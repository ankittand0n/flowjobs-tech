import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/client/libs/axios";
import { CreateMockTest } from "@reactive-resume/dto";

export const useMockTests = () => {
  return useQuery({
    queryKey: ["mock-tests"],
    queryFn: async () => {
      const { data } = await axios.get("/mock-tests");
      return data;
    },
  });
};

export const useCreateMockTest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateMockTest) => {
      const { data } = await axios.post("/mock-tests", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mock-tests"] });
    },
  });
}; 