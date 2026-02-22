import React, { useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useConvexAuth();

  const me = useQuery(api._auth.myRole, isAuthenticated ? {} : "skip");
  const ensureUser = useMutation(api._auth.ensureUser);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Only attempt if appUsers row doesn't exist yet
    if (me === null) {
      ensureUser({}).catch(() => {});
    }
  }, [isAuthenticated, me, ensureUser]);

  return (
    <SidebarProvider>
      <AppSidebar />

      <main className="min-h-screen w-full bg-background">
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <SidebarTrigger />
          <span className="text-sm text-muted-foreground">EduTrack</span>
        </div>

        <div className="mx-auto max-w-6xl p-6">{children}</div>
      </main>
    </SidebarProvider>
  );
}
