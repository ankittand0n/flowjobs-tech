import { t } from "@lingui/macro";
import { Brain } from "@phosphor-icons/react";
import { Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@reactive-resume/ui";
import { useState } from "react";
import { useJobs } from "@/client/services/jobs/job";

import { getSectionIcon } from "../shared/section-icon";

export const AiToolsSection = () => {
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const { data: jobs } = useJobs();
  const selectedJob = jobs?.find(job => job.id === selectedJobId);

  return (
    <section id="ai-tools" className="grid gap-y-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-x-4">
          <Brain className="h-5 w-5" />
          <h2 className="line-clamp-1 text-2xl font-bold lg:text-3xl">{t`AI Tools`}</h2>
        </div>
      </header>

      <main className="grid gap-y-4">
        <div className="space-y-1.5">
          <Label>{t`Select Job for ATS Keywords`}</Label>
          <Select value={selectedJobId} onValueChange={setSelectedJobId}>
            <SelectTrigger>
              <SelectValue placeholder={t`Choose a job`} />
            </SelectTrigger>
            <SelectContent>
              {jobs?.map((job) => (
                <SelectItem key={job.id} value={job.id}>
                  {job.title} - {job.company}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedJob?.atsKeywords && (
          <div className="space-y-4 border rounded-lg p-4">
            {selectedJob.atsKeywords.skills?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">{t`Skills`}</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.atsKeywords.skills.map((skill) => (
                    <div
                      key={skill.keyword}
                      className="rounded-full bg-secondary px-3 py-1 text-xs"
                    >
                      {skill.keyword} ({Math.round(skill.relevance * 100)}%)
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedJob.atsKeywords.requirements?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">{t`Requirements`}</h4>
                <ul className="space-y-1">
                  {selectedJob.atsKeywords.requirements.map((req) => (
                    <li key={req.keyword} className="text-sm">
                      {req.keyword}
                      <span className="ml-2 text-xs text-muted-foreground">({req.type})</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </main>
    </section>
  );
}; 