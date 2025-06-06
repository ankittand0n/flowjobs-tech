export interface ResumeChatDto {
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  resume: Record<string, any>;
  job?: {
    id: string;
    title: string;
    company: string;
    description?: string;
    // ... other job fields
  };
}

export interface ResumeChatResponseDto {
  message: string;
  resumeData?: Record<string, any>;
  resumeUpdates?: Record<string, any>;
} 