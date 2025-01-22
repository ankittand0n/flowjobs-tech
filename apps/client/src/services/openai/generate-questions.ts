import { axios } from '../../libs/axios';

export type MockQuestion = {
  question: string;
  type: "technical" | "behavioral" | "scenario";
  format: "multiple-choice" | "open-ended";
  keyword: string;
  expectedDuration: number;
  options?: string[];
  correctOption?: number;
  modelAnswer?: string;
  keyPoints?: string[];
};

export type AnswerEvaluation = {
  modelAnswer: string;
  keyPoints: string[];
  score: number;
  feedback: string;
};

export const generateMockQuestions = async (params: {
  jobTitle: string;
  company: string;
  keywords: string[];
  count: number;
}) => {
  const { data } = await axios.post('/openai/generate-mock-questions', params);
  return data.questions as MockQuestion[];
};

export const evaluateAnswer = async (question: string, answer: string) => {
  const { data } = await axios.post('/openai/evaluate-answer', { 
    question, 
    answer 
  });
  return data as AnswerEvaluation;
};

export const generateQuestions = async (text: string) => {
  const { data } = await axios.post('/openai/generate-questions', { text });
  return data;
}; 