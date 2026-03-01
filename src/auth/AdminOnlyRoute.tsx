import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function AdminOnlyRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const me = useQuery(api._auth.myRole, isAuthenticated ? {} : "skip");

  if (isLoading || me === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || me?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
