import { useState, useEffect } from 'react';
import Layout from '../components/Layout';

export default function Attendance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = 1; 

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/attendance/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setRecords(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch attendance:", err);
        setLoading(false);
      });
  }, []);

  const handleCheckIn = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/attendance/checkin?user_id=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Present' }),
      });
      
      if (!response.ok) throw new Error('Check-in failed');
      
      const newRecord = await response.json();
      setRecords([...records, newRecord]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink">Attendance</h1>
        <button 
          onClick={handleCheckIn}
          className="rounded-lg bg-indigo px-4 py-2 font-medium text-surface transition-colors hover:bg-indigo/90"
        >
          Check In
        </button>
      </div>
      <div className="mt-8 overflow-hidden rounded-xl2 bg-surface shadow-card">
        {loading ? (
          <p className="p-6 text-muted">Loading attendance records...</p>
        ) : records.length === 0 ? (
          <p className="p-6 text-muted">No attendance records found.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-canvas/50">
              <tr className="border-b border-line text-muted">
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Check In Time</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id} className="border-b border-line/50 last:border-0 hover:bg-canvas/30">
                  <td className="p-4">{new Date(record.date).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className="rounded-full bg-success-soft px-2.5 py-0.5 text-xs font-medium text-success">
                      {record.status}
                    </span>
                  </td>
                  <td className="p-4">{new Date(record.date).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}