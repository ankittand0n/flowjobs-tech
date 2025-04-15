import { t } from "@lingui/macro";
import { Button } from "@reactive-resume/ui";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@reactive-resume/ui";
import { Input } from "@reactive-resume/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@reactive-resume/ui";
import { useState, useEffect } from "react";
import { MessageSquare, Send, Text, Info } from "lucide-react";
import { useJobs } from "@/client/services/jobs/job";
import { CreateJobDto, ResumeChatDto, ResumeChatResponseDto } from "@reactive-resume/dto";
import { cn } from "@reactive-resume/utils";
import { useResumeStore } from "@/client/stores/resume";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
}

interface ResumeData {
  experience: any[];
  education: any[];
  skills: any[];
  projects: any[];
}

interface ChatHistory {
  [jobId: string]: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export const AiChatDialog = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState<string>("");
  const [matchedKeywords, setMatchedKeywords] = useState<Set<string>>(new Set());
  const [proposedChanges, setProposedChanges] = useState<any>(null);
  const { data: jobs } = useJobs();
  const selectedJobData = jobs?.find((job: CreateJobDto & { id: string }) => job.id === selectedJob);
  const resume = useResumeStore((state) => state.resume);
  const setValue = useResumeStore((state) => state.setValue);

  // Update matched keywords when resume data changes
  useEffect(() => {
    if (selectedJobData?.atsKeywords) {
      const resumeText = JSON.stringify(resume.data).toLowerCase();
      const matches = new Set<string>();
      
      selectedJobData.atsKeywords.skills?.forEach((skill: any) => {
        if (resumeText.includes(skill.keyword.toLowerCase())) {
          matches.add(skill.keyword);
        }
      });

      setMatchedKeywords(matches);
    }
  }, [resume.data, selectedJobData]);

  // Load chat history when component mounts or job changes
  useEffect(() => {
    if (selectedJob) {
      const savedHistory = localStorage.getItem('resume_chat_history');
      if (savedHistory) {
        const chatHistory: ChatHistory = JSON.parse(savedHistory);
        const historyMessages = chatHistory[selectedJob] || [];
        setMessages(historyMessages.map((msg, index) => ({
          id: `history-${index}`,
          role: msg.role,
          content: msg.content
        })));
      }
    } else {
      setMessages([]);
    }
  }, [selectedJob]);

  // Save chat history whenever messages change
  useEffect(() => {
    if (selectedJob && messages.length > 0) {
      const savedHistory = localStorage.getItem('resume_chat_history');
      const chatHistory: ChatHistory = savedHistory ? JSON.parse(savedHistory) : {};
      chatHistory[selectedJob] = messages.map(({ role, content }) => ({ role, content }));
      localStorage.setItem('resume_chat_history', JSON.stringify(chatHistory));
    }
  }, [messages, selectedJob]);

  useEffect(() => {
    if (!selectedJobData?.atsKeywords) return;

    const resumeText = JSON.stringify(resume.data).toLowerCase();
    const matches = new Set<string>();
    
    selectedJobData.atsKeywords.skills?.forEach((skill: any) => {
      if (resumeText.includes(skill.keyword.toLowerCase())) {
        matches.add(skill.keyword);
      }
    });

    setMatchedKeywords(matches);
  }, [selectedJobData, resume]);

  const getKeywordStats = () => {
    if (!selectedJobData?.atsKeywords?.skills?.length) return { matched: 0, total: 0, percentage: 0 };
    
    const totalKeywords = selectedJobData.atsKeywords.skills.length;
    const matchedCount = matchedKeywords.size;
    const percentage = Math.round((matchedCount / totalKeywords) * 100);

    return { matched: matchedCount, total: totalKeywords, percentage };
  };

  const getResumeWordCount = () => {
    const resumeText = JSON.stringify(resume.data)
      .replace(/"[^"]+"|{|}|\[|\]|,/g, ' ')
      .replace(/\s+/g, ' ')
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

  const handleSend = async () => {
    if (!input.trim() || isLoading || !selectedJobData) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
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
            id: selectedJobData.id,
            title: selectedJobData.title,
            company: selectedJobData.company,
            atsKeywords: selectedJobData.atsKeywords || [],
            description: selectedJobData.description || '',
            requirements: selectedJobData.requirements || []
          }
        } as ResumeChatDto),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json() as ResumeChatResponseDto;
      
      // Debug the response
      console.log('=== API Response Debug ===');
      console.log('Full API Response:', JSON.stringify(data, null, 2));
      console.log('Message:', data.message);
      console.log('ResumeData:', data.resumeData);
      console.log('ResumeUpdates:', data.resumeUpdates);
      
      // Extract the message and resumeData from the response
      let message = data.message;
      let resumeUpdates = data.resumeData || data.resumeUpdates;
      
      // Debug the updates
      console.log('=== Resume Updates Debug ===');
      console.log('Initial Resume Updates:', resumeUpdates);
      
      // If resumeData is null but message contains updates, try to extract them
      if (!resumeUpdates && message) {
        console.log('=== Message Processing Debug ===');
        console.log('Original Message:', message);
        
        try {
          // Extract keywords from the message
          const keywordMatches = message.match(/- (.*?)(?:\n|$)/g);
          if (keywordMatches) {
            console.log('Found keywords in message:', keywordMatches);
            const keywords = keywordMatches.map(match => match.replace('- ', '').trim());
            
            // Create a resume update structure
            resumeUpdates = {
              skills: {
                items: keywords.map(keyword => ({
                  id: crypto.randomUUID(),
                  name: keyword,
                  level: 3, // Default level
                  visible: true
                }))
              }
            };
            
            console.log('Created resume updates from keywords:', resumeUpdates);
          }
        } catch (e) {
          console.error('Failed to extract keywords from message:', e);
        }
      }
      
      // Set the message in chat
      setMessages((prev) => [...prev, { 
        id: (Date.now() + 1).toString(),
        role: 'assistant', 
        content: message || t`I couldn't process that request.` 
      }]);
      
      // Handle resume updates if available
      if (resumeUpdates) {
        console.log('=== Processing Resume Updates ===');
        try {
          // Ensure resumeUpdates is properly structured
          if (typeof resumeUpdates === 'string') {
            console.log('ResumeUpdates is a string, parsing it');
            resumeUpdates = JSON.parse(resumeUpdates);
            console.log('Parsed resumeUpdates:', resumeUpdates);
          }

          // Create a complete section object with all required fields
          const updatedSections: Record<string, any> = {};
          
          // Process each section from the API response
          if (resumeUpdates && typeof resumeUpdates === 'object') {
            console.log('Processing sections:', Object.keys(resumeUpdates));
            Object.entries(resumeUpdates).forEach(([sectionKey, sectionData]) => {
              console.log(`Processing section ${sectionKey}:`, sectionData);
              if (Array.isArray(sectionData)) {
                // For sections with items (like skills, experience, education)
                const existingSection = resume.data.sections[sectionKey as keyof typeof resume.data.sections];
                
                if (!existingSection) {
                  console.warn(`Section ${sectionKey} does not exist in resume`);
                  return;
                }

                console.log(`Existing section ${sectionKey}:`, existingSection);

                // Process each item in the section
                const newItems = sectionData.map((item: any) => {
                  // Find existing item by name if no id is provided
                  const existingItem = ('items' in existingSection && Array.isArray(existingSection.items)) 
                    ? existingSection.items.find((ei: any) => ei.id === item.id || ei.name === item.name)
                    : {};

                  // Create a complete item with all required fields
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
            });
          }
          
          // Only set proposed changes if we have updates
          if (Object.keys(updatedSections).length > 0) {
            const changes = {
              ...resume.data,
              sections: {
                ...resume.data.sections,
                ...updatedSections
              }
            };
            console.log('Setting proposed changes:', changes);
            setProposedChanges(changes);
            
            // Add a message about the proposed changes
            setMessages((prev) => [...prev, { 
              id: (Date.now() + 2).toString(),
              role: 'assistant', 
              content: t`I've analyzed the job requirements and prepared some updates to your resume. Please review the changes below and click "Apply Changes" if you'd like to keep them.` 
            }]);
          } else {
            console.log('No valid updates found in resumeUpdates');
          }
        } catch (error) {
          console.error('Error processing resume updates:', error);
          setMessages((prev) => [...prev, { 
            id: (Date.now() + 2).toString(),
            role: 'assistant', 
            content: t`I encountered an error while processing the resume updates. Please try again.` 
          }]);
        }
      } else {
        console.log('No resume updates received from API');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [...prev, { 
        id: (Date.now() + 1).toString(),
        role: 'assistant', 
        content: t`Sorry, I encountered an error while processing your request. Please try again.` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const applyChanges = () => {
    if (proposedChanges) {
      setValue('data', proposedChanges);
      setProposedChanges(null);
      
      // Update matched keywords after applying changes
      if (selectedJobData?.atsKeywords) {
        const resumeText = JSON.stringify(proposedChanges).toLowerCase();
        const matches = new Set<string>();
        
        selectedJobData.atsKeywords.skills?.forEach((skill: any) => {
          if (resumeText.includes(skill.keyword.toLowerCase())) {
            matches.add(skill.keyword);
          }
        });

        setMatchedKeywords(matches);
      }

      setMessages((prev) => [...prev, { 
        id: (Date.now() + 1).toString(),
        role: 'assistant', 
        content: t`I've applied the changes to your resume. The ATS analysis has been updated to reflect the new keywords.` 
      }]);
    }
  };

  const rejectChanges = () => {
    setProposedChanges(null);
    setMessages((prev) => [...prev, { 
      id: (Date.now() + 1).toString(),
      role: 'assistant', 
      content: t`I've discarded the proposed changes.` 
    }]);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="ml-2"
        onClick={() => setOpen(true)}
      >
        <MessageSquare className="mr-2 h-4 w-4" />
        {t`Ask AI`}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>{t`AI Assistant`}</DialogTitle>
          </DialogHeader>
          <div className="flex h-[600px] flex-col">
            <div className="mb-4">
              <Select value={selectedJob} onValueChange={setSelectedJob}>
                <SelectTrigger>
                  <SelectValue placeholder={t`Select a job to analyze`} />
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
            <div className="flex flex-1 gap-4 overflow-hidden">
              {/* ATS Analysis Section */}
              <div className="w-1/2 overflow-y-auto rounded-lg border p-4 space-y-4">
                {selectedJobData?.atsKeywords ? (
                  <>
                    {/* Resume Metrics */}
                    <div>
                      <div className="flex items-center gap-2">
                        <Text className="h-4 w-4" />
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
                    <div>
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
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <h4 className="text-sm font-medium">{t`Keywords Found`}</h4>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedJobData.atsKeywords.skills
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
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <h4 className="text-sm font-medium">{t`Missing Keywords`}</h4>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedJobData.atsKeywords.skills
                          .filter((skill: any) => !matchedKeywords.has(skill.keyword))
                          .map((skill: any) => (
                            <div 
                              key={skill.keyword} 
                              className="bg-red-500/10 text-red-700 dark:text-red-400 rounded-full px-3 py-1 text-xs flex items-center gap-2"
                            >
                              <span>{skill.keyword}</span>
                              <span className="opacity-75">({Math.round(skill.relevance * 100)}%)</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {t`Select a job to see the ATS analysis`}
                  </p>
                )}
              </div>

              {/* Chat Section */}
              <div className="flex w-1/2 flex-col rounded-lg border overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] rounded-lg p-3 bg-muted">
                        {t`Thinking...`}
                      </div>
                    </div>
                  )}
                </div>
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={t`Type your message...`}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSend();
                        }
                      }}
                      disabled={isLoading}
                    />
                    <Button size="icon" onClick={handleSend} disabled={isLoading}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  {proposedChanges && (
                    <div className="mt-4 flex gap-2">
                      <Button onClick={applyChanges} size="sm">
                        {t`Apply Changes`}
                      </Button>
                      <Button onClick={rejectChanges} variant="outline" size="sm">
                        {t`Discard Changes`}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}; 