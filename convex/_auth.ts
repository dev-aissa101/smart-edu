/* eslint-disable @typescript-eslint/no-explicit-any */
// convex/_auth.ts
import { mutation } from "./_generated/server";
import { ConvexError, v } from "convex/values";

export type Role = "admin" | "teacher";

/**
 * Reads the authenticated identity from ctx.auth.
 * Works with Convex Auth (or any provider plugged into Convex auth).
 */
export async function getIdentityEmail(ctx: any): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity?.email) throw new ConvexError("Not authenticated");
  return identity.email;
}

export async function getCurrentUser(ctx: any) {
  const email = await getIdentityEmail(ctx);
  const user = await ctx.db.query("users").withIndex("by_email", (q: any) => q.eq("email", email)).unique();
  if (!user) throw new ConvexError("User not found (not provisioned)");
  if (user.isActive === false) throw new ConvexError("User disabled");
  return user;
}

export async function requireRole(ctx: any, roles: Role[]) {
  const user = await getCurrentUser(ctx);
  if (!roles.includes(user.role)) throw new ConvexError("Forbidden");
  return user;
}

/**
 * Optional utility:
 * Create user record on first login (if you want auto-provision).
 * Otherwise, keep it admin-provisioned only.
 */
export const ensureUser = mutation({
  args: {
    defaultRole: v.optional(v.union(v.literal("teacher"), v.literal("admin"))),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const email = await getIdentityEmail(ctx);
    const existing = await ctx.db.query("users").withIndex("by_email", (q) => q.eq("email", email)).unique();
    if (existing) return existing;

    const role = args.defaultRole ?? "teacher";
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