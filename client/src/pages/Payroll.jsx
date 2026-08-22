import { useState, useEffect } from 'react';
import Layout from '../components/Layout';

export default function Payroll() {
  const [payroll, setPayroll] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = 1;

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/payroll/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setPayroll(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch payroll:", err);
        setLoading(false);
      });
  }, []);

  return (
    <Layout>
      <h1 className="font-display text-2xl font-bold text-ink">Payroll History</h1>
      
      <div className="mt-8 overflow-hidden rounded-xl2 bg-surface shadow-card">
        {loading ? (
          <p className="p-6 text-muted">Loading payroll records...</p>
        ) : payroll.length === 0 ? (
          <p className="p-6 text-muted">No payroll history found.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-canvas/50">
              <tr className="border-b border-line text-muted">
                <th className="p-4 font-medium">Payment Date</th>
                <th className="p-4 font-medium">Base Salary</th>
                <th className="p-4 font-medium">Bonuses</th>
                <th className="p-4 font-medium">Deductions</th>
                <th className="p-4 font-medium text-right text-indigo">Net Salary</th>
              </tr>
            </thead>
            <tbody>
              {payroll.map((record) => (
                <tr key={record.id} className="border-b border-line/50 last:border-0 hover:bg-canvas/30">
                  <td className="p-4">{new Date(record.payment_date).toLocaleDateString()}</td>
                  <td className="p-4">${record.base_salary.toLocaleString()}</td>
                  <td className="p-4 text-success">+${record.bonuses.toLocaleString()}</td>
                  <td className="p-4 text-danger">-${record.deductions.toLocaleString()}</td>
                  <td className="p-4 text-right font-bold text-ink">
                    ${record.net_salary.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}