import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Signup from './pages/Signup'
import EmployeeDashboard from './pages/EmployeeDashboard'
import Attendance from './pages/Attendance'
import Leaves from './pages/Leaves'
import Payroll from './pages/Payroll'
import AdminDashboard from './pages/AdminDashboard'
import AdminPayroll from './pages/AdminPayroll'

function Protected({ children, role }) {
  const { user, ready } = useAuth()
  if (!ready) return null
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'Admin' ? '/admin' : '/dashboard'} replace />
  }
  return children
}

export default function App() {
  const { user, ready } = useAuth()

  if (!ready) return null

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to={user.role === 'Admin' ? '/admin' : '/dashboard'} replace /> : <Login />}
      />
      <Route
        path="/signup"
        element={user ? <Navigate to={user.role === 'Admin' ? '/admin' : '/dashboard'} replace /> : <Signup />}
      />
      <Route
        path="/dashboard"
        element={<Protected><EmployeeDashboard /></Protected>}
      />
      <Route
        path="/attendance"
        element={<Protected><Attendance /></Protected>}
      />
      <Route
        path="/leaves"
        element={<Protected><Leaves /></Protected>}
      />
      <Route
        path="/payroll"
        element={<Protected><Payroll /></Protected>}
      />
      <Route
        path="/admin"
        element={<Protected role="Admin"><AdminDashboard /></Protected>}
      />
      <Route
        path="/admin/payroll"
        element={<Protected role="Admin"><AdminPayroll /></Protected>}
      />
      <Route path="*" element={<Navigate to={user ? (user.role === 'Admin' ? '/admin' : '/dashboard') : '/login'} replace />} />
    </Routes>
  )
}
