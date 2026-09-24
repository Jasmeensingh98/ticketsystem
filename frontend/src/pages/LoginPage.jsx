import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { ShieldCheck, UserCheck, User, Sparkles, ArrowRight } from 'lucide-react';

export default function LoginPage({ setUser }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: 'user@demo.com', password: 'password' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fillCredentials = (email, password = 'password') => {
    setForm({ email, password });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', form);
      localStorage.setItem('token', res.data.token);
      api.defaults.headers.Authorization = `Bearer ${res.data.token}`;
      setUser(res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to login. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 p-6">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200/80 bg-white/95 p-8 shadow-xl backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-lg shadow-md shadow-blue-500/25">
            AI
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 leading-tight">Helpdesk AI Platform</h2>
            <p className="text-xs text-blue-600 font-medium">Enterprise Ticket Intelligence</p>
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-black text-slate-900">Sign in to your account</h1>
          <p className="mt-1 text-sm text-slate-500">Access automated triage, routing, and resolution metrics.</p>
        </div>

        {/* 1-Click Demo Logins */}
        <div className="mb-6 rounded-2xl bg-slate-50 p-4 border border-slate-200">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
            <Sparkles size={14} className="text-blue-600" /> One-Click Demo Profiles
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillCredentials('user@demo.com')}
              className={`flex flex-col items-center p-2.5 rounded-xl border text-center transition ${
                form.email === 'user@demo.com' ? 'border-blue-500 bg-blue-50/80 text-blue-700 font-semibold' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              <User size={16} className="mb-1 text-blue-600" />
              <span className="text-xs font-medium">End User</span>
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('agent@demo.com')}
              className={`flex flex-col items-center p-2.5 rounded-xl border text-center transition ${
                form.email === 'agent@demo.com' ? 'border-indigo-500 bg-indigo-50/80 text-indigo-700 font-semibold' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              <UserCheck size={16} className="mb-1 text-indigo-600" />
              <span className="text-xs font-medium">Support Agent</span>
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('admin@demo.com')}
              className={`flex flex-col items-center p-2.5 rounded-xl border text-center transition ${
                form.email === 'admin@demo.com' ? 'border-purple-500 bg-purple-50/80 text-purple-700 font-semibold' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck size={16} className="mb-1 text-purple-600" />
              <span className="text-xs font-medium">IT Admin</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">Email Address</label>
            <input 
              type="email"
              value={form.email} 
              onChange={(e) => setForm({ ...form, email: e.target.value })} 
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" 
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">Password</label>
            <input 
              type="password" 
              value={form.password} 
              onChange={(e) => setForm({ ...form, password: e.target.value })} 
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" 
              required
            />
          </div>

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-medium text-rose-700">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition hover:opacity-95 disabled:opacity-50 flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In to Portal'}
            <ArrowRight size={16} />
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Need a researcher or user account?{' '}
          <Link to="/register" className="font-semibold text-blue-600 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
