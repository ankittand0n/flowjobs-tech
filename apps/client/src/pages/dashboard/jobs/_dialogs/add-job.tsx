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
  Input,
  RichInput,
  DialogDescription,
} from "@reactive-resume/ui";
import { useState } from "react";
import { useCreateJob } from "@/client/services/jobs/job";
import { useCreateJobApplication } from "@/client/services/jobs/application";
import { useResumes } from "@/client/services/resume";
import { cn } from "@reactive-resume/utils";
import { toast } from "sonner";

type Props = {
  isOpen: boolean;
  onClose: (newJob?: any) => void;
  initialStep?: number;
  initialJob?: any;
};

const StepDescription = ({ step }: { step: number }) => {
  switch (step) {
    case 1:
      return <>{t`Enter basic job information`}</>;
    case 2:
      return <>{t`Add detailed job information`}</>;
    case 3:
      return <>{t`Start tracking your application`}</>;
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
      return <>{t`Track Application`}</>;
    default:
      return null;
  }
};

export const AddJobDialog = ({ isOpen, onClose, initialStep = 1, initialJob = null }: Props) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const { mutateAsync: createJob, isPending: isCreatingJob } = useCreateJob();
  const { mutateAsync: createApplication, isPending: isCreatingApplication } = useCreateJobApplication();
  const { resumes } = useResumes();

  const [createdJob, setCreatedJob] = useState<any>(initialJob);

  const [jobData, setJobData] = useState({
    // Basic Info (Step 1)
    title: initialJob?.title || "",
    company: initialJob?.company || "",
    location: initialJob?.location || "",
    url: initialJob?.url || "",

    // Job Details (Step 2)
    type: initialJob?.type || "",
    salary: initialJob?.salary || "",
    description: initialJob?.description || "",

    // Application Details (Step 3)
    status: "draft",
    resumeId: "",
    notes: "",
  });

  const jobTypes = [
    { value: "full-time", label: t`Full-time` },
    { value: "part-time", label: t`Part-time` },
    { value: "contract", label: t`Contract` },
    { value: "freelance", label: t`Freelance` },
    { value: "internship", label: t`Internship` },
    { value: "temporary", label: t`Temporary` },
    { value: "remote", label: t`Remote` }
  ];

  const handleNext = async () => {
    if (currentStep === 2) {
      try {
        const newJob = await createJob({
          title: jobData.title,
          company: jobData.company,
          location: jobData.location || undefined,
          type: jobData.type || undefined,
          salary: jobData.salary || undefined,
          url: jobData.url || undefined,
          description: jobData.description || undefined,
        });
        setCreatedJob(newJob);
        // Reset form data completely and set new tracking data
        setJobData({
          // Reset all fields
          title: "",
          company: "",
          location: "",
          url: "",
          type: "",
          salary: "",
          description: "",
          // Set initial tracking data
          status: "draft",
          resumeId: "",
          notes: "",
        });
        setCurrentStep(3);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : t`Failed to create job`);
        console.error("Failed to create job:", error);
      }
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createdJob) return;

    try {
      await createApplication({
        jobId: createdJob.id,
        status: jobData.status,
        resumeId: jobData.resumeId || undefined,
        notes: jobData.notes || undefined,
        job: {
          id: createdJob.id,
          title: createdJob.title,
          company: createdJob.company,
        }
      });

      toast.success(t`Successfully created and started tracking job`);
      // Reset everything and close
      setJobData({
        title: "",
        company: "",
        location: "",
        url: "",
        type: "",
        salary: "",
        description: "",
        status: "draft",
        resumeId: "",
        notes: "",
      });
      setCreatedJob(null);
      setCurrentStep(1);
      onClose(createdJob);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t`Failed to create application`);
      console.error("Failed to create application:", error);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4 px-1">
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
          <div className="space-y-4 px-1">
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
                  {jobTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
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
                key={`rich-input-description-${currentStep}`}
                content={jobData.description}
                onChange={(content) => setJobData({ ...jobData, description: content })}
                placeholder={t`Enter job description or paste from job posting...`}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4 px-1">
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
                key={`rich-input-notes-${currentStep}`}
                content={jobData.notes}
                onChange={(content) => setJobData({ ...jobData, notes: content })}
                placeholder={t`Add any notes about your application...`}
                className="h-32"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-3xl max-h-[calc(100vh-2rem)] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{t`Add New Job`}</DialogTitle>
        </DialogHeader>

        <div className="relative mb-8 px-2 pb-12">
          <div className="absolute left-0 top-2 w-full">
            <div className="hidden sm:flex items-center justify-center">
              {[1, 2, 3].map((step, index) => (
                <div key={step} className="flex items-center">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border-2",
                      currentStep >= step
                        ? "border-primary bg-primary text-background"
                        : "border-muted-foreground/20 text-muted-foreground"
                    )}
                  >
                    {step}
                  </div>
                  <div className="mx-2">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        currentStep >= step ? "text-foreground" : "text-muted-foreground"
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
                        currentStep > step + 1 ? "bg-primary" : "bg-muted-foreground/20"
                      )}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex sm:hidden items-center justify-center gap-4">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={cn(
                    "flex flex-col items-center",
                    currentStep === step ? "opacity-100" : "opacity-50"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border-2 mb-1",
                      currentStep >= step
                        ? "border-primary bg-primary text-background"
                        : "border-muted-foreground/20 text-muted-foreground"
                    )}
                  >
                    {step}
                  </div>
                  <p className="text-xs font-medium">
                    <StepTitle step={step} />
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          <form id="jobForm" onSubmit={handleSubmit} className="space-y-4">
            {renderStepContent()}
          </form>
        </div>

        <DialogFooter className="mt-4 flex-shrink-0 gap-2">
          {currentStep > 1 && (
            <Button type="button" variant="outline" onClick={handleBack} className="flex-1 sm:flex-none">
              {t`Back`}
            </Button>
          )}
          {currentStep < 3 && (
            <Button 
              type="button" 
              onClick={handleNext}
              disabled={isCreatingJob}
              className="flex-1 sm:flex-none"
            >
              {isCreatingJob ? t`Saving Job...` : t`Next`}
            </Button>
          )}
          {currentStep === 3 && (
            <Button 
              type="submit"
              form="jobForm"
              disabled={isCreatingApplication}
              className="flex-1 sm:flex-none"
            >
              {isCreatingApplication ? t`Starting to Track...` : t`Start Tracking`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
