import { mutation } from "./_generated/server";
import { ConvexError, v } from "convex/values";

export type Role = "admin" | "teacher";

export async function getIdentityEmail(ctx: any): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity?.email) {
    throw new ConvexError("Not authenticated");
  }
  return identity.email;
}

export async function getCurrentUser(ctx: any) {
  const email = await getIdentityEmail(ctx);

  const user = await ctx.db
    .query("users")
    .withIndex("by_email", (q: any) => q.eq("email", email))
    .unique();

  if (!user) throw new ConvexError("User not found");
  if (user.isActive === false) throw new ConvexError("User disabled");

  return user;
}

export async function requireRole(ctx: any, roles: Role[]) {
  const user = await getCurrentUser(ctx);
  if (!roles.includes(user.role)) {
    throw new ConvexError("Forbidden");
  }
  return user;
}

/**
 * Create user on first login
 * FIRST = admin, others = teacher
 */
export const ensureUser = mutation({
  args: {
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const email = await getIdentityEmail(ctx);

    // Already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q: any) => q.eq("email", email))
      .unique();

    if (existing) return existing;

    // Count users
    const count = (await ctx.db.query("users").collect()).length;

    const role: Role = count === 0 ? "admin" : "teacher";

    const id = await ctx.db.insert("users", {
      email,
      name: args.name,
      role,
      isActive: true,
      createdAt: Date.now(),
    });

    return await ctx.db.get(id);
  },
});