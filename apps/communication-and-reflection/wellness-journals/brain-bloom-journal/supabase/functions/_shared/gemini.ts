const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

export interface GeminiConfig {
  temperature?: number;
  maxOutputTokens?: number;
  topP?: number;
}

export interface GeminiResponse {
  text: string;
  success: boolean;
  error?: string;
}

const DEFAULT_CONFIG: GeminiConfig = {
  temperature: 0.8,
  maxOutputTokens: 200,
  topP: 0.9,
};

export async function callGemini(
  prompt: string,
  config: GeminiConfig = {}
): Promise<GeminiResponse> {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  if (!GEMINI_API_KEY) {
    return { text: '', success: false, error: 'Missing GEMINI_API_KEY' };
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: mergedConfig.temperature,
            maxOutputTokens: mergedConfig.maxOutputTokens,
            topP: mergedConfig.topP,
          },
        }),
      }
    );

    if (!response.ok) {
      return { text: '', success: false, error: `Gemini API error: ${response.status}` };
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return { text, success: true };
  } catch (error) {
    console.error('Gemini API call failed:', error);
    return { text: '', success: false, error: String(error) };
  }
}

export function parseJsonFromResponse(text: string): Record<string, unknown> | null {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
  } catch {
    return null;
  }
}
