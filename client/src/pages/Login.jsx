import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { saveSession, getHomeRoute } from '../lib/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const response = await fetch(`${apiUrl}/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          username: email, 
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Invalid email or password');
      }

      saveSession(data);
      navigate(getHomeRoute());
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl2 bg-surface p-8 shadow-card">
        <h1 className="font-display text-2xl font-bold text-ink">Welcome to Dayflow</h1>
        <p className="mt-2 text-sm text-muted">Sign in to manage your HR tasks.</p>

        {error && <p className="mt-4 rounded bg-danger-soft p-3 text-sm text-danger">{error}</p>}

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-line p-2.5 outline-none focus:border-indigo"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-line p-2.5 outline-none focus:border-indigo"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-indigo p-2.5 font-medium text-surface transition-colors hover:bg-indigo/90"
          >
            Sign In
          </button>
        </form>
        
        {/* Added Sign Up Link Here */}
        <p className="mt-4 text-center text-sm text-muted">
          Don't have an account? <Link to="/signup" className="text-indigo hover:underline">Sign up</Link>
        </p>

      </div>
    </div>
  );
}