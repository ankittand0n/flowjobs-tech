import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { User } from "@prisma/client";
import { PrismaService } from "nestjs-prisma";
import { User as GetUser } from "../user/decorators/user.decorator";

type CreateJobApplicationDto = {
  jobId: string;
  status: string;
  resumeId?: string;
  notes?: string;
};

@Controller("job-applications")
@UseGuards(AuthGuard("jwt"))
export class JobApplicationController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  async createJobApplication(
    @GetUser() user: User,
    @Body() createDto: CreateJobApplicationDto
  ) {
    // Verify the job belongs to the user
    const job = await this.prisma.job.findFirst({
      where: {
        id: createDto.jobId,
        userId: user.id,
      },
    });

    if (!job) {
      throw new Error("Job not found");
    }

    return this.prisma.jobApplication.create({
      data: {
        userId: user.id,
        jobId: createDto.jobId,
        status: createDto.status,
        resumeId: createDto.resumeId,
        notes: createDto.notes || "",
      },
    });
  }

  @Get()
  async getJobApplications(@GetUser() user: User) {
    return this.prisma.jobApplication.findMany({
      where: {
        job: {
          userId: user.id,
        },
      },
      include: {
        job: true,
      },
    });
  }

  @Patch(":id")
  async updateJobApplication(
    @GetUser() user: User,
    @Param("id") id: string,
    @Body() updateDto: Partial<CreateJobApplicationDto>
  ) {
    // Verify the application belongs to the user's job
    const application = await this.prisma.jobApplication.findFirst({
      where: {
        id,
        job: {
          userId: user.id,
        },
      },
    });

    if (!application) {
      throw new Error("Application not found");
    }

    return this.prisma.jobApplication.update({
      where: { id },
      data: updateDto,
    });
  }

  @Delete(":id")
  async deleteJobApplication(@GetUser() user: User, @Param("id") id: string) {
    // Verify the application belongs to the user's job
    const application = await this.prisma.jobApplication.findFirst({
      where: {
        id,
        job: {
          userId: user.id,
        },
      },
    });

    if (!application) {
      throw new Error("Application not found");
    }

    return this.prisma.jobApplication.delete({
      where: { id },
    });
  }
}
