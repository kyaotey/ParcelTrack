import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login(email, password);
      const from = location.state?.from?.pathname;
      const dest = from || (user.role === 'ADMIN' ? '/admin' : '/agent');
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  function fillDemo(type) {
    if (type === 'admin') {
      setEmail('admin@parceltrack.dev');
      setPassword('admin123');
    } else {
      setEmail('agent1@parceltrack.dev');
      setPassword('agent123');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
            <Package className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">ParcelTrack</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-1">Welcome back</h2>
          <p className="text-sm text-slate-500 mb-6">Sign in to your ParcelTrack account</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                placeholder="you@parceltrack.dev"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg transition cursor-pointer"
            >
              {submitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">
              Demo accounts
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemo('admin')}
                className="px-3 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700 transition cursor-pointer"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => fillDemo('agent')}
                className="px-3 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700 transition cursor-pointer"
              >
                Agent
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Public tracking?{' '}
          <a href="/track" className="text-indigo-600 hover:underline font-medium">
            Track a parcel →
          </a>
        </p>
      </div>
    </div>
  );
}
