import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, ForbiddenException, BadRequestException, Logger } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { User } from "@prisma/client";
import { PrismaService } from "nestjs-prisma";
import { User as GetUser } from "../user/decorators/user.decorator";
import { CreateJobDto, UpdateJobDto } from "@reactive-resume/dto";
import { RoleGuard } from "../auth/guards/role.guard";
import { Roles, Role } from "../auth/decorators/roles.decorator";

@Controller("jobs")
@UseGuards(AuthGuard("jwt"))
export class JobController {
  private readonly logger = new Logger(JobController.name);

  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getJobs(@GetUser() user: User) {
    const jobs = await this.prisma.job.findMany({
      include: { 
        applications: {
          where: { userId: user.id }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      currentUserId: user.id,
      jobs: jobs.map(job => ({
        ...job
      }))
    };
  }

  @Post()
  async createJob(@GetUser() user: User, @Body() createJobDto: CreateJobDto) {
    try {
      this.logger.debug('Creating job with data:', {
        dto: createJobDto,
        userId: user.id
      });

      // Create a new object without createdBy from the DTO
      const { createdBy, ...jobData } = createJobDto;

      const job = await this.prisma.job.create({
        data: {
          ...jobData,
          createdBy: user.id, // Explicitly set createdBy from the authenticated user
        },
      });

      return job;
    } catch (error) {
      this.logger.error('Failed to create job:', {
        error: error.message,
        stack: error.stack,
        data: createJobDto,
        userId: user.id,
        validationErrors: error.errors
      });

      throw error;
    }
  }

  @Patch(":id")
  @UseGuards(AuthGuard("jwt"))
  async updateJob(
    @GetUser() user: User,
    @Param("id") id: string,
    @Body() updateJobDto: UpdateJobDto,
  ) {
    try {
      console.log('Raw update request:', {
        body: updateJobDto,
        params: { id },
        user: { id: user.id }
      });

      // Detailed validation logging
      const validationIssues = {
        title: !updateJobDto.title?.trim() ? 'Title is empty or missing' : null,
        company: !updateJobDto.company?.trim() ? 'Company is empty or missing' : null,
        location: updateJobDto.location && typeof updateJobDto.location !== 'string' ? 'Location must be a string' : null,
        type: updateJobDto.type && typeof updateJobDto.type !== 'string' ? 'Type must be a string' : null,
        salary: updateJobDto.salary && typeof updateJobDto.salary !== 'string' ? 'Salary must be a string' : null,
        url: updateJobDto.url && typeof updateJobDto.url !== 'string' ? 'URL must be a string' : null,
        description: updateJobDto.description && typeof updateJobDto.description !== 'string' ? 'Description must be a string' : null,
      };

      console.log('Validation check:', {
        dto: updateJobDto,
        issues: Object.entries(validationIssues).filter(([_, value]) => value !== null)
      });

      // Required field validation
      if (!updateJobDto.title?.trim()) {
        throw new BadRequestException('Title is required');
      }
      if (!updateJobDto.company?.trim()) {
        throw new BadRequestException('Company is required');
      }

      const job = await this.prisma.job.findUnique({
        where: { id },
        include: { applications: true }
      });

      if (!job) {
        throw new BadRequestException('Job not found');
      }

      if (job.createdBy !== user.id) {
        throw new ForbiddenException('You cannot edit this job');
      }

      // Clean and validate the update data
      const validUpdateData = {
        title: updateJobDto.title.trim(),
        company: updateJobDto.company.trim(),
        ...(updateJobDto.location && { location: updateJobDto.location.trim() }),
        ...(updateJobDto.type && { type: updateJobDto.type }),
        ...(updateJobDto.salary && { salary: updateJobDto.salary.trim() }),
        ...(updateJobDto.url && { url: updateJobDto.url.trim() }),
        ...(updateJobDto.description && { description: updateJobDto.description }),
        updatedAt: new Date(),
      };

      console.log('Processed update data:', validUpdateData);

      const updatedJob = await this.prisma.job.update({
        where: {
          id,
          createdBy: user.id,
        },
        data: validUpdateData,
        include: {
          applications: {
            where: { userId: user.id }
          },
        },
      });

      return updatedJob;
    } catch (error) {
      console.error('Update job error:', {
        error: error.message,
        stack: error.stack,
        data: updateJobDto,
        validation: error.response?.message
      });
      throw error;
    }
  }

  @Delete(":id")
  async deleteJob(@GetUser() user: User, @Param("id") id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
    });

    if (!job || job.createdBy !== user.id) {
      throw new ForbiddenException('You cannot delete this job');
    }

    return this.prisma.job.delete({
      where: {
        id,
        createdBy: user.id,
      },
    });
  }

  @Get(":id")
  async getJob(@GetUser() user: User, @Param("id") id: string) {
    return this.prisma.job.findUnique({
      where: {
        id,
        createdBy: user.id,
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
        createdBy: user.id,
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

  @Post(':id/refresh-ats')
  @UseGuards(RoleGuard)
  @Roles(Role.ADMIN)
  async refreshAtsKeywords(@Param('id') id: string) {
    return this.prisma.job.update({
      where: {
        id,
      },
      data: {
        updatedAt: new Date(),
      },
      include: {
        applications: true,
      },
    });
  }
}
