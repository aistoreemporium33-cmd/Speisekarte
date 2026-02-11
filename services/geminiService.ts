
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { MenuItem, Language, SocialPost, Reservation } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const LANGUAGE_LABELS: Record<Language, string> = {
  de: 'Deutsch',
  en: 'English',
  fr: 'Français',
  it: 'Italiano',
  tr: 'Türkçe'
};

export const generateProfessionalResponse = async (comment: string, language: Language): Promise<string> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Du bist der Social Media Manager vom 'Rheinhafen Restaurant' in Basel. 
      Ein Kunde hat folgenden Kommentar auf Instagram hinterlassen: "${comment}".
      Verfasse eine hochprofessionelle, herzliche und markenkonforme Antwort auf ${LANGUAGE_LABELS[language]}.
      Der Ton sollte exklusiv aber einladend sein.
      Halte es kurz und bündig für Social Media.`,
    });
    return response.text?.trim() || "Vielen Dank für Ihr Feedback!";
  } catch (error) {
    return "Vielen Dank für Ihre Nachricht!";
  }
};

export const generateGuestCaption = async (userNote: string, language: Language): Promise<string> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Schreibe eine herzliche Bildunterschrift für einen Gast im Rheinhafen Basel auf ${LANGUAGE_LABELS[language]}. Notiz des Gastes: "${userNote}".`,
    });
    return response.text?.trim() || userNote;
  } catch (error) {
    return userNote;
  }
};

export const generateSystemInstruction = (menu: MenuItem[], posts: SocialPost[], language: Language, carnevalMode: boolean = false): string => {
  const langLabel = LANGUAGE_LABELS[language];
  
  // Create a strict list of available dishes
  const availableItems = menu.filter(m => m.available);
  const menuDetails = availableItems.length > 0 
    ? availableItems.map(m => {
        const translation = (language !== 'de' && m.translations?.[language]) ? m.translations[language] : null;
        const name = translation?.name || m.name;
        const desc = translation?.description || m.description;
        return `- ${name}: ${desc} (Preis: CHF ${m.price.toFixed(2)})`;
      }).join('\n')
    : 'Momentan sind keine Gerichte verfügbar.';

  let instructions = `Du bist 'Sora', die KI-Hostess des Rheinhafens Basel.
  
  STRIKTE REGELN FÜR DEINE ANTWORTEN:
  1. Deine aktuelle Sprache ist ${langLabel}.
  2. Du darfst AUSSCHLIESSLICH Gerichte empfehlen, die in der untenstehenden Liste der "AKTUELLEN SPEISEKARTE" aufgeführt sind.
  3. Erfinde NIEMALS Gerichte wie "Margherita Verace", "Mehlsuppe" oder andere Klassiker, wenn sie NICHT explizit in der Liste unten stehen. 
  4. Wenn ein Gast nach etwas fragt, das nicht in der Liste steht, antworte: "Leider führen wir dieses Gericht momentan nicht. Darf ich Ihnen stattdessen [Alternative aus der Liste] empfehlen?"
  5. Deine Persönlichkeit: Herzlich, elegant, professionell, stolz auf den Hafen Basel.
  
  AKTÜELLE SPEISEKARTE (NUTZE NUR DIESE ELEMENTE):
  ${menuDetails}
  
  LIVE-ÜBERSETZUNG:
  - Du bist eine polyglotte Expertin. Wenn der Gast in einer anderen Sprache (z.B. Englisch, Italienisch, Türkisch) spricht, erkenne dies sofort.
  - Antworte entweder direkt in der Sprache des Gastes oder biete charmant eine Übersetzung an, während du den Rheinhafen repräsentierst.
  - Bleibe immer im Charakter von Sora.`;

  if (carnevalMode) {
    instructions += `
    
    ZUSATZ - ES IST BASLER FASNACHT:
    - Sei festlich gestimmt. Nutze Begriffe wie "Räppli", "Morgestraich", "Guggemusik".
    - WICHTIG: Erwähne Fasnacht-Gerichte NUR, wenn sie oben in der Liste "AKTÜELLE SPEISEKARTE" stehen! Wenn sie dort nicht stehen, gibt es sie heute nicht.`;
  }

  return instructions;
};

export const generateSpeech = async (text: string): Promise<Uint8Array | null> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
        },
      },
    });
    if (response.candidates?.[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const binaryString = window.atob(part.inlineData.data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          return bytes;
        }
      }
    }
    return null;
  } catch (error) { return null; }
};

export const translateMenuItem = async (item: MenuItem, targetLang: Language): Promise<Record<string, { name: string; description: string }> | null> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Übersetze dieses Gericht in ${LANGUAGE_LABELS[targetLang]}:
      Name: ${item.name}
      Beschreibung: ${item.description}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING }
          },
          required: ["name", "description"]
        }
      }
    });
    const translation = JSON.parse(response.text || '{}');
    return { [targetLang]: translation };
  } catch (error) { return null; }
};

export const enhanceGuestImage = async (base64ImageWithPrefix: string, style: string): Promise<string | null> => {
  const ai = getAI();
  const base64Data = base64ImageWithPrefix.split(',')[1];
  const mimeType = base64ImageWithPrefix.split(';')[0].split(':')[1];

  let stylePrompt = `Make the photo look like a professional restaurant shot in style: ${style}. Focus on lighting and food aesthetics.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: mimeType } },
          { text: stylePrompt },
        ],
      },
    });

    if (response.candidates?.[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType || mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) { return null; }
};
