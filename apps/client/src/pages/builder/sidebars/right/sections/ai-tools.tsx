import { t } from "@lingui/macro";
import { Brain, TextT } from "@phosphor-icons/react";
import { 
  Label, 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue
} from "@reactive-resume/ui";
import { useState, useEffect } from "react";
import { useJobs } from "@/client/services/jobs/job";
import { CreateJobDto } from "@reactive-resume/dto";
import { cn } from "@reactive-resume/utils";
import { useResumeStore } from "@/client/stores/resume";

export const AiToolsSection = () => {
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [matchedKeywords, setMatchedKeywords] = useState<Set<string>>(new Set());
  const { data: jobs } = useJobs();
  const selectedJob = jobs?.find((job: CreateJobDto & { id: string }) => job.id === selectedJobId);
  const resume = useResumeStore((state) => state.resume);

  useEffect(() => {
    if (!selectedJob?.atsKeywords) return;

    const resumeText = JSON.stringify(resume.data).toLowerCase();
    const matches = new Set<string>();
    
    selectedJob.atsKeywords.skills?.forEach((skill: any) => {
      if (resumeText.includes(skill.keyword.toLowerCase())) {
        matches.add(skill.keyword);
      }
    });

    setMatchedKeywords(matches);
  }, [selectedJob, resume]);

  const getKeywordStats = () => {
    if (!selectedJob?.atsKeywords) return null;
    
    const totalKeywords = selectedJob.atsKeywords.skills?.length || 0;
    const matchedCount = matchedKeywords.size;
    const percentage = Math.round((matchedCount / totalKeywords) * 100);

    return { matched: matchedCount, total: totalKeywords, percentage };
  };

  const getResumeWordCount = () => {
    const resumeText = JSON.stringify(resume.data)
      .replace(/"[^"]+"|{|}|\[|\]|,/g, ' ') // Remove JSON syntax
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    const wordCount = resumeText.split(' ').length;
    
    let rating: { status: string; color: string; message: string } = {
      status: '',
      color: '',
      message: ''
    };

    if (wordCount < 400) {
      rating = {
        status: t`Too Short`,
        color: 'text-red-500 dark:text-red-400',
        message: t`Your resume is too short. Consider adding more relevant experiences and skills.`
      };
    } else if (wordCount <= 800) {
      rating = {
        status: t`Ideal`,
        color: 'text-green-500 dark:text-green-400',
        message: t`Your resume length is ideal for most job applications.`
      };
    } else {
      rating = {
        status: t`Too Long`,
        color: 'text-yellow-500 dark:text-yellow-400',
        message: t`Consider condensing your resume to focus on the most relevant information.`
      };
    }

    return { wordCount, rating };
  };

  const wordCountAnalysis = getResumeWordCount();

  return (
    <section id="ai-tools" className="grid gap-y-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-x-4">
          <Brain className="h-5 w-5" />
          <h2 className="line-clamp-1 text-2xl font-bold lg:text-3xl">{t`AI Tools`}</h2>
        </div>
      </header>

      <main className="grid gap-y-4">
        {/* Resume Length Analysis */}
        <div className="space-y-4 border rounded-lg p-4">
          <div className="flex items-center gap-2">
            <TextT className="h-4 w-4" />
            <h4 className="text-sm font-medium">{t`Resume Length Analysis`}</h4>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">{t`Word Count`}</span>
              <span className="font-medium">{wordCountAnalysis.wordCount} {t`words`}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">{t`Status`}</span>
              <span className={cn("font-medium", wordCountAnalysis.rating.color)}>
                {wordCountAnalysis.rating.status}
              </span>
            </div>
            
            <div className="mt-2 text-sm text-muted-foreground">
              {wordCountAnalysis.rating.message}
            </div>
          </div>
        </div>

        {/* ATS Analysis */}
        <div className="space-y-1.5">
          <Label>{t`Select Job for ATS Keywords`}</Label>
          <Select value={selectedJobId} onValueChange={setSelectedJobId}>
            <SelectTrigger>
              <SelectValue placeholder={t`Choose a job`} />
            </SelectTrigger>
            <SelectContent>
              {jobs?.map((job: CreateJobDto & { id: string }) => (
                <SelectItem key={job.id} value={job.id}>
                  {job.title} - {job.company}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedJob?.atsKeywords && (
            <div className="space-y-4 border rounded-lg p-4">
              {getKeywordStats() && (
                <div className="mb-4 rounded-md bg-secondary/50 p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span>{t`Keywords found in resume`}</span>
                    <span className="font-medium">
                      {getKeywordStats()?.matched}/{getKeywordStats()?.total} ({getKeywordStats()?.percentage}%)
                    </span>
                  </div>
                </div>
              )}

              {selectedJob.atsKeywords.skills?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">{t`Skills`}</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.atsKeywords.skills.map((skill: any) => (
                      <div
                        key={skill.keyword}
                        className={cn(
                          "rounded-full px-3 py-1 text-xs transition-colors",
                          matchedKeywords.has(skill.keyword)
                            ? "bg-green-500/20 text-green-700 dark:text-green-400"
                            : "bg-secondary"
                        )}
                      >
                        {skill.keyword} ({Math.round(skill.relevance * 100)}%)
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </section>
  );
}; 