import { query, mutation } from "./_generated/server";
import { ConvexError, v } from "convex/values";

export type Role = "admin" | "teacher";

async function getIdentity(ctx: any) {
  return await ctx.auth.getUserIdentity();
}

export async function getCurrentUser(ctx: any) {
  const identity = await getIdentity(ctx);
  if (!identity) return null;

  const tokenIdentifier: string | undefined = identity.tokenIdentifier;

  if (tokenIdentifier) {
    const byToken = await ctx.db
      .query("appUsers")
      .withIndex("by_token", (q: any) =>
        q.eq("tokenIdentifier", tokenIdentifier)
      )
      .unique();

    if (byToken) {
      if (byToken.isActive === false) throw new ConvexError("User disabled");
      return byToken;
    }
  }

  return null;
}

export async function requireRole(ctx: any, roles: Role[]) {
  const user = await getCurrentUser(ctx);
  if (!user) return null;
  if (!roles.includes(user.role)) throw new ConvexError("Forbidden");
  return user;
}

export const ensureUser = mutation({
  args: {
    name: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await getIdentity(ctx);
    if (!identity) return null;

    const tokenIdentifier: string = identity.tokenIdentifier;

    // 1) Already linked by tokenIdentifier?
    const byToken = await ctx.db
      .query("appUsers")
      .withIndex("by_token", (q: any) =>
        q.eq("tokenIdentifier", tokenIdentifier)
      )
      .unique();

    if (byToken) {
      if (!byToken.email && args.email) {
        await ctx.db.patch(byToken._id, { email: args.email });
        return await ctx.db.get(byToken._id);
      }
      if (byToken.isActive === false) throw new ConvexError("User disabled");
      return byToken;
    }

    // 2) Link pre-created user by email (admin added teacher earlier)
    if (args.email) {
      const byEmail = await ctx.db
        .query("appUsers")
        .withIndex("by_email", (q: any) => q.eq("email", args.email!))
        .unique();

      if (byEmail) {
        await ctx.db.patch(byEmail._id, {
          tokenIdentifier,
          name: byEmail.name ?? args.name,
          email: byEmail.email ?? args.email,
          isActive: byEmail.isActive ?? true,
        });
        return await ctx.db.get(byEmail._id);
      }
    }

    // 3) Create new user row ONLY when email is provided (setup/signup)
    const count = (await ctx.db.query("appUsers").collect()).length;
    const role: Role = count === 0 ? "admin" : "teacher";

    if (!args.email) {
      // No email available -> don't create, just skip
      return null;
    }

    const id = await ctx.db.insert("appUsers", {
      tokenIdentifier,
      email: args.email,
      name: args.name,
      role,
      isActive: true,
      createdAt: Date.now(),
    });

    return await ctx.db.get(id);
  },
});

export const myRole = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    return {
      role: user.role,
      email: user.email ?? null,
      name: user.name ?? null,
    };
  },
});