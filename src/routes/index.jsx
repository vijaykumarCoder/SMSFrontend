import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";

import { ProtectedRoute } from "./ProtectedRoute";
import { PublicRoute }    from "./PublicRoute";

import { MainLayout } from '../components/layout/MainLayout'
import { AttendancePage } from '../pages/attendance/AttendancePage'
import { ClassesPage } from '../pages/classes/ClassesPage'
import { DashboardPage } from '../pages/dashboard/DashboardPage'
import { EventsPage } from '../pages/events/EventsPage'
import { ExamsPage } from '../pages/exams/ExamsPage'
import { FileManagerPage } from '../pages/file-manager/FileManagerPage'
import { FinancePage } from '../pages/finance/FinancePage'
import { MarkAttendancePage } from '../pages/attendance/MarkAttendancePage'
import { LoginPage } from '../pages/auth/LoginPage'
import { SignupPage } from '../pages/auth/SignupPage'
import { SettingsPage } from '../pages/settings/SettingsPage'
import { StudentLeaveApplicationPage } from '../pages/students/StudentLeaveApplicationPage'
import { StudentsPage } from '../pages/students/StudentsPage'
import { StudentRegistration } from '../pages/students/StudentRegistration'
import { RegisteredStudentsPage } from '../pages/students/RegisteredStudentsPage'
import { TeachersPage } from '../pages/teachers/TeachersPage'
import { useAppStore } from '../store/appStore'
import { SchoolRegistration } from '../pages/schools/SchoolRegistration'
import { useAuth } from '../context/AuthContext'
// import { setToken } from '../pages/utils/api'

// Listens for forced logouts triggered by the axios interceptor
function AuthLogoutListener() {
  const { logout } = useAuth();
  useEffect(() => {
    const handle = () => logout();
    window.addEventListener("auth:logout", handle);
    return () => window.removeEventListener("auth:logout", handle);
  }, [logout]);
  return null;
}


function ThemeSync() {
  const theme = useAppStore((state) => state.theme)

  useEffect(() => {
    document.body.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return null
}
export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthLogoutListener />   {/* ← handles forced logout from interceptor */}
      <ThemeSync />
      <Routes>
        {/* ── Public routes ───────────────────────────────────────── */}
        <Route path="/login"  element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />

        {/* ── Standalone protected routes (no MainLayout) ─────────── */}
        <Route path="/student-registration" element={<StudentRegistration />} />
        <Route path="/school-registration"  element={<SchoolRegistration />} />

        {/* ── Main app shell (sidebar + header layout) ────────────── */}
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard"      element={<DashboardPage />} />
          <Route path="/classes"        element={<ClassesPage />} />
          <Route path="/students"       element={<StudentsPage />} />
          <Route path="/registered-students" element={<RegisteredStudentsPage />} />
          {/* <Route path="/students"       element={<Navigate to="/registered-students" replace />} /> */}
          <Route path="/teachers"       element={<TeachersPage />} />
          <Route path="/student-leave-application" element={<StudentLeaveApplicationPage />} />
          <Route path="/attendance"     element={<AttendancePage />} />
          <Route path="/mark-attendance" element={<MarkAttendancePage />} />
          <Route path="/exams"          element={<ExamsPage />} />
          <Route path="/finance"        element={<FinancePage />} />
          <Route path="/events"         element={<EventsPage />} />
          <Route path="/file-manager"   element={<FileManagerPage />} />
          <Route path="/settings"       element={<SettingsPage />} />
        </Route>

        {/* ── Catch-all ───────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
