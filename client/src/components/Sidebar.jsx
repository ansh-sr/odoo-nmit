import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutGrid,
  User,
  CalendarClock,
  FileText,
  Users,
  LogOut,
  Sun,
} from 'lucide-react'

const employeeLinks = [
  { to: '/employee', label: 'Dashboard', icon: LayoutGrid, end: true },
  { to: '/employee/profile', label: 'Profile', icon: User },
  { to: '/employee/attendance', label: 'Attendance', icon: CalendarClock },
  { to: '/employee/leave', label: 'Leave Requests', icon: FileText },
]

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: LayoutGrid, end: true },
  { to: '/admin/employees', label: 'Employees', icon: Users },
  { to: '/admin/leave', label: 'Leave Approvals', icon: FileText },
]

export default function Sidebar({ user }) {
  const navigate = useNavigate()
  const links = user.role === 'HR' ? adminLinks : employeeLinks

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-line bg-surface">
      <div className="flex items-center gap-2.5 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink text-accent">
          <Sun size={18} strokeWidth={2.5} />
        </div>
        <div>
          <p className="font-display text-lg font-bold leading-none text-ink">Dayflow</p>
          <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-muted">
            {user.role === 'HR' ? 'Admin console' : 'Workspace'}
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-ink text-white'
                  : 'text-muted hover:bg-canvas hover:text-ink'
              }`
            }
          >
            <Icon size={17} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-line p-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent-deep">
            {user.avatar}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
            <p className="truncate text-xs text-muted">{user.designation}</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/login')}
          className="mt-1 flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium text-muted transition hover:bg-danger-soft hover:text-danger"
        >
          <LogOut size={17} strokeWidth={2} />
          Log out
        </button>
      </div>
    </aside>
  )
}
