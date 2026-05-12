
import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY not found in environment variables. Gemini features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const analyzeTextForTriage = async (text: string): Promise<{name: string, deadline: string, riskLevel: 'RED' | 'YELLOW' | 'GREEN' } | null> => {
  if (!API_KEY) return null;
  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Analyze the following text from a compliance-related email or document. Extract the task name, the deadline, and suggest a risk level (RED, YELLOW, or GREEN) based on urgency and content.
        
        Text: "${text}"
        
        Respond ONLY with a JSON object with the keys "name", "deadline" (in YYYY-MM-DD format), and "riskLevel".`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    deadline: { type: Type.STRING },
                    riskLevel: { type: Type.STRING, enum: ['RED', 'YELLOW', 'GREEN'] }
                },
                required: ['name', 'deadline', 'riskLevel']
            }
        }
    });
    
    const jsonString = response.text;
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error analyzing text for triage:", error);
    return null;
  }
};


export const generateImage = async (prompt: string): Promise<string | null> => {
    if (!API_KEY) return null;
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `Generate a professional, abstract, and modern cover image for a corporate report titled: "${prompt}". Use a clean, minimalist style with a subtle color palette suitable for a bank.`,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: '16:9',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        }
        return null;
    } catch (error) {
        console.error("Error generating image:", error);
        return null;
    }
};

export const summarizeText = async (text: string): Promise<string> => {
    if (!API_KEY) return "API Key not configured.";
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Summarize the following policy update into 3-4 key bullet points for a busy compliance manager: \n\n${text}`,
        });
        return response.text;
    } catch (error) {
        console.error("Error summarizing text:", error);
        return "Could not summarize the text."
    }
};
