import { create } from 'zustand'
import { classesSeed, financePayments, recentActivities, studentsSeed, teachersSeed } from '../utils/mockData'

export const useAppStore = create((set) => ({
  theme: 'light',
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  students: studentsSeed,
  teachers: teachersSeed,
  classes: classesSeed,
  payments: financePayments,
  activities: recentActivities,
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  toggleMobileSidebar: () => set((state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen })),
  closeMobileSidebar: () => set({ mobileSidebarOpen: false }),
  addStudent: (student) =>
    set((state) => ({
      students: [{ id: `student-${Date.now()}`, status: 'Active', ...student }, ...state.students],
    })),
  removeStudent: (id) =>
    set((state) => ({
      students: state.students.filter((student) => student.id !== id),
    })),
  addTeacher: (teacher) =>
    set((state) => ({
      teachers: [{ id: `teacher-${Date.now()}`, status: 'Full Time', ...teacher }, ...state.teachers],
    })),
  removeTeacher: (id) =>
    set((state) => ({
      teachers: state.teachers.filter((teacher) => teacher.id !== id),
    })),
  addClass: (classItem) =>
    set((state) => ({
      classes: [{ id: `class-${Date.now()}`, ...classItem }, ...state.classes],
    })),
}))
