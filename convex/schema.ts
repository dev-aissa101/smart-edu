// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  // ✅ Renamed from "users" → "appUsers"
  appUsers: defineTable({
    tokenIdentifier: v.optional(v.string()),
    name: v.optional(v.string()),
    email: v.optional(v.string()), // email may be unavailable in identity
    role: v.union(v.literal("admin"), v.literal("teacher")),
    isActive: v.optional(v.boolean()),
    createdAt: v.number(),
  })
    .index("by_token", ["tokenIdentifier"])
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_active", ["isActive"]),

  classes: defineTable({
    name: v.string(),
    level: v.optional(v.string()),
    year: v.optional(v.string()),
    description: v.optional(v.string()),

    createdAt: v.number(),
    createdBy: v.optional(v.id("appUsers")),
  })
    .index("by_year", ["year"])
    .index("by_level", ["level"])
    .index("by_name", ["name"]),

  students: defineTable({
    firstName: v.string(),
    lastName: v.string(),

    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    birthDate: v.optional(v.string()),
    guardianName: v.optional(v.string()),
    guardianPhone: v.optional(v.string()),

    classId: v.optional(v.id("classes")),

    status: v.optional(v.union(v.literal("active"), v.literal("inactive"))),

    createdAt: v.number(),
    createdBy: v.optional(v.id("appUsers")),
  })
    .index("by_classId", ["classId"])
    .index("by_lastName", ["lastName"])
    .index("by_email", ["email"])
    .index("by_status", ["status"]),

  subjects: defineTable({
    name: v.string(),
    code: v.optional(v.string()),
    description: v.optional(v.string()),

    createdAt: v.number(),
    createdBy: v.optional(v.id("appUsers")),
  })
    .index("by_name", ["name"])
    .index("by_code", ["code"]),

  attendance: defineTable({
    studentId: v.id("students"),
    classId: v.id("classes"),

    date: v.string(),

    status: v.union(
      v.literal("present"),
      v.literal("absent"),
      v.literal("late"),
      v.literal("excused"),
    ),

    note: v.optional(v.string()),

    createdAt: v.number(),
    createdBy: v.optional(v.id("appUsers")),
    updatedAt: v.optional(v.number()),
    updatedBy: v.optional(v.id("appUsers")),
  })
    .index("by_class_date", ["classId", "date"])
    .index("by_student_date", ["studentId", "date"])
    .index("by_date", ["date"]),

  grades: defineTable({
    studentId: v.id("students"),
    subjectId: v.id("subjects"),

    term: v.string(),

    title: v.optional(v.string()),

    score: v.number(),
    maxScore: v.optional(v.number()),
    coefficient: v.optional(v.number()),
    note: v.optional(v.string()),

    createdAt: v.number(),
    createdBy: v.optional(v.id("appUsers")),
  })
    .index("by_student", ["studentId"])
    .index("by_subject", ["subjectId"])
    .index("by_student_subject_term", ["studentId", "subjectId", "term"])
    .index("by_term", ["term"]),

  logs: defineTable({
    actorId: v.optional(v.id("appUsers")),
    action: v.string(),
    entity: v.optional(v.string()),
    entityId: v.optional(v.string()),
    meta: v.optional(v.any()),

    createdAt: v.number(),
  }).index("by_action", ["action"]),
});
