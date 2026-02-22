import { query } from "./_generated/server";

export const isSetupAllowed = query({
  args: {},
  handler: async (ctx) => {
    // ✅ Setup is allowed only if no appUsers exist yet
    const users = await ctx.db.query("appUsers").collect();

    return {
      allowed: users.length === 0,
    };
  },
});