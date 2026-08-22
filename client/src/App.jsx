import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import EmployeeDashboard from './pages/EmployeeDashboard.jsx'
import Profile from './pages/Profile.jsx'
import Attendance from './pages/Attendance.jsx'
import Leave from './pages/Leave.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import AdminEmployees from './pages/AdminEmployees.jsx'
import AdminLeaveApprovals from './pages/AdminLeaveApprovals.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />

      <Route path="/employee" element={<EmployeeDashboard />} />
      <Route path="/employee/profile" element={<Profile />} />
      <Route path="/employee/attendance" element={<Attendance />} />
      <Route path="/employee/leave" element={<Leave />} />

      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/employees" element={<AdminEmployees />} />
      <Route path="/admin/leave" element={<AdminLeaveApprovals />} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
