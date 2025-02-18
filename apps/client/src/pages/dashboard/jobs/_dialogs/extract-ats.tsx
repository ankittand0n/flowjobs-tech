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
  RichInput,
} from "@reactive-resume/ui";
import { useState } from "react";
import { extractAtsKeywords } from "@/client/services/openai/extract-ats";
import { useToast } from "@/client/hooks/use-toast";
import type { CreateJobDto } from "@reactive-resume/dto";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onExtracted?: (jobData: Partial<CreateJobDto>) => void;
};

export const ExtractAtsDialog = ({ isOpen, onClose, onExtracted }: Props) => {
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await extractAtsKeywords(description);
      
      const jobData: Partial<CreateJobDto> = {
        title: result.jobDetails?.title || "",
        company: result.jobDetails?.company || "",
        location: result.jobDetails?.location,
        salary: result.jobDetails?.salary,
        type: result.jobDetails?.type,
        description,
        atsKeywords: {
          skills: result.skills || [],
          requirements: result.requirements || [],
          experience: result.experience || [],
          education: result.education || []
        }
      };

      setExtractedData(result);

      if (onExtracted) {
        onExtracted(jobData);
      }
      
      toast({
        title: "Success",
        description: "Job details extracted successfully"
      });
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">{t`Extract Job Details`}</DialogTitle>
          <DialogDescription>
            {t`Paste the job description to automatically extract job details and ATS keywords.`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <RichInput
              content={description}
              onChange={setDescription}
              className="min-h-[200px]"
              placeholder={t`Paste the job description here...`}
            />
          </div>

          {extractedData && (
            <div className="space-y-4 rounded-lg border p-4">
              {/* Job Details Section */}
              <div className="space-y-2">
                <h3 className="font-semibold">{t`Job Details`}</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">Title:</span> {extractedData.jobDetails?.title}</div>
                  <div><span className="text-muted-foreground">Company:</span> {extractedData.jobDetails?.company}</div>
                  <div><span className="text-muted-foreground">Location:</span> {extractedData.jobDetails?.location}</div>
                  <div><span className="text-muted-foreground">Type:</span> {extractedData.jobDetails?.type}</div>
                  <div><span className="text-muted-foreground">Salary:</span> {extractedData.jobDetails?.salary}</div>
                </div>
              </div>

              {/* Skills Section */}
              {extractedData.skills?.length > 0 && (
                <div>
                  <h3 className="font-semibold">{t`Skills`}</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {extractedData.skills.map((skill: any) => (
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
              {extractedData.requirements?.length > 0 && (
                <div>
                  <h3 className="font-semibold">{t`Requirements`}</h3>
                  <ul className="mt-2 list-inside list-disc space-y-1">
                    {extractedData.requirements.map((req: any) => (
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
              {extractedData.experience?.length > 0 && (
                <div>
                  <h3 className="font-semibold">{t`Experience`}</h3>
                  <ul className="mt-2 list-inside list-disc space-y-1">
                    {extractedData.experience.map((exp: any) => (
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
              {extractedData.education?.length > 0 && (
                <div>
                  <h3 className="font-semibold">{t`Education`}</h3>
                  <ul className="mt-2 list-inside list-disc space-y-1">
                    {extractedData.education.map((edu: any) => (
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
          )}

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button type="button" variant="outline" onClick={onClose}>
              {t`Close`}
            </Button>
            <Button type="submit" disabled={!description || isLoading}>
              <Brain className="mr-2 h-4 w-4" />
              {isLoading ? t`Analyzing...` : t`Extract Details`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
