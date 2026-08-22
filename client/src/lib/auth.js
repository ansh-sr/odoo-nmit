// Small shared helper around the session data we keep in localStorage.
// Centralised here so routing/guards/logout all agree on the same keys.

export function getToken() {
  return localStorage.getItem('token');
}

export function getRole() {
  return localStorage.getItem('role');
}

export function getUserId() {
  const id = localStorage.getItem('user_id');
  return id ? Number(id) : null;
}

export function getEmployeeId() {
  return localStorage.getItem('employee_id');
}

export function isAdmin() {
  return getRole() === 'Admin';
}

export function isAuthenticated() {
  return !!getToken();
}

export function saveSession({ access_token, role, user_id, employee_id }) {
  localStorage.setItem('token', access_token);
  if (role) localStorage.setItem('role', role);
  if (user_id != null) localStorage.setItem('user_id', String(user_id));
  if (employee_id) localStorage.setItem('employee_id', employee_id);
}

export function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('user_id');
  localStorage.removeItem('employee_id');
}

// Where a logged-in user should land / be sent back to after auth actions.
export function getHomeRoute() {
  return isAdmin() ? '/admin/dashboard' : '/employee/dashboard';
}
