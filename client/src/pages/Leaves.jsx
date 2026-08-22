import { useState, useEffect } from 'react';
import Layout from '../components/Layout';

export default function Leaves() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [leaveType, setLeaveType] = useState('Sick Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [remarks, setRemarks] = useState('');

  const userId = 1;

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = () => {
    fetch(`${import.meta.env.VITE_API_URL}/leave/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setRequests(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch leaves:", err);
        setLoading(false);
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/leave/request?user_id=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leave_type: leaveType,
          start_date: new Date(startDate).toISOString(),
          end_date: new Date(endDate).toISOString(),
          remarks: remarks
        }),
      });

      if (!response.ok) throw new Error('Failed to submit leave request');
      
      setShowForm(false);
      fetchLeaves(); 
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink">Leave Requests</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-indigo px-4 py-2 font-medium text-surface transition-colors hover:bg-indigo/90"
        >
          {showForm ? 'Cancel' : 'Request Leave'}
        </button>
      </div>

      {showForm && (
        <div className="mt-8 rounded-xl2 bg-surface p-6 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-ink">Leave Type</label>
                <select 
                  value={leaveType} 
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full rounded-lg border border-line p-2.5 outline-none focus:border-indigo"
                >
                  <option>Sick Leave</option>
                  <option>Casual Leave</option>
                  <option>Annual Leave</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-ink">Remarks</label>
                <input 
                  type="text" 
                  value={remarks} 
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full rounded-lg border border-line p-2.5 outline-none focus:border-indigo" 
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-ink">Start Date</label>
                <input 
                  type="date" 
                  required
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-lg border border-line p-2.5 outline-none focus:border-indigo" 
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-ink">End Date</label>
                <input 
                  type="date" 
                  required
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-lg border border-line p-2.5 outline-none focus:border-indigo" 
                />
              </div>
            </div>
            <button type="submit" className="rounded-lg bg-indigo px-4 py-2 font-medium text-surface">
              Submit Request
            </button>
          </form>
        </div>
      )}

      <div className="mt-8 overflow-hidden rounded-xl2 bg-surface shadow-card">
        {loading ? (
          <p className="p-6 text-muted">Loading leave records...</p>
        ) : requests.length === 0 ? (
          <p className="p-6 text-muted">No leave history found.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-canvas/50">
              <tr className="border-b border-line text-muted">
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Start Date</th>
                <th className="p-4 font-medium">End Date</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id} className="border-b border-line/50 last:border-0 hover:bg-canvas/30">
                  <td className="p-4 font-medium text-ink">{req.leave_type}</td>
                  <td className="p-4">{new Date(req.start_date).toLocaleDateString()}</td>
                  <td className="p-4">{new Date(req.end_date).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      req.status === 'Pending' ? 'bg-warning-soft text-warning' : 
                      req.status === 'Approved' ? 'bg-success-soft text-success' : 
                      'bg-danger-soft text-danger'
                    }`}>
                      {req.status}
                    </span>
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