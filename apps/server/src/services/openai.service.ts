import { Injectable } from "@nestjs/common";
import OpenAI from "openai";

@Injectable()
export class OpenAIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async chat(options: { messages: any[]; functions?: any[] }) {
    const response = await this.openai.chat.completions.create({
      model: "gpt-3.5-turbo-0125",
      messages: options.messages,
      functions: options.functions,
    });

    return {
      content: response.choices[0].message.content,
      functionCall: response.choices[0].message.function_call,
    };
  }
} 