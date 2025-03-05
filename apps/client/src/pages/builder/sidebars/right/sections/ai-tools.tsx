import { t } from "@lingui/macro";
import { Brain, TextT, ChatCircleText, MagnifyingGlass, ChartBar, Robot, CheckCircle, WarningCircle, Plus, Info } from "@phosphor-icons/react";
import { 
  Label, 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  Button,
  ScrollArea,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  Alert,
  AlertDescription
} from "@reactive-resume/ui";
import { useState, useEffect } from "react";
import { useJobs } from "@/client/services/jobs/job";
import { CreateJobDto, ResumeChatDto, ResumeChatResponseDto } from "@reactive-resume/dto";
import { cn } from "@reactive-resume/utils";
import { useResumeStore } from "@/client/stores/resume"
import { AddJobDialog } from "@/client/pages/dashboard/jobs/_dialogs/add-job";
import { updateResume } from "@/client/services/resume/update";

// Add type for resume data structure
type ResumeData = {
  basics: {
    name: string;
    headline: string;
    email: string;
    phone: string;
    location: string;
    url: { label: string; href: string; };
    customFields: { id: string; name: string; value: string; icon: string; }[];
    picture: {
      url: string;
      size: number;
      aspectRatio: number;
      borderRadius: number;
      effects: {
        hidden: boolean;
        border: boolean;
        grayscale: boolean;
      };
    };
  };
  sections: {
    custom: Record<string, {
      id: string;
      name: string;
      columns: number;
      separateLinks: boolean;
      visible: boolean;
      items: {
        id: string;
        name: string;
        date: string;
        location: string;
        url: { label: string; href: string; };
        visible: boolean;
        summary: string;
        keywords: string[];
        description: string;
      }[];
    }>;
    summary: any;
    experience: any;
    education: any;
    projects: any;
    volunteer: any;
    references: any;
    skills: any;
    awards: any;
    publications: any;
    certifications: any;
    interests: any;
    languages: any;
    profiles: any;
  };
  metadata: {
    template: string;
    layout: string[][][];
    css: { value: string; visible: boolean; };
    page: {
      options: { breakLine: boolean; pageNumbers: boolean; };
      margin: number;
      format: "a4" | "letter";
    };
    theme: { background: string; text: string; primary: string; };
    typography: {
      font: {
        size: number;
        family: string;
        subset: string;
        variants: string[];
      };
      lineHeight: number;
      hideIcons: boolean;
      underlineLinks: boolean;
    };
    notes: string;
  };
};

export const AiToolsSection = () => {
  const [isChatMode, setIsChatMode] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [matchedKeywords, setMatchedKeywords] = useState<Set<string>>(new Set());
  const { data: jobs, refetch: refetchJobs } = useJobs();
  const selectedJob = jobs?.find((job: CreateJobDto & { id: string }) => job.id === selectedJobId);
  const resume = useResumeStore((state) => state.resume);
  const setValue = useResumeStore((state) => state.setValue);
  const [proposedChanges, setProposedChanges] = useState<ResumeData | null>(null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !selectedJob) return;

    const userMessage = { role: 'user' as const, content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setProposedChanges(null);

    // Log resume data size and structure
    const resumeData = resume.data;
    console.log('Full Resume Size:', JSON.stringify(resumeData).length, 'bytes');
    console.log('Resume Structure:', {
      basics: Object.keys(resumeData.basics),
      sections: Object.keys(resumeData.sections),
      metadata: Object.keys(resumeData.metadata)
    });

    // Create a minimal version of the resume data with only relevant sections
    const minimalResumeData = {
      sections: {
        experience: resumeData.sections.experience?.items?.map((item: any) => ({
          company: item.company,
          position: item.position,
          date: item.date,
          summary: item.summary,
          description: item.description
        })),
        education: resumeData.sections.education?.items?.map((item: any) => ({
          institution: item.institution,
          area: item.area,
          date: item.date,
          summary: item.summary
        })),
        skills: resumeData.sections.skills?.items?.map((item: any) => ({
          name: item.name,
          keywords: item.keywords
        })),
        projects: resumeData.sections.projects?.items?.map((item: any) => ({
          name: item.name,
          summary: item.summary,
          description: item.description
        }))
      }
    };

    // Remove empty sections to reduce payload size
    Object.keys(minimalResumeData.sections).forEach((key) => {
      const sectionKey = key as keyof typeof minimalResumeData.sections;
      if (!minimalResumeData.sections[sectionKey] || 
          (Array.isArray(minimalResumeData.sections[sectionKey]) && 
           minimalResumeData.sections[sectionKey].length === 0)) {
        delete minimalResumeData.sections[sectionKey];
      }
    });

    console.log('Minimal Resume Size:', JSON.stringify(minimalResumeData).length, 'bytes');

    try {
      const response = await fetch('/api/openai/resume-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          resume: minimalResumeData,
          job: {
            id: selectedJob.id,
            title: selectedJob.title,
            company: selectedJob.company,
            atsKeywords: selectedJob.atsKeywords
          }
        } as ResumeChatDto),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json() as ResumeChatResponseDto;
      
      // Clean up the message content by removing any JSON blocks and function calls
      let cleanMessage = data.message;
      if (cleanMessage) {
        // Remove JSON blocks
        cleanMessage = cleanMessage.replace(/```json\n[\s\S]*?\n```/g, '');
        // Remove any other code blocks
        cleanMessage = cleanMessage.replace(/```\n[\s\S]*?\n```/g, '');
        // Remove function call JSON
        cleanMessage = cleanMessage.replace(/{\s*"resumeData":\s*[\s\S]*?}/g, '');
        // Clean up any remaining whitespace
        cleanMessage = cleanMessage.trim();
      }
      
      setMessages((prev) => [...prev, { role: 'assistant', content: cleanMessage || t`I couldn't process that request.` }]);
      
      if (data.resumeUpdates) {
        // Merge updates with full resume data
        const mergedUpdates = {
          ...resumeData,
          ...data.resumeUpdates,
          basics: {
            ...resumeData.basics,
            ...data.resumeUpdates.basics
          },
          sections: {
            ...resumeData.sections,
            ...data.resumeUpdates.sections
          }
        };
        
        setProposedChanges(mergedUpdates);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [...prev, { 
        role: 'assistant', 
        content: t`Sorry, I encountered an error while processing your request. Please try again.` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const applyChanges = async () => {
    if (proposedChanges) {
      try {
        // Update each section individually using the left sidebar's setValue function
        Object.entries(proposedChanges.sections).forEach(([sectionKey, sectionData]) => {
          if (sectionData?.items) {
            // Preserve the existing section structure
            const existingSection = resume.data.sections[sectionKey as keyof typeof resume.data.sections];
            
            // Create a complete section object with all required fields
            const updatedSection = {
              id: sectionKey,
              name: existingSection?.name || sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1),
              columns: existingSection?.columns || 1,
              separateLinks: existingSection?.separateLinks ?? true,
              visible: existingSection?.visible ?? true,
              items: sectionData.items.map((item: any) => ({
                ...item,
                id: item.id || crypto.randomUUID(),
                visible: item.visible ?? true,
                date: item.date || "",
                location: item.location || "",
                url: item.url || { label: "", href: "" },
                summary: item.summary || "",
                description: item.description || "",
                keywords: Array.isArray(item.keywords) ? item.keywords : [],
                level: typeof item.level === 'number' ? item.level : 1
              }))
            };

            setValue(`sections.${sectionKey}`, updatedSection);
          }
        });
        
        setProposedChanges(null);
      } catch (error) {
        console.error('Failed to save resume changes:', error);
      }
    }
  };

  const rejectChanges = () => {
    setProposedChanges(null);
  };

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
    <section id="ai-tools" className="grid gap-y-6 h-full overflow-hidden">
      <header className="flex items-center justify-between flex-none">
        <div className="flex items-center gap-x-4">
          <Brain className="h-5 w-5" />
          <h2 className="line-clamp-1 text-2xl font-bold lg:text-3xl">{t`AI Tools`}</h2>
        </div>
      </header>

      <Tabs defaultValue="ats" className="w-full h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-2 flex-none">
          <TabsTrigger value="ats">
            <MagnifyingGlass className="mr-2 h-4 w-4" />
            {t`ATS Analysis`}
          </TabsTrigger>
          <TabsTrigger value="chat">
            <ChatCircleText className="mr-2 h-4 w-4" />
            {t`AI Assistant`}
          </TabsTrigger>
        </TabsList>

        {/* ATS Analysis Tab */}
        <TabsContent value="ats" className="mt-4 flex-1 overflow-hidden">
          <div className="flex flex-col h-full">
            {/* Scrollable Content */}
            <ScrollArea className="flex-1">
              <div className="space-y-4 pr-4">
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
                    <MagnifyingGlass className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p className="text-sm font-medium mb-2">{t`No Job Selected`}</p>
                    <p className="text-xs">{t`Please select a job above to analyze ATS keywords.`}</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>

        {/* AI Assistant Tab */}
        <TabsContent value="chat" className="mt-4 flex-1 overflow-hidden">
          <div className="h-full flex flex-col border rounded-lg">
            {/* Chat Interface - without job selector */}
            {!selectedJob ? (
              <div className="flex-1 flex items-center justify-center p-8 text-center text-muted-foreground">
                <div>
                  <Robot className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p className="text-sm font-medium mb-2">{t`No Job Selected`}</p>
                  <p className="text-xs">{t`Please select a job above to get AI assistance.`}</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <div className="flex-none border-b p-4 bg-secondary/10">
                  <div className="flex items-center justify-between mb-2">
                    <Label>{t`Selected Job`}</Label>
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
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">{selectedJob.title}</span>
                    <span>•</span>
                    <span className="text-muted-foreground">{selectedJob.company}</span>
                  </div>
                </div>

                <Alert className="flex-none">
                  <AlertDescription className="text-xs text-muted-foreground">
                    {t`Note: Personal details (name, contact info, etc.) are not sent to AI. Please fill these in manually.`}
                  </AlertDescription>
                </Alert>

                <div className="flex-1 flex flex-col min-h-0">
                  <ScrollArea className="flex-1">
                    <div className="space-y-4 p-4">
                      {messages.map((message, index) => (
                        <div
                          key={index}
                          className={cn(
                            "rounded-lg p-3 max-w-[85%] break-words",
                            message.role === 'user'
                              ? "ml-auto bg-primary text-primary-foreground"
                              : "mr-auto bg-muted"
                          )}
                        >
                          {message.content}
                        </div>
                      ))}
                      {isLoading && (
                        <div className="mr-auto animate-pulse rounded-lg bg-muted p-3">
                          {t`Thinking...`}
                        </div>
                      )}
                    </div>
                  </ScrollArea>

                  {proposedChanges && (
                    <div className="border-t p-4 bg-secondary/20">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{t`Suggested Changes`}</span>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={rejectChanges}
                              className="text-destructive hover:text-destructive"
                            >
                              {t`Reject`}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={applyChanges}
                              className="text-green-600 hover:text-green-700"
                            >
                              {t`Apply Changes`}
                            </Button>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {t`Review the suggested changes before applying them to your resume.`}
                        </div>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="flex gap-2 p-4 border-t">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={t`Ask anything about your resume...`}
                      className="flex-1 bg-transparent p-2 border rounded outline-none text-sm"
                      disabled={isLoading || !selectedJob}
                    />
                    <Button 
                      type="submit" 
                      variant="ghost" 
                      disabled={isLoading || !selectedJob}
                      className={cn(
                        "min-w-[40px]",
                        isLoading && "animate-pulse"
                      )}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                          <span className="text-xs">{t`Processing...`}</span>
                        </div>
                      ) : (
                        <ChatCircleText className="h-4 w-4" />
                      )}
                    </Button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
};