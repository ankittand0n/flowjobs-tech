import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, ConflictException, InternalServerErrorException } from "@nestjs/common";
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
    @Body() createJobApplicationDto: CreateJobApplicationDto
  ) {
    try {
      // Check if application already exists
      const existingApplication = await this.prisma.jobApplication.findFirst({
        where: {
          userId: user.id,
          jobId: createJobApplicationDto.jobId,
        },
      });

      if (existingApplication) {
        throw new ConflictException('You have already applied to this job');
      }

      return this.prisma.jobApplication.create({
        data: {
          jobId: createJobApplicationDto.jobId,
          status: createJobApplicationDto.status,
          userId: user.id,
          notes: createJobApplicationDto.notes ?? "",
          resumeId: createJobApplicationDto.resumeId,
        },
        include: {
          job: true,
        },
      });
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create application');
    }
  }

  @Get()
  async getJobApplications(@GetUser() user: User) {
    return this.prisma.jobApplication.findMany({
      where: {
        userId: user.id, // Only get applications created by the current user
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
    // Verify the application belongs to the user
    const application = await this.prisma.jobApplication.findFirst({
      where: {
        id,
        userId: user.id, // Check if the application belongs to the user
      },
    });

    if (!application) {
      throw new Error("Application not found");
    }

    return this.prisma.jobApplication.update({
      where: { id },
      data: updateDto,
      include: {
        job: true,
      },
    });
  }

  @Delete(":id")
  async deleteJobApplication(@GetUser() user: User, @Param("id") id: string) {
    // Verify the application belongs to the user
    const application = await this.prisma.jobApplication.findFirst({
      where: {
        id,
        userId: user.id, // Check if the application belongs to the user
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
