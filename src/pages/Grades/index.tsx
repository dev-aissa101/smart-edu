import AppLayout from "@/components/app-layout";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
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
import { Button } from "@/components/ui/button";

export default function GradesPage() {
  const classes = useQuery(api.classes.list);
  const [classId, setClassId] = useState<string>("");

  const students = useQuery(
    api.students.listByClass,
    classId ? { classId: classId as any } : { classId: undefined },
  );

  const sorted = useMemo(() => {
    if (!students) return [];
    return [...students].sort((a, b) =>
      (a.lastName ?? "").localeCompare(b.lastName ?? ""),
    );
  }, [students]);

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Grades</h1>
        <p className="text-sm text-muted-foreground">
          Open a student profile to add/view grades
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Choose class</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
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
        </CardContent>
      </Card>

      {!classId ? (
        <p className="text-sm text-muted-foreground">Select a class.</p>
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
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Open</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((s) => (
                  <TableRow key={s._id}>
                    <TableCell className="font-medium">
                      {s.firstName} {s.lastName}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="secondary" size="sm">
                        <Link to={`/students/${s._id}`}>Grades</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </AppLayout>
  );
}
