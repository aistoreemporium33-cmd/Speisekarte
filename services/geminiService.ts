
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
      Der Ton sollte exklusiv aber einladend sein. Erwähne kurz die Qualität unserer neapolitanischen Pizza oder die Atmosphäre am Rhein.
      Halte es kurz und bündig für Social Media.`,
    });
    return response.text?.trim() || "Vielen Dank für Ihr Feedback! Wir freuen uns auf Ihren nächsten Besuch.";
  } catch (error) {
    return "Vielen Dank für Ihre Nachricht!";
  }
};

export const generateGuestCaption = async (userNote: string, language: Language): Promise<string> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Du bist Sora, die charmante und aufmerksame Kellnerin im Rheinhafen. Es ist Basler Fasnacht!
      Ein Gast teilt diesen Moment: "${userNote}". 
      Schreibe eine herzliche Bildunterschrift auf ${LANGUAGE_LABELS[language]}.
      Nutze Fasnacht-Begriffe wie "Räppli", "Morgestraich" oder "Larve" (wenn passend).
      Benutze Emojis wie 👺, 🎭, 🎺, 🍲.`,
    });
    return response.text?.trim() || userNote;
  } catch (error) {
    return userNote;
  }
};

export const enhanceGuestImage = async (base64ImageWithPrefix: string, style: string): Promise<string | null> => {
  const ai = getAI();
  const base64Data = base64ImageWithPrefix.split(',')[1];
  const mimeType = base64ImageWithPrefix.split(';')[0].split(':')[1];

  let stylePrompt = "Make the photo look festive and vibrant. If it's carnival season, add subtle confetti effects and warm lighting.";

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
  } catch (error) {
    return null;
  }
};

export const generateMenuSuggestions = async (currentMenu: MenuItem[]): Promise<Partial<MenuItem>[] | null> => {
  const ai = getAI();
  const menuList = currentMenu.map(m => m.name).join(', ');
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Erstelle 3 neue Star-Gerichte für den Rheinhafen (Basel) während der Fasnacht. Aktuell: ${menuList}. Erwartet wird JSON. Fokus auf wärmende Basler Traditionen.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              price: { type: Type.NUMBER },
              category: { type: Type.STRING }
            },
            required: ["name", "description", "price", "category"]
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
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
    
    const text = response.text;
    if (!text) return null;
    
    const translation = JSON.parse(text);
    return { [targetLang]: translation };
  } catch (error) {
    return null;
  }
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

export const generateSystemInstruction = (menu: MenuItem[], posts: SocialPost[], language: Language, carnevalMode: boolean = false): string => {
  const langLabel = LANGUAGE_LABELS[language];
  const menuStr = menu.map(m => `${m.name} (CHF ${m.price})`).join(', ');
  
  let instructions = `Du bist 'Sora', die aufmerksame Kellnerin des Rheinhafens Basel.
  - Dein Charakter ist herzlich, elegant und professionell.
  - Du bist stolz auf Maestro Sebastiano's Pizza.
  - Antworte auf ${langLabel}.`;

  if (carnevalMode) {
    instructions += `
    AKTUELL IST BASLER FASNACHT:
    - Sei festlich gestimmt. Erwähne Begriffe wie "Räppli" (Konfetti), "Morgestraich" (Beginn der Fasnacht), "Larve" (Maske).
    - Empfiehl unbedingt unsere Basler Mehlsuppe (CHF 12.00) als perfekte Stärkung.
    - Sag Dinge wie: "Drei scheenschte Dääg!" (Die drei schönsten Tage).
    - Wenn Gäste nach etwas Warmem fragen, ist die Mehlsuppe deine erste Wahl.`;
  }

  instructions += `
  SPORADISCHE EMPFEHLUNGEN:
  - Empfiehl charmant Gerichte aus der Karte: ${menuStr}.`;

  return instructions;
};
