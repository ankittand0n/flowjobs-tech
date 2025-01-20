import { t, plural } from "@lingui/macro";
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
  Input,
  RichInput,
  DialogDescription,
} from "@reactive-resume/ui";
import { useState } from "react";
import { useCreateJob } from "@/client/services/jobs/job";
import { useCreateJobApplication } from "@/client/services/jobs/application";
import { useResumes } from "@/client/services/resume";
import { cn } from "@reactive-resume/utils";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const StepDescription = ({ step }: { step: number }) => {
  switch (step) {
    case 1:
      return <>{t`Enter basic job information`}</>;
    case 2:
      return <>{t`Add detailed job information`}</>;
    case 3:
      return <>{t`Track your application`}</>;
    default:
      return null;
  }
};

const StepTitle = ({ step }: { step: number }) => {
  switch (step) {
    case 1:
      return <>{t`Basic Info`}</>;
    case 2:
      return <>{t`Job Details`}</>;
    case 3:
      return <>{t`Application`}</>;
    default:
      return null;
  }
};

export const TrackJobDialog = ({ isOpen, onClose }: Props) => {
  const [currentStep, setCurrentStep] = useState(1);
  const { mutateAsync: createJob, isPending: isCreatingJob } = useCreateJob();
  const { mutateAsync: createApplication, isPending: isCreatingApp } = useCreateJobApplication();
  const { resumes } = useResumes();

  const [jobData, setJobData] = useState({
    // Basic Info (Step 1)
    title: "",
    company: "",
    location: "",
    url: "",

    // Job Details (Step 2)
    type: "",
    salary: "",
    description: "",

    // Application Details (Step 3)
    status: "draft",
    resumeId: "",
    notes: "",
  });

  const handleNext = () => setCurrentStep((prev) => Math.min(prev + 1, 3));
  const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Create job first
      const job = await createJob({
        title: jobData.title,
        company: jobData.company,
        location: jobData.location || undefined,
        type: jobData.type || undefined,
        salary: jobData.salary || undefined,
        url: jobData.url || undefined,
        description: jobData.description || undefined,
      });

      // Then create application
      await createApplication({
        jobId: job.id,
        status: jobData.status,
        resumeId: jobData.resumeId || undefined,
        notes: jobData.notes || undefined,
        job: {
          id: job.id,
          title: job.title,
          company: job.company,
          location: job.location,
        },
      });

      setJobData({
        title: "",
        company: "",
        location: "",
        type: "",
        salary: "",
        description: "",
        url: "",
        status: "draft",
        resumeId: "",
        notes: "",
      });
      setCurrentStep(1);
      onClose();
    } catch (error) {
      console.error("Failed to create job:", error);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t`Job Title`}</Label>
              <Input
                required
                placeholder={t`e.g. Frontend Developer`}
                value={jobData.title}
                onChange={(e) => setJobData({ ...jobData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>{t`Company`}</Label>
              <Input
                required
                placeholder={t`e.g. Google`}
                value={jobData.company}
                onChange={(e) => setJobData({ ...jobData, company: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>{t`Location`}</Label>
              <Input
                placeholder={t`e.g. New York, NY or Remote`}
                value={jobData.location}
                onChange={(e) => setJobData({ ...jobData, location: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>{t`Job URL`}</Label>
              <Input
                type="url"
                placeholder={t`e.g. https://company.com/jobs/123`}
                value={jobData.url}
                onChange={(e) => setJobData({ ...jobData, url: e.target.value })}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
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
              <Label>{t`Salary`}</Label>
              <Input
                placeholder={t`e.g. $100,000/year or $50-70/hour`}
                value={jobData.salary}
                onChange={(e) => setJobData({ ...jobData, salary: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>{t`Description`}</Label>
              <RichInput
                content={jobData.description}
                onChange={(content) => setJobData({ ...jobData, description: content })}
                placeholder={t`Enter job description or paste from job posting...`}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t`Application Status`}</Label>
              <Select
                required
                value={jobData.status}
                onValueChange={(value) => setJobData({ ...jobData, status: value })}
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
                value={jobData.resumeId}
                onValueChange={(value) => setJobData({ ...jobData, resumeId: value })}
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
                content={jobData.notes}
                onChange={(content) => setJobData({ ...jobData, notes: content })}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isLoading = isCreatingJob || isCreatingApp;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t`Track New Job`}</DialogTitle>
        </DialogHeader>

        {/* Steps Indicator */}
        <div className="mb-8 flex items-center justify-between">
          {[1, 2, 3].map((step, index) => (
            <div key={step} className="flex-1">
              <div className="flex items-center">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2",
                    currentStep === step
                      ? "border-primary bg-primary text-primary-foreground"
                      : currentStep > step
                        ? "border-primary bg-primary/20 text-primary"
                        : "border-muted-foreground/50 text-muted-foreground/50",
                  )}
                >
                  {currentStep > step ? "✓" : step}
                </div>
                <div className="ml-3">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      currentStep === step ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    <StepTitle step={step} />
                  </p>
                  <p className="text-muted-foreground text-xs">
                    <StepDescription step={step} />
                  </p>
                </div>
                {index < 2 && (
                  <div
                    className={cn(
                      "mx-4 h-[2px] flex-1",
                      currentStep > step + 1 ? "bg-primary" : "bg-muted-foreground/20",
                    )}
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {renderStepContent()}

          <DialogFooter>
            {currentStep > 1 && (
              <Button type="button" variant="outline" onClick={handleBack}>
                {t`Back`}
              </Button>
            )}
            {currentStep < 3 ? (
              <Button type="button" onClick={handleNext}>
                {t`Next`}
              </Button>
            ) : (
              <Button type="submit" disabled={isLoading}>
                {isLoading ? t`Creating job...` : t`Create Job`}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
