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
import { useState, useEffect } from "react";
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

interface ChatHistory {
  [jobId: string]: Array<{ role: 'user' | 'assistant'; content: string }>;
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

  // Load chat history when component mounts or job changes
  useEffect(() => {
    if (selectedJobId) {
      const savedHistory = localStorage.getItem('resume_chat_history');
      if (savedHistory) {
        const chatHistory: ChatHistory = JSON.parse(savedHistory);
        setMessages(chatHistory[selectedJobId] || []);
      }
    } else {
      setMessages([]);
    }
  }, [selectedJobId]);

  // Save chat history whenever messages change
  useEffect(() => {
    if (selectedJobId && messages.length > 0) {
      const savedHistory = localStorage.getItem('resume_chat_history');
      const chatHistory: ChatHistory = savedHistory ? JSON.parse(savedHistory) : {};
      chatHistory[selectedJobId] = messages;
      localStorage.setItem('resume_chat_history', JSON.stringify(chatHistory));
    }
  }, [messages, selectedJobId]);

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
      // Add custom sections
      ...Object.entries(resume?.data?.sections || {})
        .filter(([key]) => key.startsWith('custom_'))
        .reduce((acc, [key, section]) => ({
          ...acc,
          [key]: 'items' in section ? section.items : []
        }), {})
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
            atsKeywords: selectedJob.atsKeywords || []
          }
        } as ResumeChatDto),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json() as ResumeChatResponseDto;
      
      // Log the response for debugging
      console.log('AI Response:', data);
      
      // Extract the message and resumeData from the response
      let message = data.message;
      let resumeUpdates = data.resumeData || data.resumeUpdates;
      
      // If the response is a string that looks like JSON, try to parse it
      if (typeof message === 'string') {
        try {
          // First try to parse the entire message as JSON
          if (message.trim().startsWith('{')) {
            const parsedResponse = JSON.parse(message);
            message = parsedResponse.message;
            resumeUpdates = parsedResponse.resumeData || parsedResponse.resumeUpdates;
          } else {
            // If not JSON, clean up any JSON blocks in the message
            message = message.replace(/```json\n[\s\S]*?\n```/g, '');
            message = message.replace(/```\n[\s\S]*?\n```/g, '');
            message = message.replace(/{\s*"resumeData":\s*[\s\S]*?}/g, '');
            message = message.trim();
          }
        } catch (e) {
          console.error('Failed to parse JSON response:', e);
          // If parsing fails, clean up the message
          message = message.replace(/```json\n[\s\S]*?\n```/g, '');
          message = message.replace(/```\n[\s\S]*?\n```/g, '');
          message = message.replace(/{\s*"resumeData":\s*[\s\S]*?}/g, '');
          message = message.trim();
        }
      }
      
      // Set the message in chat
      setMessages((prev) => [...prev, { 
        role: 'assistant', 
        content: message || t`I couldn't process that request.` 
      }]);
      
      // Handle resume updates if available
      if (resumeUpdates) {
        // Create a complete section object with all required fields
        const updatedSections: Record<string, any> = {};
        
        Object.entries(resumeUpdates).forEach(([sectionKey, sectionData]) => {
          if (sectionData && typeof sectionData === 'object') {
            const existingSection = resume.data.sections[sectionKey as keyof typeof resume.data.sections];
            
            // Skip sections that don't exist
            if (!existingSection) {
              return;
            }
            
            // Handle sections with items
            if ('items' in sectionData && 'items' in existingSection) {
              const typedSectionData = sectionData as { items: any[] };
              const existingItems = Array.isArray(existingSection.items) ? existingSection.items : [];
              
              // Merge existing items with new items
              const newItems = typedSectionData.items.map((item: any) => {
                const existingItem = existingItems.find((ei: any) => ei.id === item.id) || {};
                return {
                  ...existingItem,
                  ...item,
                  id: item.id || crypto.randomUUID(),
                  visible: item.visible ?? true,
                  date: item.date || (existingItem as any).date || "",
                  location: item.location || (existingItem as any).location || "",
                  url: item.url || (existingItem as any).url || { label: "", href: "" },
                  summary: item.summary || (existingItem as any).summary || "",
                  description: item.description || (existingItem as any).description || "",
                  keywords: Array.isArray(item.keywords) 
                    ? [...new Set([...((existingItem as any).keywords || []), ...item.keywords])]
                    : (existingItem as any).keywords || [],
                  level: typeof item.level === 'number' ? item.level : (existingItem as any).level || 1
                };
              });
              
              updatedSections[sectionKey] = {
                ...existingSection,
                items: newItems
              };
            }
            // Handle sections without items (like summary)
            else if ('content' in sectionData) {
              updatedSections[sectionKey] = {
                ...existingSection,
                content: sectionData.content
              };
            }
          }
        });
        
        // Only set proposed changes if we have updates
        if (Object.keys(updatedSections).length > 0) {
          const changes = {
            ...resume.data,
            sections: {
              ...resume.data.sections,
              ...updatedSections
            }
          };
          console.log('Proposed Changes:', changes);
          setProposedChanges(changes);
        }
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
        // Update the entire resume data at once
        setValue('', proposedChanges);
        
        // Clear proposed changes after successful update
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
    <div className="h-full flex flex-col gap-4">
      <div className="flex-none border rounded-lg p-4 bg-secondary/10">
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

      <div className="flex-1 border rounded-lg overflow-hidden flex flex-col">
        {!selectedJob ? (
          <div className="flex-1 flex items-center justify-center p-8 text-center text-muted-foreground">
            <div>
              <Robot className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p className="text-sm font-medium mb-2">{t`No Job Selected`}</p>
              <p className="text-xs">{t`Please select a job above to get assistance.`}</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            <Alert className="flex-none">
              <AlertDescription className="text-xs text-muted-foreground">
                {t`Note: Personal details (name, contact info, etc.) are not sent to AI. Please fill these in manually.`}
              </AlertDescription>
            </Alert>

            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
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
              </div>

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

              <div className="flex-none border-t bg-background">
                <form onSubmit={handleSubmit} className="flex gap-2 p-4">
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
          </div>
        )}
      </div>

      <AddJobDialog 
        isOpen={isAddJobOpen} 
        onClose={() => setIsAddJobOpen(false)}
        onSuccess={onJobAdded}
      />
    </div>
  );
}; 