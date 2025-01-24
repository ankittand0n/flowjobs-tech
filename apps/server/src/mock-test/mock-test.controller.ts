import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Logger,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { User as UserEntity } from "@prisma/client";
import { CreateMockTest } from "@reactive-resume/dto";

import { User } from "@/server/user/decorators/user.decorator";
import { TwoFactorGuard } from "../auth/guards/two-factor.guard";
import { MockTestService } from "./mock-test.service";

@ApiTags("Mock Tests")
@Controller("mock-tests")
export class MockTestController {
  constructor(private readonly mockTestService: MockTestService) {}

  @Post()
  @UseGuards(TwoFactorGuard)
  async create(@User() user: UserEntity, @Body() createMockTestDto: CreateMockTest) {
    try {
      return await this.mockTestService.create(user.id, createMockTestDto);
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  @Get()
  @UseGuards(TwoFactorGuard)
  findAll(@User() user: UserEntity) {
    return this.mockTestService.findAll(user.id);
  }

  @Get(":id")
  @UseGuards(TwoFactorGuard)
  findOne(@User() user: UserEntity, @Param("id") id: string) {
    return this.mockTestService.findOne(user.id, id);
  }

  @Delete(":id")
  @UseGuards(TwoFactorGuard)
  remove(@User() user: UserEntity, @Param("id") id: string) {
    return this.mockTestService.remove(user.id, id);
  }
} 