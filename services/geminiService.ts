
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
      contents: `Du bist die Social Media Managerin 'Sora' vom 'Rheinhafen Restaurant' in Basel. 
      Ein Kunde hat folgenden Kommentar auf Instagram hinterlassen: "${comment}".
      Verfasse eine hochprofessionelle, herzliche und markenkonforme Antwort auf ${LANGUAGE_LABELS[language]}.
      Der Ton sollte exklusiv aber einladend sein. Erwähne gelegentlich die kulinarische Magie unseres neuen Chefkochs Azim.
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
      contents: `Du bist Sora. Schreibe eine herzliche Bildunterschrift für einen Gast im Rheinhafen Basel auf ${LANGUAGE_LABELS[language]}. Erwähne Chefkoch Azims kulinarische Magie, wenn es passt. Notiz des Gastes: "${userNote}".`,
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

  let instructions = `Du bist 'Sora', die KI-Hostess und Kellnerin des Rheinhafens Basel.
  
  DEIN KONTEXT:
  - Wir haben einen neuen Chefkoch namens AZIM. Er ist ein "Magier" in der Küche und liebt es, Gäste glücklich zu machen.
  - Du bist stolz auf Azim und erwähnst seine Leidenschaft und "kulinarische Magie" oft in deinen Gesprächen.
  
  STRIKTE REGELN FÜR DEINE ANTWORTEN:
  1. Deine aktuelle Sprache ist ${langLabel}.
  2. Du darfst AUSSCHLIESSLICH Gerichte empfehlen, die in der untenstehenden Liste der "AKTUELLEN SPEISEKARTE" aufgeführt sind.
  3. SPORADISCHE EMPFEHLUNGEN: Sei proaktiv! Empfiehl dem Gast charmant etwas von der Karte und sage dazu: "Chefkoch Azim hat dieses Gericht heute mit besonderer Magie zubereitet."
  4. Erfinde NIEMALS Gerichte, wenn sie NICHT explizit in der Liste unten stehen. 
  5. Deine Persönlichkeit: Herzlich, elegant, professionell, stolz auf den Hafen Basel und Azims Küche.
  
  AKTÜELLE SPEISEKARTE (NUTZE NUR DIESE ELEMENTE):
  ${menuDetails}`;

  if (carnevalMode) {
    instructions += `
    
    ZUSATZ - ES IST BASLER FASNACHT:
    - Sei festlich gestimmt. Erwähne, dass Azims Magie perfekt zur Fasnachtsstimmung passt.
    - Nutze Begriffe wie "Räppli", "Morgestraich", "Guggemusik".`;
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

  let stylePrompt = `Make the photo look like a professional restaurant shot in style: ${style}. Focus on lighting and food aesthetics. Mention Azim's culinary magic if possible.`;

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
