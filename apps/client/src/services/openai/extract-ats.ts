/* eslint-disable lingui/text-restrictions */

import { t } from "@lingui/macro";
import { DEFAULT_MAX_TOKENS, DEFAULT_MODEL } from "@/client/constants/llm";
import { openai } from "./client";

// Add helper function
const cleanJsonResponse = (content: string): string => {
  // Remove markdown code block markers and any whitespace before/after
  return content
    .replace(/^```(?:json)?\s*/i, '')  // Remove opening ```json or ``` 
    .replace(/\s*```$/, '')            // Remove closing ```
    .trim();
};

const PROMPT = `You are an AI assistant specialized in analyzing job descriptions and extracting key ATS (Applicant Tracking System) keywords.
Analyze the following job description and extract relevant keywords in a structured JSON format.
Follow this exact format for the response:

{
  "skills": [
    { "keyword": "JavaScript", "relevance": 0.9, "count": 2 },
    { "keyword": "React", "relevance": 0.8, "count": 1 }
  ],
  "requirements": [
    { "keyword": "5+ years experience", "type": "must-have" },
    { "keyword": "AWS certification", "type": "nice-to-have" }
  ],
  "experience": [
    { "keyword": "frontend development", "yearsRequired": 5 },
    { "keyword": "team leadership", "yearsRequired": 2 }
  ],
  "education": [
    { "level": "Bachelor's", "field": "Computer Science" },
    { "level": "Master's", "field": "Software Engineering" }
  ]
}

Return only valid JSON with no additional text. Ensure relevance is between 0 and 1.

Job Description: """{input}"""

JSON Response: """`;

export const extractAtsKeywords = async (
  description: string,
  config?: { model?: string; maxTokens?: number }
) => {
  try {
    const prompt = PROMPT.replace("{input}", description);

    const result = await openai().chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: config?.model ?? DEFAULT_MODEL,
      max_tokens: config?.maxTokens ?? DEFAULT_MAX_TOKENS,
      temperature: 0.3,
      stop: ['"""'],
      n: 1,
    });

    if (result.choices.length === 0) {
      throw new Error(t`OpenAI did not return any analysis for the job description.`);
    }

    const content = result.choices[0].message.content;
    if (!content) throw new Error(t`No content in OpenAI response`);

    // Clean the response before parsing
    const cleanedContent = cleanJsonResponse(content);
    return JSON.parse(cleanedContent) as {
      skills: Array<{
        keyword: string;
        relevance: number;
        count: number;
      }>;
      requirements: Array<{
        keyword: string;
        type: "must-have" | "nice-to-have";
      }>;
      experience: Array<{
        keyword: string;
        yearsRequired?: number;
      }>;
      education: Array<{
        level: string;
        field?: string;
      }>;
    };
  } catch (error) {
    console.error("Failed to extract ATS keywords:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to extract ATS keywords: ${error.message}`);
    }
    throw new Error('Failed to extract ATS keywords');
  }
};
