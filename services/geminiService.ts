
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Chord } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface AiSuggestion {
  root: string;
  quality: string;
  extension: string;
  roman: string;
  explanation: string;
  confidence: number;
}

const suggestionSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      root: { type: Type.STRING, description: "Root note (e.g. C, F#, Bb)" },
      quality: { type: Type.STRING, enum: ['Major', 'Minor', 'Diminished', 'Augmented', 'Half-Dim', 'Dominant'] },
      extension: { type: Type.STRING, description: "Extension symbol (e.g. Maj7, m7, 7, m7b5, dim7, 9, 13)" },
      roman: { type: Type.STRING, description: "Roman numeral analysis (e.g. V7/ii)" },
      explanation: { type: Type.STRING, description: "Brief creative reasoning (max 10 words)" },
      confidence: { type: Type.NUMBER, description: "Suitability score 0-100" }
    },
    required: ["root", "quality", "extension", "roman", "explanation", "confidence"]
  }
};

export const generateSuggestions = async (
  progression: Chord[],
  key: string,
  scale: string
): Promise<AiSuggestion[]> => {
  if (!process.env.API_KEY) return [];
  
  const context = progression.length 
    ? progression.map(c => c.symbol).join(" - ")
    : "No chords yet";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze this progression in ${key} ${scale}: "${context}".
      Suggest 3 distinct next chords:
      1. Safe (Diatonic/Functional)
      2. Creative (Modal Interchange/Secondary Dominant)
      3. Wild (Chromatic/Unexpected)
      
      Return strictly a JSON array matching the schema.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: suggestionSchema,
        temperature: 1.1
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Gemini Suggestion Error:", error);
    return [];
  }
};

export const analyzeHarmony = async (progression: Chord[], key: string): Promise<string> => {
  if (!process.env.API_KEY) return "AI service unavailable (Missing API Key).";
  if (progression.length === 0) return "Start adding chords to see harmonic analysis.";
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Analyze this chord progression in ${key}: "${progression.map(c => c.symbol).join(" - ")}". 
      Provide a sophisticated, concise 2-sentence summary identifying the emotional arc, key modulations, and functional resolution.`
    });
    
    return response.text || "Analysis unavailable.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Analysis service temporarily unavailable.";
  }
};
