import { t } from "@lingui/macro";
import { ArrowSquareOut, Trash } from "@phosphor-icons/react";
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

import { useUpdateJob, useDeleteJob } from "@/client/services/jobs/job";

type Job = {
  id: string;
  title: string;
  company: string;
  location?: string;
  type?: string;
  salary?: string;
  url?: string;
  description?: string;
  createdBy: string;
  canEdit: boolean;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  job: Job;
};

export const EditJobDialog = ({ isOpen, onClose, job }: Props) => {
  const { mutateAsync: updateJob, isPending: isUpdating } = useUpdateJob();
  const { mutateAsync: deleteJob, isPending: isDeleting } = useDeleteJob();

  const [jobData, setJobData] = useState({
    title: job.title,
    company: job.company,
    location: job.location || "",
    type: job.type || "",
    salary: job.salary || "",
    url: job.url || "",
    description: job.description || "",
  });

  useEffect(() => {
    setJobData({
      title: job.title,
      company: job.company,
      location: job.location || "",
      type: job.type || "",
      salary: job.salary || "",
      url: job.url || "",
      description: job.description || "",
    });
  }, [job]);

  useEffect(() => {
    if (!job.canEdit) {
      console.error("You don't have permission to edit this job");
      onClose();
    }
  }, [job, onClose]);

  if (!job.canEdit) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      console.log('Preparing job update:', {
        jobId: job.id,
        currentData: jobData,
        canEdit: job.canEdit
      });

      const updateData = {
        id: job.id,
        title: jobData.title.trim(),
        company: jobData.company.trim(),
        location: jobData.location?.trim(),
        type: jobData.type,
        salary: jobData.salary?.trim(),
        url: jobData.url?.trim(),
        description: jobData.description,
      };

      console.log('Sending update data:', updateData);

      await updateJob(updateData);
      console.log('Update completed successfully');
      onClose();
    } catch (error) {
      console.error("Failed to update job:", {
        error,
        jobId: job.id,
        updateData: jobData
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteJob(job.id);
      onClose();
    } catch (error) {
      console.error("Failed to delete job:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-[1200px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">{t`Edit Job`}</DialogTitle>
          <DialogDescription>
            {t`Update the details of your tracked job`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label>{t`Job Title`}</Label>
                  <Input
                    required
                    value={jobData.title}
                    onChange={(e) => setJobData({ ...jobData, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
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
                      <SelectItem value="internship">{t`Internship`}</SelectItem>
                      <SelectItem value="freelance">{t`Freelance`}</SelectItem>
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
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t`Job Description`}</Label>
                <RichInput
                  content={jobData.description}
                  onChange={(value) => setJobData({ ...jobData, description: value })}
                  className="min-h-[200px] sm:min-h-[250px]"
                  placeholder={t`Enter or paste the job description here...`}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
            <Button 
              type="button" 
              variant="error"
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              <Trash className="mr-2 h-4 w-4" />
              {isDeleting ? t`Deleting...` : t`Delete Job`}
            </Button>
            <div className="flex gap-2 w-full sm:w-auto order-1 sm:order-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 sm:flex-initial">
                {t`Cancel`}
              </Button>
              <Button type="submit" className="flex-1 sm:flex-initial" disabled={isUpdating}>
                {isUpdating ? t`Saving...` : t`Save Changes`}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
