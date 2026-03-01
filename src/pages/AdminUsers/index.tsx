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
  const deleteUser = useMutation(api.admin.deleteUser);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <AppLayout>
      <h1 className="text-2xl font-semibold mb-6">Manage Users</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add Teacher Account</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div>
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div>
            <Label>Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <div className="flex items-end">
            <Button
              onClick={async () => {
                const e1 = email.trim();
                const p1 = password;
                const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e1);
                if (!e1 || !p1) {
                  toast({ title: "Validation error", description: "Email and password are required.", variant: "error" });
                  return;
                }
                if (!emailValid) {
                  toast({ title: "Validation error", description: "Please enter a valid teacher email.", variant: "error" });
                  return;
                }
                if (p1.length < 6) {
                  toast({ title: "Validation error", description: "Password must be at least 6 characters.", variant: "error" });
                  return;
                }
                try {
                  await createTeacher({ email: e1, password: p1 });
                  setEmail("");
                  setPassword("");
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
            <div key={u._id} className="flex items-center justify-between gap-3 py-2 border-b">
              <div>
                <b>{u.email}</b>
                <div className="text-xs text-muted-foreground">{u.role}</div>
              </div>

              <Button
                size="sm"
                variant="destructive"
                onClick={async () => {
                  if (!confirm(`Delete user ${u.email}?`)) return;
                  try {
                    await deleteUser({ userId: u._id });
                    toast({ title: "User deleted", description: "User removed successfully.", variant: "success" });
                  } catch (e: any) {
                    toast({ title: "Delete failed", description: e?.message ?? "Failed to delete user.", variant: "error" });
                  }
                }}
              >
                Delete
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
