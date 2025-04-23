import { Module } from "@nestjs/common";

import { AuthModule } from "@/server/auth/auth.module";
import { PrinterModule } from "@/server/printer/printer.module";

import { StorageModule } from "../storage/storage.module";
import { ResumeController } from "./resume.controller";
import { ResumeChatController } from "./resume-chat.controller";
import { ResumeService } from "./resume.service";
import { OpenAIService } from "../openai/openai.service";
import { OpenAIModule } from "../openai/openai.module";

@Module({
  imports: [AuthModule, PrinterModule, StorageModule, OpenAIModule],
  controllers: [ResumeController, ResumeChatController],
  providers: [ResumeService],
  exports: [ResumeService],
})
export class ResumeModule {}
