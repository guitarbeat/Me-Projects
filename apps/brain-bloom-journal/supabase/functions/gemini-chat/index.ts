import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  handleCorsPreflightRequest,
  jsonResponse,
  errorResponse,
  authenticateRequest,
  callGemini,
  parseJsonFromResponse,
  fetchWeather,
  buildChatPrompt,
  buildSummaryPrompt,
  formatConversationHistory,
  extractUserMessages,
  DEFAULT_STRUCTURED_DATA,
} from "../_shared/mod.ts";

serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  try {
    // Authenticate user
    const { user, error: authError } = await authenticateRequest(req);
    
    if (authError || !user) {
      const message = authError === 'Missing Authorization header'
        ? "Please sign in to use the journal companion."
        : "Your session has expired. Please sign in again.";
      return errorResponse('Unauthorized', message, 401);
    }

    const { message, context, generateSummary } = await req.json();
    
    console.log('Received message:', message);
    console.log('Context length:', context?.length || 0);
    console.log('Generate summary requested:', generateSummary);

    // Summary generation flow
    if (generateSummary) {
      const [weatherInfo, summaryResult] = await Promise.all([
        fetchWeather(),
        callGemini(buildSummaryPrompt(extractUserMessages(context)), {
          temperature: 0.3,
          maxOutputTokens: 1000,
          topP: 0.8,
        }),
      ]);

      if (!summaryResult.success) {
        console.error('Summary generation failed:', summaryResult.error);
      }

      const structuredData = parseJsonFromResponse(summaryResult.text) || DEFAULT_STRUCTURED_DATA;

      return jsonResponse({
        type: 'summary',
        structuredData,
        weather: weatherInfo,
        response: "Summary generated successfully",
      });
    }

    // Regular chat flow
    const conversationHistory = formatConversationHistory(context);
    const prompt = buildChatPrompt(message, conversationHistory);
    
    const result = await callGemini(prompt);

    if (!result.success) {
      throw new Error(result.error);
    }

    const aiResponse = result.text || "I'm here to listen. Tell me more about what's on your mind.";

    return jsonResponse({ response: aiResponse });
    
  } catch (error) {
    console.error('Error in gemini-chat function:', error);
    return errorResponse(
      'Failed to get AI response',
      "I'm having trouble connecting right now, but I'm here to listen. What's on your mind?",
      500
    );
  }
});
