import { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { api } from '../services/api';
import { BarChart3, CircleDashed, Gauge, Ticket, Users, Clock3, ShieldCheck } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const palette = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'];

export default function DashboardPage({ user }) {
  const [overview, setOverview] = useState({});
  const [categories, setCategories] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/analytics/overview'),
      api.get('/analytics/categories'),
      api.get('/analytics/priorities'),
      api.get('/tickets')
    ]).then(([overviewRes, categoriesRes, prioritiesRes, ticketsRes]) => {
      setOverview(overviewRes.data);
      setCategories(categoriesRes.data.categories || []);
      setPriorities(prioritiesRes.data.priorities || []);
      setTickets(ticketsRes.data.tickets || []);
    }).catch(() => {
      setOverview({ total_tickets: 0, open_tickets: 0, critical_tickets: 0, high_priority_tickets: 0, resolved_tickets: 0, average_resolution_time: 0, sla_compliance: 0, ai_classification_accuracy: 0 });
    });
  }, []);

  const stats = [
    { label: 'Total Tickets', value: overview.total_tickets || 0, icon: Ticket, color: 'bg-blue-100 text-blue-600' },
    { label: 'Open Tickets', value: overview.open_tickets || 0, icon: CircleDashed, color: 'bg-violet-100 text-violet-600' },
    { label: 'Critical', value: overview.critical_tickets || 0, icon: ShieldCheck, color: 'bg-amber-100 text-amber-600' },
    { label: 'High Priority', value: overview.high_priority_tickets || 0, icon: Gauge, color: 'bg-emerald-100 text-emerald-600' },
  ];

  return (
    <DashboardLayout user={user} title="Dashboard">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{label}</p>
                <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
                <Icon size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-4 text-lg font-bold text-slate-900">Tickets by Category</h3>
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={categories} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={4}>
                  {categories.map((entry, index) => <Cell key={entry.name} fill={palette[index % palette.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="mb-4 text-lg font-bold text-slate-900">Tickets by Priority</h3>
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer>
              <BarChart data={priorities}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-8 card p-5">
        <h3 className="mb-4 text-lg font-bold text-slate-900">Recent Tickets</h3>
        <div className="space-y-3">
          {tickets.slice(0, 5).map(ticket => (
            <div key={ticket.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div>
                <p className="font-semibold text-slate-900">#{ticket.id} {ticket.title}</p>
                <p className="text-sm text-slate-500">{ticket.predicted_category || ticket.category || 'Other'} • {ticket.priority}</p>
              </div>
              <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">{ticket.status}</span>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
