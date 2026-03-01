import { mutation } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { getCurrentUser, requireRole } from "./_auth";
import { createAccount } from "@convex-dev/auth/server";

export const createTeacher = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Only admin
    await requireRole(ctx, ["admin"]);

    // Check duplicate
    const existing = await ctx.db
      .query("appUsers")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (existing) {
      throw new ConvexError("User already exists");
    }

    const email = args.email.trim().toLowerCase();
    const password = args.password;

    if (!email) throw new ConvexError("Email is required");
    if (password.length < 6) {
      throw new ConvexError("Password must be at least 6 characters");
    }

    await createAccount(ctx as any, {
      provider: "password",
      account: { id: email, secret: password },
      profile: { email },
      shouldLinkViaEmail: false,
      shouldLinkViaPhone: false,
    });

    return await ctx.db.insert("appUsers", {
      email,
      role: "teacher",
      isActive: true,
      createdAt: Date.now(),
    });
  },
});


export const deleteUser = mutation({
  args: {
    userId: v.id("appUsers"),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);

    const me = await getCurrentUser(ctx);
    if (me?._id === args.userId) {
      throw new ConvexError("You cannot delete your own account");
    }

    const user = await ctx.db.get(args.userId);
    if (!user) throw new ConvexError("User not found");

    await ctx.db.delete(args.userId);
  },
});
