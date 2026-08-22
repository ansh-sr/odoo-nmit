import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navClass = (path) =>
    `block rounded-lg p-2 font-medium ${
      location.pathname === path
        ? 'bg-indigo-soft text-indigo'
        : 'text-muted hover:bg-canvas'
    }`;

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-line bg-surface p-6">
      <div className="mb-8 font-display text-2xl font-bold text-ink">Dayflow</div>
      <nav className="flex-1 space-y-2">
        <Link to="/dashboard" className={navClass('/dashboard')}>Dashboard</Link>
        <Link to="/attendance" className={navClass('/attendance')}>Attendance</Link>
        <Link to="/leaves" className={navClass('/leaves')}>Leaves</Link>
        <Link to="/payroll" className={navClass('/payroll')}>Payroll</Link>
      </nav>
      <button 
        onClick={handleLogout} 
        className="mt-auto block w-full rounded-lg p-2 text-left font-medium text-danger hover:bg-danger-soft"
      >
        Log out
      </button>
    </aside>
  );
}