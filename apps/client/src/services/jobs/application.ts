import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axios } from "../../libs/axios";

// For form input in TrackJobDialog
export interface JobApplicationInput {
  title: string;
  company: string;
  description: string;
  location: string;
  url: string;
  type?: string;
  salary?: string;
  status?: string;
  resumeId?: string;
  notes?: string;
}

// For API response and data storage
export interface JobApplication {
  id: string;
  jobId: string;
  status: string;
  resumeId?: string;
  notes?: string;
  job: {
    id: string;
    title: string;
    company: string;
    location?: string;
  };
  resume?: {
    id: string;
    title: string;
  };
}

export const useJobApplications = () => {
  return useQuery({
    queryKey: ["job-applications"],
    queryFn: async () => {
      const { data } = await axios.get<JobApplication[]>("/job-applications");
      return data;
    },
  });
};

export const useCreateJobApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      jobId: string;
      status: string;
      resumeId?: string;
      notes?: string;
      job: {
        id: string;
        title: string;
        company: string;
        location?: string;
      };
    }) => {
      try {
        const response = await axios.post("/job-applications", {
          jobId: data.jobId,
          status: data.status,
          resumeId: data.resumeId,
          notes: data.notes,
          job: data.job
        });
        return response.data;
      } catch (error: any) {
        if (error.response?.data?.message) {
          throw new Error(error.response.data.message);
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-applications"] });
    },
  });
};

export const useUpdateJobApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<JobApplication> & { id: string }) => {
      const { data: response } = await axios.patch(`/job-applications/${id}`, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-applications"] });
    },
  });
};

export const useDeleteJobApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axios.delete(`/job-applications/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-applications"] });
    },
  });
};
