import { t } from "@lingui/macro";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  RichInput,
  DialogDescription,
} from "@reactive-resume/ui";
import { useState } from "react";
import { useResumes } from "@/client/services/resume";
import { useCreateJobApplication } from "@/client/services/jobs/application";
import { toast } from "sonner";

type Props = {
  job: {
    id: string;
    title: string;
    company: string;
  };
  isOpen: boolean;
  onClose: () => void;
};

export const TrackJobDialog = ({ job, isOpen, onClose }: Props) => {
  const { resumes } = useResumes();
  const { mutateAsync: createApplication, isPending } = useCreateJobApplication();

  const [applicationData, setApplicationData] = useState({
    status: "applied",
    resumeId: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createApplication({
        jobId: job.id,
        status: applicationData.status,
        resumeId: applicationData.resumeId || undefined,
        notes: applicationData.notes || undefined,
        job: {
          id: job.id,
          title: job.title,
          company: job.company,
        }
      });

      toast.success(t`Successfully started tracking job application`);
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t`Failed to create application`);
      console.error("Failed to create application:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t`Track Job Application`}</DialogTitle>
          <DialogDescription>
            {t`Track application for` + ` ${job.title}` + ` at ` + `${job.company}`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t`Application Status`}</Label>
              <Select
                required
                value={applicationData.status}
                onValueChange={(value) =>
                  setApplicationData({ ...applicationData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">{t`Draft`}</SelectItem>
                  <SelectItem value="applied">{t`Applied`}</SelectItem>
                  <SelectItem value="interviewing">{t`Interviewing`}</SelectItem>
                  <SelectItem value="offer">{t`Offer`}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t`Resume`}</Label>
              <Select
                value={applicationData.resumeId}
                onValueChange={(value) =>
                  setApplicationData({ ...applicationData, resumeId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t`Select a resume`} />
                </SelectTrigger>
                <SelectContent>
                  {resumes?.map((resume) => (
                    <SelectItem key={resume.id} value={resume.id}>
                      {resume.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t`Notes`}</Label>
              <RichInput
                content={applicationData.notes}
                onChange={(content) => setApplicationData({ ...applicationData, notes: content })}
                placeholder={t`Add any notes about your application...`}
                className="h-32"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t`Cancel`}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? t`Saving...` : t`Start Tracking`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 