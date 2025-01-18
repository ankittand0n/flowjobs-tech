import { t } from "@lingui/macro";
import { Brain, CaretRight, Clock } from "@phosphor-icons/react";
import { Button, Card, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@reactive-resume/ui";
import { motion } from "framer-motion";
import { useState } from "react";
import { Helmet } from "react-helmet-async";

import { useJobs } from "@/client/services/jobs/job";

type TestDuration = "15" | "30" | "60";

export const MockTestsPage = () => {
  const { data: jobs } = useJobs();
  const [selectedJob, setSelectedJob] = useState<string>("");
  const [duration, setDuration] = useState<TestDuration>("30");

  const handleStartTest = () => {
    if (!selectedJob) return;
    // TODO: Implement test generation and navigation to test page
    console.log(`Starting ${duration} minute test for job:`, selectedJob);
  };

  const durations: { value: TestDuration; label: string }[] = [
    { value: "15", label: t`15 Minutes` },
    { value: "30", label: t`30 Minutes` },
    { value: "60", label: t`60 Minutes` },
  ];

  return (
    <>
      <Helmet>
        <title>
          {t`Mock Tests`} - {t`Reactive Resume`}
        </title>
      </Helmet>

      <div className="space-y-4 p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <motion.h1
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl sm:text-4xl font-bold tracking-tight"
          >
            {t`Mock Tests`}
          </motion.h1>
        </div>

        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Brain className="h-12 w-12" />
              <div>
                <h2 className="text-xl font-semibold">{t`Practice Interview Questions`}</h2>
                <p className="text-muted-foreground">
                  {t`Get personalized interview questions based on the job description and requirements.`}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t`Select Job`}</label>
                <Select value={selectedJob} onValueChange={setSelectedJob}>
                  <SelectTrigger>
                    <SelectValue placeholder={t`Choose a job`} />
                  </SelectTrigger>
                  <SelectContent>
                    {jobs?.map((job: any) => (
                      <SelectItem key={job.id} value={job.id}>
                        {job.title} - {job.company}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t`Test Duration`}</label>
                <Select value={duration} onValueChange={(value: TestDuration) => setDuration(value)}>
                  <SelectTrigger>
                    <SelectValue>
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4" />
                        {durations.find((d) => d.value === duration)?.label}
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {durations.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4" />
                          {d.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full sm:w-auto bg-foreground text-background hover:bg-foreground/90"
              disabled={!selectedJob}
              onClick={handleStartTest}
            >
              <Brain className="mr-2 h-4 w-4" />
              {t`Start Mock Test`}
              <CaretRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
};
