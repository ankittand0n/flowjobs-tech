import { t } from "@lingui/macro";
import { Helmet } from "react-helmet-async";

export const DashboardPage = () => {
  return (
    <>
      <Helmet>
        <title>
          {t`Dashboard`} - {t`Reactive Resume`}
        </title>
      </Helmet>

      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          {t`Dashboard`}
        </h1>

        {/* Add your dashboard content here */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border bg-card p-4">
            <h2 className="font-semibold">{t`Total Resumes`}</h2>
            {/* Add content */}
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h2 className="font-semibold">{t`Applications Status`}</h2>
            {/* Add content */}
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h2 className="font-semibold">{t`Recent Activity`}</h2>
            {/* Add content */}
          </div>
        </div>
      </div>
    </>
  );
}; 