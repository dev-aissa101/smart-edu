import { Navigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function SetupRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const setup = useQuery(api.setup.isSetupAllowed);

  if (setup === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  // If setup already done → block access
  if (!setup.allowed) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
