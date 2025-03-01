import { Module } from "@nestjs/common";

import { AuthModule } from "@/server/auth/auth.module";
import { PrinterModule } from "@/server/printer/printer.module";

import { StorageModule } from "../storage/storage.module";
import { ResumeController } from "./resume.controller";
import { ResumeChatController } from "./resume-chat.controller";
import { ResumeService } from "./resume.service";
import { OpenAIService } from "../services/openai.service";

@Module({
  imports: [AuthModule, PrinterModule, StorageModule],
  controllers: [ResumeController, ResumeChatController],
  providers: [ResumeService, OpenAIService],
  exports: [ResumeService],
})
export class ResumeModule {}
