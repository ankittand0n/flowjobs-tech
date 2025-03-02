import { Module } from "@nestjs/common";
import { AdminController } from "./admin.controller";
import { PrismaModule } from "nestjs-prisma";

@Module({
  imports: [PrismaModule],
  controllers: [AdminController],
})
export class AdminModule {} 