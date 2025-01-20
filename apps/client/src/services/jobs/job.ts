import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { stripHtml } from "@/client/utils/string";

import { axios } from "../../libs/axios";
import { extractAtsKeywords } from "../openai/extract-ats";
import { t } from "@lingui/macro";
import { UpdateJobDto } from "@reactive-resume/dto";

type CreateJobDto = {
  title: string;
  company: string;
  location?: string;
  type?: string;
  salary?: string;
  url?: string;
  description?: string;
  atsKeywords?: {
    skills: {
      keyword: string;
      relevance: number;
      count: number;
    }[];
    requirements: {
      keyword: string;
      type: "must-have" | "nice-to-have";
    }[];
    experience: {
      keyword: string;
      yearsRequired?: number;
    }[];
    education: {
      level: string;
      field?: string;
    }[];
  };
};

type UpdateJobStatusDto = {
  id: string;
  status: string;
};

export const useJobs = () => {
  return useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const { data } = await axios.get("/jobs");
      return data.map((job: any) => ({
        ...job,
        canEdit: job.userId === job.currentUserId
      }));
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
    mutationFn: async ({ id, ...data }: { id: string } & Omit<UpdateJobDto, "atsKeywords">) => {
      try {
        const { data: updatedJob } = await axios.patch(`/jobs/${id}`, {
          title: data.title,
          company: data.company,
          location: data.location,
          type: data.type,
          salary: data.salary,
          url: data.url,
          description: data.description,
          notes: data.notes,
          status: data.status,
          resumeId: data.resumeId,
        });
        return updatedJob;
      } catch (error) {
        console.error("Error in updateJob mutation:", error);
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

