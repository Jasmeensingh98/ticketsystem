import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { api } from '../services/api';
import { 
  Search, Filter, Plus, ArrowUpRight, Clock, AlertTriangle, 
  CheckCircle, RefreshCw, XCircle, RotateCcw
} from 'lucide-react';

export default function MyTicketsPage({ user }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const fetchTickets = () => {
    setLoading(true);
    const params = {};
    if (statusFilter !== 'all') params.status = statusFilter;
    if (priorityFilter !== 'all') params.priority = priorityFilter;
    if (categoryFilter !== 'all') params.category = categoryFilter;
    if (search.trim()) params.search = search.trim();

    api.get('/tickets', { params })
      .then(res => setTickets(res.data.tickets || []))
      .catch(err => console.error('Failed to load tickets', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, priorityFilter, categoryFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTickets();
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      await api.put(`/tickets/${ticketId}`, { 
        status: newStatus,
        performed_by: user?.name || 'User'
      });
      fetchTickets();
    } catch (err) {
      console.error('Failed to update ticket status', err);
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'Critical':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'High':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Medium':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Low':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Open':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Assigned':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'In Progress':
        return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'Pending':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Resolved':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Closed':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <DashboardLayout user={user} title="Support Tickets Queue">
      {/* Top action row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tickets by title, keyword, ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </form>

        {/* Filters and CTA */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-700 outline-none focus:border-blue-500"
          >
            <option value="all">Status: All</option>
            <option value="Open">Open</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Pending">Pending</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-700 outline-none focus:border-blue-500"
          >
            <option value="all">Priority: All</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-700 outline-none focus:border-blue-500"
          >
            <option value="all">Category: All</option>
            <option value="Network">Network</option>
            <option value="Hardware">Hardware</option>
            <option value="Software">Software</option>
            <option value="Access Management">Access Management</option>
            <option value="Other">Other</option>
          </select>

          <button
            onClick={fetchTickets}
            title="Refresh"
            className="p-2.5 rounded-xl border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 transition"
          >
            <RefreshCw size={16} />
          </button>

          <Link
            to="/tickets/new"
            className="btn-primary flex items-center gap-2 text-xs font-semibold py-2.5"
          >
            <Plus size={16} />
            Create Ticket
          </Link>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-500">
            <RefreshCw size={28} className="animate-spin mx-auto mb-3 text-blue-600" />
            <p className="text-sm font-medium">Loading ticket queue from database...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <CheckCircle size={36} className="mx-auto mb-3 text-slate-300" />
            <p className="text-base font-bold text-slate-800">No tickets found</p>
            <p className="text-xs text-slate-400 mt-1">Try resetting the filters or submit a new ticket.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4">Ticket</th>
                  <th className="px-6 py-4">AI Category</th>
                  <th className="px-6 py-4">AI Priority</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Created Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-50/60 transition group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                          #{ticket.id}
                        </span>
                        <div>
                          <Link 
                            to={`/tickets/${ticket.id}`} 
                            className="font-semibold text-slate-900 group-hover:text-blue-600 transition block max-w-md truncate"
                          >
                            {ticket.title}
                          </Link>
                          <p className="text-xs text-slate-400 truncate max-w-sm">
                            {ticket.description}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800 text-xs">
                          {ticket.predicted_category || ticket.category || 'Other'}
                        </span>
                        {ticket.category_confidence > 0 && (
                          <span className="text-[10px] text-blue-600 font-medium">
                            {Math.round(ticket.category_confidence * 100)}% conf
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className={`inline-flex items-center w-fit px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getPriorityBadge(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                        {ticket.priority_confidence > 0 && (
                          <span className="text-[10px] text-slate-400 mt-0.5">
                            {Math.round(ticket.priority_confidence * 100)}% conf
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                      {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : 'Today'}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {ticket.status === 'Resolved' || ticket.status === 'Closed' ? (
                          <button
                            onClick={() => handleStatusChange(ticket.id, 'Open')}
                            className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1 transition"
                            title="Reopen Ticket"
                          >
                            <RotateCcw size={12} /> Reopen
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(ticket.id, 'Resolved')}
                            className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-medium flex items-center gap-1 transition"
                            title="Mark as Resolved"
                          >
                            <CheckCircle size={12} /> Resolve
                          </button>
                        )}
                        <Link
                          to={`/tickets/${ticket.id}`}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 text-slate-600 transition"
                          title="View Details"
                        >
                          <ArrowUpRight size={15} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
