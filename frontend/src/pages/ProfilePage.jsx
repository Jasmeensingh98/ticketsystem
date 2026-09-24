import DashboardLayout from '../layouts/DashboardLayout';

export default function ProfilePage({ user }) {
  return (
    <DashboardLayout user={user} title="Profile Settings">
      <div className="card max-w-2xl p-6">
        <h2 className="text-xl font-bold text-slate-900">Profile</h2>
        <div className="mt-5 space-y-4 text-sm text-slate-700">
          <div><span className="font-semibold">Name:</span> {user?.name}</div>
          <div><span className="font-semibold">Email:</span> {user?.email}</div>
          <div><span className="font-semibold">Department:</span> {user?.department || 'IT Support'}</div>
          <div><span className="font-semibold">Role:</span> {user?.role}</div>
        </div>
      </div>
    </DashboardLayout>
  );
}
