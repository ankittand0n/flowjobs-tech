import { Module } from "@nestjs/common";
import { AuthModule } from "@/server/auth/auth.module";
import { MockTestController } from "./mock-test.controller";
import { MockTestService } from "./mock-test.service";

@Module({
  imports: [AuthModule],
  controllers: [MockTestController],
  providers: [MockTestService],
  exports: [MockTestService],
})
export class MockTestModule {} 