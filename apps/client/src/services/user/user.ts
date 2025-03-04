import type { UserDto } from "@reactive-resume/dto";
import { useQuery } from "@tanstack/react-query";
import type { AxiosError, AxiosResponse } from "axios";
import { useEffect } from "react";

import { axios } from "@/client/libs/axios";
import { useAuthStore } from "@/client/stores/auth";

export const fetchUser = async () => {
  try {
    const response = await axios.get<UserDto | undefined, AxiosResponse<UserDto | undefined>>(
      "/user/me",
    );

    return response.data;
  } catch (error) {
    // If unauthorized, clear the auth store
    if ((error as AxiosError)?.response?.status === 401) {
      useAuthStore.setState({ user: null });
    }
    throw error;
  }
};

export const useUser = () => {
  const setUser = useAuthStore((state) => state.setUser);

  const {
    error,
    isPending: loading,
    data: user,
  } = useQuery({
    queryKey: ["user"],
    queryFn: fetchUser,
    retry: 1, // Only retry once on failure
    retryDelay: 1000, // Wait 1 second before retrying
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
    refetchOnWindowFocus: true, // Refetch when window gains focus
  });

  useEffect(() => {
    setUser(user ?? null);
  }, [user, setUser]);

  return { user: user, loading, error };
};
