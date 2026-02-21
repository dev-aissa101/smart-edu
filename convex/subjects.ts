// convex/subjects.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireRole } from "./_auth";

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, ["admin", "teacher"]);
    return await ctx.db.query("subjects").collect();
  },
});

export const create = mutation({
  args: { name: v.string(), code: v.optional(v.string()), description: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["admin"]);
    return await ctx.db.insert("subjects", {
      ...args,
      createdAt: Date.now(),
      createdBy: user._id,
    });
  },
});

export const update = mutation({
  args: {
    subjectId: v.id("subjects"),
    name: v.optional(v.string()),
    code: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);
    const { subjectId, ...patch } = args;
    await ctx.db.patch(subjectId, patch);
  },
});

export const remove = mutation({
  args: { subjectId: v.id("subjects") },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);
    await ctx.db.delete(args.subjectId);
  },
});