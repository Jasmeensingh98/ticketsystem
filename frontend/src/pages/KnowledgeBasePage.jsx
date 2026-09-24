import { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { api } from '../services/api';

export default function KnowledgeBasePage({ user }) {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    api.get('/knowledge-base').then(res => setArticles(res.data.articles || [])).catch(() => setArticles([]));
  }, []);

  return (
    <DashboardLayout user={user} title="Knowledge Base">
      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Knowledge Articles</h2>
        </div>
        <div className="space-y-4">
          {articles.map(article => (
            <div key={article.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-lg font-bold text-slate-900">{article.title}</p>
                  <p className="text-sm text-slate-500">Category: {article.category}</p>
                </div>
                <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">{article.category}</span>
              </div>
              <p className="mt-3 text-sm text-slate-600">Problem: {article.problem}</p>
              <p className="mt-2 text-sm text-slate-600">Solution: {article.solution}</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
