import { Module } from "@nestjs/common";
import { JobApplicationController } from "./job-application.controller";

@Module({
  controllers: [JobApplicationController],
})
export class JobApplicationModule {}
