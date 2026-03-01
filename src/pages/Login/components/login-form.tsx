import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuthActions } from "@convex-dev/auth/react";
import { toast } from "@/components/ui/toast";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { signIn } = useAuthActions();

  const PENDING_LOGIN_EMAIL_KEY = "pendingLoginEmail";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      await signIn("password", {
        email: e1,
        password,
        flow: "signIn", // ✅ login only
      });
      localStorage.setItem(PENDING_LOGIN_EMAIL_KEY, e1);
      toast({ title: "Login successful", description: "Welcome back!", variant: "success" });
    } catch (err: any) {
      const message = err?.message ?? "Login failed.";
      setError(message);
      toast({ title: "Login failed", description: message, variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </Field>

              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </Field>

              {error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Field>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in..." : "Login"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
