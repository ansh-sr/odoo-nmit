const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function getToken() {
  return localStorage.getItem('hrms_token')
}

async function request(path, { method = 'GET', body, form, auth = true } = {}) {
  const headers = {}
  let payload = body

  if (form) {
    // application/x-www-form-urlencoded, used only by /signin (OAuth2PasswordRequestForm)
    headers['Content-Type'] = 'application/x-www-form-urlencoded'
    payload = new URLSearchParams(body).toString()
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }

  if (auth) {
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL}${path}`, { method, headers, body: payload })

  let data = null
  const text = await res.text()
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }

  if (!res.ok) {
    const message = (data && data.detail) || res.statusText || 'Request failed'
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message))
  }
  return data
}

export const api = {
  signup: (payload) => request('/signup', { method: 'POST', body: payload, auth: false }),
  signin: (email, password) =>
    request('/signin', { method: 'POST', form: true, body: { username: email, password }, auth: false }),

  checkIn: (userId) => request(`/attendance/checkin?user_id=${userId}`, { method: 'POST' }),
  checkOut: (attendanceId) => request(`/attendance/check-out/${attendanceId}`, { method: 'PUT' }),
  getAttendance: (userId) => request(`/attendance/${userId}`),

  requestLeave: (userId, payload) =>
    request(`/leave/request?user_id=${userId}`, { method: 'POST', body: payload }),
  getLeaves: (userId) => request(`/leave/${userId}`),
  updateLeaveStatus: (leaveId, status) =>
    request(`/leave/approve/${leaveId}?status=${encodeURIComponent(status)}`, { method: 'PUT' }),

  getPayroll: (userId) => request(`/payroll/${userId}`),
  getAllPayroll: () => request('/payroll/admin/all'),
  getSalaryStructure: () => request('/payroll/admin/salary-structure'),
  createPayroll: (userId, payload) =>
    request(`/payroll/create?user_id=${userId}`, { method: 'POST', body: payload }),
  updatePayroll: (payrollId, payload) =>
    request(`/payroll/update/${payrollId}`, { method: 'PUT', body: payload }),
}

export function setToken(token) {
  localStorage.setItem('hrms_token', token)
}
export function clearToken() {
  localStorage.removeItem('hrms_token')
}
export { getToken }
