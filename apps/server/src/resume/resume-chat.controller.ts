import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { OpenAIService } from "../openai/openai.service";
import { User } from "../user/decorators/user.decorator";
import { ResumeChatDto, ResumeChatResponseDto } from "@reactive-resume/dto";

@Controller("resume-chat")
@UseGuards(AuthGuard("jwt"))
export class ResumeChatController {
  constructor(private readonly openai: OpenAIService) {}

  @Post()
  async chat(@User() user: any, @Body() body: ResumeChatDto): Promise<ResumeChatResponseDto> {
    try {
      const response = await this.openai.handleResumeChat(body.messages, body.resume, body.job);
      return {
        message: response.message,
        resumeUpdates: response.resumeData
      };
    } catch (error) {
      console.error("Resume chat error:", error);
      throw error;
    }
  }
} 