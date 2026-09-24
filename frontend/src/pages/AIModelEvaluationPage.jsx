import DashboardLayout from '../layouts/DashboardLayout';

const metrics = [
  { name: 'Classification Accuracy', value: 'Demo / Placeholder Metrics', type: 'Accuracy' },
  { name: 'Precision', value: 'Demo / Placeholder Metrics', type: 'Precision' },
  { name: 'Recall', value: 'Demo / Placeholder Metrics', type: 'Recall' },
  { name: 'F1 Score', value: 'Demo / Placeholder Metrics', type: 'F1 Score' },
];

export default function AIModelEvaluationPage({ user }) {
  return (
    <DashboardLayout user={user} title="AI Model Evaluation">
      <div className="grid gap-6 md:grid-cols-2">
        {metrics.map((metric) => (
          <div key={metric.name} className="card p-5">
            <h3 className="text-lg font-bold text-slate-900">{metric.name}</h3>
            <p className="mt-4 text-sm text-slate-600">{metric.value}</p>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
