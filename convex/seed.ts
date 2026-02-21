// convex/seed.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireRole } from "./_auth";

export const seed = mutation({
  args: { year: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);

    const year = args.year ?? "2025/2026";

    const classA = await ctx.db.insert("classes", {
      name: "1BAC-A",
      level: "1 BAC",
      year,
      createdAt: Date.now(),
    });

    const classB = await ctx.db.insert("classes", {
      name: "2BAC-SCI",
      level: "2 BAC",
      year,
      createdAt: Date.now(),
    });

    await ctx.db.insert("subjects", { name: "Math", code: "MATH", createdAt: Date.now() });
    await ctx.db.insert("subjects", { name: "Physics", code: "PHY", createdAt: Date.now() });

    await ctx.db.insert("students", {
      firstName: "Youssef",
      lastName: "El Amrani",
      classId: classA,
      status: "active",
      createdAt: Date.now(),
    });

    await ctx.db.insert("students", {
      firstName: "Sara",
      lastName: "Bennani",
      classId: classB,
      status: "active",
      createdAt: Date.now(),
    });

    return { ok: true, classIds: [classA, classB] };
  },
});