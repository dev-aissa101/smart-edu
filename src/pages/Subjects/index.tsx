import { useMemo, useState } from "react";
import AppLayout from "@/components/app-layout";
import { api } from "../../../convex/_generated/api";
import { useConvexAuth, useMutation, useQuery } from "convex/react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

import { Plus, Pencil, Trash2, BookOpen } from "lucide-react";
import { toast } from "@/components/ui/toast";

type SubjectForm = {
  name: string;
  code: string;
  description: string;
};

const emptyForm: SubjectForm = { name: "", code: "", description: "" };

export default function SubjectsPage() {
  const { isAuthenticated } = useConvexAuth();

  // Role info (for admin permissions)
  const me = useQuery(api._auth.myRole, isAuthenticated ? {} : "skip");

  const [search, setSearch] = useState("");
  const subjects = useQuery(
    api.subjects.list,
    isAuthenticated ? { search } : "skip",
  );

  const createSubject = useMutation(api.subjects.create);
  const updateSubject = useMutation(api.subjects.update);
  const removeSubject = useMutation(api.subjects.remove);

  const isAdmin = me?.role === "admin";

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<any>(null);
  const [form, setForm] = useState<SubjectForm>(emptyForm);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const list = useMemo(() => subjects ?? [], [subjects]);

  function openCreate() {
    setMode("create");
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
    setOpen(true);
  }

  function openEdit(subject: any) {
    setMode("edit");
    setEditingId(subject._id);
    setForm({
      name: subject.name ?? "",
      code: subject.code ?? "",
      description: subject.description ?? "",
    });
    setError(null);
    setOpen(true);
  }

  async function onSave() {
    setError(null);
    const name = form.name.trim();
    if (!name) {
      setError("Subject name is required.");
      return;
    }

    setSaving(true);
    try {
      if (mode === "create") {
        await createSubject({
          name,
          code: form.code.trim() || undefined,
          description: form.description.trim() || undefined,
        });
      } else {
        await updateSubject({
          id: editingId,
          name,
          code: form.code.trim() || undefined,
          description: form.description.trim() || undefined,
        });
      }
      setOpen(false);
      toast({ title: mode === "create" ? "Subject created" : "Subject updated", description: "Saved successfully.", variant: "success" });
    } catch (e: any) {
      const message = e?.message ?? "Failed to save.";
      setError(message);
      toast({ title: "Save failed", description: message, variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: any) {
    if (!confirm("Delete this subject?")) return;
    try {
      await removeSubject({ id });
      toast({ title: "Subject deleted", description: "Deleted successfully.", variant: "success" });
    } catch (e: any) {
      const message = e?.message ?? "Failed to delete.";
      toast({ title: "Delete failed", description: message, variant: "error" });
    }
  }

  return (
    <AppLayout>
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Subjects</h1>
          <p className="text-sm text-muted-foreground">
            Manage subjects (Math, Physics, Arabic...)
          </p>
        </div>

        <div className="flex gap-2">
          <div className="relative w-full md:w-80">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, code, description..."
            />
          </div>

          <Button onClick={openCreate} disabled={!isAdmin}>
            <Plus className="mr-2 h-4 w-4" />
            New
          </Button>
        </div>
      </div>

      {!isAdmin && (
        <div className="mb-4 rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
          You are signed in as{" "}
          <span className="font-medium">{me?.role ?? "—"}</span>. Only admins
          can create, edit, or delete subjects.
        </div>
      )}

      {subjects === undefined ? (
        <div className="text-sm text-muted-foreground">Loading...</div>
      ) : list.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <BookOpen className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <div className="text-base font-medium">No subjects yet</div>
            <div className="text-sm text-muted-foreground">
              {isAdmin
                ? "Create your first subject."
                : "Ask admin to add subjects."}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {list.map((s: any) => (
            <Card key={s._id}>
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="min-w-0">
                  <CardTitle className="truncate">{s.name}</CardTitle>
                  <div className="text-xs text-muted-foreground">
                    {s.code ? `Code: ${s.code}` : "No code"}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => openEdit(s)}
                    disabled={!isAdmin}
                    title="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => onDelete(s._id)}
                    disabled={!isAdmin}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              {s.description && (
                <CardContent className="pt-0 text-sm text-muted-foreground">
                  {s.description}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "Create Subject" : "Edit Subject"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="e.g. Mathematics"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                value={form.code}
                onChange={(e) =>
                  setForm((p) => ({ ...p, code: e.target.value }))
                }
                placeholder="e.g. MATH-101"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="desc">Description</Label>
              <Input
                id="desc"
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Short description..."
              />
            </div>

            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={onSave} disabled={saving || !isAdmin}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
