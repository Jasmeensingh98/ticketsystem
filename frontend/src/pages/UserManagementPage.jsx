import DashboardLayout from '../layouts/DashboardLayout';

const users = [
  { name: 'Demo User', email: 'user@demo.com', role: 'User' },
  { name: 'Agent Taylor', email: 'agent@demo.com', role: 'Agent' },
  { name: 'Admin Morgan', email: 'admin@demo.com', role: 'Admin' },
];

export default function UserManagementPage({ user }) {
  return (
    <DashboardLayout user={user} title="User Management">
      <div className="card p-5">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-600">
              <th className="py-3 pr-4">Name</th>
              <th className="py-3 pr-4">Email</th>
              <th className="py-3 pr-4">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((entry) => (
              <tr key={entry.email} className="border-b border-slate-100">
                <td className="py-3 pr-4 font-medium text-slate-900">{entry.name}</td>
                <td className="py-3 pr-4">{entry.email}</td>
                <td className="py-3 pr-4"><span className="badge bg-slate-100 text-slate-700">{entry.role}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
