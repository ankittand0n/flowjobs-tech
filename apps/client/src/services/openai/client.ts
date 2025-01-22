import { t } from "@lingui/macro";
import { OpenAI } from "openai";


export const openai = () => {
  // Get API configuration from environment variables
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  const baseURL = import.meta.env.VITE_OPENAI_BASE_URL;

  // Check if API key exists
  if (!apiKey) {
    throw new Error(
      t`Your OpenAI API Key has not been set yet.`,
    );
  }

  // Create and return configured OpenAI client
  return new OpenAI({
    apiKey,
    baseURL,
    dangerouslyAllowBrowser: true,
  });
};
