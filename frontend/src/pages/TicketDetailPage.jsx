import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { api } from '../services/api';
import { 
  Sparkles, CheckCircle2, Clock, AlertTriangle, ArrowLeft, Send, 
  UserCheck, ShieldAlert, Cpu, BookOpen, Layers, RefreshCw, MessageSquare, 
  RotateCcw, History, ArrowRight
} from 'lucide-react';

export default function TicketDetailPage({ user }) {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');

  const fetchTicket = () => {
    api.get(`/tickets/${id}`)
      .then(res => {
        setData(res.data);
        setSelectedTeamId(res.data.ticket.assigned_team_id || '');
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTicket();
    api.get('/teams').then(res => setTeams(res.data.teams || [])).catch(() => {});
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      await api.put(`/tickets/${id}`, {
        status: newStatus,
        performed_by: user?.name || 'Support Specialist'
      });
      fetchTicket();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePriorityChange = async (newPriority) => {
    try {
      await api.put(`/tickets/${id}`, {
        priority: newPriority,
        performed_by: user?.name || 'Support Specialist'
      });
      fetchTicket();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReassignTeam = async (e) => {
    const teamId = e.target.value;
    setSelectedTeamId(teamId);
    try {
      await api.put(`/tickets/${id}`, {
        assigned_team_id: teamId ? Number(teamId) : null,
        performed_by: user?.name || 'Support Specialist'
      });
      fetchTicket();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRerunRouting = async () => {
    try {
      await api.post(`/tickets/${id}/route`);
      fetchTicket();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    try {
      await api.post(`/tickets/${id}/comments`, {
        content: commentText.trim(),
        author_name: user?.name || 'Support Specialist',
        user_id: user?.id
      });
      setCommentText('');
      fetchTicket();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleApplyResolution = (solutionText) => {
    setCommentText(prev => prev ? `${prev}\n\n[Applied KB Solution]:\n${solutionText}` : `[Applied KB Solution]:\n${solutionText}`);
  };

  if (loading) {
    return (
      <DashboardLayout user={user} title="Ticket Details">
        <div className="card p-12 text-center text-slate-500">
          <RefreshCw size={32} className="animate-spin mx-auto mb-3 text-blue-600" />
          <p className="text-sm font-semibold">Loading ticket data and AI analysis...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!data || !data.ticket) {
    return (
      <DashboardLayout user={user} title="Ticket Not Found">
        <div className="card p-12 text-center text-slate-500 space-y-4">
          <AlertTriangle size={36} className="mx-auto text-amber-500" />
          <h2 className="text-lg font-bold text-slate-900">Ticket #{id} does not exist</h2>
          <Link to="/tickets" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft size={16} /> Return to Queue
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const { ticket, comments, history, suggestions, ai_analysis, team_name, agent_name } = data;

  const workflowSteps = ['Open', 'Assigned', 'In Progress', 'Pending', 'Resolved', 'Closed'];

  return (
    <DashboardLayout user={user} title={`Ticket #${ticket.id}: ${ticket.title}`}>
      {/* Header back bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link 
          to="/tickets" 
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-blue-600 transition"
        >
          <ArrowLeft size={16} /> Back to Ticket Queue
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">SLA Target:</span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            {ticket.sla_deadline ? new Date(ticket.sla_deadline).toLocaleString() : 'Standard 24h'}
          </span>
        </div>
      </div>

      {/* Status Workflow Bar */}
      <div className="card p-5 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Workflow State</p>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mt-0.5">
              <span className="h-3 w-3 rounded-full bg-blue-600 animate-pulse"></span>
              {ticket.status}
            </h3>
          </div>

          {/* Quick Workflow Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {ticket.status !== 'In Progress' && ticket.status !== 'Resolved' && ticket.status !== 'Closed' && (
              <button
                onClick={() => handleStatusChange('In Progress')}
                disabled={updatingStatus}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
              >
                Start Progress
              </button>
            )}

            {ticket.status === 'In Progress' && (
              <button
                onClick={() => handleStatusChange('Pending')}
                disabled={updatingStatus}
                className="px-3 py-1.5 rounded-xl bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition"
              >
                Mark Pending
              </button>
            )}

            {ticket.status !== 'Resolved' && ticket.status !== 'Closed' && (
              <button
                onClick={() => handleStatusChange('Resolved')}
                disabled={updatingStatus}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition"
              >
                Mark Resolved
              </button>
            )}

            {ticket.status === 'Resolved' && (
              <button
                onClick={() => handleStatusChange('Closed')}
                disabled={updatingStatus}
                className="px-3 py-1.5 rounded-xl bg-slate-700 text-white text-xs font-semibold hover:bg-slate-800 transition"
              >
                Close Ticket
              </button>
            )}

            {(ticket.status === 'Resolved' || ticket.status === 'Closed') && (
              <button
                onClick={() => handleStatusChange('Open')}
                disabled={updatingStatus}
                className="px-3 py-1.5 rounded-xl bg-blue-100 text-blue-700 text-xs font-semibold hover:bg-blue-200 transition flex items-center gap-1.5"
              >
                <RotateCcw size={14} /> Reopen Ticket
              </button>
            )}

            {/* Escalate button */}
            {ticket.priority !== 'Critical' && (
              <button
                onClick={() => handlePriorityChange('Critical')}
                className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold hover:bg-rose-100 transition flex items-center gap-1.5"
              >
                <ShieldAlert size={14} /> Escalate to Critical
              </button>
            )}
          </div>
        </div>

        {/* Workflow Visual Timeline */}
        <div className="grid grid-cols-6 gap-2 pt-2 border-t border-slate-100">
          {workflowSteps.map((step, idx) => {
            const isCompleted = workflowSteps.indexOf(ticket.status) >= idx;
            const isCurrent = ticket.status === step;
            return (
              <div key={step} className="flex flex-col items-center text-center">
                <div className={`h-2 w-full rounded-full mb-2 ${
                  isCurrent ? 'bg-blue-600' : isCompleted ? 'bg-blue-400' : 'bg-slate-200'
                }`}></div>
                <span className={`text-[11px] font-semibold ${
                  isCurrent ? 'text-blue-700 font-bold' : isCompleted ? 'text-slate-700' : 'text-slate-400'
                }`}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Ticket Details & AI Analysis */}
      <div className="grid gap-8 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          {/* Main Info Card */}
          <div className="card p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                  #{ticket.id}
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-2">{ticket.title}</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  ticket.priority === 'Critical' ? 'bg-rose-100 text-rose-700 border-rose-200' :
                  ticket.priority === 'High' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                  ticket.priority === 'Medium' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                  'bg-slate-100 text-slate-700 border-slate-200'
                }`}>
                  {ticket.priority} Priority
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
                  {ticket.category || ticket.predicted_category}
                </span>
              </div>
            </div>

            <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 whitespace-pre-line leading-relaxed">
              {ticket.description}
            </div>

            {/* Metadata Fields */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <p className="text-slate-400 font-medium">Submitted By</p>
                <p className="text-slate-900 font-bold mt-1 truncate">{ticket.created_by}</p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <p className="text-slate-400 font-medium">Department</p>
                <p className="text-slate-900 font-bold mt-1">{ticket.department || 'General IT'}</p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <p className="text-slate-400 font-medium">Device / System</p>
                <p className="text-slate-900 font-bold mt-1">{ticket.device || 'N/A'}</p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <p className="text-slate-400 font-medium">Location</p>
                <p className="text-slate-900 font-bold mt-1">{ticket.location || 'HQ'}</p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <p className="text-slate-400 font-medium">Affected Users</p>
                <p className="text-slate-900 font-bold mt-1">{ticket.affected_users || 1}</p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <p className="text-slate-400 font-medium">Business Impact</p>
                <p className="text-slate-900 font-bold mt-1">{ticket.business_impact || 'Low'}</p>
              </div>
            </div>
          </div>

          {/* AI Explainability & Urgency Analysis Card */}
          <div className="card p-6 border-2 border-indigo-100 bg-gradient-to-br from-white via-indigo-50/20 to-blue-50/30 shadow-md">
            <div className="flex items-center justify-between pb-4 border-b border-indigo-100">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 font-bold">
                  <Cpu size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">AI Explainability & Urgency Indicators</h3>
                  <p className="text-xs text-slate-500">Research explainability layer</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
                {ai_analysis?.ai_message || 'Demo AI Model'}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white border border-slate-200">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Predicted Category</p>
                <p className="text-lg font-bold text-slate-900 mt-1">{ticket.predicted_category || ticket.category}</p>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Transformer Confidence</span>
                  <span className="font-bold text-blue-600">{Math.round((ticket.category_confidence || 0.94) * 100)}%</span>
                </div>
                <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${Math.round((ticket.category_confidence || 0.94) * 100)}%` }}></div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Predicted Priority</p>
                <p className="text-lg font-black text-indigo-700 mt-1">{ticket.priority}</p>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-500">XGBoost Confidence</span>
                  <span className="font-bold text-indigo-600">{Math.round((ticket.priority_confidence || 0.89) * 100)}%</span>
                </div>
                <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${Math.round((ticket.priority_confidence || 0.89) * 100)}%` }}></div>
                </div>
              </div>
            </div>

            {/* Routing Reason */}
            <div className="mt-4 p-3.5 rounded-xl bg-white border border-slate-200 text-xs">
              <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Smart Routing Decision</p>
              <p className="text-slate-800 font-medium mt-1">
                {ticket.routing_reason || 'Category=Network, Priority=High -> Network Support'}
              </p>
            </div>

            {/* Extracted Salient Keywords */}
            {ai_analysis?.important_keywords && (
              <div className="mt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Extracted High-Weight Tokens
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {ai_analysis.important_keywords.map((kw, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200/60">
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Comments & Discussion */}
          <div className="card p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <MessageSquare size={18} className="text-blue-600" />
              Ticket Activity & Comments ({comments.length})
            </h3>

            {/* Comment Thread */}
            <div className="space-y-3 mb-6">
              {comments.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">No comments yet. Add an update or resolution note below.</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between font-semibold text-slate-800">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                        {comment.author_name || 'Support Agent'}
                      </span>
                      <span className="text-[11px] text-slate-400 font-normal">
                        {comment.created_at ? new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                      </span>
                    </div>
                    <p className="text-slate-600 whitespace-pre-line">{comment.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="space-y-3">
              <textarea
                rows="3"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Post an update, resolution notes, or reply to customer..."
                className="w-full rounded-xl border border-slate-300 p-3 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                required
              />
              <button
                type="submit"
                disabled={submittingComment}
                className="btn-primary text-xs font-semibold py-2 px-4 flex items-center gap-2"
              >
                <Send size={14} />
                {submittingComment ? 'Posting...' : 'Add Comment / Work Note'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Routing & KB Suggestions & History */}
        <div className="space-y-6">
          {/* Assignment Card */}
          <div className="card p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <UserCheck size={18} className="text-blue-600" />
              Routing & Assignment
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 font-medium mb-1">Assigned Support Team</label>
                <select
                  value={selectedTeamId}
                  onChange={handleReassignTeam}
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 font-semibold text-slate-800 outline-none focus:border-blue-500"
                >
                  <option value="">Unassigned</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-between items-center py-2 border-y border-slate-100">
                <span className="text-slate-500 font-medium">Assigned Agent:</span>
                <span className="font-bold text-slate-900">{agent_name || 'Unassigned'}</span>
              </div>

              <button
                type="button"
                onClick={handleRerunRouting}
                className="w-full py-2 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 font-semibold text-xs hover:bg-blue-100 transition flex items-center justify-center gap-1.5"
              >
                <RefreshCw size={14} /> Re-evaluate Smart Routing
              </button>
            </div>
          </div>

          {/* Knowledge Base Recommendations */}
          <div className="card p-6">
            <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <BookOpen size={18} className="text-blue-600" />
              Recommended KB Articles
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Semantically matched based on ticket text and predicted category:
            </p>

            <div className="space-y-3">
              {suggestions && suggestions.length > 0 ? (
                suggestions.map((item, idx) => (
                  <div key={item.id || idx} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs space-y-2">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>{item.title}</span>
                      <span className="text-blue-600 font-semibold">{item.match_score}% match</span>
                    </div>
                    <p className="text-slate-600 whitespace-pre-line line-clamp-3">{item.solution}</p>
                    <button
                      type="button"
                      onClick={() => handleApplyResolution(item.solution)}
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      Apply as resolution notes <ArrowRight size={12} />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">No matching KB articles found.</p>
              )}
            </div>
          </div>

          {/* Audit History Timeline */}
          <div className="card p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <History size={18} className="text-blue-600" />
              Activity Audit Log
            </h3>
            <div className="space-y-3 text-xs">
              {history && history.length > 0 ? (
                history.map((h) => (
                  <div key={h.id} className="flex items-start gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-blue-600 mt-1.5 shrink-0"></span>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800">{h.action}</p>
                      {h.new_value && <p className="text-slate-500">{h.new_value}</p>}
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        By {h.performed_by || 'System'} • {h.timestamp ? new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Earlier'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">No history events recorded yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
