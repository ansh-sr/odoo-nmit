import Layout from '../components/Layout';

export default function Dashboard() {
  return (
    <Layout>
      <h1 className="font-display text-2xl font-bold text-ink">Dashboard Overview</h1>
      <p className="mt-1 text-muted">Welcome back! Here is your HR summary.</p>
      
      <div className="mt-8 grid grid-cols-3 gap-6">
        <div className="rounded-xl2 bg-surface p-6 shadow-card">
          <h3 className="text-sm font-medium text-muted">Next Payroll</h3>
          <p className="mt-2 font-display text-2xl font-bold text-ink">Aug 31</p>
        </div>
        <div className="rounded-xl2 bg-surface p-6 shadow-card">
          <h3 className="text-sm font-medium text-muted">Pending Leaves</h3>
          <p className="mt-2 font-display text-2xl font-bold text-warning">2</p>
        </div>
        <div className="rounded-xl2 bg-surface p-6 shadow-card">
          <h3 className="text-sm font-medium text-muted">Attendance This Week</h3>
          <p className="mt-2 font-display text-2xl font-bold text-success">5/5</p>
        </div>
      </div>
    </Layout>
  );
}