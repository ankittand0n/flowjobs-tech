import { t } from "@lingui/macro";
import { Helmet } from "react-helmet-async";
import { useJobApplications } from "@/client/services/jobs/application";
import { Card } from "@reactive-resume/ui";
import { motion } from "framer-motion";
import { formatDistance } from "date-fns";
import { Buildings, Calendar } from "@phosphor-icons/react";

export const DashboardPage = () => {
  const { data: applications = [], isLoading } = useJobApplications();

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

        <div className="grid gap-4 md:grid-cols-6 lg:grid-cols-6">
          <Card className="p-4">
            <h2 className="text-lg font-semibold">{t`Total Applications`}</h2>
            <p className="mt-2 text-3xl font-bold">{totalApplications}</p>
          </Card>

          {Object.entries(applicationsByStatus).map(([status, count]) => (
            <Card key={status} className="p-4">
              <h2 className="text-lg font-semibold">
                <span className={getStatusColor(status)}>{getStatusLabel(status)}</span>
              </h2>
              <p className="mt-2 text-3xl font-bold">{count}</p>
            </Card>
          ))}
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