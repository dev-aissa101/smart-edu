/* eslint-disable react-hooks/rules-of-hooks */
// @ts-nocheck
import AppLayout from "@/components/app-layout";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useParams } from "react-router-dom";
import { useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";

const TERMS = ["S1", "S2", "T1", "T2", "T3"] as const;

export default function StudentDetailsPage() {
  const { studentId } = useParams();
  if (!studentId) return <div>Missing studentId</div>;

  const student = useQuery(api.students.get, { studentId: studentId as any });
  const subjects = useQuery(api.subjects.list);
  const grades = useQuery(api.grades.listByStudent, {
    studentId: studentId as any,
  });

  const updateStudent = useMutation(api.students.update);
  const addGrade = useMutation(api.grades.add);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [term, setTerm] = useState<(typeof TERMS)[number]>("S1");
  const avg = useQuery(api.grades.averageForStudentTerm, {
    studentId: studentId as any,
    term,
  });

  const [subjectId, setSubjectId] = useState<string>("");
  const [score, setScore] = useState<number>(0);

  // Prefill edit fields when student loads
  useMemo(() => {
    if (!student) return;
    setFirstName(student.firstName);
    setLastName(student.lastName);
  }, [student]);

  const gradesForTerm = useMemo(() => {
    if (!grades) return [];
    return grades.filter((g) => g.term === term);
  }, [grades, term]);

  if (student === undefined)
    return (
      <AppLayout>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </AppLayout>
    );
  if (student === null)
    return (
      <AppLayout>
        <p className="text-sm text-muted-foreground">Student not found.</p>
      </AppLayout>
    );

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">
          {student.firstName} {student.lastName}
        </h1>
        <p className="text-sm text-muted-foreground">
          Student profile, grades & averages
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Edit profile</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label>First name</Label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Last name</Label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <Button
              onClick={async () => {
                const first = firstName.trim();
                const last = lastName.trim();
                if (!first || !last) {
                  toast({ title: "Validation error", description: "First name and last name are required.", variant: "error" });
                  return;
                }
                if (first.length < 2 || last.length < 2) {
                  toast({ title: "Validation error", description: "Names must be at least 2 characters.", variant: "error" });
                  return;
                }
                try {
                  await updateStudent({
                    studentId: student._id,
                    firstName: first,
                    lastName: last,
                  });
                  toast({ title: "Student updated", description: "Profile saved successfully.", variant: "success" });
                } catch (e: any) {
                  toast({ title: "Update failed", description: e?.message ?? "Failed to update student.", variant: "error" });
                }
              }}
            >
              Save
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Term average</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label>Term</Label>
              <Select value={term} onValueChange={(v) => setTerm(v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent>
                  {TERMS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="secondary">Average</Badge>
              <span className="text-2xl font-semibold">
                {avg?.average ?? "—"}
              </span>
              <span className="text-sm text-muted-foreground">
                ({avg?.count ?? 0} grades)
              </span>
            </div>

            <div className="grid gap-2">
              <Label>Add grade</Label>
              <div className="grid gap-2 md:grid-cols-3">
                <Select value={subjectId} onValueChange={setSubjectId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects?.map((s) => (
                      <SelectItem key={s._id} value={s._id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  type="number"
                  min={0}
                  max={20}
                  step="0.25"
                  value={Number.isFinite(score) ? score : 0}
                  onChange={(e) => setScore(Number(e.target.value))}
                  placeholder="Score"
                />

                <Button
                  onClick={async () => {
                    if (!subjectId) {
                      toast({ title: "Validation error", description: "Please select a subject.", variant: "error" });
                      return;
                    }
                    if (!Number.isFinite(score) || score < 0 || score > 20) {
                      toast({ title: "Validation error", description: "Score must be a number between 0 and 20.", variant: "error" });
                      return;
                    }
                    try {
                      await addGrade({
                        studentId: student._id,
                        subjectId: subjectId as any,
                        term,
                        score,
                        maxScore: 20,
                      });
                      setScore(0);
                      toast({ title: "Grade added", description: "Grade saved successfully.", variant: "success" });
                    } catch (e: any) {
                      toast({ title: "Add grade failed", description: e?.message ?? "Failed to add grade.", variant: "error" });
                    }
                  }}
                >
                  Add
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Scores are normalized on /20 in averages.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Grades (term: {term})</CardTitle>
        </CardHeader>
        <CardContent>
          {grades === undefined ? (
            <p className="text-sm text-muted-foreground">Loading grades...</p>
          ) : gradesForTerm.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No grades for this term.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Score</TableHead>
                  <TableHead>Max</TableHead>
                  <TableHead>Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gradesForTerm.map((g) => (
                  <TableRow key={g._id}>
                    <TableCell className="font-medium">{g.score}</TableCell>
                    <TableCell>{g.maxScore ?? 20}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {g.note ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
