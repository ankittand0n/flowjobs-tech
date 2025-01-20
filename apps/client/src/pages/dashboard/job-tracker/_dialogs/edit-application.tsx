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
} from "@reactive-resume/ui";
import { useState } from "react";
import { useResumes } from "@/client/services/resume";
import { useUpdateJobApplication } from "@/client/services/jobs/application";

type Props = {
  application: any;
  isOpen: boolean;
  onClose: () => void;
};

export const EditApplicationDialog = ({ application, isOpen, onClose }: Props) => {
  const { resumes } = useResumes();
  const { mutateAsync: updateApplication, isPending } = useUpdateJobApplication();
  const [formData, setFormData] = useState({
    status: application.status,
    resumeId: application.resumeId || "",
    notes: application.notes || "",
  });

  const statusOptions = [
    { value: "draft", label: t`Draft` },
    { value: "applied", label: t`Applied` },
    { value: "screening", label: t`Screening` },
    { value: "interviewing", label: t`Interviewing` },
    { value: "offer", label: t`Offer` },
    { value: "accepted", label: t`Accepted` },
    { value: "rejected", label: t`Rejected` },
    { value: "ghosted", label: t`Ghosted` },
    { value: "withdrawn", label: t`Withdrawn` },
    { value: "archived", label: t`Archived` },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateApplication({
        id: application.id,
        ...formData,
      });
      onClose();
    } catch (error) {
      console.error("Failed to update application:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t`Edit Application`}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t`Status`}</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t`Resume`}</Label>
              <Select
                value={formData.resumeId}
                onValueChange={(value) => setFormData({ ...formData, resumeId: value })}
              >
                <SelectTrigger>
                  <SelectValue />
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
                content={formData.notes}
                onChange={(content) => setFormData({ ...formData, notes: content })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? t`Saving...` : t`Save Changes`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
