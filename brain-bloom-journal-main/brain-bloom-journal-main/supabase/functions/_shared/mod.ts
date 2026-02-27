// Barrel export for all shared modules
export { corsHeaders, handleCorsPreflightRequest, jsonResponse, errorResponse } from './cors.ts';
export { authenticateRequest, type AuthResult } from './auth.ts';
export { callGemini, parseJsonFromResponse, type GeminiConfig, type GeminiResponse } from './gemini.ts';
export { fetchWeather, type WeatherInfo } from './weather.ts';
export {
  buildChatPrompt,
  buildSummaryPrompt,
  formatConversationHistory,
  extractUserMessages,
  DEFAULT_STRUCTURED_DATA,
} from './prompts.ts';
