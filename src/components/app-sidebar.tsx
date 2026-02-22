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
import { useQuery, useConvexAuth } from "convex/react";
import { api } from "../../convex/_generated/api";

import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CalendarCheck,
  BookOpen,
  Shield,
  LogOut,
  ChartPieIcon,
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
    icon: ChartPieIcon,
  },
  {
    title: "Subjects",
    url: "/subjects",
    icon: BookOpen,
  },
];

export function AppSidebar() {
  const { pathname } = useLocation();
  const { signOut } = useAuthActions();
  const { isAuthenticated } = useConvexAuth();

  const me = useQuery(api._auth.myRole, isAuthenticated ? {} : "skip");

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
        {/* Role + email */}
        <div className="mb-3">
          <div className="text-xs text-muted-foreground">Role</div>
          <div className="text-sm font-medium capitalize">
            {me?.role ?? "—"}
          </div>

          {me?.email && (
            <div className="mt-1 text-xs text-muted-foreground truncate">
              {me.email}
            </div>
          )}
        </div>

        {/* Logout */}
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
      </SidebarFooter>
    </Sidebar>
  );
}
