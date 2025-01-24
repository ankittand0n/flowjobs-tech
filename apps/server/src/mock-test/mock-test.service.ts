import { Injectable, Logger } from "@nestjs/common";
import { CreateMockTest } from "@reactive-resume/dto";
import { PrismaService } from "nestjs-prisma";

@Injectable()
export class MockTestService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createMockTestDto: CreateMockTest) {
    try {
      return await this.prisma.mockTest.create({
        data: {
          ...createMockTestDto,
          userId,
        },
      });
    } catch (error) {
      Logger.error(error);
      throw error;
    }
  }

  findAll(userId: string) {
    return this.prisma.mockTest.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  findOne(userId: string, id: string) {
    return this.prisma.mockTest.findFirstOrThrow({
      where: { id, userId },
    });
  }

  async remove(userId: string, id: string) {
    return this.prisma.mockTest.delete({
      where: { id, userId },
    });
  }
} 