import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axios } from "../../libs/axios";

type JobApplication = {
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
};

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
    mutationFn: async (application: Omit<JobApplication, "id">) => {
      const { data } = await axios.post("/job-applications", application);
      return data;
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
