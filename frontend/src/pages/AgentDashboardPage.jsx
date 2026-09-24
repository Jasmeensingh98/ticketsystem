import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { api } from '../services/api';
import { 
  UserCheck, AlertTriangle, Clock, CheckCircle2, ArrowUpRight, 
  Layers, Sparkles, ShieldAlert, RefreshCw
} from 'lucide-react';

export default function AgentDashboardPage({ user }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState({});

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.get('/tickets'),
      api.get('/analytics/overview')
    ]).then(([ticketsRes, overviewRes]) => {
      setTickets(ticketsRes.data.tickets || []);
      setOverview(overviewRes.data || {});
    }).catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const openTickets = tickets.filter(t => ['Open', 'Assigned', 'In Progress', 'Pending', 'AI Processing'].includes(t.status));
  const highPriorityTickets = tickets.filter(t => ['Critical', 'High'].includes(t.priority));
  const resolvedTickets = tickets.filter(t => ['Resolved', 'Closed'].includes(t.status));

  return (
    <DashboardLayout user={user} title="Support Agent Command Center">
      {/* Top Agent Metrics */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="card p-5 border-l-4 border-l-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Queue</p>
              <p className="mt-2 text-3xl font-black text-slate-900">{openTickets.length}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Layers size={24} />
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500">Awaiting resolution or update</p>
        </div>

        <div className="card p-5 border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Critical & High</p>
              <p className="mt-2 text-3xl font-black text-rose-600">{highPriorityTickets.length}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <ShieldAlert size={24} />
            </div>
          </div>
          <p className="mt-2 text-xs text-rose-600 font-medium">Elevated SLA urgency</p>
        </div>

        <div className="card p-5 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Resolved</p>
              <p className="mt-2 text-3xl font-black text-purple-700">{resolvedTickets.length}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
              <CheckCircle2 size={24} />
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500">Successfully closed issues</p>
        </div>

        <div className="card p-5 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">SLA Compliance</p>
              <p className="mt-2 text-3xl font-black text-emerald-600">
                {Math.round((overview.sla_compliance || 0.88) * 100)}%
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Clock size={24} />
            </div>
          </div>
          <p className="mt-2 text-xs text-emerald-700 font-medium">Within target response window</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        {/* Priority Triage Queue */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Urgent Support Queue</h2>
              <p className="text-xs text-slate-500">Tickets prioritized by XGBoost machine learning model</p>
            </div>
            <Link
              to="/agent/queue"
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              Full Queue View <ArrowUpRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400">
              <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-blue-600" />
              Loading tickets...
            </div>
          ) : openTickets.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <CheckCircle2 size={32} className="mx-auto mb-2 text-emerald-500" />
              <p className="text-sm font-semibold text-slate-700">All caught up!</p>
              <p className="text-xs text-slate-400">No open tickets requiring urgent action.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {openTickets.slice(0, 6).map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[11px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                        #{ticket.id}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        ticket.priority === 'Critical' ? 'bg-rose-100 text-rose-700 border-rose-200' :
                        ticket.priority === 'High' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                        'bg-blue-100 text-blue-700 border-blue-200'
                      }`}>
                        {ticket.priority}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        • {ticket.category || ticket.predicted_category}
                      </span>
                    </div>
                    <Link
                      to={`/tickets/${ticket.id}`}
                      className="font-semibold text-sm text-slate-900 hover:text-blue-600 block truncate"
                    >
                      {ticket.title}
                    </Link>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs px-2.5 py-1 rounded-full bg-slate-200/80 text-slate-700 font-semibold">
                      {ticket.status}
                    </span>
                    <Link
                      to={`/tickets/${ticket.id}`}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition"
                    >
                      Triage
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Tools & Tips */}
        <div className="space-y-6">
          <div className="card p-6 border border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-blue-50/30">
            <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Sparkles size={18} className="text-indigo-600" />
              AI Automated Triage
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tickets are automatically evaluated via DistilBERT NLP and XGBoost feature vectorization upon arrival. The system recommends resolutions from internal Knowledge Base articles.
            </p>
            <div className="mt-4 pt-4 border-t border-indigo-100/80 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Category NLP Model:</span>
                <span className="font-bold text-slate-900">DistilBERT / BERT</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Priority Classifier:</span>
                <span className="font-bold text-slate-900">XGBoost (8 Features)</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Knowledge Retrieval:</span>
                <span className="font-bold text-slate-900">Semantic Token Matching</span>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">Quick Navigation</h3>
            <div className="space-y-2">
              <Link
                to="/agent/queue"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition text-xs font-semibold text-slate-800"
              >
                <span>Full Agent Queue</span>
                <ArrowUpRight size={14} className="text-slate-400" />
              </Link>
              <Link
                to="/knowledge-base"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition text-xs font-semibold text-slate-800"
              >
                <span>Search Knowledge Base</span>
                <ArrowUpRight size={14} className="text-slate-400" />
              </Link>
              <Link
                to="/ai-evaluation"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition text-xs font-semibold text-slate-800"
              >
                <span>AI Model Performance & Viva Page</span>
                <ArrowUpRight size={14} className="text-slate-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
