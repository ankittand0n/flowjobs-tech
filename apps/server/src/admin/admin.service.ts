import { Injectable, Logger } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class AdminService {
  private prisma: PrismaClient;
  private readonly logger = new Logger(AdminService.name);

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getStatistics() {
    try {
      this.logger.debug('Fetching admin statistics');

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
        // Total users
        this.prisma.user.count(),
        
        // Total resumes
        this.prisma.resume.count(),
        
        // Total jobs
        this.prisma.job.count(),
        
        // Total applications
        this.prisma.jobApplication.count(),
        
        // Users by role
        this.prisma.user.groupBy({
          by: ['role'],
          _count: true,
        }),
        
        // Active users in last 24h
        this.prisma.user.count({
          where: {
            updatedAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
            }
          }
        }),
        
        // Active users in last 7 days
        this.prisma.user.count({
          where: {
            updatedAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          }
        }),
        
        // Total public resumes
        this.prisma.resume.count({
          where: {
            visibility: 'public'
          }
        }),
        
        // Average resume views
        this.prisma.statistics.aggregate({
          _avg: {
            views: true
          }
        }),
        
        // Average resume downloads
        this.prisma.statistics.aggregate({
          _avg: {
            downloads: true
          }
        }),
        
        // Jobs by type
        this.prisma.job.groupBy({
          by: ['type'],
          _count: true,
        }).then(types => types.filter(t => t.type !== null)),
        
        // Applications by status
        this.prisma.jobApplication.groupBy({
          by: ['status'],
          _count: true,
        }).then(statuses => statuses.filter(s => s.status !== null))
      ]);

      const stats = {
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

      this.logger.debug('Statistics fetched successfully', stats);
      return stats;
    } catch (error) {
      this.logger.error('Error fetching statistics', error);
      throw error;
    }
  }
} 