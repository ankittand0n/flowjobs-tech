import { t } from "@lingui/macro";
import { OpenAI } from "openai";
import { useOpenAiStore } from "@/client/stores/openai";


export const openai = () => {
  // Get API configuration from environment variables
  const apiKey = import.meta.env.OPENAI_API_KEY;
  const baseURL = import.meta.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';

  // Check if API key exists
  if (!apiKey) {
    throw new Error(
      t`Your OpenAI API Key has not been set yet. Please go to your account settings to enable OpenAI Integration.`,
    );
  }

  // Create and return configured OpenAI client
  return new OpenAI({
    apiKey,
    baseURL,
    dangerouslyAllowBrowser: true,
  });
};
