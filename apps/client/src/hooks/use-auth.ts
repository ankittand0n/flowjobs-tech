import { useQuery } from "@tanstack/react-query";
import { axios } from "@/client/libs/axios";
import { useAuthStore } from "@/client/stores/auth";

interface AuthResponse {
  user: {
    id: string;
    role: string;
    name: string;
    picture?: string | null;
  } | null;
}

export const useAuth = () => {
  const authStoreUser = useAuthStore((state) => state.user);
  
  const { data } = useQuery<AuthResponse>({
    queryKey: ["user"],
    queryFn: async () => {
      const { data } = await axios.get<AuthResponse>("/auth/me");
      console.log("Auth API Response:", data);
      return data;
    },
  });

  // console.log("Auth Data in Hook:", {
  //   queryData: data,
  //   authStoreUser,
  //   authStoreRole: authStoreUser?.role,
  //   isAdmin: authStoreUser?.role === "ADMIN"
  // });
  
  // Use auth store role instead of query data
  const isAdmin = authStoreUser?.role === "ADMIN";
  
  return { user: authStoreUser, isAdmin };
}; 