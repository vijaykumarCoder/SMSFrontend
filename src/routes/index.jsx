import { useEffect } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
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
import { StudentRegistration } from '../pages/students/StudentRegistration'
import { StudentsPage } from '../pages/students/StudentsPage'
import { TeachersPage } from '../pages/teachers/TeachersPage'
import { useAppStore } from '../store/appStore'

function ThemeSync() {
  const theme = useAppStore((state) => state.theme)

  useEffect(() => {
    document.body.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return null
}

export function AppRouter() {
  return (
    <HashRouter>
      <ThemeSync />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/student-registration" element={<StudentRegistration />} />
        <Route element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/classes" element={<ClassesPage />} />
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/teachers" element={<TeachersPage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/mark-attendance" element={<MarkAttendancePage />} />
          <Route path="/exams" element={<ExamsPage />} />
          <Route path="/finance" element={<FinancePage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/file-manager" element={<FileManagerPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
