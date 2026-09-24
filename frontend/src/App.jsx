import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CreateTicketPage from './pages/CreateTicketPage';
import MyTicketsPage from './pages/MyTicketsPage';
import TicketDetailPage from './pages/TicketDetailPage';
import AgentDashboardPage from './pages/AgentDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AnalyticsPage from './pages/AnalyticsPage';
import KnowledgeBasePage from './pages/KnowledgeBasePage';
import SupportTeamsPage from './pages/SupportTeamsPage';
import UserManagementPage from './pages/UserManagementPage';
import RoutingRulesPage from './pages/RoutingRulesPage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import AIModelEvaluationPage from './pages/AIModelEvaluationPage';
import { api } from './services/api';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.Authorization = `Bearer ${token}`;
      api.get('/auth/me').then(res => setUser(res.data.user)).catch(() => {
        localStorage.removeItem('token');
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-600">Loading application...</div>;

  return (
    <Routes>
      <Route path="/" element={<LandingPage user={user} />} />
      <Route path="/login" element={<LoginPage setUser={setUser} />} />
      <Route path="/register" element={<RegisterPage setUser={setUser} />} />
      <Route path="/dashboard" element={user ? <DashboardPage user={user} /> : <Navigate to="/login" />} />
      <Route path="/tickets/new" element={user ? <CreateTicketPage user={user} /> : <Navigate to="/login" />} />
      <Route path="/tickets" element={user ? <MyTicketsPage user={user} /> : <Navigate to="/login" />} />
      <Route path="/tickets/:id" element={user ? <TicketDetailPage user={user} /> : <Navigate to="/login" />} />
      <Route path="/agent" element={user ? <AgentDashboardPage user={user} /> : <Navigate to="/login" />} />
      <Route path="/admin" element={user && user.role === 'admin' ? <AdminDashboardPage user={user} /> : <Navigate to="/login" />} />
      <Route path="/analytics" element={user ? <AnalyticsPage user={user} /> : <Navigate to="/login" />} />
      <Route path="/knowledge-base" element={user ? <KnowledgeBasePage user={user} /> : <Navigate to="/login" />} />
      <Route path="/teams" element={user ? <SupportTeamsPage user={user} /> : <Navigate to="/login" />} />
      <Route path="/users" element={user && user.role === 'admin' ? <UserManagementPage user={user} /> : <Navigate to="/login" />} />
      <Route path="/routing-rules" element={user && user.role === 'admin' ? <RoutingRulesPage user={user} /> : <Navigate to="/login" />} />
      <Route path="/profile" element={user ? <ProfilePage user={user} /> : <Navigate to="/login" />} />
      <Route path="/notifications" element={user ? <NotificationsPage user={user} /> : <Navigate to="/login" />} />
      <Route path="/ai-evaluation" element={user ? <AIModelEvaluationPage user={user} /> : <Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
