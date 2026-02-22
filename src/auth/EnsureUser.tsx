import { type ReactNode, useEffect } from "react";
import { useConvexAuth, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function EnsureUser({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useConvexAuth();
  const ensureUser = useMutation(api._auth.ensureUser);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Create user if missing
    ensureUser({}).catch(() => {});
  }, [isAuthenticated, ensureUser]);

  return <>{children}</>;
}
