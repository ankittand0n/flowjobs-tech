import { t } from "@lingui/macro";
import { Brain } from "@phosphor-icons/react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  RichInput,
} from "@reactive-resume/ui";
import { useState } from "react";
import { useToast } from "@/client/hooks/use-toast";
import { extractAtsKeywords } from "@/client/services/openai/extract-ats";
import type { CreateJobDto } from "@reactive-resume/dto";
import { useCreateJob } from "@/client/services/jobs/job";
import { useCreateJobApplication } from "@/client/services/jobs/application";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  initialStep?: number;
  initialJob?: any; // Or use proper job type
};

type Step = 1 | 2 | 3;

export const AddJobDialog = ({ isOpen, onClose, initialStep = 1, initialJob }: Props) => {
  const [step, setStep] = useState<Step>(initialStep as Step);
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [jobData, setJobData] = useState<Partial<CreateJobDto>>({
    title: "",
    company: "",
    description: "",
  });
  const [extractedKeywords, setExtractedKeywords] = useState<any>(null);
  
  const { toast } = useToast();
  const { mutateAsync: createJob } = useCreateJob();
  const { mutateAsync: createJobApplication } = useCreateJobApplication();

  const handleExtract = async () => {
    setIsLoading(true);

    try {
      const result = await extractAtsKeywords(description);
      
      setJobData({
        ...jobData,
        title: result.jobDetails?.title || "",
        company: result.jobDetails?.company || "",
        location: result.jobDetails?.location || "",
        type: result.jobDetails?.type || "",
        salary: result.jobDetails?.salary || "",
        description,
        atsKeywords: {
          skills: result.skills || [],
          requirements: result.requirements || [],
          experience: result.experience || [],
          education: result.education || []
        }
      });

      setExtractedKeywords(result);
      setStep(2);
    } catch (error) {
      console.error("Failed to extract job details:", error);
      toast({
        title: "Error",
        description: "Failed to extract job details",
        variant: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);

      // Log the data being sent
      console.log("Creating job with data:", {
        title: jobData.title,
        company: jobData.company,
        description: description || "",
        location: jobData.location,
        type: jobData.type,
        salary: jobData.salary,
        url: jobData.url,
        atsKeywords: extractedKeywords ? {
          skills: extractedKeywords.skills || [],
          requirements: extractedKeywords.requirements || [],
          experience: extractedKeywords.experience || undefined,
          education: extractedKeywords.education || []
        } : undefined
      });

      // First create the job
      const job = await createJob({
        title: jobData.title || "",
        company: jobData.company || "",
        description: description || "",
        location: jobData.location,
        type: jobData.type,
        salary: jobData.salary,
        url: jobData.url,
        atsKeywords: extractedKeywords ? {
          skills: extractedKeywords.skills || [],
          requirements: extractedKeywords.requirements || [],
          experience: extractedKeywords.experience || undefined,
          education: extractedKeywords.education || []
        } : undefined
      });

      // Then create a job application in draft status
      await createJobApplication({
        jobId: job.id,
        status: "draft",
        notes: "",
        job: {
          id: job.id,
          title: job.title,
          company: job.company,
          location: job.location
        }
      });

      toast({
        title: "Success",
        description: "Job added successfully"
      });
      setStep(3);
    } catch (error: any) {
      // Detailed error logging
      console.error("Job creation error:", {
        error,
        response: error.response?.data,
        status: error.response?.status,
        data: error.response?.data?.message,
      });

      // More informative error message
      let errorMessage = "Failed to add job";
      if (error.response?.data?.message) {
        if (typeof error.response.data.message === 'object') {
          // Handle Zod validation errors
          errorMessage = Object.entries(error.response.data.message)
            .map(([field, errors]) => `${field}: ${errors}`)
            .join(', ');
        } else {
          errorMessage = error.response.data.message;
        }
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <DialogHeader>
              <DialogTitle>{t`Add Job - Step 1`}</DialogTitle>
              <DialogDescription>
                {t`Enter the job description to automatically extract details.`}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t`Job URL`}</label>
                <Input
                  value={jobData.url || ""}
                  onChange={(e) => setJobData({ ...jobData, url: e.target.value })}
                  placeholder="https://"
                  type="url"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t`Job Description`}</label>
                <RichInput
                  content={description}
                  onChange={setDescription}
                  className="min-h-[200px]"
                  placeholder={t`Paste the job description here...`}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                {t`Cancel`}
              </Button>
              <Button 
                onClick={handleExtract} 
                disabled={!description || isLoading}
              >
                <Brain className="mr-2 h-4 w-4" />
                {isLoading ? t`Extracting...` : t`Extract Details`}
              </Button>
            </DialogFooter>
          </>
        );

      case 2:
        return (
          <>
            <DialogHeader>
              <DialogTitle>{t`Add Job - Step 2`}</DialogTitle>
              <DialogDescription>
                {t`Review and edit the extracted job details.`}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t`Job Title`}<span className="text-red-500">*</span></label>
                <Input
                  value={jobData.title}
                  onChange={(e) => setJobData({ ...jobData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t`Company`}<span className="text-red-500">*</span></label>
                <Input
                  value={jobData.company}
                  onChange={(e) => setJobData({ ...jobData, company: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t`Location`}</label>
                <Input
                  value={jobData.location}
                  onChange={(e) => setJobData({ ...jobData, location: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t`Job Type`}</label>
                  <Input
                    value={jobData.type}
                    onChange={(e) => setJobData({ ...jobData, type: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{t`Salary`}</label>
                  <Input
                    value={jobData.salary}
                    onChange={(e) => setJobData({ ...jobData, salary: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep(1)}>
                {t`Back`}
              </Button>
              <Button 
                onClick={handleSave}
                disabled={isLoading || !jobData.title || !jobData.company}
              >
                {isLoading ? t`Saving...` : t`Save & Add Job`}
              </Button>
            </DialogFooter>
          </>
        );

      case 3:
        return (
          <>
            <DialogHeader>
              <DialogTitle>{t`Job Added Successfully`}</DialogTitle>
              <DialogDescription>
                {t`Here are the extracted keywords and requirements.`}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 rounded-lg border p-4">
              {/* Skills Section */}
              {extractedKeywords.skills?.length > 0 && (
                <div>
                  <h3 className="font-semibold">{t`Skills`}</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {extractedKeywords.skills.map((skill: any) => (
                      <div
                        key={skill.keyword}
                        className="rounded-full bg-secondary px-3 py-1 text-sm"
                      >
                        {skill.keyword} ({Math.round(skill.relevance * 100)}%)
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Requirements Section */}
              {extractedKeywords.requirements?.length > 0 && (
                <div>
                  <h3 className="font-semibold">{t`Requirements`}</h3>
                  <ul className="mt-2 list-inside list-disc space-y-1">
                    {extractedKeywords.requirements.map((req: any) => (
                      <li key={req.keyword} className="text-sm">
                        {req.keyword}
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({req.type})
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Experience Section */}
              {extractedKeywords.experience?.length > 0 && (
                <div>
                  <h3 className="font-semibold">{t`Experience`}</h3>
                  <ul className="mt-2 list-inside list-disc space-y-1">
                    {extractedKeywords.experience.map((exp: any) => (
                      <li key={exp.keyword} className="text-sm">
                        {exp.keyword}
                        {exp.yearsRequired && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            ({exp.yearsRequired} years)
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Education Section */}
              {extractedKeywords.education?.length > 0 && (
                <div>
                  <h3 className="font-semibold">{t`Education`}</h3>
                  <ul className="mt-2 list-inside list-disc space-y-1">
                    {extractedKeywords.education.map((edu: any) => (
                      <li key={edu.level} className="text-sm">
                        {edu.level}
                        {edu.field && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            ({edu.field})
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button onClick={onClose}>
                {t`Close`}
              </Button>
            </DialogFooter>
          </>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-3xl">
        <VisuallyHidden asChild>
          <DialogTitle>{t`Add Job`}</DialogTitle>
        </VisuallyHidden>
        {renderStep()}
      </DialogContent>
    </Dialog>
  );
};
