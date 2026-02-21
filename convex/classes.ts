// convex/classes.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireRole } from "./_auth";

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, ["admin", "teacher"]);
    return await ctx.db.query("classes").order("desc").collect();
  },
});

export const get = query({
  args: { classId: v.id("classes") },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin", "teacher"]);
    return await ctx.db.get(args.classId);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    level: v.optional(v.string()),
    year: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["admin"]);
    return await ctx.db.insert("classes", {
      ...args,
      createdAt: Date.now(),
      createdBy: user._id,
    });
  },
});

export const update = mutation({
  args: {
    classId: v.id("classes"),
    name: v.optional(v.string()),
    level: v.optional(v.string()),
    year: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);
    const { classId, ...patch } = args;
    await ctx.db.patch(classId, patch);
  },
});

export const remove = mutation({
  args: { classId: v.id("classes") },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);
    await ctx.db.delete(args.classId);
  },
});