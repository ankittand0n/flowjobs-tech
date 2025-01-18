import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { User } from "@prisma/client";
import { PrismaService } from "nestjs-prisma";

import { User as GetUser } from "../user/decorators/user.decorator";
import { CreateJobDto , UpdateJobDto} from "@reactive-resume/dto";

@Controller("jobs")
@UseGuards(AuthGuard("jwt"))
export class JobController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getJobs(@GetUser() user: User) {
    return this.prisma.job.findMany({
      where: { userId: user.id },
      include: { applications: true },
      orderBy: { createdAt: "desc" },
    });
  }

  @Post()
  async createJob(@GetUser() user: User, @Body() createJobDto: CreateJobDto) {
    try {
      if (createJobDto.url) {
        const existingJob = await this.prisma.job.findFirst({
          where: {
            userId: user.id,
            url: createJobDto.url,
          },
          include: {
            applications: true,
          },
        });

        if (existingJob) {
          return existingJob;
        }
      }

      return await this.prisma.job.create({
        data: {
          ...createJobDto,
          userId: user.id,
        },
        include: {
          applications: true,
        },
      });
    } catch (error) {
      console.error("Error creating job:", error);
      throw error;
    }
  }

  @Patch(":id")
  async updateJob(
    @GetUser() user: User,
    @Param("id") id: string,
    @Body() updateJobDto: UpdateJobDto,
  ) {
    return this.prisma.job.update({
      where: {
        id,
        userId: user.id,
      },
      data: {
        ...updateJobDto,
        updatedAt: new Date(),
      },
      include: {
        applications: true,
      },
    });
  }

  @Delete(":id")
  async deleteJob(@GetUser() user: User, @Param("id") id: string) {
    return this.prisma.job.delete({
      where: {
        id,
        userId: user.id,
      },
    });
  }

  @Get(":id")
  async getJob(@GetUser() user: User, @Param("id") id: string) {
    return this.prisma.job.findUnique({
      where: {
        id,
        userId: user.id,
      },
      include: {
        applications: true,
      },
    });
  }

  @Patch(":id/ats-keywords")
  async updateJobAtsKeywords(
    @GetUser() user: User,
    @Param("id") id: string,
    @Body() data: {
      atsKeywords: {
        skills: Array<{ keyword: string; relevance: number; count: number }>;
        requirements: Array<{ keyword: string; type: string }>;
        experience: Array<{ keyword: string; yearsRequired?: number }>;
        education: Array<{ level: string; field?: string }>;
      };
    },
  ) {
    return this.prisma.job.update({
      where: {
        id,
        userId: user.id,
      },
      data: {
        atsKeywords: data.atsKeywords,
        updatedAt: new Date(),
      },
      include: {
        applications: true,
      },
    });
  }
}
