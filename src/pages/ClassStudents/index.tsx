/* eslint-disable react-hooks/rules-of-hooks */
import AppLayout from "@/components/app-layout";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Link, useParams } from "react-router-dom";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ClassStudentsPage() {
  const { classId } = useParams();
  if (!classId) return <div>Missing classId</div>;

  const classDoc = useQuery(api.classes.get, { classId: classId as any });
  const students = useQuery(api.students.listByClass, {
    classId: classId as any,
  });
  const createStudent = useMutation(api.students.create);

  const [q, setQ] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const filtered = useMemo(() => {
    if (!students) return [];
    const s = q.trim().toLowerCase();
    if (!s) return students;
    return students.filter((x) =>
      `${x.firstName} ${x.lastName}`.toLowerCase().includes(s),
    );
  }, [students, q]);

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Students</h1>
        <p className="text-sm text-muted-foreground">
          Class: <span className="font-medium">{classDoc?.name ?? "..."}</span>
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Add student</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <Label>First name</Label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Youssef"
              />
            </div>
            <div className="grid gap-2">
              <Label>Last name</Label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="El Amrani"
              />
            </div>
            <div className="flex items-end">
              <Button
                className="w-full"
                onClick={async () => {
                  if (!firstName.trim() || !lastName.trim()) return;
                  await createStudent({
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    classId: classId as any,
                  });
                  setFirstName("");
                  setLastName("");
                }}
              >
                Add
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Students list</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search student..."
            />

            {students === undefined ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Profile</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((s) => (
                    <TableRow key={s._id}>
                      <TableCell className="font-medium">
                        {s.firstName} {s.lastName}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="secondary" size="sm">
                          <Link to={`/students/${s._id}`}>Open</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
