import { query } from "./_generated/server";
import { getCurrentUser } from "./_auth";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export const overview = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    // ⬅️ Not ready yet → return safe defaults
    if (!user) {
      return {
        classes: 0,
        students: 0,
        attendanceToday: 0,
        today: todayISO(),
      };
    }

    const [classes, students] = await Promise.all([
      ctx.db.query("classes").collect(),
      ctx.db.query("students").collect(),
    ]);

    const attendanceToday = await ctx.db
      .query("attendance")
      .withIndex("by_date", (q) => q.eq("date", todayISO()))
      .collect();

    return {
      classes: classes.length,
      students: students.length,
      attendanceToday: attendanceToday.length,
      today: todayISO(),
    };
  },
});