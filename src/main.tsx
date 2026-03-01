import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { router } from "./routes";
import { ConvexReactClient } from "convex/react";
import "./index.css";
import { Toaster } from "@/components/ui/toast";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConvexAuthProvider client={convex}>
      <>
        <RouterProvider router={router} />
        <Toaster />
      </>
    </ConvexAuthProvider>
  </StrictMode>,
);
