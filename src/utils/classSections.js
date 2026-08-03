import api from './api'

function readCatalog(response) {
  const candidates = [response?.data?.data, response?.data, response]

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate
    }
  }

  return []
}

function normalizeSection(section, index = 0, fallbackTeacherName = '') {
  const teacherName = String(
    section?.teacher_name ??
      section?.teacherName ??
      section?.class_teacher ??
      section?.classTeacher ??
      fallbackTeacherName ??
      '',
  ).trim()

  return {
    id: section?.section_id ?? section?.id ?? section?.sectionId ?? `section-${index}`,
    sectionId: section?.section_id ?? section?.id ?? section?.sectionId ?? null,
    sectionName: String(section?.section_name ?? section?.sectionName ?? '').trim(),
    classTeacher: teacherName,
    classTeacherId: section?.teacher_id ?? section?.teacherId ?? section?.class_teacher_id ?? section?.classTeacherId ?? null,
    studentsCount: Number(section?.students_count ?? section?.studentsCount ?? 0) || 0,
    raw: section ?? {},
  }
}

function normalizeClass(record, index = 0) {
  const fallbackTeacherName = String(
    record?.teacher_name ?? record?.teacherName ?? record?.class_teacher ?? record?.classTeacher ?? '',
  ).trim()

  return {
    id: record?.class_id ?? record?.id ?? record?.classId ?? `class-${index}`,
    classId: record?.class_id ?? record?.id ?? record?.classId ?? null,
    className: String(record?.class_name ?? record?.className ?? '').trim(),
    sections: Array.isArray(record?.sections) ? record.sections.map((section) => normalizeSection(section, index, fallbackTeacherName)) : [],
    raw: record ?? {},
  }
}

export function getOrganizationId() {
  if (typeof window === 'undefined') {
    return ''
  }

  return String(window.localStorage.getItem('DEFAULT_ORGANIZATION_ID') || '').trim()
}

export async function fetchClassSectionCatalog(organizationId = getOrganizationId()) {
  if (!organizationId) {
    throw new Error('Organization id is required')
  }

  const response = await api.get(`/classes/getClassAndSection/${organizationId}`)

  if (response?.data?.status === 'error' || response?.status === 'error') {
    throw new Error(response?.data?.message || response?.message || 'Failed to load classes and sections')
  }

  return readCatalog(response).map(normalizeClass)
}
