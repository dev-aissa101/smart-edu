import AppLayout from "@/components/app-layout";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { Link } from "react-router-dom";

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

export default function ClassesPage() {
  const classes = useQuery(api.classes.list);
  const createClass = useMutation(api.classes.create);

  const [name, setName] = useState("");
  const [level, setLevel] = useState("");
  const [year, setYear] = useState("2025/2026");

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Classes</h1>
        <p className="text-sm text-muted-foreground">
          Create and manage classes
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Create class</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <div className="grid gap-2">
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="2BAC-SCI-A"
            />
          </div>
          <div className="grid gap-2">
            <Label>Level</Label>
            <Input
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              placeholder="2 BAC"
            />
          </div>
          <div className="grid gap-2">
            <Label>Year</Label>
            <Input
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="2025/2026"
            />
          </div>
          <div className="flex items-end">
            <Button
              className="w-full"
              onClick={async () => {
                if (!name.trim()) return;
                await createClass({
                  name: name.trim(),
                  level: level || undefined,
                  year: year || undefined,
                });
                setName("");
                setLevel("");
              }}
            >
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All classes</CardTitle>
        </CardHeader>
        <CardContent>
          {classes === undefined ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : classes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No classes yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead className="text-right">Open</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.map((c) => (
                  <TableRow key={c._id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{c.level ?? "—"}</TableCell>
                    <TableCell>{c.year ?? "—"}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="secondary" size="sm">
                        <Link to={`/classes/${c._id}/students`}>Students</Link>
                      </Button>
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
