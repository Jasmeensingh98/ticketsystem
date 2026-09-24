import DashboardLayout from '../layouts/DashboardLayout';

export default function AdminDashboardPage({ user }) {
  const cards = [
    { label: 'Total Tickets', value: 184 },
    { label: 'Open Tickets', value: 42 },
    { label: 'Resolved', value: 121 },
    { label: 'SLA Compliance', value: '86%' },
  ];

  return (
    <DashboardLayout user={user} title="Admin Dashboard">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="card p-5">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-3 text-3xl font-bold text-slate-900">{card.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <div className="card p-5">
          <h3 className="text-lg font-bold text-slate-900">Support Team Workload</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            <div className="flex justify-between"><span>Network Support</span><span>23 tickets</span></div>
            <div className="flex justify-between"><span>Hardware Support</span><span>19 tickets</span></div>
            <div className="flex justify-between"><span>Software Support</span><span>17 tickets</span></div>
            <div className="flex justify-between"><span>IAM Support</span><span>11 tickets</span></div>
          </div>
        </div>
        <div className="card p-5">
          <h3 className="text-lg font-bold text-slate-900">AI Prediction Stats</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            <div className="flex justify-between"><span>Classification Accuracy</span><span>91%</span></div>
            <div className="flex justify-between"><span>Priority Accuracy</span><span>88%</span></div>
            <div className="flex justify-between"><span>Avg Confidence</span><span>0.89</span></div>
            <div className="flex justify-between"><span>Demo Model</span><span>Enabled</span></div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
