import AppLayout from "@/components/app-layout";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";

export default function AdminUsersPage() {
  const users = useQuery(api.users.list);
  const createTeacher = useMutation(api.admin.createTeacher);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  return (
    <AppLayout>
      <h1 className="text-2xl font-semibold mb-6">Manage Users</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add Teacher</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div>
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div>
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="flex items-end">
            <Button
              onClick={async () => {
                const e1 = email.trim();
                const n1 = name.trim();
                const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e1);
                if (!e1 || !n1) {
                  toast({ title: "Validation error", description: "Email and name are required.", variant: "error" });
                  return;
                }
                if (!emailValid) {
                  toast({ title: "Validation error", description: "Please enter a valid teacher email.", variant: "error" });
                  return;
                }
                if (n1.length < 2) {
                  toast({ title: "Validation error", description: "Name must be at least 2 characters.", variant: "error" });
                  return;
                }
                try {
                  await createTeacher({ email: e1, name: n1 });
                  setEmail("");
                  setName("");
                  toast({ title: "Teacher added", description: "User created successfully.", variant: "success" });
                } catch (e: any) {
                  toast({ title: "Create failed", description: e?.message ?? "Failed to add teacher.", variant: "error" });
                }
              }}
            >
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          {users?.map((u) => (
            <div key={u._id} className="flex justify-between py-2 border-b">
              <div>
                <b>{u.email}</b>
                <div className="text-xs text-muted-foreground">{u.role}</div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
