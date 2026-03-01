import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

export default function AdminSignupPage() {
  const navigate = useNavigate();

  const setup = useQuery(api.setup.isSetupAllowed);
  const ensureUser = useMutation(api._auth.ensureUser);
  const { signIn } = useAuthActions();

  const { isAuthenticated, isLoading } = useConvexAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ After signup finishes, wait until auth is REALLY ready,
  // then create the appUsers row using the email from the form.
  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) return;
    if (!pendingEmail) return;

    ensureUser({ email: pendingEmail })
      .then(() => {
        toast({ title: "Admin created", description: "Setup completed successfully.", variant: "success" });
        navigate("/", { replace: true });
      })
      .catch((err: any) => {
        const message = err?.message ?? "Failed to create admin user.";
        setError(message);
        toast({ title: "Setup failed", description: message, variant: "error" });
      })
      .finally(() => {
        setLoading(false);
        setPendingEmail(null);
      });
  }, [isAuthenticated, isLoading, pendingEmail, ensureUser, navigate]);

  // Loading setup state
  if (setup === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Setup already done
  if (!setup.allowed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Setup already completed</CardTitle>
            <CardDescription>
              Admin account already exists. Please use the normal login page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              onClick={() => navigate("/login", { replace: true })}
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const e1 = email.trim();
    if (!e1 || !password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);

    try {
      // 1) Create Convex Auth account
      await signIn("password", {
        email: e1,
        password,
        flow: "signUp",
      });

      // 2) DO NOT call ensureUser immediately (race condition)
      // Save email and wait for isAuthenticated in useEffect
      setPendingEmail(e1);
    } catch (err: any) {
      const message = err?.message ?? "Setup failed.";
      setError(message);
      toast({ title: "Setup failed", description: message, variant: "error" });
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Setup</CardTitle>
          <CardDescription>
            Create the first admin account. This page works only once.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Admin Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </Field>

              {error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Field>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating admin..." : "Create Admin Account"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
