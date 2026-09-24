import DashboardLayout from '../layouts/DashboardLayout';
import { BarChart3, PieChart as PieChartIcon, Activity } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line } from 'recharts';

const categoryData = [
  { name: 'Hardware', value: 16 },
  { name: 'Software', value: 28 },
  { name: 'Network', value: 33 },
  { name: 'Access', value: 19 },
  { name: 'Other', value: 12 },
];
const priorityData = [
  { name: 'Critical', value: 9 },
  { name: 'High', value: 18 },
  { name: 'Medium', value: 26 },
  { name: 'Low', value: 10 },
];
const volumeData = [
  { name: 'Jan', tickets: 30 },
  { name: 'Feb', tickets: 45 },
  { name: 'Mar', tickets: 49 },
  { name: 'Apr', tickets: 52 },
  { name: 'May', tickets: 67 },
  { name: 'Jun', tickets: 61 },
];
const colors = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'];

export default function AnalyticsPage({ user }) {
  return (
    <DashboardLayout user={user} title="Analytics">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total tickets', value: '432' },
          { label: 'Avg first response', value: '2.4h' },
          { label: 'Avg resolution', value: '8.7h' },
          { label: 'SLA compliance', value: '86%' },
        ].map((stat) => (
          <div key={stat.label} className="card p-5">
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className="mt-3 text-3xl font-bold text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-4 text-lg font-bold text-slate-900">Ticket Categories</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90}>
                {categoryData.map((entry, index) => <Cell fill={colors[index % colors.length]} key={entry.name} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="mb-4 text-lg font-bold text-slate-900">Priority Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={priorityData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8b5cf6" radius={[8,8,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5 xl:col-span-2">
          <h3 className="mb-4 text-lg font-bold text-slate-900">Ticket Volume Over Time</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={volumeData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="tickets" stroke="#3b82f6" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  );
}
