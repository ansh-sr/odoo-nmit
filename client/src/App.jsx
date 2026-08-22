import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import AdminEmployees from './pages/AdminEmployees';
import AdminEmployeeIds from './pages/AdminEmployeeIds';
import AdminLeaveApprovals from './pages/AdminLeaveApprovals';
import Attendance from './pages/Attendance';
import Leaves from './pages/Leaves';
import Payroll from './pages/Payroll';
import { isAuthenticated, isAdmin, getHomeRoute } from './lib/auth';

// Any logged-in user may pass.
const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

// Only logged-in Admins may pass; Employees get bounced to their own dashboard.
const AdminRoute = ({ children }) => {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  return isAdmin() ? children : <Navigate to="/employee/dashboard" replace />;
};

// Only logged-in Employees may pass; Admins get bounced to their own dashboard.
const EmployeeRoute = ({ children }) => {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  return !isAdmin() ? children : <Navigate to="/admin/dashboard" replace />;
};

const PublicRoute = ({ children }) => {
  return !isAuthenticated() ? children : <Navigate to={getHomeRoute()} replace />;
};

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

      {/* Employee area */}
      <Route path="/employee/dashboard" element={<EmployeeRoute><EmployeeDashboard /></EmployeeRoute>} />
      <Route path="/employee/profile" element={<EmployeeRoute><Profile /></EmployeeRoute>} />
      <Route path="/employee/attendance" element={<EmployeeRoute><Attendance /></EmployeeRoute>} />
      <Route path="/employee/leave" element={<EmployeeRoute><Leaves /></EmployeeRoute>} />
      <Route path="/employee/payroll" element={<EmployeeRoute><Payroll /></EmployeeRoute>} />

      {/* Admin / HR area */}
      <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/employees" element={<AdminRoute><AdminEmployees /></AdminRoute>} />
      <Route path="/admin/employee-ids" element={<AdminRoute><AdminEmployeeIds /></AdminRoute>} />
      <Route path="/admin/leave" element={<AdminRoute><AdminLeaveApprovals /></AdminRoute>} />
      <Route path="/admin/payroll" element={<AdminRoute><Payroll /></AdminRoute>} />

      {/* Legacy link redirects to the right role-based dashboard */}
      <Route path="/dashboard" element={<ProtectedRoute><Navigate to={getHomeRoute()} replace /></ProtectedRoute>} />

      <Route path="/" element={<Navigate to={isAuthenticated() ? getHomeRoute() : '/login'} replace />} />
      <Route path="*" element={<Navigate to={isAuthenticated() ? getHomeRoute() : '/login'} replace />} />
    </Routes>
  );
}
