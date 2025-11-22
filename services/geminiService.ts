
// AI Service Disabled by User Request
// This file is kept as a stub to prevent import errors if references persist,
// but all logic has been stripped to ensure no "magic" generation occurs.

export interface LyricRequest {
  mood: string;
  key: string;
  scale: string;
  progression: string[];
}

export interface TheoryRequest {
  key: string;
  scale: string;
  progression: string[];
}

export const generateLyrics = async (data: LyricRequest): Promise<string> => {
  return "AI features are disabled.";
};

export const explainTheory = async (data: TheoryRequest): Promise<string> => {
  return "AI features are disabled.";
};
