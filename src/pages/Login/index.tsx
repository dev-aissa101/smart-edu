import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useConvexAuth } from "convex/react";

import { LoginForm } from "./components/login-form";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const { isAuthenticated, isLoading } = useConvexAuth();

  const from = (location.state as any)?.from ?? "/";

  // ✅ Redirect only when auth is ready
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, from]);

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
