import AppLayout from "@/components/app-layout";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useMemo, useState } from "react";
import { toast } from "@/components/ui/toast";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

const STATUSES = ["present", "absent", "late", "excused"] as const;

export default function AttendancePage() {
  const classes = useQuery(api.classes.list);
  const [classId, setClassId] = useState<string>("");
  const [date, setDate] = useState(todayISO());

  const students = useQuery(
    api.students.listByClass,
    classId ? { classId: classId as any } : { classId: undefined },
  );
  const rows = useQuery(
    api.attendance.getForDate,
    classId ? { classId: classId as any, date } : ("skip" as any),
  );

  const upsert = useMutation(api.attendance.upsert);

  const statusByStudent = useMemo(() => {
    const map = new Map<string, string>();
    (rows ?? []).forEach((r) => map.set(r.studentId, r.status));
    return map;
  }, [rows]);

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Attendance</h1>
        <p className="text-sm text-muted-foreground">
          Mark attendance by class & date
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Choose class & date</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="grid gap-2">
            <Label>Class</Label>
            <Select value={classId} onValueChange={setClassId}>
              <SelectTrigger>
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {classes?.map((c) => (
                  <SelectItem key={c._id} value={c._id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Date</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="flex items-end">
            <Badge variant="secondary">
              {classId ? "Ready" : "Select a class"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {!classId ? (
        <p className="text-sm text-muted-foreground">
          Select a class to take attendance.
        </p>
      ) : students === undefined ? (
        <p className="text-sm text-muted-foreground">Loading students...</p>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Students</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Mark</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((s) => {
                  const st = statusByStudent.get(s._id) ?? "absent";
                  return (
                    <TableRow key={s._id}>
                      <TableCell className="font-medium">
                        {s.firstName} {s.lastName}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{st}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex gap-2">
                          {STATUSES.map((x) => (
                            <Button
                              key={x}
                              size="sm"
                              variant={st === x ? "default" : "secondary"}
                              onClick={async () => {
                                try {
                                  await upsert({
                                    studentId: s._id as any,
                                    classId: classId as any,
                                    date,
                                    status: x,
                                  });
                                  toast({ title: "Attendance saved", description: `${s.firstName} ${s.lastName}: ${x}`, variant: "success" });
                                } catch (e: any) {
                                  toast({ title: "Save failed", description: e?.message ?? "Failed to update attendance.", variant: "error" });
                                }
                              }}
                            >
                              {x}
                            </Button>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </AppLayout>
  );
}
