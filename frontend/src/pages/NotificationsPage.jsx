import DashboardLayout from '../layouts/DashboardLayout';

const notifications = [
  { id: 1, message: 'Ticket #104 assigned to Network Support', type: 'info' },
  { id: 2, message: 'SLA risk detected for High-priority VPN issue', type: 'warning' },
  { id: 3, message: 'Ticket #118 resolved successfully', type: 'success' },
];

export default function NotificationsPage({ user }) {
  return (
    <DashboardLayout user={user} title="Notifications">
      <div className="card p-5">
        <div className="space-y-3">
          {notifications.map(item => (
            <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              {item.message}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
