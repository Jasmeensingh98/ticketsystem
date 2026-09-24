import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { api } from '../services/api';
import {
  Clock, AlertTriangle, CheckCircle, RefreshCw, ArrowRight,
  Zap, User, SortAsc, Ticket, Filter, Activity
} from 'lucide-react';

const PRIORITY_COLORS = {
  critical: 'bg-red-100 text-red-700 border border-red-200',
  high: 'bg-orange-100 text-orange-700 border border-orange-200',
  medium: 'bg-amber-100 text-amber-700 border border-amber-200',
  low: 'bg-green-100 text-green-700 border border-green-200',
};

const STATUS_COLORS = {
  open: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-purple-100 text-purple-700',
  resolved: 'bg-green-100 text-green-700',
  closed: 'bg-slate-100 text-slate-600',
};

function timeAgo(dateStr) {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function slaCountdown(deadlineStr) {
  if (!deadlineStr) return null;
  const diff = new Date(deadlineStr).getTime() - Date.now();
  if (diff <= 0) return { label: 'OVERDUE', color: 'text-red-600 font-bold' };
  const hrs = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hrs < 2) return { label: `${hrs}h ${mins}m left`, color: 'text-amber-600 font-semibold' };
  return { label: `${hrs}h ${mins}m left`, color: 'text-slate-500' };
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'priority', label: 'Priority (Critical first)' },
  { value: 'sla', label: 'SLA Deadline' },
];

const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

export default function AgentQueuePage({ user }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('my_queue');
  const [sortBy, setSortBy] = useState('priority');
  const [actionLoading, setActionLoading] = useState({});
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [openRes, inProgressRes] = await Promise.all([
        api.get('/tickets?status=open&limit=50'),
        api.get('/tickets?status=in_progress&limit=50'),
      ]);
      const all = [
        ...(openRes.data.tickets || []),
        ...(inProgressRes.data.tickets || []),
      ];
      setTickets(all);
      setLastRefreshed(new Date());
    } catch {
      setError('Failed to load tickets. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, 60000);
    return () => clearInterval(interval);
  }, [fetchTickets]);

  const myQueue = tickets.filter(
    (t) => t.assigned_agent && (
      t.assigned_agent === user?.name ||
      t.assigned_agent === user?.email
    )
  );
  const unassigned = tickets.filter((t) => !t.assigned_agent);
  const displayed = activeTab === 'my_queue' ? myQueue : unassigned;

  const sorted = [...displayed].sort((a, b) => {
    if (sortBy === 'priority') {
      return (PRIORITY_ORDER[a.priority] ?? 4) - (PRIORITY_ORDER[b.priority] ?? 4);
    }
    if (sortBy === 'sla') {
      const ta = a.sla_deadline ? new Date(a.sla_deadline).getTime() : Infinity;
      const tb = b.sla_deadline ? new Date(b.sla_deadline).getTime() : Infinity;
      return ta - tb;
    }
    return new Date(b.created_at) - new Date(a.created_at);
  });

  const criticalCount = tickets.filter((t) => t.priority === 'critical').length;
  const slaAtRisk = tickets.filter((t) => {
    if (!t.sla_deadline) return false;
    const diff = new Date(t.sla_deadline).getTime() - Date.now();
    return diff <= 7200000;
  }).length;

  async function handleAction(ticketId, updates) {
    setActionLoading((prev) => ({ ...prev, [ticketId]: true }));
    try {
      await api.put(`/tickets/${ticketId}`, updates);
      await fetchTickets();
    } catch {
      alert('Action failed. Please try again.');
    } finally {
      setActionLoading((prev) => ({ ...prev, [ticketId]: false }));
    }
  }

  return (
    <DashboardLayout user={user} title="Agent Queue">
      {/* Stats bar */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        {[
          { label: 'Active Tickets', value: myQueue.length, icon: Ticket, color: 'text-blue-600' },
          { label: 'Critical', value: criticalCount, icon: AlertTriangle, color: 'text-red-600' },
          { label: 'SLA At Risk', value: slaAtRisk, icon: Clock, color: 'text-amber-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-4 flex items-center gap-4">
            <Icon className={`w-8 h-8 ${color}`} />
            <div>
              <p className="text-2xl font-bold text-slate-900">{value}</p>
              <p className="text-sm text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        {/* Tabs */}
        <div className="flex rounded-xl border border-slate-200 overflow-hidden">
          {[
            { key: 'my_queue', label: `My Queue (${myQueue.length})` },
            { key: 'unassigned', label: `Unassigned (${unassigned.length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {/* Sort */}
          <div className="flex items-center gap-2">
            <SortAsc className="w-4 h-4 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Refresh */}
          <button
            onClick={fetchTickets}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {lastRefreshed && (
        <p className="mb-3 text-xs text-slate-400">
          Last updated: {lastRefreshed.toLocaleTimeString()} · Auto-refreshes every 60s
        </p>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Ticket Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mr-3" />
          Loading tickets...
        </div>
      ) : sorted.length === 0 ? (
        <div className="card p-12 text-center">
          <Ticket className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-lg font-semibold text-slate-500">No tickets in this queue</p>
          <p className="text-sm text-slate-400 mt-1">
            {activeTab === 'my_queue'
              ? 'You have no active tickets assigned to you.'
              : 'All tickets are assigned. Great work!'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map((ticket) => {
            const sla = slaCountdown(ticket.sla_deadline);
            const isActing = actionLoading[ticket.id];
            return (
              <div key={ticket.id} className="card p-5 hover:shadow-md transition-shadow">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  {/* Left: ticket info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-mono text-slate-400">#{ticket.id}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${PRIORITY_COLORS[ticket.priority] || 'bg-slate-100 text-slate-600'}`}>
                        {ticket.priority}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[ticket.status] || 'bg-slate-100 text-slate-600'}`}>
                        {ticket.status?.replace('_', ' ')}
                      </span>
                      {ticket.category && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600 border border-slate-200">
                          {ticket.category}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-semibold text-slate-900 truncate">{ticket.title}</h3>

                    <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {timeAgo(ticket.created_at)}
                      </span>
                      {ticket.assigned_agent && (
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          {ticket.assigned_agent}
                        </span>
                      )}
                      {sla && (
                        <span className={`flex items-center gap-1 ${sla.color}`}>
                          <AlertTriangle className="w-3.5 h-3.5" />
                          SLA: {sla.label}
                        </span>
                      )}
                    </div>

                    {ticket.routing_reason && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 rounded-lg px-2 py-1 w-fit">
                        <Zap className="w-3.5 h-3.5" />
                        <span>AI Routing: {ticket.routing_reason}</span>
                      </div>
                    )}
                  </div>

                  {/* Right: actions */}
                  <div className="flex flex-col gap-2 min-w-[160px]">
                    <Link
                      to={`/tickets/${ticket.id}`}
                      className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      View Details <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    {activeTab === 'unassigned' && (
                      <button
                        onClick={() => handleAction(ticket.id, { status: 'in_progress' })}
                        disabled={isActing}
                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                      >
                        {isActing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5" />}
                        Take Ticket
                      </button>
                    )}

                    {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                      <button
                        onClick={() => handleAction(ticket.id, { status: 'resolved' })}
                        disabled={isActing}
                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm text-green-700 border border-green-200 rounded-lg hover:bg-green-50 disabled:opacity-50 transition-colors"
                      >
                        {isActing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
