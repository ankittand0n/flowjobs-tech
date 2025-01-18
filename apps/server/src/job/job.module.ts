import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { JobController } from "./job.controller";

@Module({
  imports: [HttpModule],
  controllers: [JobController],
})
export class JobModule {} 