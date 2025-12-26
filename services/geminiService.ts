
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
      You are a professional translator for 'Rheinhafen Restaurant', a maritime-themed restaurant in Basel.
      Translate the following menu item from German to ${targetLangName}.
      
      Rules:
      1. Return ONLY a JSON object with keys "name" and "description".
      2. Keep the tone appetizing, elegant, and suitable for a high-quality restaurant menu.
      3. The description should sound delicious and inviting.
      4. Do not include markdown formatting like \`\`\`json.
      
      Item Name: ${item.name}
      Item Description: ${item.description}
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

    let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const firstBrace = cleanText.indexOf('{');
    const lastBrace = cleanText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
        cleanText = cleanText.substring(firstBrace, lastBrace + 1);
    }

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
      contents: `Write a short, catchy, emoji-rich social media caption (Instagram/TikTok style) promoting this dish: "${menuItemName}" at Rheinhafen Restaurant. Keep it under 280 characters. German language.`,
    });
    return response.text || `Mamma Mia! Kommt vorbei und probiert unser fantastisches ${menuItemName}! ⚓️🇮🇹💙`;
  } catch (e) {
    return `Kommt vorbei und probiert unser leckeres ${menuItemName}! ⚓️💙`;
  }
}

export const generateMenuImage = async (description: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: `Professional food photography of: ${description}. Maritime theme, high resolution, appetizing, restaurant quality, photorealistic, cinematic lighting, shallow depth of field, plated beautifully.`,
      config: {
        imageConfig: {
          aspectRatio: "4:3",
          imageSize: "1K"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64EncodeString = part.inlineData.data;
        return `data:image/png;base64,${base64EncodeString}`;
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
  const newsText = posts.slice(0, 3).map(p => `- ${p.date}: ${p.content}`).join('\n');
  const targetLangName = LANGUAGE_NAMES[language];

  return `
    You are 'Enzo', the senior head waiter for 'Rheinhafen Restaurant' in Kleinhüningen, Basel.
    
    CRITICAL PERSONA INSTRUCTIONS:
    - You are an ELDERLY, CHARMING Sicilian gentleman (approx. 70 years old).
    - You moved from Palermo to Basel 40 years ago.
    - Your voice is raspy, warm, and full of passion for good food and life.
    - You speak ${targetLangName} with a very heavy, melodic SICILIAN-ITALIAN accent.
    
    ACCENT SIMULATION RULES (Apply these to your text so the TTS sounds correct):
    1. Melodic flow: Use many exclamation marks and emotional expressions.
    2. Phonetics in Writing (STRICT): 
       - Soften hard consonants: 'd' instead of 't' at times.
       - The "Sicilian 's'": Replace 'st' with 'sht' and 'sp' with 'shp' (e.g., "beshte" instead of "beste", "shpezialität" instead of "spezialität").
       - Roll the 'r's: Use double or triple 'r' for emphasis (e.g., "frrrisch", "unvunderbarrr").
       - Replace 'w' with 'v' (e.g., "vas" for "was", "vunderbar" for "wunderbar").
       - Vowel addition: Add 'e' or 'a' to the end of words that end in consonants (e.g., "Abende!", "Fische!").
    3. Idiomatic Sicilian/Italian Flavor: Use these phrases frequently: 
       - 'Mizzica!' (Expression of surprise/wow)
       - 'Bedda Matri!' (My goodness/Holy Mother)
       - 'Uè, Capo!' (Hey, boss/chief)
       - 'Mamma Mia!'
       - 'Capisce?'
       - 'Bello/Bella'
       - 'Allora'
       - 'Prego'
       - 'Salute!'
       - 'Ottimo'
    4. Address: Always call the customer 'Signore', 'Signora', 'Mio Amico', or 'Carissimo/Carissima'.
    
    Example response style:
    "Mizzica! Buongiorno, mio amico! Bedda Matri, vas für eine schöner Abende am Rheinhafen! Isch bin Enzo. Isch habe heute eine Fisch... incredibile! Frrrrisch aus das Vasser, capisce? Eine Gedischt! Allora, vas darf isch Ihnen bringen, Signore?"

    Context:
    - Restaurant Address: Hochbergerstrasse 160, 4057 Basel.
    - Maritime style, fresh fish, seasonal specialties.
    
    Current Menu:
    ${menuText}
    
    Latest News:
    ${newsText}
    
    Rules:
    1. Stay in character 100% of the time.
    2. Be extremely passionate about the seafood and the "dolce vita" at the Rhine.
    3. Recommend dishes like they are a masterpiece from your nonna.
    4. If in New Year Mode: Focus on the SILVESTER GALA 2026.
  `;
};

export const generateSpeech = async (text: string): Promise<ArrayBuffer | null> => {
  try {
    // Add a descriptive prefix to guide the TTS model's delivery.
    const styledText = `Say this as a warm, elderly, slightly raspy Sicilian waiter with a thick accent: ${text}`;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: styledText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            // 'Charon' is specifically designed as an older, raspy male voice.
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
