// convex/logs.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireRole } from "./_auth";

export const add = mutation({
  args: {
    action: v.string(),
    entity: v.optional(v.string()),
    entityId: v.optional(v.string()),
    meta: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["admin", "teacher"]);
    return await ctx.db.insert("logs", {
      actorId: user._id,
      action: args.action,
      entity: args.entity,
      entityId: args.entityId,
      meta: args.meta,
      createdAt: Date.now(),
    });
  },
});