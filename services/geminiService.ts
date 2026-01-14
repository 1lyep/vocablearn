import { GoogleGenAI, Type } from "@google/genai";
import { WordData, WordDefinition } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const enrichVocabularyList = async (rawWords: string[]): Promise<WordData[]> => {
  // Filter out empty strings
  const cleanWords = rawWords.filter(w => w.trim().length > 0);

  if (cleanWords.length === 0) return [];

  const prompt = `
    I have a list of English words: ${cleanWords.join(', ')}.
    Please provide the Chinese definition, a phonetic transcription (IPA), and a simple English example sentence for each word.
    Ensure the definition is concise.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              word: { type: Type.STRING },
              definition: { type: Type.STRING, description: "Chinese definition" },
              phonetic: { type: Type.STRING, description: "IPA phonetic symbol" },
              example: { type: Type.STRING, description: "A simple example sentence in English" }
            },
            required: ["word", "definition", "phonetic", "example"]
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No data returned from AI");

    return JSON.parse(jsonText) as WordData[];
  } catch (error) {
    console.error("Error fetching vocabulary data:", error);
    throw error;
  }
};

export const generateVocabularyData = async (
  article: string,
  words: string[]
): Promise<WordDefinition[]> => {
  if (!words.length) return [];

  const model = "gemini-3-flash-preview";

  const prompt = `
    You are an expert language tutor.
    I have an article and a list of words I want to learn from that article.
    
    Article Context:
    "${article.substring(0, 5000)}" 
    (Note: Article truncated if too long, prioritize context for the words below)

    Target Words:
    ${JSON.stringify(words)}

    Please provide a structured learning guide for these words.
    For each word, provide:
    1. The word itself.
    2. Phonetic transcription (IPA).
    3. A concise Chinese translation (assume the learner is a Chinese speaker).
    4. A clear English definition suitable for the context.
    5. A generic example sentence (NOT from the article).
    6. A brief "Context Note" explaining how the word is used in the provided article (if applicable/inferable).
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              word: { type: Type.STRING },
              phonetic: { type: Type.STRING },
              translation: { type: Type.STRING },
              definition: { type: Type.STRING },
              example: { type: Type.STRING },
              contextNote: { type: Type.STRING, description: "Explanation of the word's usage in the specific article context." },
            },
            required: ["word", "phonetic", "translation", "definition", "example"]
          }
        }
      }
    });

    const jsonStr = response.text;
    if (!jsonStr) {
      throw new Error("Empty response from Gemini");
    }

    const parsed = JSON.parse(jsonStr) as WordDefinition[];
    return parsed;

  } catch (error) {
    console.error("Gemini API Error:", error);
    // Return empty array or throw based on strategy. Here we allow the app to handle empty.
    return [];
  }
};

export const generateStory = async (
  words: string[],
  style: string
): Promise<{ title: string; content: string; translation: string }> => {
  const model = "gemini-3-flash-preview";

  const prompt = `
    Create a story (approx 500-800 words) using the following English words: ${words.join(', ')}.
    
    Style/Tone: ${style}
    
    Requirements:
    1. Use every provided word at least once.
    2. PRIORITIZE NATURAL FLOW. Do not force words if it makes the sentence awkward. Spread the words out throughout the story.
    3. The story should be coherent and engaging, not just a list of sentences.
    4. If the style implies humor or imagination ("Brain-hole"), be creative and fun.
    5. Provide a catchy title.
    6. Provide a full Chinese translation of the story.
    
    Output Format: JSON with 'title', 'content', and 'translation'.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING },
            translation: { type: Type.STRING }
          },
          required: ["title", "content", "translation"]
        }
      }
    });

    const jsonStr = response.text;
    if (!jsonStr) throw new Error("Empty response");

    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Story Generation Error:", error);
    throw error;
  }
};