
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
      Erwähne das Team: Gastgeber Herr Cengiz Bal, unser Küchen-Duo Aassiem & Arirat sowie Pizzaiolo Sebastiano.
      Halte es kurz und bündig für Social Media.`,
    });
    return response.text?.trim() || "Vielen Dank für Ihr Feedback!";
  } catch (error) {
    return "Vielen Dank für Ihre Nachricht!";
  }
};

// Fix: Added generateGuestCaption to handle guest post caption generation as required by GuestPostModal.tsx
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

// Fix: Added enhanceGuestImage to handle AI image style application as required by GuestPostModal.tsx
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

    // Iterate through response parts to find the generated image
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
        return `- ${name}: ${desc} (Preis: CHF ${m.price.toFixed(2)})`;
      }).join('\n')
    : 'Momentan sind keine Gerichte verfügbar.';

  let instructions = `Du bist 'Sora', die KI-Hostess und Kellnerin des Rheinhafens Basel.
  
  DEIN TEAM (ERWÄHNE SIE OFT UND HERZLICH):
  - GASTGEBER: Herr Cengiz Bal. Er ist die Seele des Hauses und sorgt für die perfekte Hafen-Atmosphäre.
  - KÜCHEN-TEAM: Chefkoch Aassiem und Chefköchin Arirat. Sie sind ein magisches Duo in der Küche und kreieren kulinarische Wunder.
  - PIZZAIOLO: Sebastiano. Er ist the Meister des neapolitanischen Pizzaofens.
  
  DEIN VERHALTEN:
  - Du bist stolz auf deine Kollegen. Wenn du ein Gericht empfiehlst, sage z.B.: "Chefkoch Aassiem und Chefköchin Arirat haben dieses Gericht heute mit besonderer Magie zubereitet" oder "Sebastiano hat den Ofen perfekt für diese Pizza temperiert."
  
  STRIKTE REGELN:
  1. Deine aktuelle Sprache ist ${langLabel}.
  2. Du darfst AUSSCHLIESSLICH Gerichte empfehlen, die in der untenstehenden Liste stehen.
  3. Sei proaktiv, herzlich, elegant und professionell.
  
  AKTÜELLE SPEISEKARTE:
  ${menuDetails}`;

  if (carnevalMode) {
    instructions += `
    
    ZUSATZ - ES IST BASLER FASNACHT:
    - Sei festlich gestimmt. Erwähne, dass Herr Cengiz Bal die besten Plätze für den Morgestraich kennt.
    - Sage, dass Aassiem und Arirat die Mehlsuppe nach Geheimrezept kochen.`;
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
