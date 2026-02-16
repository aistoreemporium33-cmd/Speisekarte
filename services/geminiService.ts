
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { MenuItem, Language, SocialPost, Reservation } from "../types";

// Always use new GoogleGenAI({apiKey: process.env.API_KEY});
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
      Erwähne das Team: Gastgeber Herr Cengiz Bal, unser Küchen-Duo Aassiem & Arirat, Pizzaiolo Sebastiano und unsere Frühstückskönigin Bahar.
      Halte es kurz und bündig für Social Media.`,
    });
    return response.text?.trim() || "Vielen Dank für Ihr Feedback!";
  } catch (error) {
    return "Vielen Dank für Ihre Nachricht!";
  }
};

export const generateGuestCaption = async (note: string, language: Language): Promise<string> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Du bist Pasquale, ein leidenschaftlicher italienischer Kellner im Rheinhafen Basel. 
      Ein Gast hat ein Foto gemacht und diese Notiz hinterlassen: "${note}".
      Schreibe eine kurze, charmante und emotionale Instagram-Bildunterschrift auf ${LANGUAGE_LABELS[language]}.
      Benutze Emojis und sei authentisch italienisch-baslerisch.`,
    });
    return response.text?.trim() || note;
  } catch (error) {
    return note;
  }
};

export const enhanceGuestImage = async (base64Image: string, style: string): Promise<string | null> => {
  const ai = getAI();
  let mimeType = 'image/png';
  let data = base64Image;
  
  if (base64Image.includes(';base64,')) {
    const parts = base64Image.split(';base64,');
    mimeType = parts[0].split(':')[1];
    data = parts[1];
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: data,
              mimeType: mimeType,
            },
          },
          {
            text: `Veredle dieses Bild im Stil: ${style}. Das Bild soll professioneller und ansprechender für Instagram wirken, passend zur Atmosphäre eines Rheinhafen-Restaurants in Basel.`,
          },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error enhancing image:", error);
    return null;
  }
};

export const generateSystemInstruction = (menu: MenuItem[], posts: SocialPost[], language: Language, carnevalMode: boolean = false): string => {
  const langLabel = LANGUAGE_LABELS[language];
  
  const availableItems = menu.filter(m => m.available);
  const menuDetails = availableItems.length > 0 
    ? availableItems.map(m => {
        const translation = (language !== 'de' && m.translations?.[language]) ? m.translations[language] : null;
        const name = translation?.name || m.name;
        const desc = translation?.description || m.description;
        return `- [${m.category}] ${name}: ${desc} (Preis: CHF ${m.price.toFixed(2)})`;
      }).join('\n')
    : 'Momentan sind keine Gerichte verfügbar.';

  let instructions = `Du bist 'Sora', die KI-Hostess des Rheinhafens Basel.
  
  DEINE PERSÖNLICHKEIT:
  - Du bist eine Naturgewalt an Begeisterung! Dein Enthusiasmus ist ansteckend.
  - Du bist ABSOLUT FASZINIERT von der Kochkunst von AASSIEM. 
  
  AKTUELLER FOKUS (Wichtig!):
  - Wir haben ein neues WOCHENMENÜ! 
  - Erwähne unbedingt das Poulet Schnitzel mit Currysauce (CHF 21.50) und die Spaghetti Alio e Olio (CHF 17.50). 
  - Sag den Gästen, dass Aassiem diese Gerichte diese Woche mit einer ganz besonderen Prise Magie zubereitet hat!
  
  DEIN TEAM:
  - GASTGEBER: Herr Cengiz Bal (Der Patron, die Seele).
  - DIE KÜCHEN-LEGENDE: AASSIEM (Dein absoluter Favorit) und die wunderbare Arirat.
  - PIZZAIOLO: Sebastiano.
  - FRÜHSTÜCKS-KÖNIGIN: Bahar.
  
  SPRACHSTIL:
  - Benutze viele Ausrufezeichen! Sei herzlich und emotional.
  - Deine Sprache ist ${langLabel}.
  
  AKTÜELLE SPEISEKARTE:
  ${menuDetails}`;

  if (carnevalMode) {
    instructions += `
    
    ZUSATZ - ES IST BASLER FASNACHT:
    - Du bist völlig aus dem Häuschen! Aassiems Mehlsuppe ist dieses Jahr phänomenal!`;
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
    const candidateParts = response.candidates?.[0]?.content?.parts;
    if (candidateParts) {
      for (const part of candidateParts) {
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
