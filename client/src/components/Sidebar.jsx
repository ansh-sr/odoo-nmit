import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Clock,
  CalendarDays,
  Wallet,
  Users,
  FileCheck,
  LogOut,
  GraduationCap,
  Shield,
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/attendance', label: 'Attendance', icon: Clock },
  { to: '/leaves', label: 'Leaves', icon: CalendarDays },
  { to: '/payroll', label: 'Payroll', icon: Wallet },
]

const ADMIN_ITEMS = [
  { to: '/admin/payroll', label: 'Payroll Control', icon: Shield },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <aside className="flex h-screen w-[260px] shrink-0 flex-col border-r border-[#E5E7EB] bg-white">
      {/* Brand */}
      <div className="flex h-16 items-center gap-3 border-b border-[#E5E7EB] px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4F46E5]">
          <span className="text-sm font-bold text-white">D</span>
        </div>
        <div>
          <span className="font-display text-lg font-bold tracking-tight text-[#111827]">
            Dayflow
          </span>
          <span className="ml-1.5 rounded bg-[#F3F4F6] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
            HRMS
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-[#9CA3AF]">
          Main Menu
        </p>
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to
          return (
            <Link
              key={to}
              to={to}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                active
                  ? 'bg-[#EEF2FF] text-[#4F46E5]'
                  : 'text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#374151]'
              }`}
            >
              <Icon
                size={18}
                className={`transition ${
                  active ? 'text-[#4F46E5]' : 'text-[#9CA3AF] group-hover:text-[#6B7280]'
                }`}
              />
              {label}
            </Link>
          )
        })}

        <p className="mb-2 mt-6 px-3 text-[10px] font-semibold uppercase tracking-widest text-[#9CA3AF]">
          Admin
        </p>
        {ADMIN_ITEMS.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to
          return (
            <Link
              key={to}
              to={to}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                active
                  ? 'bg-[#EEF2FF] text-[#4F46E5]'
                  : 'text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#374151]'
              }`}
            >
              <Icon
                size={18}
                className={`transition ${
                  active ? 'text-[#4F46E5]' : 'text-[#9CA3AF] group-hover:text-[#6B7280]'
                }`}
              />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* NMIT branding footer */}
      <div className="border-t border-[#E5E7EB] px-3 py-4">
        <div className="flex items-center gap-2.5 rounded-lg bg-[#F9FAFB] px-3 py-2.5">
          <GraduationCap size={16} className="text-[#6B7280]" />
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-[#374151]">NMIT, Bengaluru</p>
            <p className="truncate text-[10px] text-[#9CA3AF]">Human Resources Dept</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#DC2626] transition hover:bg-[#FEF2F2]"
        >
          <LogOut size={17} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
