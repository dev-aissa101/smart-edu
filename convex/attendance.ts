// convex/attendance.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireRole } from "./_auth";

export const getForDate = query({
  args: { classId: v.id("classes"), date: v.string() }, // date: "YYYY-MM-DD"
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin", "teacher"]);
    return await ctx.db
      .query("attendance")
      .withIndex("by_class_date", (q) => q.eq("classId", args.classId).eq("date", args.date))
      .collect();
  },
});

export const upsert = mutation({
  args: {
    studentId: v.id("students"),
    classId: v.id("classes"),
    date: v.string(), // "YYYY-MM-DD"
    status: v.union(v.literal("present"), v.literal("absent"), v.literal("late"), v.literal("excused")),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["admin", "teacher"]);

    const existing = await ctx.db
      .query("attendance")
      .withIndex("by_student_date", (q) => q.eq("studentId", args.studentId).eq("date", args.date))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        classId: args.classId,
        status: args.status,
        note: args.note,
        updatedAt: Date.now(),
        updatedBy: user._id,
      });
      return existing._id;
    }

    return await ctx.db.insert("attendance", {
      studentId: args.studentId,
      classId: args.classId,
      date: args.date,
      status: args.status,
      note: args.note,
      createdAt: Date.now(),
      createdBy: user._id,
    });
  },
});