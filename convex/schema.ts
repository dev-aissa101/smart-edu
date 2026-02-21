// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ---- Auth / Users ----
  users: defineTable({
    // If you're using Convex Auth, you may store auth linkage fields too
    name: v.optional(v.string()),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("teacher")),

    // metadata
    isActive: v.optional(v.boolean()),
    createdAt: v.number(), // Date.now()
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_active", ["isActive"]),

  // ---- School structure ----
  classes: defineTable({
    name: v.string(), // e.g. "2BAC-SCI-A"
    level: v.optional(v.string()), // e.g. "2 BAC"
    year: v.optional(v.string()), // e.g. "2025/2026"
    description: v.optional(v.string()),

    createdAt: v.number(),
    createdBy: v.optional(v.id("users")),
  })
    .index("by_year", ["year"])
    .index("by_level", ["level"])
    .index("by_name", ["name"]),

  students: defineTable({
    firstName: v.string(),
    lastName: v.string(),

    // optional contact/profile
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    birthDate: v.optional(v.string()), // keep as ISO string "YYYY-MM-DD" for simplicity
    guardianName: v.optional(v.string()),
    guardianPhone: v.optional(v.string()),

    // relationship
    classId: v.optional(v.id("classes")),

    // status
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"))),

    createdAt: v.number(),
    createdBy: v.optional(v.id("users")),
  })
    .index("by_classId", ["classId"])
    .index("by_lastName", ["lastName"])
    .index("by_email", ["email"])
    .index("by_status", ["status"]),

  // ---- Subjects / terms ----
  subjects: defineTable({
    name: v.string(), // e.g. "Math"
    code: v.optional(v.string()), // e.g. "MATH"
    description: v.optional(v.string()),

    createdAt: v.number(),
    createdBy: v.optional(v.id("users")),
  })
    .index("by_name", ["name"])
    .index("by_code", ["code"]),

  // ---- Attendance (one record per student per day) ----
  attendance: defineTable({
    studentId: v.id("students"),
    classId: v.id("classes"),

    // store date as "YYYY-MM-DD" to avoid timezone issues
    date: v.string(),

    status: v.union(
      v.literal("present"),
      v.literal("absent"),
      v.literal("late"),
      v.literal("excused")
    ),

    note: v.optional(v.string()),

    createdAt: v.number(),
    createdBy: v.optional(v.id("users")),
    updatedAt: v.optional(v.number()),
    updatedBy: v.optional(v.id("users")),
  })
    .index("by_class_date", ["classId", "date"])
    .index("by_student_date", ["studentId", "date"])
    .index("by_date", ["date"]),

  // ---- Grades (flexible: multiple grades per student/subject/term) ----
  grades: defineTable({
    studentId: v.id("students"),
    subjectId: v.id("subjects"),

    // term examples: "S1", "S2", "T1", "T2", "T3"
    term: v.string(),

    // e.g. "Exam 1", "Quiz", "Project"
    title: v.optional(v.string()),

    score: v.number(),
    maxScore: v.optional(v.number()), // default 20 if you want in code
    coefficient: v.optional(v.number()), // optional weighting
    note: v.optional(v.string()),

    createdAt: v.number(),
    createdBy: v.optional(v.id("users")),
  })
    .index("by_student", ["studentId"])
    .index("by_subject", ["subjectId"])
    .index("by_student_subject_term", ["studentId", "subjectId", "term"])
    .index("by_term", ["term"]),

  // ---- Optional: Audit log (nice for a “pro” stage project) ----
  logs: defineTable({
    actorId: v.optional(v.id("users")),
    action: v.string(), // e.g. "student.create"
    entity: v.optional(v.string()), // e.g. "students"
    entityId: v.optional(v.string()), // store as string to keep generic
    meta: v.optional(v.any()),

    createdAt: v.number(),
  }).index("by_action", ["action"]),
});