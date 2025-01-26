import { useQuery } from "@tanstack/react-query";
import { axios } from "@/client/libs/axios";

export const useAuth = () => {
  const { data } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data } = await axios.get("/auth/me");
      return data;
    },
  });

  // Add console.log to debug
  console.log("Auth Data:", data);
  
  const isAdmin = data?.user?.role === "ADMIN";
  
  return { user: data?.user, isAdmin };
}; 