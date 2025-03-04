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
    // console.log('Making request:', {
    //   method: config.method,
    //   url: config.url,
    //   data: config.data,
    //   headers: config.headers
    // });
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('Response error:', {
        data: error.response.data,
        status: error.response.status,
        headers: error.response.headers,
        requestData: error.config?.data
      });

      toast({
        variant: "error",
        title: error.response.data.message || 'An error occurred'
      });
    } else if (error.request) {
      console.error('No response received:', {
        request: error.request,
        config: error.config
      });
    } else {
      console.error('Request setup error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Create another instance to handle failed refresh tokens
// Reference: https://github.com/Flyrell/axios-auth-refresh/issues/191
const axiosForRefresh = axios.create({ baseURL: "/api", withCredentials: true });

// Interceptor to handle expired access token errors
const handleAuthError = () => refreshToken(axiosForRefresh);

// Interceptor to handle expired refresh token errors
const handleRefreshError = async () => {
  await queryClient.invalidateQueries({ queryKey: USER_KEY });
  redirect("/auth/login");
};

// Intercept responses to check for 401 and 403 errors, refresh token and retry the request
createAuthRefreshInterceptor(axiosInstance, handleAuthError, { statusCodes: [401, 403] });
createAuthRefreshInterceptor(axiosForRefresh, handleRefreshError);

export { axiosInstance as axios };
