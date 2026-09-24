import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Bell, LayoutDashboard, Ticket, Briefcase, Users, Gauge, BookOpen, 
  Settings, LogOut, Sparkles, ShieldCheck, Database, FileText, 
  CheckCircle2, Network, UserCheck, Layers
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function DashboardLayout({ user, children, title }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    api.get('/notifications').then(res => {
      const unread = (res.data.notifications || []).filter(n => !n.read).length;
      setUnreadCount(unread);
    }).catch(() => {});
  }, [location.pathname]);

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.Authorization;
    navigate('/login');
  };

  const switchRole = async (targetEmail) => {
    try {
      const res = await api.post('/auth/login', { email: targetEmail, password: 'password' });
      localStorage.setItem('token', res.data.token);
      api.defaults.headers.Authorization = `Bearer ${res.data.token}`;
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  const isCurrent = (path) => location.pathname === path;

  const mainNav = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Create Ticket', path: '/tickets/new', icon: Ticket },
    { label: 'My Tickets', path: '/tickets', icon: Briefcase },
    { label: 'Knowledge Base', path: '/knowledge-base', icon: BookOpen },
    { label: 'Analytics', path: '/analytics', icon: Gauge },
    { label: 'AI Evaluation', path: '/ai-evaluation', icon: Sparkles },
    { label: 'Support Teams', path: '/teams', icon: Users },
  ];

  const agentNav = [
    { label: 'Agent Dashboard', path: '/agent', icon: UserCheck },
    { label: 'Support Queue', path: '/agent/queue', icon: Layers },
  ];

  const adminNav = [
    { label: 'Admin Center', path: '/admin', icon: ShieldCheck },
    { label: 'Dataset Manager', path: '/dataset-management', icon: Database },
    { label: 'User Directory', path: '/users', icon: Users },
    { label: 'Routing Rules', path: '/routing-rules', icon: Network },
  ];

  const systemNav = [
    { label: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount },
    { label: 'API Reference', path: '/docs', icon: FileText },
    { label: 'Profile & Settings', path: '/profile', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Sidebar */}
      <aside className="w-72 border-r border-slate-200 bg-white flex flex-col fixed inset-y-0 z-30">
        <div className="p-5 border-b border-slate-200">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold shadow-md shadow-blue-500/20">
              AI
            </div>
            <div>
              <p className="text-base font-bold text-slate-900 leading-tight">Helpdesk AI</p>
              <p className="text-xs text-blue-600 font-medium tracking-wide">Enterprise Triage</p>
            </div>
          </Link>
        </div>

        {/* Quick Demo Switcher */}
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Switch Demo Role</p>
          <div className="grid grid-cols-3 gap-1.5 text-xs font-semibold">
            <button 
              onClick={() => switchRole('user@demo.com')} 
              className={`px-2 py-1 rounded-md text-center transition ${user?.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}`}
            >
              User
            </button>
            <button 
              onClick={() => switchRole('agent@demo.com')} 
              className={`px-2 py-1 rounded-md text-center transition ${user?.role === 'agent' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}`}
            >
              Agent
            </button>
            <button 
              onClick={() => switchRole('admin@demo.com')} 
              className={`px-2 py-1 rounded-md text-center transition ${user?.role === 'admin' ? 'bg-purple-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}`}
            >
              Admin
            </button>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-5">
          <div>
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Core Workflows</p>
            <nav className="space-y-1">
              {mainNav.map(({ label, path, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition ${
                    isCurrent(path) 
                      ? 'bg-blue-50 text-blue-700 font-semibold' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon size={18} className={isCurrent(path) ? 'text-blue-600' : 'text-slate-400'} />
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {(user?.role === 'agent' || user?.role === 'admin') && (
            <div>
              <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-indigo-500 mb-1">Agent Operations</p>
              <nav className="space-y-1">
                {agentNav.map(({ label, path, icon: Icon }) => (
                  <Link
                    key={path}
                    to={path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition ${
                      isCurrent(path) 
                        ? 'bg-indigo-50 text-indigo-700 font-semibold' 
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon size={18} className={isCurrent(path) ? 'text-indigo-600' : 'text-slate-400'} />
                    {label}
                  </Link>
                ))}
              </nav>
            </div>
          )}

          {user?.role === 'admin' && (
            <div>
              <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-purple-600 mb-1">Administration</p>
              <nav className="space-y-1">
                {adminNav.map(({ label, path, icon: Icon }) => (
                  <Link
                    key={path}
                    to={path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition ${
                      isCurrent(path) 
                        ? 'bg-purple-50 text-purple-700 font-semibold' 
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon size={18} className={isCurrent(path) ? 'text-purple-600' : 'text-slate-400'} />
                    {label}
                  </Link>
                ))}
              </nav>
            </div>
          )}

          <div>
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">System & Tools</p>
            <nav className="space-y-1">
              {systemNav.map(({ label, path, icon: Icon, badge }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition ${
                    isCurrent(path) 
                      ? 'bg-slate-100 text-slate-900 font-semibold' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className={isCurrent(path) ? 'text-blue-600' : 'text-slate-400'} />
                    {label}
                  </div>
                  {badge > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                      {badge}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* User bar & Logout */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-slate-700 to-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
                {user?.name ? user.name[0] : 'U'}
              </div>
              <div className="truncate">
                <p className="text-sm font-semibold text-slate-900 truncate">{user?.name || 'Demo User'}</p>
                <p className="text-xs text-slate-500 truncate capitalize">{user?.role || 'user'}</p>
              </div>
            </div>
            <button 
              onClick={logout} 
              title="Logout" 
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-72 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{title}</h1>
          </div>

          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              AI Service Active
            </span>

            <Link 
              to="/notifications" 
              className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
              title="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>

            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                user?.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                user?.role === 'agent' ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {user?.role || 'user'}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
