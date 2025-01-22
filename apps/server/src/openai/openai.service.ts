import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { ATS_PROMPT, QUESTIONS_PROMPT, ANSWER_EVALUATION_PROMPT, MOCK_QUESTIONS_PROMPT, CHANGE_TONE_PROMPT, FIX_GRAMMAR_PROMPT, IMPROVE_WRITING_PROMPT } from './prompts';

@Injectable()
export class OpenAIService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    const baseURL = this.configService.get<string>('OPENAI_BASE_URL');
    
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }
    
    this.openai = new OpenAI({
      apiKey,
      baseURL,
    });
  }

  async extractAtsKeywords(text: string) {
    const model = this.configService.get<string>('OPENAI_MODEL') || 'gpt-3.5-turbo';
    const maxTokens = 4096;

    const response = await this.openai.chat.completions.create({
      model,
      max_tokens: maxTokens,
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: "You are an AI assistant specialized in analyzing job descriptions and extracting key ATS keywords."
        },
        {
          role: "user",
          content: ATS_PROMPT.replace("{input}", text)
        }
      ]
    });

    try {
      const content = response.choices[0].message.content;
      if (!content) throw new Error('No content in OpenAI response');
      
      // Clean the response before parsing
      const cleanedContent = content
        .replace(/^```(?:json)?\s*/i, '')  // Remove opening ```json or ``` 
        .replace(/\s*```$/, '')            // Remove closing ```
        .trim();
      
      return JSON.parse(cleanedContent);
    } catch (error) {
      console.error("Failed to parse OpenAI response:", error);
      throw new Error('Failed to extract ATS keywords');
    }
  }

  async generateQuestions(text: string) {
    const model = this.configService.get<string>('OPENAI_MODEL') || 'gpt-3.5-turbo';
    const maxTokens = 4096;

    const response = await this.openai.chat.completions.create({
      model,
      max_tokens: maxTokens,
      temperature: 0.7, // Slightly higher for more creative questions
      messages: [
        {
          role: "system",
          content: "You are an AI interviewer specialized in creating relevant technical and behavioral questions."
        },
        {
          role: "user",
          content: QUESTIONS_PROMPT.replace("{input}", text)
        }
      ]
    });

    try {
      const content = response.choices[0].message.content;
      if (!content) throw new Error('No content in OpenAI response');
      
      const cleanedContent = content
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/, '')
        .trim();
      
      return JSON.parse(cleanedContent);
    } catch (error) {
      console.error("Failed to parse OpenAI response:", error);
      throw new Error('Failed to generate questions');
    }
  }

  async evaluateAnswer(question: string, answer: string) {
    const model = this.configService.get<string>('OPENAI_MODEL') || 'gpt-3.5-turbo';
    const maxTokens = 4096;

    const response = await this.openai.chat.completions.create({
      model,
      max_tokens: maxTokens,
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: "You are an AI interviewer evaluating technical interview responses."
        },
        {
          role: "user",
          content: ANSWER_EVALUATION_PROMPT
            .replace("{question}", question)
            .replace("{answer}", answer)
        }
      ]
    });

    try {
      const content = response.choices[0].message.content;
      if (!content) throw new Error('No content in OpenAI response');
      
      const cleanedContent = content
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/, '')
        .trim();
      
      return JSON.parse(cleanedContent);
    } catch (error) {
      console.error("Failed to parse OpenAI response:", error);
      throw new Error('Failed to evaluate answer');
    }
  }

  async generateMockQuestions(params: {
    jobTitle: string;
    company: string;
    keywords: string[];
    count: number;
  }) {
    const model = this.configService.get<string>('OPENAI_MODEL') || 'gpt-3.5-turbo';
    const maxTokens = 4096;

    const prompt = MOCK_QUESTIONS_PROMPT
      .replace("{jobTitle}", params.jobTitle)
      .replace("{company}", params.company)
      .replace("{keywords}", params.keywords.join(", "))
      .replace("{count}", params.count.toString());

    const response = await this.openai.chat.completions.create({
      model,
      max_tokens: maxTokens,
      temperature: 0.7,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });

    try {
      const content = response.choices[0].message.content;
      if (!content) throw new Error('No content in OpenAI response');
      
      const cleanedContent = content
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/, '')
        .trim();
      
      return JSON.parse(cleanedContent);
    } catch (error) {
      console.error("Failed to parse OpenAI response:", error);
      throw new Error('Failed to generate mock questions');
    }
  }

  async changeTone(text: string, mood: "casual" | "professional" | "confident" | "friendly") {
    const model = this.configService.get<string>('OPENAI_MODEL') || 'gpt-3.5-turbo';
    const maxTokens = 4096;

    const response = await this.openai.chat.completions.create({
      model,
      max_tokens: maxTokens,
      temperature: 0.5,
      messages: [
        {
          role: "user",
          content: CHANGE_TONE_PROMPT
            .replace("{mood}", mood)
            .replace("{input}", text)
        }
      ]
    });

    return response.choices[0].message.content ?? text;
  }

  async fixGrammar(text: string) {
    const model = this.configService.get<string>('OPENAI_MODEL') || 'gpt-3.5-turbo';
    const maxTokens = 4096;

    const response = await this.openai.chat.completions.create({
      model,
      max_tokens: maxTokens,
      temperature: 0,
      messages: [
        {
          role: "user",
          content: FIX_GRAMMAR_PROMPT.replace("{input}", text)
        }
      ]
    });

    return response.choices[0].message.content ?? text;
  }

  async improveWriting(text: string) {
    const model = this.configService.get<string>('OPENAI_MODEL') || 'gpt-3.5-turbo';
    const maxTokens = 4096;

    const response = await this.openai.chat.completions.create({
      model,
      max_tokens: maxTokens,
      temperature: 0,
      messages: [
        {
          role: "user",
          content: IMPROVE_WRITING_PROMPT.replace("{input}", text)
        }
      ]
    });

    return response.choices[0].message.content ?? text;
  }
} 