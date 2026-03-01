import { type ReactNode, useEffect } from "react";
import { useConvexAuth, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const PENDING_LOGIN_EMAIL_KEY = "pendingLoginEmail";

export default function EnsureUser({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useConvexAuth();
  const ensureUser = useMutation(api._auth.ensureUser);

  useEffect(() => {
    if (!isAuthenticated) return;

    const pendingEmail = localStorage.getItem(PENDING_LOGIN_EMAIL_KEY) ?? undefined;

    // Create user if missing and prefer login email when available
    ensureUser({ email: pendingEmail })
      .then((user) => {
        if (user) {
          localStorage.removeItem(PENDING_LOGIN_EMAIL_KEY);
        }
      })
      .catch(() => {});
  }, [isAuthenticated, ensureUser]);

  return <>{children}</>;
}
