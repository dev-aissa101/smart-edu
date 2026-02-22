import { query } from "./_generated/server";
import { requireRole } from "./_auth";

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export const overview = query({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, ["admin", "teacher"]);

    const classes = await ctx.db.query("classes").collect();
    const students = await ctx.db.query("students").collect();

    const attendanceToday = await ctx.db
      .query("attendance")
      .withIndex("by_date", (q) => q.eq("date", todayISO()))
      .collect();

    return {
      classes: classes.length,
      students: students.length,
      attendanceToday: attendanceToday.length,
    };
  },
});