import AppLayout from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Users, GraduationCap, CalendarCheck } from "lucide-react";

export default function DashboardPage() {
  const stats = useQuery(api.stats.overview);

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your school data
        </p>
      </div>

      {stats === undefined ? (
        <p className="text-sm text-muted-foreground">Loading stats...</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Classes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{stats.classes}</div>
              <p className="text-xs text-muted-foreground">Total classes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Students</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{stats.students}</div>
              <p className="text-xs text-muted-foreground">Total students</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Attendance Today</CardTitle>
              <CalendarCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">
                {stats.attendanceToday}
              </div>
              <p className="text-xs text-muted-foreground">
                Records marked today
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </AppLayout>
  );
}
