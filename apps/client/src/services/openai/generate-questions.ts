import { t } from "@lingui/macro";
import { DEFAULT_MAX_TOKENS, DEFAULT_MODEL } from "@/client/constants/llm";
import { openai } from "./client";

const PROMPT = `You are an AI interviewer specialized in conducting technical interviews.
Generate interview questions based on the following job details and keywords.
Mix of multiple choice and open-ended questions.
Follow this exact format for the response:

{
  "questions": [
    {
      "question": "Question Related to the ATS Keywords in the Job Details & Keywords",
      "type": "technical",
      "format": "multiple-choice",
      "keyword": "ATS Keywords",
      "expectedDuration": 1,
      "options": [
        "Option 1",
        "Option 2",
        "Option 3",
        "Option 4"
      ],
      "correctOption": 1
    },
    {
      "question": "Question Related to the ATS Keywords in the Job Details & Keywords",
      "type": "technical",
      "format": "open-ended",
      "keyword": "ATS Keywords",
      "expectedDuration": 3
    }
  ]
}

Return only valid JSON with no additional text.
Make 60% multiple choice and 40% open-ended questions.
Each multiple choice question should have 4 options.

Job Details:
Title: {jobTitle}
Company: {company}
Key Skills: {keywords}
Number of Questions: {count}

JSON Response: """`;


const ANSWER_PROMPT = `You are an AI interviewer evaluating interview responses.
For the following question and response, provide:
1. A model answer for comparison
2. Key points that should be covered
3. A score out of 100 based on completeness, accuracy, and clarity

Follow this exact format for the response:

{
  "modelAnswer": "string",
  "keyPoints": ["point1", "point2", "point3"],
  "score": 85,
  "feedback": "Detailed feedback on the response"
}

Question: {question}
Response: {answer}

JSON Response: """`;

export type MockQuestion = {
  question: string;
  type: "technical" | "behavioral" | "scenario";
  format: "multiple-choice" | "open-ended";
  keyword: string;
  expectedDuration: number;
  options?: string[];  // For multiple choice questions
  correctOption?: number;  // Index of correct option
  modelAnswer?: string;
  keyPoints?: string[];
};

export type AnswerEvaluation = {
  modelAnswer: string;
  keyPoints: string[];
  score: number;
  feedback: string;
};

const cleanJsonResponse = (content: string): string => {
  // Remove markdown code block markers and any whitespace before/after
  return content
    .replace(/^```(?:json)?\s*/i, '')  // Remove opening ```json or ``` 
    .replace(/\s*```$/, '')            // Remove closing ```
    .trim();
};

export const generateMockQuestions = async (
  params: {
    jobTitle: string;
    company: string;
    keywords: string[];
    count: number;
  },
  config?: { model?: string; maxTokens?: number }
) => {
  try {
    const prompt = PROMPT
      .replace("{jobTitle}", params.jobTitle)
      .replace("{company}", params.company)
      .replace("{keywords}", params.keywords.join(", "))
      .replace("{count}", params.count.toString());

    // console.log("Sending prompt to OpenAI:", prompt);

    const result = await openai().chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: config?.model ?? DEFAULT_MODEL,
      max_tokens: config?.maxTokens ?? DEFAULT_MAX_TOKENS,
      temperature: 0.7,
      stop: ['"""'],
      n: 1,
    });

    if (result.choices.length === 0) {
      throw new Error(t`OpenAI did not return any questions.`);
    }

    const content = result.choices[0].message.content;
    if (!content) throw new Error(t`No content in OpenAI response`);

    // console.log("OpenAI response:", content);

    // Clean the response before parsing
    const cleanedContent = cleanJsonResponse(content);
    const parsed = JSON.parse(cleanedContent) as { questions: MockQuestion[] };
    return parsed.questions;

  } catch (error) {
    console.error("Failed to generate mock questions:", error);
    throw error;
  }
};

export const evaluateAnswer = async (
  question: string,
  answer: string,
  config?: { model?: string; maxTokens?: number }
) => {
  try {
    const prompt = ANSWER_PROMPT
      .replace("{question}", question)
      .replace("{answer}", answer);

    const result = await openai().chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: config?.model ?? DEFAULT_MODEL,
      max_tokens: config?.maxTokens ?? DEFAULT_MAX_TOKENS,
      temperature: 0.3,
      stop: ['"""'],
      n: 1,
    });

    if (!result.choices[0].message.content) {
      throw new Error(t`No evaluation returned from OpenAI`);
    }

    // Clean the response before parsing
    const cleanedContent = cleanJsonResponse(result.choices[0].message.content);
    return JSON.parse(cleanedContent) as AnswerEvaluation;
  } catch (error) {
    console.error("Failed to evaluate answer:", error);
    throw error;
  }
}; 