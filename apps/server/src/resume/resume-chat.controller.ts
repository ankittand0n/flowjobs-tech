import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { OpenAIService } from "../services/openai.service";
import { User } from "../user/decorators/user.decorator";
import { ResumeChatDto, ResumeChatResponseDto } from "@reactive-resume/dto";

@Controller("resume-chat")
@UseGuards(AuthGuard("jwt"))
export class ResumeChatController {
  constructor(private readonly openai: OpenAIService) {}

  @Post()
  async chat(@User() user: any, @Body() body: ResumeChatDto): Promise<ResumeChatResponseDto> {
    try {
      const completion = await this.openai.chat({
        messages: [
          {
            role: "system",
            content: "You are a helpful resume assistant. Help users improve their resume by suggesting changes and updates. When asked to make changes, return the updated resume data structure.",
          },
          ...body.messages,
        ],
        functions: [
          {
            name: "updateResume",
            description: "Update the resume data structure",
            parameters: {
              type: "object",
              properties: {
                resumeData: {
                  type: "object",
                  description: "The updated resume data structure",
                },
              },
            },
          },
        ],
      });

      return {
        message: completion.content || "I couldn't process that request.",
        resumeUpdates: completion.functionCall?.arguments ? JSON.parse(completion.functionCall.arguments) : null,
      };
    } catch (error) {
      console.error("Resume chat error:", error);
      throw error;
    }
  }
} 