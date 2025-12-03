/**
 * Minimal types for dual-model AI system (GPT-4 + Dolphin Mistral)
 * V1: Simple, pragmatic approach - one function, two models, automatic routing
 */

export interface ChatRequest {
  message: string;
  allowAdvancedAI: boolean; // true = peut utiliser Dolphin Mistral (uncensored)
  userId?: string; // optional, for logging
}

export interface ChatResponse {
  content: string;
  modelUsed: 'gpt-4' | 'dolphin-mistral';
  isUncensored: boolean;
  tokensUsed?: {
    prompt: number;
    completion: number;
  };
}

export interface ChatLog {
  id: string;
  userId: string;
  message: string;
  response: string;
  modelUsed: 'gpt-4' | 'dolphin-mistral';
  isUncensored: boolean;
  createdAt: Date;
}
