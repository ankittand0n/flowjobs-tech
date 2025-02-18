import { t } from "@lingui/macro";
import { Brain, ArrowSquareOut, ArrowsClockwise } from "@phosphor-icons/react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@reactive-resume/ui";
import { useState, useEffect } from "react";
import { useExtractAtsKeywords } from "@/client/services/jobs/job";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/client/libs/axios";
import { useAuth } from "@/client/hooks/use-auth";
import { useToast } from "@/client/hooks/use-toast";

type Props = {
  job: {
    id: string;
    title: string;
    company: string;
    description: string;
    location?: string;
    type?: string;
    salary?: string;
    url?: string;
    atsKeywords?: {
      skills: Array<{ keyword: string; relevance: number; count: number }>;
      requirements: Array<{ keyword: string; type: string }>;
      experience: Array<{ keyword: string; yearsRequired?: number }>;
      education: Array<{ level: string; field?: string }>;
    };
  };
  isOpen: boolean;
  onClose: () => void;
};

// Add mutation hook for refreshing ATS keywords
const useRefreshAtsKeywords = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (jobId: string) => {
      const { data } = await axios.post(`/jobs/${jobId}/refresh-ats`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast({
        title: "Success",
        description: "ATS keywords have been refreshed",
      });
    },
  });
};

export const JobDetailsDialog = ({ job, isOpen, onClose }: Props) => {
  const [atsKeywords, setAtsKeywords] = useState(job.atsKeywords);
  const { mutateAsync: extractAts, isPending: isExtracting } = useExtractAtsKeywords();
  const { isAdmin } = useAuth();
  const { mutateAsync: refreshAts, isPending: isRefreshing } = useRefreshAtsKeywords();

  useEffect(() => {
    const analyzeDescription = async () => {
      if (isOpen && job.description && !job.atsKeywords) {
        try {
          const keywords = await extractAts(job.id);
          setAtsKeywords(keywords);
        } catch (error) {
          console.error("Failed to extract ATS keywords:", error);
        }
      }
    };

    analyzeDescription();
  }, [isOpen, job.id, job.description, job.atsKeywords, extractAts]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-[72rem] h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">
            {job.title} - {job.company}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            {/* Left Column - Job Description */}
            <div className="flex flex-col space-y-6 min-h-0">
              {/* Basic Info - Fixed */}
              <div className="border rounded-lg p-4 flex-shrink-0">
                <h4 className="text-sm font-medium mb-4">{t`Job Details`}</h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground">{t`Title`}</label>
                      <p className="text-sm">{job.title}</p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">{t`Company`}</label>
                      <p className="text-sm">{job.company}</p>
                    </div>
                    {job.location && (
                      <div>
                        <label className="text-xs text-muted-foreground">{t`Location`}</label>
                        <p className="text-sm">{job.location}</p>
                      </div>
                    )}
                    {job.type && (
                      <div>
                        <label className="text-xs text-muted-foreground">{t`Type`}</label>
                        <p className="text-sm">{job.type}</p>
                      </div>
                    )}
                    {job.salary && (
                      <div>
                        <label className="text-xs text-muted-foreground">{t`Salary`}</label>
                        <p className="text-sm">{job.salary}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Description - Scrollable */}
              <div className="border rounded-lg p-4 min-h-0 flex-1 overflow-y-auto">
                <h4 className="text-sm font-medium mb-4">{t`Description`}</h4>
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: job.description }}
                />
              </div>
            </div>

            {/* Right Column - ATS Keywords */}
            <div className="border rounded-lg p-4 overflow-y-auto">
              <div className="sticky top-0 bg-background pb-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium">{t`ATS Keywords Analysis`}</h4>
                  {isExtracting && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Brain className="h-4 w-4 animate-pulse" />
                      {t`Analyzing`}
                    </div>
                  )}
                </div>
              </div>

              {atsKeywords ? (
                <div className="space-y-4">
                  {/* Skills Section */}
                  {atsKeywords.skills?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">{t`Skills`}</h4>
                      <div className="flex flex-wrap gap-2">
                        {atsKeywords.skills.map((skill) => (
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
                  {atsKeywords.requirements?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">{t`Requirements`}</h4>
                      <ul className="space-y-1">
                        {atsKeywords.requirements.map((req) => (
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
                  {atsKeywords.experience?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">{t`Experience`}</h4>
                      <ul className="space-y-1">
                        {atsKeywords.experience.map((exp) => (
                          <li key={exp.keyword} className="text-sm">
                            {exp.keyword}
                            {typeof exp.yearsRequired === 'number' && (
                              <span className="ml-2 text-xs text-muted-foreground">
                                ({exp.yearsRequired} {exp.yearsRequired === 1 ? t`year` : t`years`})
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Education Section */}
                  {atsKeywords.education?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">{t`Education`}</h4>
                      <ul className="space-y-1">
                        {atsKeywords.education.map((edu) => (
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
              ) : (
                <div className="flex items-center justify-center h-[100px] border rounded-lg">
                  <div className="text-sm text-muted-foreground">
                    {t`No ATS keywords analysis available.`}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4 flex-shrink-0 gap-2">
          {job.url && (
            <Button
              variant="secondary"
              onClick={() => window.open(job.url, "_blank", "noopener noreferrer")}
              className="bg-foreground text-background hover:bg-foreground/90"
            >
              <ArrowSquareOut className="mr-2 h-4 w-4" />
              {t`View Job Posting`}
            </Button>
          )}
          {isAdmin && (
            <Button
              variant="outline"
              onClick={() => refreshAts(job.id)}
              disabled={isRefreshing}
            >
              <ArrowsClockwise className="h-4 w-4 mr-2" />
              {isRefreshing ? "Refreshing..." : "Refresh ATS Keywords"}
            </Button>
          )}
          <Button onClick={onClose}>{t`Close`}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
