import {
  Banknote,
  BookOpen,
  CalendarCheck2,
  CalendarRange,
  ClipboardCheck,
  FolderKanban,
  GraduationCap,
  LayoutDashboard,
  Settings,
  Users,
  UserSquare2,
} from 'lucide-react'

export const navigationItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Classes', icon: Users, path: '/classes' },
  { label: 'Students', icon: GraduationCap, path: '/students' },
  { label: 'Teachers', icon: UserSquare2, path: '/teachers' },
  { label: 'Attendance', icon: CalendarCheck2, path: '/attendance' },
  { label: 'Mark Attendance', icon: ClipboardCheck, path: '/mark-attendance' },
  { label: 'Exams', icon: BookOpen, path: '/exams' },
  { label: 'Finance', icon: Banknote, path: '/finance' },
  { label: 'Events', icon: CalendarRange, path: '/events' },
  { label: 'File Manager', icon: FolderKanban, path: '/file-manager' },
  { label: 'Settings', icon: Settings, path: '/settings' },
]

export const statCards = [
  { title: 'Students Count', value: '932', change: '+12.4%', caption: 'New admissions this month', color: 'from-brand-500 to-brand-700', icon: GraduationCap },
  { title: 'Teachers Count', value: '128', change: '+5.8%', caption: 'Faculty satisfaction 92%', color: 'from-orange-400 to-rose-500', icon: Users },
  { title: 'Events', value: '24', change: '+4 upcoming', caption: 'Cultural, sports and exams', color: 'from-amber-400 to-orange-500', icon: CalendarRange },
  { title: 'Revenue', value: '$84.2k', change: '+18.2%', caption: 'Fee collection efficiency', color: 'from-slate-700 to-brand-700', icon: Banknote },
]

export const performanceData = [
  { name: 'Week 1', current: 280, previous: 420 },
  { name: 'Week 2', current: 395, previous: 315 },
  { name: 'Week 3', current: 322, previous: 386 },
  { name: 'Week 4', current: 404, previous: 210 },
  { name: 'Week 5', current: 238, previous: 448 },
  { name: 'Week 6', current: 398, previous: 228 },
]

export const overviewData = [
  { month: 'Jan', attendance: 72, revenue: 45, events: 28 },
  { month: 'Feb', attendance: 82, revenue: 62, events: 24 },
  { month: 'Mar', attendance: 70, revenue: 55, events: 41 },
  { month: 'Apr', attendance: 96, revenue: 74, events: 29 },
  { month: 'May', attendance: 49, revenue: 44, events: 23 },
  { month: 'Jun', attendance: 97, revenue: 53, events: 34 },
  { month: 'Jul', attendance: 78, revenue: 39, events: 18 },
  { month: 'Aug', attendance: 73, revenue: 57, events: 43 },
  { month: 'Sep', attendance: 92, revenue: 76, events: 31 },
  { month: 'Oct', attendance: 33, revenue: 45, events: 18 },
  { month: 'Nov', attendance: 72, revenue: 49, events: 34 },
  { month: 'Dec', attendance: 97, revenue: 42, events: 19 },
]

export const recentActivities = [
  { id: 1, title: 'Semester fee reconciliation completed', time: '08:45 AM', tag: 'Finance' },
  { id: 2, title: 'Class 10 attendance uploaded for April 5', time: '09:20 AM', tag: 'Attendance' },
  { id: 3, title: 'Science fair registrations crossed 200 students', time: '11:00 AM', tag: 'Events' },
  { id: 4, title: 'New mathematics teacher onboarded', time: '12:10 PM', tag: 'Teachers' },
]

export const studentsSeed = [
  { id: 's-1', name: 'Aarav Mehta', className: 'Class 10', section: 'A', contact: '+1 555 204 190', status: 'Active' },
  { id: 's-2', name: 'Sophia Carter', className: 'Class 9', section: 'C', contact: '+1 555 672 113', status: 'Active' },
  { id: 's-3', name: 'Ethan Brooks', className: 'Class 8', section: 'B', contact: '+1 555 903 667', status: 'On Leave' },
  { id: 's-4', name: 'Mia Thompson', className: 'Class 11', section: 'A', contact: '+1 555 120 891', status: 'Active' },
  { id: 's-5', name: 'Liam Rivera', className: 'Class 12', section: 'D', contact: '+1 555 811 302', status: 'Probation' },
]

export const teachersSeed = [
  { id: 't-1', name: 'Olivia Stone', subject: 'Mathematics', department: 'STEM', contact: '+1 555 377 102', status: 'Full Time' },
  { id: 't-2', name: 'Noah Kim', subject: 'Physics', department: 'STEM', contact: '+1 555 877 991', status: 'Full Time' },
  { id: 't-3', name: 'Emma Wright', subject: 'History', department: 'Humanities', contact: '+1 555 603 188', status: 'Contract' },
  { id: 't-4', name: 'James Hall', subject: 'Computer Science', department: 'Technology', contact: '+1 555 772 771', status: 'Full Time' },
]

export const classesSeed = [
  { id: 'c-1', className: 'Class 8', section: 'A', teacherId: 't-1' },
  { id: 'c-2', className: 'Class 8', section: 'B', teacherId: 't-2' },
  { id: 'c-3', className: 'Class 9', section: 'A', teacherId: 't-3' },
  { id: 'c-4', className: 'Class 9', section: 'B', teacherId: 't-4' },
  { id: 'c-5', className: 'Class 9', section: 'C', teacherId: 't-1' },
  { id: 'c-6', className: 'Class 10', section: 'A', teacherId: 't-2' },
  { id: 'c-7', className: 'Class 10', section: 'B', teacherId: 't-3' },
  { id: 'c-8', className: 'Class 11', section: 'A', teacherId: 't-4' },
  { id: 'c-9', className: 'Class 12', section: 'A', teacherId: 't-1' },
  { id: 'c-10', className: 'Class 12', section: 'B', teacherId: 't-2' },
  { id: 'c-11', className: 'Class 12', section: 'C', teacherId: 't-3' },
  { id: 'c-12', className: 'Class 12', section: 'D', teacherId: 't-4' },
]

export const attendanceRoster = [
  { id: 1, day: 'Mon', date: 1, status: 'Present' },
  { id: 2, day: 'Tue', date: 2, status: 'Present' },
  { id: 3, day: 'Wed', date: 3, status: 'Absent' },
  { id: 4, day: 'Thu', date: 4, status: 'Present' },
  { id: 5, day: 'Fri', date: 5, status: 'Late' },
  { id: 6, day: 'Sat', date: 6, status: 'Present' },
  { id: 7, day: 'Sun', date: 7, status: 'Holiday' },
  { id: 8, day: 'Mon', date: 8, status: 'Present' },
  { id: 9, day: 'Tue', date: 9, status: 'Present' },
  { id: 10, day: 'Wed', date: 10, status: 'Absent' },
  { id: 11, day: 'Thu', date: 11, status: 'Present' },
  { id: 12, day: 'Fri', date: 12, status: 'Present' },
]

export const studentLeaveRecords = [
  { id: 'sl-1', studentId: 's-3', name: 'Ethan Brooks', className: 'Class 8', section: 'B', reason: 'Medical leave', date: 1 },
  { id: 'sl-2', studentId: 's-1', name: 'Aarav Mehta', className: 'Class 10', section: 'A', reason: 'Family function', date: 3 },
  { id: 'sl-3', studentId: 's-2', name: 'Sophia Carter', className: 'Class 9', section: 'C', reason: 'Dental appointment', date: 3 },
  { id: 'sl-4', studentId: 's-4', name: 'Mia Thompson', className: 'Class 11', section: 'A', reason: 'Competition travel', date: 5 },
  { id: 'sl-5', studentId: 's-3', name: 'Ethan Brooks', className: 'Class 8', section: 'B', reason: 'Recovery day', date: 8 },
  { id: 'sl-6', studentId: 's-2', name: 'Sophia Carter', className: 'Class 9', section: 'C', reason: 'Personal leave', date: 10 },
  { id: 'sl-7', studentId: 's-1', name: 'Aarav Mehta', className: 'Class 10', section: 'A', reason: 'Sports meet', date: 11 },
]

export const teacherLeaveRecords = [
  { id: 'tl-1', teacherId: 't-1', name: 'Olivia Stone', subject: 'Mathematics', department: 'STEM', reason: 'Conference', date: 1 },
  { id: 'tl-2', teacherId: 't-3', name: 'Emma Wright', subject: 'History', department: 'Humanities', reason: 'Personal leave', date: 3 },
  { id: 'tl-3', teacherId: 't-2', name: 'Noah Kim', subject: 'Physics', department: 'STEM', reason: 'Medical appointment', date: 5 },
  { id: 'tl-4', teacherId: 't-4', name: 'James Hall', subject: 'Computer Science', department: 'Technology', reason: 'Workshop duty', date: 8 },
  { id: 'tl-5', teacherId: 't-1', name: 'Olivia Stone', subject: 'Mathematics', department: 'STEM', reason: 'Exam moderation', date: 10 },
  { id: 'tl-6', teacherId: 't-3', name: 'Emma Wright', subject: 'History', department: 'Humanities', reason: 'Family emergency', date: 11 },
]

export const examCards = [
  { id: 1, title: 'Mid Term Examination', subject: 'All subjects', timeline: 'Apr 18 - Apr 26', students: 412, progress: 78 },
  { id: 2, title: 'Science Assessment', subject: 'Physics, Chemistry, Biology', timeline: 'Apr 12 - Apr 14', students: 240, progress: 52 },
  { id: 3, title: 'Quarterly Language Test', subject: 'English and Literature', timeline: 'Apr 29 - Apr 30', students: 196, progress: 35 },
]

export const resultsRows = [
  { id: 1, student: 'Aarav Mehta', exam: 'Mid Term', marks: 89, grade: 'A', status: 'Published' },
  { id: 2, student: 'Sophia Carter', exam: 'Science Assessment', marks: 94, grade: 'A+', status: 'Published' },
  { id: 3, student: 'Ethan Brooks', exam: 'Mid Term', marks: 68, grade: 'B', status: 'Pending Review' },
  { id: 4, student: 'Mia Thompson', exam: 'Language Test', marks: 91, grade: 'A+', status: 'Published' },
]

export const feeCards = [
  { title: 'Collected Fees', value: '$54,200', subtitle: '87% of target achieved' },
  { title: 'Pending Dues', value: '$8,720', subtitle: '32 families overdue' },
  { title: 'Scholarships', value: '$6,340', subtitle: '12 active awards' },
]

export const financePayments = [
  { id: 1, payer: 'Aarav Mehta', invoice: 'INV-1024', amount: '$1,250', method: 'Card', status: 'Paid' },
  { id: 2, payer: 'Mia Thompson', invoice: 'INV-1027', amount: '$1,180', method: 'Bank', status: 'Pending' },
  { id: 3, payer: 'Liam Rivera', invoice: 'INV-1031', amount: '$1,440', method: 'Cash', status: 'Paid' },
  { id: 4, payer: 'Sophia Carter', invoice: 'INV-1034', amount: '$980', method: 'UPI', status: 'Pending' },
]

export const eventCards = [
  { id: 1, title: 'Annual Science Fair', date: 'April 18', time: '09:00 AM', location: 'Main Auditorium', attendees: 320 },
  { id: 2, title: 'Parents Orientation', date: 'April 21', time: '11:30 AM', location: 'Seminar Hall', attendees: 180 },
  { id: 3, title: 'Inter-school Sports Day', date: 'April 26', time: '08:00 AM', location: 'Athletics Ground', attendees: 460 },
]

export const eventCalendarDays = [
  { date: 7, title: 'House Assembly' },
  { date: 12, title: 'Debate Finals' },
  { date: 18, title: 'Science Fair' },
  { date: 21, title: 'Parent Orientation' },
  { date: 26, title: 'Sports Day' },
]

export const fileItems = [
  { id: 1, name: 'Class Schedules', type: 'Folder', size: '12 items', updated: '2h ago' },
  { id: 2, name: 'Term Results.xlsx', type: 'File', size: '1.8 MB', updated: 'Today' },
  { id: 3, name: 'Staff Handbook.pdf', type: 'File', size: '3.1 MB', updated: 'Yesterday' },
  { id: 4, name: 'Admission Docs', type: 'Folder', size: '36 items', updated: '3d ago' },
  { id: 5, name: 'Sports Posters', type: 'Folder', size: '8 items', updated: '5d ago' },
  { id: 6, name: 'Fee Receipts.zip', type: 'File', size: '8.2 MB', updated: '1w ago' },
]

export const settingsCards = [
  { title: 'Role Permissions', description: 'Review access for administration, academic, and finance teams.' },
  { title: 'Notification Center', description: 'Manage parent updates, fee reminders, and event broadcasts.' },
  { title: 'Academic Session', description: 'Configure current term, grading slabs, and class promotion rules.' },
]
