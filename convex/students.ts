// convex/students.ts
import { query, mutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { requireRole } from "./_auth";

export const get = query({
  args: { studentId: v.id("students") },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin", "teacher"]);
    return await ctx.db.get(args.studentId);
  },
});

export const listByClass = query({
  args: { classId: v.optional(v.id("classes")) },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin", "teacher"]);
    if (!args.classId) return await ctx.db.query("students").order("desc").collect();
    return await ctx.db
      .query("students")
      .withIndex("by_classId", (q) => q.eq("classId", args.classId))
      .collect();
  },
});

export const search = query({
  args: { q: v.string(), classId: v.optional(v.id("classes")) },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin", "teacher"]);
    const q = args.q.trim().toLowerCase();

    const base = args.classId
      ? await ctx.db.query("students").withIndex("by_classId", (x) => x.eq("classId", args.classId)).collect()
      : await ctx.db.query("students").collect();

    // Simple in-memory search (ok for MVP)
    return base.filter((s) => {
      const full = `${s.firstName} ${s.lastName}`.toLowerCase();
      return full.includes(q) || (s.email?.toLowerCase().includes(q) ?? false) || (s.phone?.includes(q) ?? false);
    });
  },
});

export const create = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    birthDate: v.optional(v.string()),
    guardianName: v.optional(v.string()),
    guardianPhone: v.optional(v.string()),
    classId: v.optional(v.id("classes")),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"))),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["admin", "teacher"]);

    // Optional: prevent duplicate email if you want
    if (args.email) {
      const dup = await ctx.db.query("students").withIndex("by_email", (q) => q.eq("email", args.email)).unique();
      if (dup) throw new ConvexError("Student email already exists");
    }

    return await ctx.db.insert("students", {
      ...args,
      status: args.status ?? "active",
      createdAt: Date.now(),
      createdBy: user._id,
    });
  },
});

export const update = mutation({
  args: {
    studentId: v.id("students"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    birthDate: v.optional(v.string()),
    guardianName: v.optional(v.string()),
    guardianPhone: v.optional(v.string()),
    classId: v.optional(v.id("classes")),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"))),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin", "teacher"]);
    const { studentId, ...patch } = args;
    await ctx.db.patch(studentId, patch);
  },
});

export const remove = mutation({
  args: { studentId: v.id("students") },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);
    await ctx.db.delete(args.studentId);
  },
});