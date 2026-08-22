import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Signup() {
  const [formData, setFormData] = useState({
    employeeId: '',
    email: '',
    password: '',
    role: 'Employee',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Validation rules
  const validateForm = () => {
    const { employeeId, email, password } = formData;

    if (!employeeId.trim()) {
      return 'Employee ID is required.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return 'Please enter a valid email address.';
    }

    if (password.length < 8) {
      return 'Password must be at least 8 characters long.';
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/;
    if (!passwordRegex.test(password)) {
      return 'Password must contain at least 1 uppercase letter, 1 number, and 1 special character.';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Run client-side validation first
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const response = await fetch(`${apiUrl}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 422 && Array.isArray(data.detail)) {
          const messages = data.detail.map((err) =>
            err.msg.replace('Value error, ', '')
          );
          throw new Error(messages.join(' | '));
        } else if (data.detail && typeof data.detail === 'string') {
          throw new Error(data.detail);
        } else {
          throw new Error('Failed to create account');
        }
      }

      navigate('/login');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl2 bg-surface p-8 shadow-card">
        <h1 className="font-display text-2xl font-bold text-ink">Create Account</h1>
        <p className="mt-2 text-sm text-muted">Register for Dayflow HRMS.</p>

        {error && (
          <div className="mt-4 rounded-lg bg-danger-soft p-3 text-sm font-medium text-danger">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Employee ID</label>
            <input
              type="text"
              required
              placeholder="e.g. EMP-101"
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              className="w-full rounded-lg border border-line p-2.5 outline-none focus:border-indigo"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Email</label>
            <input
              type="email"
              required
              placeholder="name@company.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded-lg border border-line p-2.5 outline-none focus:border-indigo"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Password</label>
            <input
              type="password"
              required
              placeholder="Min 8 chars, 1 uppercase, 1 number, 1 special"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full rounded-lg border border-line p-2.5 outline-none focus:border-indigo"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full rounded-lg border border-line p-2.5 outline-none focus:border-indigo"
            >
              <option value="Employee">Employee</option>
              <option value="Admin">Admin / HR</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-indigo p-2.5 font-medium text-surface transition-colors hover:bg-indigo/90"
          >
            Sign Up
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-muted">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}