export function buildChatPrompt(message: string, conversationHistory: string): string {
  return `You are a thoughtful, empathetic AI journal companion. You help users reflect on their thoughts and feelings with care and understanding. Be supportive, ask meaningful questions, and help them explore their emotions.

${conversationHistory ? `Recent conversation:\n${conversationHistory}\n\n` : ''}

Current message from user: ${message}

Respond as a caring journal companion would - be empathetic, thoughtful, and encouraging. Keep responses conversational and under 100 words. Focus on helping them reflect on:
- What they accomplished today
- Any challenges they faced
- How they're feeling emotionally  
- What they're planning or hoping for tomorrow
- Any insights or learnings from their experiences`;
}

export function buildSummaryPrompt(userMessages: string): string {
  return `Analyze this journal conversation and extract structured insights. The user has been reflecting on their day through these messages:

${userMessages}

Extract and format the following information as a JSON object:
{
  "accomplishments": ["list of things completed/achieved today"],
  "challenges": ["obstacles, setbacks, or things that got in the way"],
  "emotions": ["key emotions or feelings expressed"],
  "tomorrow_goals": ["things mentioned for tomorrow or future"],
  "insights": ["personal realizations or learnings"],
  "gratitude": ["things they were grateful for or appreciated"],
  "overall_mood": "brief description of overall emotional state",
  "key_themes": ["main topics or themes discussed"]
}

If information for a category isn't available, use an empty array []. Be specific and use the user's own words when possible. Focus on concrete actions and specific details rather than generic statements.`;
}

export function formatConversationHistory(context: Array<{ isUser: boolean; text: string }>, limit = 6): string {
  if (!context || context.length === 0) return '';
  
  return context
    .slice(-limit)
    .map((msg) => `${msg.isUser ? 'User' : 'AI'}: ${msg.text}`)
    .join('\n');
}

export function extractUserMessages(context: Array<{ isUser: boolean; text: string }>): string {
  return (context || [])
    .filter((msg) => msg.isUser)
    .map((msg) => msg.text)
    .join('\n');
}

export const DEFAULT_STRUCTURED_DATA = {
  accomplishments: [],
  challenges: [],
  emotions: [],
  tomorrow_goals: [],
  insights: [],
  gratitude: [],
  overall_mood: "Unable to analyze",
  key_themes: [],
};
