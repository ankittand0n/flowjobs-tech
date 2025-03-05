import { t } from "@lingui/macro";
import { ChatCircleText, Plus, Robot } from "@phosphor-icons/react";
import { 
  Label, 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  Button,
  ScrollArea,
  Alert,
  AlertDescription,
} from "@reactive-resume/ui";
import { useState } from "react";
import { useJobs } from "@/client/services/jobs/job";
import { CreateJobDto, ResumeChatDto, ResumeChatResponseDto } from "@reactive-resume/dto";
import { cn } from "@reactive-resume/utils";
import { useResumeStore } from "@/client/stores/resume";
import { AddJobDialog } from "@/client/pages/dashboard/jobs/_dialogs/add-job";

interface ResumeData {
  experience: any[];
  education: any[];
  skills: any[];
  projects: any[];
}

interface SectionData {
  items: any[];
  name?: string;
  columns?: number;
  separateLinks?: boolean;
  visible?: boolean;
}

export const AiAssistantSection = () => {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const { data: jobs, refetch: refetchJobs } = useJobs();
  const selectedJob = jobs?.find((job: CreateJobDto & { id: string }) => job.id === selectedJobId);
  const resume = useResumeStore((state) => state.resume);
  const setValue = useResumeStore((state) => state.setValue);
  const [proposedChanges, setProposedChanges] = useState<any>(null);
  const [isAddJobOpen, setIsAddJobOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !selectedJob) return;

    const userMessage = { role: 'user' as const, content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setProposedChanges(null);

    // Create a minimal version of the resume data with only relevant sections
    const resumeData: ResumeData = {
      experience: resume?.data?.sections?.experience?.items || [],
      education: resume?.data?.sections?.education?.items || [],
      skills: resume?.data?.sections?.skills?.items || [],
      projects: resume?.data?.sections?.projects?.items || [],
    };

    // Remove empty sections to reduce payload size
    (Object.keys(resumeData) as Array<keyof ResumeData>).forEach((key) => {
      if (!resumeData[key] || 
          (Array.isArray(resumeData[key]) && 
           resumeData[key].length === 0)) {
        delete resumeData[key];
      }
    });

    try {
      const response = await fetch('/api/openai/resume-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          resume: resumeData,
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
          ...resume.data,
          ...data.resumeUpdates,
          basics: {
            ...resume.data.basics,
            ...data.resumeUpdates.basics
          },
          sections: {
            ...resume.data.sections,
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
          const typedSectionData = sectionData as SectionData;
          if (typedSectionData?.items) {
            // Preserve the existing section structure
            const existingSection = resume.data.sections[sectionKey as keyof typeof resume.data.sections];
            
            // Create a complete section object with all required fields
            const updatedSection = {
              id: sectionKey,
              name: existingSection?.name || sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1),
              columns: existingSection?.columns || 1,
              separateLinks: existingSection?.separateLinks ?? true,
              visible: existingSection?.visible ?? true,
              items: typedSectionData.items.map((item: any) => ({
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

  const onJobAdded = () => {
    setIsAddJobOpen(false);
    refetchJobs();  // Refresh jobs list after adding
  };

  return (
    <div className="h-full flex flex-col border rounded-lg">
      <div className="flex-none border-b p-4 bg-secondary/10">
        <div className="flex items-center justify-between mb-2">
          <Label>{t`Select Job for Assistant`}</Label>
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
            <SelectValue placeholder={t`Choose a job to get assistance`} />
          </SelectTrigger>
          <SelectContent>
            {jobs?.map((job: CreateJobDto & { id: string }) => (
              <SelectItem key={job.id} value={job.id}>
                {job.title} - {job.company}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedJob ? (
        <div className="flex-1 flex items-center justify-center p-8 text-center text-muted-foreground">
          <div>
            <Robot className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p className="text-sm font-medium mb-2">{t`No Job Selected`}</p>
            <p className="text-xs">{t`Please select a job above to get assistance.`}</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          <Alert className="flex-none">
            <AlertDescription className="text-xs text-muted-foreground">
              {t`Note: Personal details (name, contact info, etc.) are not sent to AI. Please fill these in manually.`}
            </AlertDescription>
          </Alert>

          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
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
                    {message.role === 'assistant' ? (
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    ) : (
                      message.content
                    )}
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
              <div className="flex-none border-t p-4 bg-secondary/20">
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

            <form onSubmit={handleSubmit} className="flex-none flex gap-2 p-4 border-t">
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

      <AddJobDialog 
        isOpen={isAddJobOpen} 
        onClose={() => setIsAddJobOpen(false)}
        onSuccess={onJobAdded}
      />
    </div>
  );
}; 