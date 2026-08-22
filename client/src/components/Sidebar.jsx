import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, UserCircle, CalendarClock, FileText, Users, Wallet, LogOut, UserPlus } from 'lucide-react';
import { isAdmin, clearSession } from '../lib/auth';

const employeeLinks = [
  { to: '/employee/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/employee/profile', label: 'Profile', icon: UserCircle },
  { to: '/employee/attendance', label: 'Attendance', icon: CalendarClock },
  { to: '/employee/leave', label: 'Leave Requests', icon: FileText },
  { to: '/employee/payroll', label: 'Payroll', icon: Wallet },
];

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/employees', label: 'Employees', icon: Users },
  { to: '/admin/employee-ids', label: 'Generate Employee ID', icon: UserPlus },
  { to: '/admin/leave', label: 'Leave Approvals', icon: FileText },
  { to: '/admin/payroll', label: 'Payroll', icon: Wallet },
];

export default function Sidebar({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const admin = isAdmin();
  const links = admin ? adminLinks : employeeLinks;

  const handleLogout = () => {
    clearSession();
    navigate('/login');
  };

  const navClass = (path) =>
    `flex items-center gap-2.5 rounded-lg p-2 font-medium transition-colors ${
      location.pathname === path
        ? 'bg-indigo-soft text-indigo'
        : 'text-muted hover:bg-canvas'
    }`;

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-line bg-surface p-6">
      <div className="mb-8 font-display text-2xl font-bold text-ink">Dayflow</div>

      {user && (
        <div className="mb-6 flex items-center gap-3 rounded-lg bg-canvas px-3 py-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent-deep">
            {user.avatar || user.name?.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">{user.name}</p>
            <p className="truncate text-xs text-muted">{admin ? 'Admin / HR' : 'Employee'}</p>
          </div>
        </div>
      )}

      <nav className="flex-1 space-y-1.5">
        {links.map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to} className={navClass(to)}>
            <Icon size={17} />
            {label}
          </Link>
        ))}
      </nav>
      <button
        onClick={handleLogout}
        className="mt-auto flex items-center gap-2.5 rounded-lg p-2 text-left font-medium text-danger hover:bg-danger-soft"
      >
        <LogOut size={17} />
        Log out
      </button>
    </aside>
  );
}
