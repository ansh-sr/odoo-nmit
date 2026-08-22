import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { LogOut, ChevronRight, Bell } from 'lucide-react'
import Sidebar from './Sidebar'

const BREADCRUMBS = {
  '/dashboard': 'Dashboard',
  '/attendance': 'Attendance',
  '/leaves': 'Leaves',
  '/payroll': 'Payroll',
  '/admin/dashboard': 'Admin Overview',
  '/admin/employees': 'Employees',
  '/admin/leave': 'Leave Approvals',
  '/admin/payroll': 'Payroll Control',
  '/employee/profile': 'My Profile',
  '/employee/attendance': 'Attendance',
  '/employee/leave': 'Leave Requests',
}

export default function Layout({ children, title, subtitle, action }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  const breadcrumb = BREADCRUMBS[location.pathname] || 'Page'

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8F9FC]">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#E5E7EB] bg-white px-8">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-sm text-[#6B7280]">
            <span className="font-medium text-[#111827]">Dayflow</span>
            <ChevronRight size={14} className="text-[#D1D5DB]" />
            <span className="font-medium text-[#374151]">{breadcrumb}</span>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Notification bell */}
            <button className="relative rounded-lg p-2 text-[#6B7280] transition hover:bg-[#F3F4F6] hover:text-[#374151]">
              <Bell size={18} />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#EF4444]" />
            </button>

            {/* User menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2.5 rounded-lg py-1.5 pl-1.5 pr-3 transition hover:bg-[#F3F4F6]"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EEF2FF] text-xs font-semibold text-[#4F46E5]">
                  AS
                </div>
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-medium text-[#111827]">Aditi Sharma</p>
                  <p className="text-xs text-[#6B7280]">Employee</p>
                </div>
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-[#E5E7EB] bg-white py-1.5 shadow-lg">
                  <div className="border-b border-[#F3F4F6] px-4 py-2.5">
                    <p className="text-sm font-medium text-[#111827]">Aditi Sharma</p>
                    <p className="text-xs text-[#6B7280]">aditi.sharma@dayflow.io</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-[#DC2626] transition hover:bg-[#FEF2F2]"
                  >
                    <LogOut size={15} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-8 py-8">
            {/* Page header */}
            {(title || action) && (
              <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  {title && (
                    <h1 className="font-display text-2xl font-bold tracking-tight text-[#111827]">
                      {title}
                    </h1>
                  )}
                  {subtitle && (
                    <p className="mt-1 text-sm text-[#6B7280]">{subtitle}</p>
                  )}
                </div>
                {action && <div>{action}</div>}
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
