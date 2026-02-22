import { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useConvexAuth } from "convex/react";
import EnsureUser from "@/auth/EnsureUser";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <EnsureUser>{children}</EnsureUser>;
}
