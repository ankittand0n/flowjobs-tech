import { create } from "zustand";
import { DEFAULT_MAX_TOKENS, DEFAULT_MODEL } from "../constants/llm";

type OpenAIStore = {
  baseURL: string;
  apiKey: string;
  model: string;
  maxTokens: number;
};

export const useOpenAiStore = create<OpenAIStore>()(() => ({
  baseURL: import.meta.env.VITE_OPENAI_BASE_URL ?? "",
  apiKey: import.meta.env.VITE_OPENAI_API_KEY ?? "",
  model: import.meta.env.VITE_OPENAI_MODEL ?? DEFAULT_MODEL,
  maxTokens: Number(import.meta.env.VITE_OPENAI_MAX_TOKENS) ?? DEFAULT_MAX_TOKENS,
}));
