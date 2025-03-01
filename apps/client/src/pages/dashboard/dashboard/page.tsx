import { t } from "@lingui/macro";
import { Helmet } from "react-helmet-async";
import { useJobApplications } from "@/client/services/jobs/application";
import { Card } from "@reactive-resume/ui";
import { motion } from "framer-motion";
import { formatDistance } from "date-fns";
import { Buildings, Calendar, Trophy, Star } from "@phosphor-icons/react";
import { useResumes } from "@/client/services/resume";
import { useJobs } from "@/client/services/jobs/job";
import { Progress } from "@reactive-resume/ui";
import { cn } from "@reactive-resume/utils";

export const DashboardPage = () => {
  const { data: applications = [], isLoading } = useJobApplications();
  const { resumes = [] } = useResumes();
  const { data: jobs = [] } = useJobs();

  // Calculate statistics
  const totalApplications = applications.length;
  const applicationsByStatus = applications.reduce((acc: Record<string, number>, app: any) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {});

  // Get recent applications (last 5)
  const recentApplications = [...applications]
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Define milestones
  const milestones = [
    {
      id: 'first-resume',
      title: t`Create Your First Resume`,
      description: t`Start your journey by creating a resume`,
      target: 1,
      current: resumes.length,
      completed: resumes.length >= 1
    },
    {
      id: 'first-job',
      title: t`Track Your First Job`,
      description: t`Add a job posting to track`,
      target: 1,
      current: jobs.length,
      completed: jobs.length >= 1
    },
    {
      id: 'optimize-resume',
      title: t`Optimize Your Resume`,
      description: t`Get an ATS score above 70%`,
      target: 70,
      current: 0,
      completed: false
    },
    {
      id: 'multiple-versions',
      title: t`Create Multiple Versions`,
      description: t`Customize your resume for different roles`,
      target: 3,
      current: resumes.length,
      completed: resumes.length >= 3
    },
    {
      id: 'track-applications',
      title: t`Track Your Applications`,
      description: t`Monitor your job application progress`,
      target: 5,
      current: applications.length,
      completed: applications.length >= 5
    },
    {
      id: 'power-user',
      title: t`Become a Power User`,
      description: t`Master resume customization`,
      target: 10,
      current: resumes.length,
      completed: resumes.length >= 10
    }
  ];

  const calculateOverallProgress = () => {
    const totalProgress = milestones.reduce((sum, milestone) => {
      const progress = Math.min(100, Math.round((milestone.current / milestone.target) * 100));
      return sum + progress;
    }, 0);
    
    return Math.round(totalProgress / milestones.length);
  };

  const overallProgress = calculateOverallProgress();

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "applied":
        return "text-blue-500";
      case "interviewing":
        return "text-yellow-500";
      case "offer":
        return "text-green-500";
      case "rejected":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case "draft":
        return t`Draft`;
      case "applied":
        return t`Applied`;
      case "interviewing":
        return t`Interviewing`;
      case "offer":
        return t`Offer`;
        case "rejected":
          return t`Rejected`;
      case "ghosted":
        return t`Ghosted`;
      case "withdrawn":
        return t`Withdrawn`;
      case "archived":
        return t`Archived`;
      default:
        return status;
    }
  };

  return (
    <>
      <Helmet>
        <title>
          {t`Dashboard`} - {t`Reactive Resume`}
        </title>
      </Helmet>

      <div className="space-y-8 p-4">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold tracking-tight"
        >
          {t`Dashboard`}
        </motion.h1>

        {/* Progress Section */}
        <div className="rounded-lg border bg-card">
          <div className="border-b p-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <h2 className="text-lg font-semibold">{t`Your Progress`}</h2>
            </div>
          </div>

          <div className="p-4 space-y-6">
            {/* Overall Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t`Overall Progress`}</span>
                <span>{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} className="h-2" />
            </div>

            {/* Individual Milestones */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {milestones.map((milestone) => {
                const progress = Math.min(100, Math.round((milestone.current / milestone.target) * 100));
                const isCompleted = progress >= 100;

                return (
                  <div 
                    key={milestone.id}
                    className={cn(
                      "rounded-lg border p-4 transition-colors",
                      isCompleted && "bg-primary/5 border-primary"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{milestone.title}</h3>
                      {isCompleted && <Star weight="fill" className="h-5 w-5 text-yellow-500" />}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{milestone.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>
                          {isCompleted ? t`Completed` : `${milestone.current}/${milestone.target}`}
                        </span>
                        <span>{progress}%</span>
                      </div>
                      <Progress 
                        value={progress}
                        className={cn("h-1", isCompleted && "bg-primary/20")}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card">
          <div className="border-b p-4">
            <h2 className="text-lg font-semibold">{t`Recent Applications`}</h2>
          </div>

          {isLoading ? (
            <div className="p-4">
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
            </div>
          ) : recentApplications.length > 0 ? (
            <div className="divide-y">
              {recentApplications.map((application: any) => (
                <div key={application.id} className="flex items-center justify-between p-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Buildings className="h-4 w-4" />
                      <span className="font-medium">{application.job.company}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {application.job.title}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`text-sm ${getStatusColor(application.status)}`}>
                      {getStatusLabel(application.status)}
                    </span>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {formatDistance(new Date(application.createdAt), new Date(), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              {t`No applications found. Start by applying to jobs!`}
            </div>
          )}
        </div>
      </div>
    </>
  );
}; 