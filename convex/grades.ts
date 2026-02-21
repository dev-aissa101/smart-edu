// convex/grades.ts
import { query, mutation } from "convex/server";
import { v } from "convex/values";
import { requireRole } from "./_auth";

export const listByStudent = query({
  args: { studentId: v.id("students") },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin", "teacher"]);
    return await ctx.db
      .query("grades")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .collect();
  },
});

export const listByClassTermSubject = query({
  args: {
    classId: v.id("classes"),
    term: v.string(),
    subjectId: v.id("subjects"),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin", "teacher"]);

    const students = await ctx.db
      .query("students")
      .withIndex("by_classId", (q) => q.eq("classId", args.classId))
      .collect();

    const grades = await ctx.db.query("grades").withIndex("by_student_subject_term", (q) => {
      // Can't query many studentIds at once with an index; MVP approach: fetch all then filter.
      return q; // placeholder, we will do in-memory after collecting
    }).collect();

    const studentIds = new Set(students.map((s) => s._id));
    return grades.filter(
      (g) => studentIds.has(g.studentId) && g.subjectId === args.subjectId && g.term === args.term
    );
  },
});

export const add = mutation({
  args: {
    studentId: v.id("students"),
    subjectId: v.id("subjects"),
    term: v.string(), // "S1" / "S2" / "T1" etc
    title: v.optional(v.string()),
    score: v.number(),
    maxScore: v.optional(v.number()),
    coefficient: v.optional(v.number()),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["admin", "teacher"]);
    return await ctx.db.insert("grades", {
      ...args,
      maxScore: args.maxScore ?? 20,
      coefficient: args.coefficient ?? 1,
      createdAt: Date.now(),
      createdBy: user._id,
    });
  },
});

export const remove = mutation({
  args: { gradeId: v.id("grades") },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);
    await ctx.db.delete(args.gradeId);
  },
});

/**
 * Average per student for a term (across all subjects),
 * using coefficient weighting.
 */
export const averageForStudentTerm = query({
  args: { studentId: v.id("students"), term: v.string() },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin", "teacher"]);
    const rows = await ctx.db
      .query("grades")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .collect();

    const termRows = rows.filter((r) => r.term === args.term);

    let total = 0;
    let coefSum = 0;

    for (const r of termRows) {
      const max = r.maxScore ?? 20;
      const coef = r.coefficient ?? 1;
      const normalizedOn20 = (r.score / max) * 20;
      total += normalizedOn20 * coef;
      coefSum += coef;
    }

    return {
      term: args.term,
      average: coefSum === 0 ? null : Number((total / coefSum).toFixed(2)),
      count: termRows.length,
    };
  },
});