import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { Link, useLocation } from "react-router-dom";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CalendarCheck,
  BookOpen,
  Shield,
  LogOut,
} from "lucide-react";

const mainItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Classes",
    url: "/classes",
    icon: Users,
  },
  {
    title: "Students",
    url: "/students",
    icon: GraduationCap,
  },
  {
    title: "Attendance",
    url: "/attendance",
    icon: CalendarCheck,
  },
  {
    title: "Grades",
    url: "/grades",
    icon: BookOpen,
  },
];

export function AppSidebar() {
  const { pathname } = useLocation();
  const { signOut } = useAuthActions();

  // Get current user's role
  const me = useQuery(api._auth.myRole);

  return (
    <Sidebar>
      {/* ================= HEADER ================= */}
      <SidebarHeader className="px-4 py-4 border-b">
        <div className="text-lg font-semibold">EduTrack</div>
        <div className="text-xs text-muted-foreground">
          Student Management System
        </div>
      </SidebarHeader>

      {/* ================= MAIN MENU ================= */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {mainItems.map((item) => {
              const active = pathname === item.url;

              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={active}>
                    <Link to={item.url}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.title}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        {/* ================= ADMIN MENU ================= */}
        {me?.role === "admin" && (
          <SidebarGroup>
            <div className="px-4 py-2 text-xs font-semibold text-muted-foreground">
              Administration
            </div>

            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/admin/users"}
                >
                  <Link to="/admin/users">
                    <Shield className="mr-2 h-4 w-4" />
                    Manage Users
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* ================= FOOTER ================= */}
      <SidebarFooter className="px-4 py-4 border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => signOut()}
              className="text-red-600 hover:text-red-700"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* User info */}
        {me && (
          <div className="mt-3 text-xs text-muted-foreground">
            <div>{me.email}</div>
            <div className="capitalize">{me.role}</div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
