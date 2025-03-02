import { t } from "@lingui/macro";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@reactive-resume/ui";
import { Users, FileText, Briefcase, ChartLine, UsersFour, Crown } from "@phosphor-icons/react";
import { axios } from "@/client/libs/axios";
import { useAuth } from "@/client/hooks/use-auth";
import { Navigate } from "react-router";

type AdminStatistics = {
  users: {
    total: number;
    byRole: Array<{ role: string; _count: number }>;
    activeUsers: {
      last24h: number;
      last7d: number;
    };
  };
  resumes: {
    total: number;
    public: number;
    averageViews: number;
    averageDownloads: number;
  };
  jobs: {
    total: number;
    byType: Array<{ type: string; _count: number }>;
  };
  applications: {
    total: number;
    byStatus: Array<{ status: string; _count: number }>;
  };
};

export const AdminStatisticsPage = () => {
  const { isAdmin } = useAuth();

  const { data: statistics } = useQuery<AdminStatistics>({
    queryKey: ["admin-statistics"],
    queryFn: async () => {
      const response = await axios.get("/admin/statistics");
      return response.data;
    },
  });

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t`Admin Statistics`}</h1>
        <p className="mt-2 text-muted-foreground">{t`Overview of platform usage and metrics.`}</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* User Statistics */}
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t`User Statistics`}</p>
              <h2 className="text-2xl font-bold">{statistics?.users.total ?? 0}</h2>
            </div>
          </div>
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span>{t`Active Users (24h)`}</span>
              <span>{statistics?.users.activeUsers.last24h ?? 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>{t`Active Users (7d)`}</span>
              <span>{statistics?.users.activeUsers.last7d ?? 0}</span>
            </div>
          </div>
        </Card>

        {/* Resume Statistics */}
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t`Resume Statistics`}</p>
              <h2 className="text-2xl font-bold">{statistics?.resumes.total ?? 0}</h2>
            </div>
          </div>
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span>{t`Public Resumes`}</span>
              <span>{statistics?.resumes.public ?? 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>{t`Average Views`}</span>
              <span>{statistics?.resumes.averageViews.toFixed(1) ?? 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>{t`Average Downloads`}</span>
              <span>{statistics?.resumes.averageDownloads.toFixed(1) ?? 0}</span>
            </div>
          </div>
        </Card>

        {/* Job Statistics */}
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t`Job Statistics`}</p>
              <h2 className="text-2xl font-bold">{statistics?.jobs.total ?? 0}</h2>
            </div>
          </div>
          <div className="mt-6 space-y-2">
            {statistics?.jobs.byType.map((type) => (
              <div key={type.type} className="flex justify-between text-sm">
                <span>{type.type || t`Unspecified`}</span>
                <span>{type._count}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Application Statistics */}
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <ChartLine className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t`Application Statistics`}</p>
              <h2 className="text-2xl font-bold">{statistics?.applications.total ?? 0}</h2>
            </div>
          </div>
          <div className="mt-6 space-y-2">
            {statistics?.applications.byStatus.map((status) => (
              <div key={status.status} className="flex justify-between text-sm">
                <span className="capitalize">{status.status.toLowerCase()}</span>
                <span>{status._count}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* User Roles */}
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <Crown className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t`Users by Role`}</p>
              <h2 className="text-2xl font-bold">{t`Roles`}</h2>
            </div>
          </div>
          <div className="mt-6 space-y-2">
            {statistics?.users.byRole.map((role) => (
              <div key={role.role} className="flex justify-between text-sm">
                <span className="capitalize">{role.role.toLowerCase()}</span>
                <span>{role._count}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Active Users */}
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <UsersFour className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t`Active Users`}</p>
              <h2 className="text-2xl font-bold">{statistics?.users.activeUsers.last7d ?? 0}</h2>
            </div>
          </div>
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span>{t`Last 24 Hours`}</span>
              <span>{statistics?.users.activeUsers.last24h ?? 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>{t`Last 7 Days`}</span>
              <span>{statistics?.users.activeUsers.last7d ?? 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>{t`Active Rate (24h)`}</span>
              <span>
                {((statistics?.users.activeUsers.last24h ?? 0) / (statistics?.users.total ?? 1) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}; 