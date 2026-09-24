import DashboardLayout from '../layouts/DashboardLayout';

const rules = [
  { category: 'Hardware', priority: 'Critical', team: 'Hardware Support' },
  { category: 'Software', priority: 'High', team: 'Software Support' },
  { category: 'Network', priority: 'High', team: 'Network Support' },
  { category: 'Access Management', priority: 'Critical', team: 'IAM Support' },
  { category: 'Other', priority: 'Medium', team: 'General IT Support' },
];

export default function RoutingRulesPage({ user }) {
  return (
    <DashboardLayout user={user} title="Routing Rules">
      <div className="card p-5">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-600">
              <th className="py-3 pr-4">Category</th>
              <th className="py-3 pr-4">Priority</th>
              <th className="py-3 pr-4">Assigned Team</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((rule) => (
              <tr key={`${rule.category}-${rule.priority}`} className="border-b border-slate-100">
                <td className="py-3 pr-4 font-medium text-slate-900">{rule.category}</td>
                <td className="py-3 pr-4">{rule.priority}</td>
                <td className="py-3 pr-4">{rule.team}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
