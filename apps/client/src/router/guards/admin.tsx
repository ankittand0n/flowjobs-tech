import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/client/hooks/use-auth";

export const AdminGuard = () => {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}; 