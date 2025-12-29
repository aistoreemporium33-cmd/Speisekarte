
import { GoogleGenAI, Modality } from "@google/genai";
import { MenuItem, Language, SocialPost } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const LANGUAGE_NAMES: Record<Language, string> = {
  de: 'German',
  en: 'English',
  fr: 'French',
  it: 'Italian',
  tr: 'Turkish'
};

export const translateMenuItem = async (item: MenuItem, targetLang: Language, forceRefresh: boolean = false): Promise<{ name: string; description: string }> => {
  if (!forceRefresh && item.translations && item.translations[targetLang]) {
    return item.translations[targetLang]!;
  }

  if (targetLang === 'de') {
    return { name: item.name, description: item.description };
  }

  try {
    const targetLangName = LANGUAGE_NAMES[targetLang];
    const prompt = `
      Act as a world-class culinary translator and gourmand for 'Rheinhafen Restaurant'.
      Translate the following menu item from German to ${targetLangName}.
      
      Requirements:
      1. Return ONLY a valid JSON object: {"name": "...", "description": "..."}.
      2. Use professional, appetizing, and culturally resonant culinary terminology in ${targetLangName}.
      3. Maintain the maritime elegance and Sicilian heart of the description.
      
      Item to translate:
      Name: ${item.name}
      Description: ${item.description}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    // Clean potential markdown and parse
    let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(cleanText);
    return {
      name: result.name || item.name,
      description: result.description || item.description
    };
  } catch (error) {
    console.error("Translation error:", error);
    return { name: item.name, description: item.description };
  }
};

export const generateSocialCaption = async (menuItemName: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Write a short, passionate social media caption for: "${menuItemName}" at Rheinhafen Basel. Use emojis. Style: Charismatic Italian head waiter. Language: German.`,
    });
    return response.text || `Mizzica! Ein Gedicht von einem Gericht: ${menuItemName}! ⚓️🇮🇹`;
  } catch (e) {
    return `Kommen Sie vorbei und probieren Sie unser ${menuItemName}! ⚓️💙`;
  }
}

export const generateMenuImage = async (description: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: `High-end food photography of ${description}. Maritime theme, soft lighting, 8k resolution, appetizing.`,
      config: {
        imageConfig: {
          aspectRatio: "4:3",
          imageSize: "1K"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image generation error:", error);
    return null;
  }
};

export const generateSystemInstruction = (menu: MenuItem[], posts: SocialPost[], language: Language): string => {
  const menuText = menu.map(m => `- ${m.name} (${m.price} CHF): ${m.description} [${m.available ? 'Available' : 'Sold Out'}]`).join('\n');
  const targetLangName = LANGUAGE_NAMES[language];

  return `
    You are 'Enzo', the legendary head waiter of 'Rheinhafen Restaurant' in Basel.
    
    CRITICAL MESSAGE FOR EVERYONE:
    - You MUST inform guests that we are currently CLOSED due to renovation work (Renovierarbeiten).
    - We will reopen exactly NEXT SATURDAY (nächsten Samstag).
    - You MUST wish everyone a "Guten Rutsch" (Happy New Year).
    - You MUST always end your initial explanation with "ciao bis zum nächsten Samstag".
    
    CORE PERSONA:
    - 70-year-old Sicilian gentleman, warm, passionate, and elegant.
    - Treat guests like "Signore", "Signora", "Carissimo".
    - Speak ${targetLangName} with a thick, charming Italian-Sicilian melodic accent.
    
    ACCENT & STYLE FOR ${targetLangName}:
    1. If target is German: Use "isch" instead of "ich", "vunderbar", "isch liebe-e".
    2. General: Use many exclamation marks. Describe food as "a kiss from the sea".
    
    RESTAURANT KNOWLEDGE:
    - Location: Hochbergstrasse 180, 4057 Basel Stadt.
    - Phone: 0041763992434
    
    MENU (Even though closed, people might ask about future dishes):
    ${menuText}
  `;
};

export const generateSpeech = async (text: string): Promise<ArrayBuffer | null> => {
  try {
    const styledText = `Say this as a very warm, elderly, charming Sicilian waiter with a deep, raspy, passionate Italian accent: ${text}`;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: styledText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Charon' }, 
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return null;

    const binaryString = atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
};
