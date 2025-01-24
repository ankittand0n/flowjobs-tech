import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { stripHtml } from "@/client/utils/string";

import { axios } from "../../libs/axios";
import { extractAtsKeywords } from "../openai/extract-ats";

// Base type for Job properties
type BaseJob = {
  id: string;
  title: string;
  company: string;
  location?: string;
  type?: string;
  salary?: string;
  url?: string;
  description?: string;
  atsKeywords?: {
    skills: Array<{ keyword: string; relevance: number; count: number }>;
    requirements: Array<{ keyword: string; type: "must-have" | "nice-to-have" }>;
    experience: Array<{ keyword: string; yearsRequired?: number }>;
    education: Array<{ level: string; field?: string }>;
  };
};

// Full Job type with additional properties from server
export type Job = BaseJob & {
  createdBy: string;
  currentUserId?: string;
  canEdit?: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// DTO for creating a new job
export type CreateJobDto = Omit<BaseJob, 'id' | 'status'>;

// DTO for updating a job
export type UpdateJobDto = Partial<Omit<BaseJob, 'id' | 'status'>>;

// DTO for updating just the status
export type UpdateJobStatusDto = {
  id: string;
  status: string;
};

export const useJobs = () => {
  return useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const { data } = await axios.get("/jobs");
      const { currentUserId, jobs } = data;

      return jobs.map((job: any) => {
        return {
          ...job,
          canEdit: job.createdBy === currentUserId
        };
      });
    },
  });
};

export const useCreateJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (job: CreateJobDto) => {
      try {
        // First check if job with same URL exists
        if (job.url) {
          const { data: existingJobs } = await axios.get(`/jobs/search?url=${encodeURIComponent(job.url)}`);

          // If job exists, return it instead of creating new one
          if (existingJobs && existingJobs.length > 0) {
            return existingJobs[0];
          }
        }

        // If no existing job found, create new one
        const { data } = await axios.post("/jobs", job);
        return data;
      } catch (error) {
        console.error("Error in createJob mutation:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
};

export const useUpdateJobStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: UpdateJobStatusDto) => {
      const { data } = await axios.patch(`/job/${id}/status`, { status });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
};

export const useUpdateJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Omit<BaseJob, 'id' | 'atsKeywords'>) => {
      try {
        const updateData = {
          title: data.title?.trim(),
          company: data.company?.trim(),
          location: data.location?.trim() || null,
          type: data.type || null,
          salary: data.salary?.trim() || null,
          url: data.url?.trim() || null,
          description: data.description || null,
        };

        Object.keys(updateData).forEach((key) => {
          if (updateData[key as keyof typeof updateData] === null) {
            delete updateData[key as keyof typeof updateData];
          }
        });

        console.log('Making update request:', {
          endpoint: `/jobs/${id}`,
          method: 'PATCH',
          requestData: updateData
        });

        const response = await axios.patch(`/jobs/${id}`, updateData);
        console.log('Update response:', response);
        
        return response.data;
      } catch (error: any) {
        console.error("Job Update Error:", {
          message: error.message,
          response: error.response ? {
            data: error.response.data,
            status: error.response.status,
            statusText: error.response.statusText,
          } : 'No response',
          request: error.request ? 'Request was made but no response received' : 'No request made',
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
};

export const usePublicJobs = () => {
  return useQuery({
    queryKey: ["public-jobs"],
    queryFn: async () => {
      const { data } = await axios.get("/jobs/public");
      return data;
    },
  });
};

export const useExtractAtsKeywords = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobId: string) => {
      try {
        console.log('Starting ATS extraction for job:', jobId);

        const { data: job } = await axios.get(`/jobs/${jobId}`);

        if (!job.description) {
          throw new Error("No job description provided");
        }

        const plainDescription = stripHtml(job.description);
        console.log('Sending to OpenAI:', plainDescription);

        const keywords = await extractAtsKeywords(plainDescription);
        console.log('Received from OpenAI:', keywords);

        await axios.patch(`/jobs/${jobId}/ats-keywords`, {
          atsKeywords: keywords,
        });

        return keywords;
      } catch (error: unknown) {
        console.error('Failed to extract ATS keywords:', error);
        if (error && typeof error === 'object' && 'response' in error &&
            error.response && typeof error.response === 'object' && 'data' in error.response &&
            error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
          throw new Error(error.response.data.message as string);
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
};

export const useDeleteJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axios.delete(`/jobs/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
};

export const useSearchJobs = (url?: string) => {
  return useQuery({
    queryKey: ["jobs", "search", url],
    queryFn: async () => {
      const { data } = await axios.get(`/jobs/search?url=${encodeURIComponent(url || '')}`);
      return data;
    },
    enabled: !!url,
  });
};

