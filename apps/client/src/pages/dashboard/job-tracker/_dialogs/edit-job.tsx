import { t } from "@lingui/macro";
import { ArrowSquareOut } from "@phosphor-icons/react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  RichInput,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@reactive-resume/ui";
import { useState, useEffect } from "react";

import { useUpdateJob } from "@/client/services/jobs/job";

type Job = {
  id: string;
  title: string;
  company: string;
  location?: string;
  type?: string;
  salary?: string;
  status: string;
  url?: string;
  description?: string;
  notes?: string;
  resumeId?: string;
  resume?: {
    title: string;
  };
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  job: Job;
};

export const EditJobDialog = ({ isOpen, onClose, job }: Props) => {
  const { mutateAsync: updateJob, isPending: isLoading } = useUpdateJob();

  const [jobData, setJobData] = useState({
    title: job.title,
    company: job.company,
    location: job.location || "",
    type: job.type || "",
    salary: job.salary || "",
    status: job.status,
    url: job.url || "",
    description: job.description || "",
    notes: job.notes || "",
  });

  useEffect(() => {
    setJobData({
      title: job.title,
      company: job.company,
      location: job.location || "",
      type: job.type || "",
      salary: job.salary || "",
      status: job.status,
      url: job.url || "",
      description: job.description || "",
      notes: job.notes || "",
    });
  }, [job]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const updateData = {
        id: job.id,
        title: jobData.title.trim(),
        company: jobData.company.trim(),
        location: jobData.location?.trim() || undefined,
        type: jobData.type || undefined,
        salary: jobData.salary?.trim() || undefined,
        status: jobData.status,
        url: jobData.url?.trim() || undefined,
        description: jobData.description,
        notes: jobData.notes,
        resumeId: job.resumeId || undefined,
      };

      Object.keys(updateData).forEach(
        (key) => updateData[key as keyof typeof updateData] === undefined && delete updateData[key as keyof typeof updateData]
      );

      await updateJob(updateData);
      onClose();
    } catch (error) {
      console.error("Failed to update job:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-[1200px]">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">{t`Edit Job`}</DialogTitle>
          <DialogDescription>
            {t`Update the details of your tracked job`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t`Job Title`}</Label>
                <Input
                  required
                  value={jobData.title}
                  onChange={(e) => setJobData({ ...jobData, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>{t`Company`}</Label>
                <Input
                  required
                  value={jobData.company}
                  onChange={(e) => setJobData({ ...jobData, company: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>{t`Location`}</Label>
                <Input
                  value={jobData.location}
                  onChange={(e) => setJobData({ ...jobData, location: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>{t`Job Type`}</Label>
                <Select
                  value={jobData.type}
                  onValueChange={(value) => setJobData({ ...jobData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t`Select job type`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">{t`Full-time`}</SelectItem>
                    <SelectItem value="part-time">{t`Part-time`}</SelectItem>
                    <SelectItem value="contract">{t`Contract`}</SelectItem>
                    <SelectItem value="remote">{t`Remote`}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>
                  {t`Salary Range`}
                  <span className="text-xs text-muted-foreground ml-1">({t`Optional`})</span>
                </Label>
                <Input
                  value={jobData.salary}
                  onChange={(e) => setJobData({ ...jobData, salary: e.target.value })}
                  placeholder={t`e.g. $80k - $100k`}
                />
              </div>

              <div className="space-y-2">
                <Label>{t`Job URL`}</Label>
                <Input
                  type="url"
                  value={jobData.url}
                  onChange={(e) => setJobData({ ...jobData, url: e.target.value })}
                  placeholder={t`e.g. https://example.com/job-posting`}
                />
              </div>

              {job.resumeId && (
                <div className="space-y-2">
                  <Label>{t`Resume Used`}</Label>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    onClick={() => window.open(`/builder/${job.resumeId}`, '_blank')}
                  >
                    <span className="truncate">{job.resume?.title || t`View Resume`}</span>
                    <ArrowSquareOut className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t`Job Description`}</Label>
                <RichInput
                  content={jobData.description}
                  onChange={(value) => setJobData({ ...jobData, description: value })}
                  className="min-h-[250px]"
                  placeholder={t`Enter or paste the job description here...`}
                />
              </div>

              <div className="space-y-2">
                <Label>{t`Notes`}</Label>
                <RichInput
                  content={jobData.notes}
                  onChange={(value) => setJobData({ ...jobData, notes: value })}
                  className="min-h-[250px]"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
              {t`Cancel`}
            </Button>
            <Button type="submit" className="w-full sm:w-auto" disabled={isLoading}>
              {isLoading ? t`Saving...` : t`Save Changes`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
