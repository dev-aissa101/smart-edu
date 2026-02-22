// convex/subjects.ts
import { query, mutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { requireRole } from "./_auth";

export const list = query({
  args: {
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // teacher + admin can view
    const user = await requireRole(ctx, ["admin", "teacher"]);
    if (!user) return [];

    const search = args.search?.trim().toLowerCase();
    const subjects = await ctx.db.query("subjects").collect();

    // sort newest first
    subjects.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));

    if (!search) return subjects;

    return subjects.filter((s) => {
      const name = (s.name ?? "").toLowerCase();
      const code = (s.code ?? "").toLowerCase();
      const desc = (s.description ?? "").toLowerCase();
      return (
        name.includes(search) || code.includes(search) || desc.includes(search)
      );
    });
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    code: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["admin"]);
    if (!user) throw new ConvexError("Not authenticated");

    const name = args.name.trim();
    if (!name) throw new ConvexError("Name is required");

    const id = await ctx.db.insert("subjects", {
      name,
      code: args.code?.trim() || undefined,
      description: args.description?.trim() || undefined,
      createdAt: Date.now(),
      createdBy: user._id,
    });

    return id;
  },
});

export const update = mutation({
  args: {
    id: v.id("subjects"),
    name: v.string(),
    code: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["admin"]);
    if (!user) throw new ConvexError("Not authenticated");

    const name = args.name.trim();
    if (!name) throw new ConvexError("Name is required");

    await ctx.db.patch(args.id, {
      name,
      code: args.code?.trim() || undefined,
      description: args.description?.trim() || undefined,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("subjects") },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["admin"]);
    if (!user) throw new ConvexError("Not authenticated");

    await ctx.db.delete(args.id);
  },
});