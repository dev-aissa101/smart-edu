import { createBrowserRouter } from "react-router-dom";

import ProtectedRoute from "@/auth/ProtectedRoute";

import DashboardPage from "@/pages/Dashboard";
import LoginPage from "@/pages/Login";
import ClassesPage from "@/pages/Classes";
import ClassStudentsPage from "@/pages/ClassStudents";
import StudentsPage from "@/pages/Students";
import StudentDetailsPage from "@/pages/StudentDetails";
import AttendancePage from "@/pages/Attendance";
import GradesPage from "@/pages/Grades";
import AdminUsersPage from "./pages/AdminUsers";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    path: "/admin/users",
    element: (
      <ProtectedRoute>
        <AdminUsersPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/classes",
    element: (
      <ProtectedRoute>
        <ClassesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/classes/:classId/students",
    element: (
      <ProtectedRoute>
        <ClassStudentsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/students",
    element: (
      <ProtectedRoute>
        <StudentsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/students/:studentId",
    element: (
      <ProtectedRoute>
        <StudentDetailsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/attendance",
    element: (
      <ProtectedRoute>
        <AttendancePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/grades",
    element: (
      <ProtectedRoute>
        <GradesPage />
      </ProtectedRoute>
    ),
  },
]);
