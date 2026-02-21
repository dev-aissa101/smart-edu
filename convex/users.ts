// convex/users.ts
import { query, mutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { requireRole, getCurrentUser } from "./_auth";

export const me = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, ["admin"]);
    return await ctx.db.query("users").collect();
  },
});

export const createTeacher = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    role: v.optional(v.union(v.literal("admin"), v.literal("teacher"))),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);

    const existing = await ctx.db.query("users").withIndex("by_email", (q) => q.eq("email", args.email)).unique();
    if (existing) throw new ConvexError("Email already exists");

    const id = await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      role: args.role ?? "teacher",
      isActive: true,
      createdAt: Date.now(),
    });

    return id;
  },
});

export const setActive = mutation({
  args: { userId: v.id("users"), isActive: v.boolean() },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);
    await ctx.db.patch(args.userId, { isActive: args.isActive });
  },
});

export const setRole = mutation({
  args: { userId: v.id("users"), role: v.union(v.literal("admin"), v.literal("teacher")) },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);
    await ctx.db.patch(args.userId, { role: args.role });
  },
});