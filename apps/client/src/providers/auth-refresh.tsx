import { useEffect, useRef } from "react";
import { t } from "@lingui/macro";
import { axios } from "../libs/axios";
import { refreshToken } from "../services/auth/refresh";
import { useAuthStore } from "../stores/auth";
import { toast } from "../hooks/use-toast";

type Props = {
  children: React.ReactNode;
};

/**
 * The AuthRefreshProvider wrapper is responsible for refreshing
 * the access token periodically while the user is authenticated.
 * It also handles refresh failures gracefully.
 *
 * @param children The children to render.
 */
export const AuthRefreshProvider = ({ children }: Props) => {
  const intervalId = useRef<NodeJS.Timeout>();
  const refreshing = useRef<boolean>(false);
  const isLoggedIn = useAuthStore((state) => !!state.user);
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    if (!isLoggedIn) {
      if (intervalId.current) {
        clearInterval(intervalId.current);
        intervalId.current = undefined;
      }
      return;
    }

    const _refreshToken = async () => {
      // Prevent multiple simultaneous refresh attempts
      if (refreshing.current) return;
      
      try {
        refreshing.current = true;
        await refreshToken(axios);
      } catch (error) {
        console.error('Token refresh failed:', error);
        
        // If refresh fails, log out the user gracefully
        setUser(null);
        toast({
          variant: "error",
          title: t`Session expired`,
          description: t`Please log in again to continue.`
        });
        
        // Redirect to login
        window.location.href = `/auth/login?redirect=${window.location.pathname}`;
      } finally {
        refreshing.current = false;
      }
    };

    // Initial refresh
    void _refreshToken();
    
    // Refresh every 4 minutes (shorter than the typical 5-minute token expiry)
    intervalId.current = setInterval(_refreshToken, 4 * 60 * 1000);

    return () => {
      if (intervalId.current) {
        clearInterval(intervalId.current);
        intervalId.current = undefined;
      }
    };
  }, [isLoggedIn, setUser]);

  return children;
};
