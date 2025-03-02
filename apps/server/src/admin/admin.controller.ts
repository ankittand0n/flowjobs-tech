import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtGuard } from "../auth/guards/jwt.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { Role } from "@prisma/client";
import { RoleGuard } from "../auth/guards/role.guard";
import { PrismaService } from "nestjs-prisma";

@Controller("admin")
@UseGuards(JwtGuard, RoleGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("statistics")
  async getStatistics() {
    try {
      const [
        totalUsers,
        totalResumes,
        totalJobs,
        totalApplications,
        usersByRole,
        activeUsers24h,
        activeUsers7d,
        totalPublicResumes,
        averageResumeViews,
        averageResumeDownloads,
        jobsByType,
        applicationsByStatus
      ] = await Promise.all([
        this.prisma.user.count(),
        this.prisma.resume.count(),
        this.prisma.job.count(),
        this.prisma.jobApplication.count(),
        this.prisma.user.groupBy({
          by: ['role'],
          _count: true,
        }),
        this.prisma.user.count({
          where: {
            updatedAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
            }
          }
        }),
        this.prisma.user.count({
          where: {
            updatedAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          }
        }),
        this.prisma.resume.count({
          where: {
            visibility: 'public'
          }
        }),
        this.prisma.statistics.aggregate({
          _avg: {
            views: true
          }
        }),
        this.prisma.statistics.aggregate({
          _avg: {
            downloads: true
          }
        }),
        this.prisma.job.groupBy({
          by: ['type'],
          _count: true,
        }).then(types => types.filter(t => t.type !== null)),
        this.prisma.jobApplication.groupBy({
          by: ['status'],
          _count: true,
        }).then(statuses => statuses.filter(s => s.status !== null))
      ]);

      return {
        users: {
          total: totalUsers || 0,
          byRole: usersByRole.map(role => ({
            role: role.role,
            count: role._count
          })),
          activeUsers: {
            last24h: activeUsers24h || 0,
            last7d: activeUsers7d || 0
          }
        },
        resumes: {
          total: totalResumes || 0,
          public: totalPublicResumes || 0,
          averageViews: Math.round((averageResumeViews._avg?.views || 0) * 100) / 100,
          averageDownloads: Math.round((averageResumeDownloads._avg?.downloads || 0) * 100) / 100
        },
        jobs: {
          total: totalJobs || 0,
          byType: jobsByType.map(type => ({
            type: type.type || 'unknown',
            count: type._count
          }))
        },
        applications: {
          total: totalApplications || 0,
          byStatus: applicationsByStatus.map(status => ({
            status: status.status || 'unknown',
            count: status._count
          }))
        }
      };
    } catch (error) {
      throw error;
    }
  }
} 