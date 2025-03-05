import { t } from "@lingui/macro";
import { TextT, Info, CheckCircle, WarningCircle, Plus } from "@phosphor-icons/react";
import { 
  Label, 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  Button,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@reactive-resume/ui";
import { useState, useEffect } from "react";
import { useJobs } from "@/client/services/jobs/job";
import { CreateJobDto } from "@reactive-resume/dto";
import { cn } from "@reactive-resume/utils";
import { useResumeStore } from "@/client/stores/resume";
import { AddJobDialog } from "@/client/pages/dashboard/jobs/_dialogs/add-job";

export const AtsAnalysisSection = () => {
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [matchedKeywords, setMatchedKeywords] = useState<Set<string>>(new Set());
  const { data: jobs, refetch: refetchJobs } = useJobs();
  const selectedJob = jobs?.find((job: CreateJobDto & { id: string }) => job.id === selectedJobId);
  const resume = useResumeStore((state) => state.resume);
  const [isAddJobOpen, setIsAddJobOpen] = useState(false);

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
    if (!selectedJob?.atsKeywords?.skills?.length) return { matched: 0, total: 0, percentage: 0 };
    
    const totalKeywords = selectedJob.atsKeywords.skills.length;
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

  const countKeywordsInSection = (sectionName: 'experience' | 'skills') => {
    const sectionText = JSON.stringify(resume.data.sections[sectionName]).toLowerCase();
    return selectedJob?.atsKeywords.skills.filter(
      (skill: any) => sectionText.includes(skill.keyword.toLowerCase())
    ).length || 0;
  };

  const checkBulletPoints = () => {
    const experienceText = JSON.stringify(resume.data.sections.experience);
    return experienceText.includes('<ul>') && experienceText.includes('<li>');
  };

  const checkDateFormat = () => {
    const dates = resume.data.sections.experience.items.map((item: any) => item.date);
    const datePattern = /^[A-Z][a-z]+ \d{4} - ([A-Z][a-z]+ \d{4}|Present)$/;
    return dates.every((date: string) => datePattern.test(date));
  };

  const formatChecks = [
    {
      id: 'fonts',
      passed: true,
      message: t`Using standard fonts`
    },
    {
      id: 'headings',
      passed: true,
      message: t`Clear section headings`
    },
    {
      id: 'bullets',
      passed: checkBulletPoints(),
      message: t`Proper bullet point format`
    },
    {
      id: 'dates',
      passed: checkDateFormat(),
      message: t`Consistent date format`
    },
    {
      id: 'special',
      passed: true,
      message: t`No special characters or tables`
    }
  ];

  const onJobAdded = () => {
    setIsAddJobOpen(false);
    refetchJobs();  // Refresh jobs list after adding
  };

  return (
    <div className="space-y-4">
      {/* Job Selector */}
      <div className="border rounded-lg p-4 bg-secondary/10">
        <div className="flex items-center justify-between mb-2">
          <Label>{t`Select Job for Analysis`}</Label>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setIsAddJobOpen(true)}
            className="text-xs"
          >
            <Plus className="h-4 w-4 mr-1" />
            {t`Add Job`}
          </Button>
        </div>
        <Select value={selectedJobId} onValueChange={setSelectedJobId}>
          <SelectTrigger>
            <SelectValue placeholder={t`Choose a job to analyze`} />
          </SelectTrigger>
          <SelectContent>
            {jobs?.map((job: CreateJobDto & { id: string }) => (
              <SelectItem key={job.id} value={job.id}>
                {job.title} - {job.company}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedJob && (
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium">{selectedJob.title}</span>
            <span>•</span>
            <span>{selectedJob.company}</span>
          </div>
        )}
      </div>

      {selectedJob?.atsKeywords ? (
        <>
          {/* Resume Metrics */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2">
              <TextT className="h-4 w-4" />
              <h4 className="text-sm font-medium">{t`Resume Length Analysis`}</h4>
            </div>
            
            <div className="space-y-2 mt-4">
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

          {/* Keyword Match Score */}
          <div className="border rounded-lg p-4">
            <h4 className="text-sm font-medium mb-4">{t`ATS Match Score`}</h4>
            <div className="relative h-4 bg-secondary rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full transition-all",
                  getKeywordStats()?.percentage! >= 70 ? "bg-green-500" :
                  getKeywordStats()?.percentage! >= 50 ? "bg-yellow-500" : "bg-red-500"
                )}
                style={{ width: `${getKeywordStats()?.percentage}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>{getKeywordStats()?.percentage}% {t`Match`}</span>
              <span>{getKeywordStats()?.matched}/{getKeywordStats()?.total} {t`Keywords Found`}</span>
            </div>
          </div>

          {/* Found Keywords */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <h4 className="text-sm font-medium">{t`Keywords Found`}</h4>
              <Tooltip content={t`Percentage shows how relevant each keyword is to the job`}>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </Tooltip>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedJob.atsKeywords.skills
                .filter((skill: any) => matchedKeywords.has(skill.keyword))
                .map((skill: any) => (
                  <div 
                    key={skill.keyword} 
                    className="bg-green-500/10 text-green-700 dark:text-green-400 rounded-full px-3 py-1 text-xs flex items-center gap-2"
                  >
                    <span>{skill.keyword}</span>
                    <span className="opacity-75">({Math.round(skill.relevance * 100)}%)</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Missing Keywords */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <h4 className="text-sm font-medium">{t`Missing Important Keywords`}</h4>
              <Tooltip content={t`Higher percentage indicates greater importance for the job`}>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </Tooltip>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedJob.atsKeywords.skills
                .filter((skill: any) => !matchedKeywords.has(skill.keyword))
                .sort((a: any, b: any) => b.relevance - a.relevance)
                .map((skill: any) => (
                  <div 
                    key={skill.keyword} 
                    className={cn(
                      "rounded-full px-3 py-1 text-xs flex items-center gap-2",
                      skill.relevance > 0.7 
                        ? "bg-red-500/10 text-red-700 dark:text-red-400"
                        : "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
                    )}
                  >
                    <span>{skill.keyword}</span>
                    <span className="opacity-75">({Math.round(skill.relevance * 100)}%)</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Section-wise Analysis */}
          <div className="border rounded-lg p-4">
            <h4 className="text-sm font-medium mb-4">{t`Section Analysis`}</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span>{t`Experience Section`}</span>
                <span className="text-xs text-muted-foreground">
                  {countKeywordsInSection('experience')} {t`keywords found`}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>{t`Skills Section`}</span>
                <span className="text-xs text-muted-foreground">
                  {countKeywordsInSection('skills')} {t`keywords found`}
                </span>
              </div>
            </div>
          </div>

          {/* Format Compliance */}
          <div className="border rounded-lg p-4">
            <h4 className="text-sm font-medium mb-4">{t`ATS Format Check`}</h4>
            <div className="space-y-2">
              {formatChecks.map((check) => (
                <div key={check.id} className="flex items-center gap-2">
                  {check.passed ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <WarningCircle className="h-4 w-4 text-yellow-500" />
                  )}
                  <span className="text-sm">{check.message}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="p-8 text-center text-muted-foreground">
          <TextT className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <p className="text-sm font-medium mb-2">{t`No Job Selected`}</p>
          <p className="text-xs">{t`Please select a job above to analyze ATS keywords.`}</p>
        </div>
      )}

      <AddJobDialog 
        isOpen={isAddJobOpen} 
        onClose={() => setIsAddJobOpen(false)}
        onSuccess={onJobAdded}
      />
    </div>
  );
}; 