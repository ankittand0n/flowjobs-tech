import { Controller, Post, Body } from '@nestjs/common';
import { OpenAIService } from './openai.service';

@Controller('openai')
export class OpenAIController {
  constructor(private readonly openaiService: OpenAIService) {}

  @Post('extract-keywords')
  async extractKeywords(@Body() { text }: { text: string }) {
    return this.openaiService.extractAtsKeywords(text);
  }

  @Post('generate-questions')
  async generateQuestions(@Body() { text }: { text: string }) {
    return this.openaiService.generateQuestions(text);
  }

  @Post('evaluate-answer')
  async evaluateAnswer(
    @Body() { question, answer }: { question: string; answer: string }
  ) {
    return this.openaiService.evaluateAnswer(question, answer);
  }

  @Post('generate-mock-questions')
  async generateMockQuestions(@Body() params: {
    jobTitle: string;
    company: string;
    keywords: string[];
    count: number;
  }) {
    return this.openaiService.generateMockQuestions(params);
  }

  @Post('change-tone')
  async changeTone(
    @Body() { text, mood }: { text: string; mood: "casual" | "professional" | "confident" | "friendly" }
  ) {
    return this.openaiService.changeTone(text, mood);
  }

  @Post('fix-grammar')
  async fixGrammar(@Body() { text }: { text: string }) {
    return this.openaiService.fixGrammar(text);
  }

  @Post('improve-writing')
  async improveWriting(@Body() { text }: { text: string }) {
    return this.openaiService.improveWriting(text);
  }
} 