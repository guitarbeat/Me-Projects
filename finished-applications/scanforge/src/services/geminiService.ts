import { GoogleGenAI, Type } from "@google/genai";
import { EditState } from "../types";
import { PROMPTS } from "./prompts";
import { sanitizeInput } from "./security";

let ai: GoogleGenAI | null = null;

const getClient = () => {
  if (ai) return ai;
  const key = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!key) {
    console.warn("GEMINI_API_KEY is missing. Please set GEMINI_API_KEY in your environment to enable AI features.");
    return null;
  }
  ai = new GoogleGenAI({ apiKey: key });
  return ai;
};

const getAuthenticatedClient = () => {
  const client = getClient();
  if (!client) throw new Error("API key missing. Set GEMINI_API_KEY to enable AI features.");
  return client;
};

const parseDataUrl = (url: string) => {
  const match = url.match(/^data:(image\/[\w+]+);base64,(.+)$/);
  if (!match) throw new Error("Invalid base64 image data.");
  return { mimeType: match[1], data: match[2] };
};

const extractImage = (response: any): string => {
  const parts = response.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated.");
};

export const refineEditIntent = async (
  prompt: string, 
  sourceText: string | undefined, 
  analysis: string | null, 
  imageUrl: string, 
  guideUrl?: string | null
) => {
  const client = getAuthenticatedClient();

  const safePrompt = sanitizeInput(prompt);
  const safeSourceText = sanitizeInput(sourceText || '');

  const parts: any[] = [
    { text: PROMPTS.REFINE_INTENT(analysis, safePrompt, safeSourceText) },
    { inlineData: parseDataUrl(imageUrl) }
  ];
  
  try {
    const res = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            targetText: { type: Type.STRING, description: "Refined prompt describing the edit." },
            sourceText: { type: Type.STRING, description: "Specific text to replace, if applicable." },
            locationDescription: { type: Type.STRING, description: "Visual description of the area to edit." }
          }
        }
      }
    });
    const json = JSON.parse(res.text || "{}");
    return { refinedPrompt: json.targetText || prompt, locationHint: json.locationDescription || "", sourceText: json.sourceText || sourceText || "" };
  } catch (e) {
    console.warn("Refinement fallback", e);
    return { refinedPrompt: prompt, locationHint: "", sourceText: sourceText || "" };
  }
};

export const editDocumentImage = async (imageUrl: string, opts: EditState) => {
  const client = getAuthenticatedClient();

  const parts: any[] = [{ text: "Original Document:" }, { inlineData: parseDataUrl(imageUrl) }];
  
  let locationInstruction = "";
  if (opts.maskBoundingBox) {
    const [y1, x1, y2, x2] = opts.maskBoundingBox;
    locationInstruction = PROMPTS.EDIT_LOCATION_INSTRUCTION(y1, x1, y2, x2);
  } else if (opts.guideImage) {
     parts.push({ text: "Visual Mask (Red indicates area to change):" }, { inlineData: parseDataUrl(opts.guideImage) });
  }

  const safePrompt = sanitizeInput(opts.prompt);
  const safeSourceText = sanitizeInput(opts.sourceText || '');

  const prompt = PROMPTS.EDIT_SYSTEM_INSTRUCTION(!!opts.maskBoundingBox, safePrompt, safeSourceText, locationInstruction);
  parts.push({ text: prompt });

  const count = Math.min(4, Math.max(1, opts.variationCount || 1));
  const requests = [];

  for (let i = 0; i < count; i++) {
     requests.push(client.models.generateContent({
        model: opts.model || 'gemini-2.5-flash-image',
        contents: { parts }
     }));
  }

  const responses = await Promise.all(requests);
  
  return responses.map(res => ({
      url: extractImage(res),
      debugPrompt: prompt
  }));
};

export const analyzeImage = async (imageUrl: string) => {
  const client = getAuthenticatedClient();

  try {
    const res = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: parseDataUrl(imageUrl) },
          { text: PROMPTS.ANALYZE_IMAGE }
        ]
      },
      config: {
        thinkingConfig: { thinkingBudget: 2048 },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: { type: Type.STRING, description: "Concise technical summary of document type, paper condition, fonts used, and visible damage." },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 specific, high-quality edit prompts (e.g., 'Remove coffee stain', 'Sharpen text')." }
          }
        }
      }
    });
    const data = JSON.parse(res.text || "{}");
    return { analysis: data.analysis || "No analysis available.", suggestions: data.suggestions || [] };
  } catch (e) {
    console.warn("Analysis failed", e);
    return { analysis: "Analysis failed.", suggestions: [] };
  }
};

export const critiqueGeneration = async (
  originalUrl: string, 
  generatedUrls: string | string[], 
  prompt: string
) => {
  const client = getAuthenticatedClient();

  try {
    const candidates = Array.isArray(generatedUrls) ? generatedUrls : [generatedUrls];
    const safePrompt = sanitizeInput(prompt);
    
    const parts: any[] = [
      { text: `ORIGINAL IMAGE:` },
      { inlineData: parseDataUrl(originalUrl) },
      { text: PROMPTS.CRITIQUE_HEADER(safePrompt, candidates.length) }
    ];

    candidates.forEach((url, idx) => {
      parts.push({ text: `CANDIDATE ${idx + 1}:` });
      parts.push({ inlineData: parseDataUrl(url) });
    });

    parts.push({ text: PROMPTS.CRITIQUE_SYSTEM });

    const res = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            critique: { type: Type.STRING, description: "Combined critical analysis of the generated candidates." },
            refinedPrompts: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 alternative, highly descriptive prompts to achieve the user's goal better." }
          }
        }
      }
    });
    
    const json = JSON.parse(res.text || "{}");
    return { 
      critique: json.critique || "Unable to critique.", 
      refinedPrompts: json.refinedPrompts || [] 
    };
  } catch (e) {
    console.error("Critique failed", e);
    return { critique: "Critique service unavailable.", refinedPrompts: [] };
  }
};

export const optimizeEditPrompt = async (userInput: string) => {
  const client = getAuthenticatedClient();

  try {
    const safeInput = sanitizeInput(userInput);
    const res = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: PROMPTS.OPTIMIZE_PROMPT(safeInput),
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            optimizedPrompt: { type: Type.STRING }
          }
        }
      }
    });
    const json = JSON.parse(res.text || "{}");
    return json.optimizedPrompt || userInput;
  } catch (e) {
    return userInput;
  }
};
