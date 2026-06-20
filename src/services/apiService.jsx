const API_BASE_URL = 'http://127.0.0.1:8000'
const ACCESS_TOKEN_COOKIE = 'sms_access_token'
const REFRESH_TOKEN_COOKIE = 'sms_refresh_token'
const TOKEN_TYPE_COOKIE = 'sms_token_type'

function setCookie(name, value, maxAgeSeconds = 60 * 60 * 24 * 7) {
  if (typeof document === 'undefined') return

  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`
}

function getCookie(name) {
  if (typeof document === 'undefined') return ''

  const cookie = document.cookie
    .split('; ')
    .find((item) => item.startsWith(`${name}=`))

  return cookie ? decodeURIComponent(cookie.split('=').slice(1).join('=')) : ''
}

function deleteCookie(name) {
  if (typeof document === 'undefined') return

  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`
}

export function getAccessToken() {
  return getCookie(ACCESS_TOKEN_COOKIE)
}

export function saveAuthTokens({ accessToken, refreshToken, tokenType = 'bearer' }) {
  setCookie(ACCESS_TOKEN_COOKIE, accessToken)
  setCookie(REFRESH_TOKEN_COOKIE, refreshToken)
  setCookie(TOKEN_TYPE_COOKIE, tokenType)
}

export function clearAuthTokens() {
  deleteCookie(ACCESS_TOKEN_COOKIE)
  deleteCookie(REFRESH_TOKEN_COOKIE)
  deleteCookie(TOKEN_TYPE_COOKIE)
}

async function apiRequest(path, options = {}) {
  const accessToken = getAccessToken()
  const headers = {
    Accept: 'application/json',
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...options.headers,
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    const error = new Error(payload?.message || payload?.error?.message || 'Request failed')
    error.status = response.status
    throw error
  }

  return payload
}

async function login(payload) {
  const response = await apiRequest('/users/login/', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  if (response?.status !== 'success') {
    throw new Error(response?.message || 'Invalid credentials')
  }

  const authData = response.data ?? {}

  return {
    accessToken: authData.access_token ?? '',
    refreshToken: authData.refresh_token ?? '',
    tokenType: authData.token_type ?? 'bearer',
  }
}

async function getAllRegisteredStudents(schoolId) {
  if (!schoolId) {
    throw new Error('School id is required')
  }

  return apiRequest(`/students/getAllRegisterdStudents/${schoolId}`, {
    method: 'GET',
  })
}

async function updateRegisteredStudent(studentId, payload) {
  if (!studentId) {
    throw new Error('Student id is required')
  }

  return apiRequest(`/students/studentRegister/${studentId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

async function deleteRegisteredStudent(studentId) {
  if (!studentId) {
    throw new Error('Student id is required')
  }

  return apiRequest(`/students/studentRegister/${studentId}`, {
    method: 'DELETE',
  })
}

async function enrollStudent(payload) {
  if (!payload?.student_register_id) {
    throw new Error('Student register id is required')
  }

  return apiRequest('/students/studentEnroll', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export const apiService = {
  login,
  getAllRegisteredStudents,
  updateRegisteredStudent,
  deleteRegisteredStudent,
  enrollStudent,
}
