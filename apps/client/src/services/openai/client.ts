import { t } from "@lingui/macro";
import { OpenAI } from "openai";

export const openai = () => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  const baseURL = import.meta.env.VITE_OPENAI_BASE_URL;

  if (!apiKey) {
    throw new Error(
      t`Your OpenAI API Key has not been set yet. Please go to your account settings to enable OpenAI Integration.`,
    );
  }

  return new OpenAI({
    apiKey,
    baseURL,
    dangerouslyAllowBrowser: true,
  });
};
