import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getUserId } from '../lib/auth';

export default function Attendance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = getUserId();

  const loadRecords = () => {
    if (!userId) {
      setLoading(false);
      return;
    }
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
  };

  useEffect(() => {
    loadRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const todayStr = new Date().toDateString();
  const todayRecord = records.find((r) => new Date(r.date).toDateString() === todayStr);
  const checkedIn = Boolean(todayRecord?.check_in_time);
  const checkedOut = Boolean(todayRecord?.check_out_time);

  const handleCheckIn = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/attendance/check-in?user_id=${userId}`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Check-in failed');

      await response.json();
      loadRecords();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckOut = async () => {
    if (!todayRecord) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/attendance/check-out/${todayRecord.id}`, {
        method: 'PUT',
      });

      if (!response.ok) throw new Error('Check-out failed');

      await response.json();
      loadRecords();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink">Attendance</h1>
        {!checkedOut && (
          <button
            onClick={checkedIn ? handleCheckOut : handleCheckIn}
            className="rounded-lg bg-indigo px-4 py-2 font-medium text-surface transition-colors hover:bg-indigo/90"
          >
            {checkedIn ? 'Check Out' : 'Check In'}
          </button>
        )}
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
                  <td className="p-4">{record.check_in_time ? new Date(record.check_in_time).toLocaleTimeString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}