import { ArrowRight, Bot, BrainCircuit, Gauge, ShieldCheck, Sparkles, Workflow } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  { icon: Bot, title: 'AI Ticket Classification', text: 'DistilBERT-like model predicts issue categories with confidence scores.' },
  { icon: BrainCircuit, title: 'AI Priority Prediction', text: 'XGBoost estimates urgency based on impact, affected users, and SLA risk.' },
  { icon: Workflow, title: 'Smart Routing', text: 'Assign tickets to the correct support team and available specialist.' },
  { icon: Sparkles, title: 'Knowledge-Based Resolution', text: 'Recommend troubleshooting and fix steps from internal KB articles.' },
  { icon: Gauge, title: 'Real-Time Analytics', text: 'Track performance, workload, SLA compliance, and ticket trends.' },
  { icon: ShieldCheck, title: 'SLA Monitoring', text: 'Monitor breach risk and ensure swift incident response.' },
];

export default function LandingPage({ user }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="mx-auto max-w-7xl px-6 py-6">
        <div className="flex items-center justify-between rounded-full border border-slate-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-violet-600 text-sm font-bold text-white">AI</div>
            <div>
              <p className="text-sm font-bold text-slate-900">Helpdesk AI</p>
            </div>
          </div>
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#features">Features</a>
            <a href="#workflow">Workflow</a>
            <a href="#research">Research</a>
          </nav>
          <div className="flex gap-3">
            <Link to="/login" className="btn-secondary">Login</Link>
            {user ? <Link to="/dashboard" className="btn-primary">Dashboard</Link> : <Link to="/register" className="btn-primary">Create Support Ticket</Link>}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 pb-20">
        <section className="grid items-center gap-10 py-12 md:grid-cols-2 md:py-20">
          <div>
            <p className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Academic Research Prototype</p>
            <h1 className="mt-6 text-4xl font-black leading-tight text-slate-900 md:text-6xl">
              AI-Powered Helpdesk Ticket Prioritization & Routing
            </h1>
            <p className="mt-6 max-w-xl text-lg text-slate-600">
              Automatically classify, prioritize, route, and resolve IT support tickets using AI-powered intelligence.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to={user ? '/tickets/new' : '/register'} className="btn-primary">Create Support Ticket</Link>
              <Link to={user ? '/dashboard' : '/login'} className="btn-secondary">Explore Dashboard</Link>
              <Link to="/login" className="btn-secondary">Login</Link>
            </div>
          </div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
            <div className="rounded-2xl bg-gradient-to-br from-blue-50 via-white to-violet-50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Ticket Overview</p>
                  <h3 className="mt-2 text-2xl font-bold text-slate-900">Live AI Triage</h3>
                </div>
                <div className="rounded-xl bg-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-700">Active</div>
              </div>
              <div className="mt-6 space-y-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Category</span>
                    <span className="font-semibold text-slate-900">Network</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-slate-500">Confidence</span>
                    <span className="font-semibold text-blue-600">94%</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Priority</p>
                    <p className="mt-2 text-2xl font-black text-amber-500">High</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Team</p>
                    <p className="mt-2 text-xl font-bold text-slate-900">Network Support</p>
                  </div>
                </div>
                <div className="rounded-xl bg-slate-900 p-4 text-slate-100">
                  <p className="text-sm text-slate-300">Suggested resolution</p>
                  <p className="mt-2 text-sm">Restart router and verify VPN parameters before escalating to ISP or firewall team.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-8">
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Platform capabilities</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900">Intelligent support operations</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {features.map(({ icon: Icon, title, text }) => (
              <div key={title} className="card p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Icon size={22} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="workflow" className="py-16">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Operational workflow</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900">From submission to resolution</h2>
          </div>
          <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
            {['Ticket Submission', 'AI Processing', 'Classification', 'Priority Prediction', 'Smart Routing', 'Resolution Suggestion', 'Support Agent', 'Resolution'].map((step, idx) => (
              <div key={step} className="flex items-center gap-4">
                <div className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">{idx + 1}</div>
                <span className="text-sm font-medium text-slate-700">{step}</span>
                {idx < 7 && <ArrowRight className="hidden text-slate-400 md:block" size={18} />}
              </div>
            ))}
          </div>
        </section>

        <section id="research" className="py-6">
          <div className="card p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">Research & project context</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900">Academic prototype for AI-powered IT support research</h2>
            <p className="mt-4 max-w-3xl text-slate-600">
              This project provides a complete research-oriented prototype of an enterprise IT helpdesk platform. It demonstrates a modular ML pipeline for ticket classification and priority prediction, with a structured workflow that can later be upgraded with fine-tuned transformer models, real XGBoost training pipelines, and additional integrations.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
