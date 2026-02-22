import React from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
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
