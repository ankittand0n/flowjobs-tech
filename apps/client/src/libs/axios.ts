import { t } from "@lingui/macro";
import type { ErrorMessage } from "@reactive-resume/utils";
import { deepSearchAndParseDates } from "@reactive-resume/utils";
import axios from "axios";
import createAuthRefreshInterceptor from "axios-auth-refresh";
import { redirect } from "react-router";
import type { AxiosError } from "axios";

import { refreshToken } from "@/client/services/auth";

import { USER_KEY } from "../constants/query-keys";
import { toast } from "../hooks/use-toast";
import { translateError } from "../services/errors/translate-error";
import { queryClient } from "./query-client";

export const axiosInstance = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for better error handling
axiosInstance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
axiosInstance.interceptors.response.use(
  (response) => {
    // Parse dates in response data if any
    if (response.data) {
      response.data = deepSearchAndParseDates(response.data, ['createdAt', 'updatedAt', 'date', 'startDate', 'endDate']);
    }
    return response;
  },
  async (error) => {
    if (error.response) {
      // Only handle 401/403 if it's not a refresh token request
      // This prevents redirect loops
      if ((error.response.status === 401 || error.response.status === 403) && 
          !error.config.url?.includes('/auth/refresh')) {
        // Clear user data from query client
        queryClient.setQueryData(USER_KEY, null);
        
        // Only redirect if it's not an API call from the auth pages
        const currentPath = window.location.pathname;
        if (!currentPath.startsWith('/auth/')) {
          window.location.href = `/auth/login?redirect=${currentPath}`;
        }
        return Promise.reject(error);
      }

      // Show error toast unless it's an auth-related error
      if (![401, 403].includes(error.response.status)) {
        // Extract error message from various possible locations in the response
        const errorMessage = error.response.data?.message || 
                           error.response.data?.error || 
                           error.response.data?.details ||
                           error.response.statusText ||
                           t`An error occurred`;

        // Try to translate the error message if it's a known error type
        let translatedMessage = translateError(errorMessage as ErrorMessage);
        if (!translatedMessage) {
          // If it's not a known error type, use the raw message
          translatedMessage = errorMessage;
        }

        // Extract error details from various possible locations
        const errorDetails = error.response.data?.details || 
                           error.response.data?.error || 
                           error.response.data?.message ||
                           error.response.data?.stack ||
                           '';

        toast({
          variant: "error",
          title: translatedMessage as string,
          description: errorDetails ? String(errorDetails) : t`Please try again later`
        });
      }
    } else if (error.request) {
      // Show network error toast
      toast({
        variant: "error",
        title: t`Network error`,
        description: t`Please check your internet connection and try again`
      });
    } else {
      // Handle other types of errors
      toast({
        variant: "error",
        title: t`An error occurred`,
        description: error.message || t`Please try again later`
      });
    }
    return Promise.reject(error);
  }
);

// Create another instance to handle failed refresh tokens
// Reference: https://github.com/Flyrell/axios-auth-refresh/issues/191
const axiosForRefresh = axios.create({ 
  baseURL: "/api", 
  withCredentials: true,
  timeout: 10000 // 10 second timeout for refresh requests
});

// Interceptor to handle expired access token errors
const handleAuthError = async (failedRequest: any) => {
  try {
    await refreshToken(axiosForRefresh);
    return Promise.resolve();
  } catch (error) {
    return Promise.reject(error);
  }
};

// Interceptor to handle expired refresh token errors
const handleRefreshError = async () => {
  await queryClient.invalidateQueries({ queryKey: USER_KEY });
  const currentPath = window.location.pathname;
  if (!currentPath.startsWith('/auth/')) {
    window.location.href = '/auth/login';
  }
};

// Intercept responses to check for 401 and 403 errors, refresh token and retry the request
createAuthRefreshInterceptor(axiosInstance, handleAuthError, { 
  statusCodes: [401, 403],
  pauseInstanceWhileRefreshing: true // Prevent multiple refresh requests
});
createAuthRefreshInterceptor(axiosForRefresh, handleRefreshError);

export { axiosInstance as axios };
