import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireRole } from "./_auth";

export const createTeacher = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Only admin
    await requireRole(ctx, ["admin"]);

    // Check duplicate
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (existing) {
      throw new Error("User already exists");
    }

    return await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      role: "teacher",
      isActive: true,
      createdAt: Date.now(),
    });
  },
});