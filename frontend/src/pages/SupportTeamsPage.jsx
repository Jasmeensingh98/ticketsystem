import DashboardLayout from '../layouts/DashboardLayout';

const teams = [
  { name: 'Hardware Support', members: 4, workload: 'Medium' },
  { name: 'Software Support', members: 6, workload: 'High' },
  { name: 'Network Support', members: 5, workload: 'High' },
  { name: 'IAM Support', members: 3, workload: 'Medium' },
  { name: 'General IT Support', members: 2, workload: 'Low' },
];

export default function SupportTeamsPage({ user }) {
  return (
    <DashboardLayout user={user} title="Support Teams">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {teams.map(team => (
          <div key={team.name} className="card p-5">
            <h3 className="text-lg font-bold text-slate-900">{team.name}</h3>
            <p className="mt-2 text-sm text-slate-600">Members: {team.members}</p>
            <p className="mt-1 text-sm text-slate-600">Workload: {team.workload}</p>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
