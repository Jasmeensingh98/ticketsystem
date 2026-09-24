import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { api } from '../services/api';
import { 
  Sparkles, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, 
  Cpu, Network, BookOpen, Clock, FileUp, Info, RefreshCw
} from 'lucide-react';

export default function CreateTicketPage({ user }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    user_name: user?.name || 'Demo User',
    email: user?.email || 'user@demo.com',
    department: user?.department || 'IT Support',
    category: '',
    device: 'MacBook Pro / Workstation',
    location: 'Building 4, Floor 2',
    affected_users: 1,
    business_impact: 'Low',
    downtime: 'None',
    additional_information: '',
  });

  const [attachmentName, setAttachmentName] = useState('');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const samplePresets = [
    {
      label: 'VPN Outage (Network / High)',
      title: 'VPN gateway connection drop for remote engineers',
      description: 'Multiple remote workers cannot maintain IPSec VPN tunnels. Authentication loops after MFA and drops connection every 3 minutes.',
      category: '',
      affected_users: 25,
      business_impact: 'High',
      downtime: 'Partial',
      device: 'Cisco AnyConnect / FortiClient',
    },
    {
      label: 'Laptop Won\'t Power (Hardware / Critical)',
      title: 'Executive laptop completely dead, will not turn on',
      description: 'ThinkPad workstation has no power LED. Tested with known good 100W USB-C charger. Executive meeting scheduled in 90 minutes.',
      category: '',
      affected_users: 1,
      business_impact: 'Critical',
      downtime: 'Total Outage',
      device: 'Lenovo ThinkPad X1 Carbon',
    },
    {
      label: 'Password Lockout (IAM / High)',
      title: 'Active Directory account locked after credential change',
      description: 'Cannot sign into company email or SSO dashboard. Account was locked after three failed attempts on mobile client.',
      category: '',
      affected_users: 1,
      business_impact: 'Medium',
      downtime: 'Partial',
      device: 'Single Sign-On / Active Directory',
    }
  ];

  const applyPreset = (preset) => {
    setForm(prev => ({ ...prev, ...preset }));
    setResult(null);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachmentName(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setProcessing(true);
    setResult(null);

    try {
      const res = await api.post('/tickets', {
        ...form,
        attachment_name: attachmentName
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit ticket. Please check your network connection.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <DashboardLayout user={user} title="Submit Support Ticket">
      {/* Sample Presets for Viva / Research Demonstrations */}
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-blue-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-blue-900">
              Demo Presets for Testing AI Pipeline:
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {samplePresets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(preset)}
                className="px-3 py-1.5 rounded-lg bg-white border border-blue-200 text-xs font-semibold text-blue-700 hover:bg-blue-600 hover:text-white transition shadow-sm"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.5fr_1fr]">
        {/* Ticket Form */}
        <div className="card p-7">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Incident Details</h2>
              <p className="text-xs text-slate-500">Provide details for transformer NLP classification & XGBoost triage.</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">
              Step 1 of 2
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
                Ticket Title <span className="text-rose-500">*</span>
              </label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder="Brief summary of the issue..."
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
                Detailed Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows="4"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder="Explain the symptoms, error codes, steps to reproduce, or affected systems..."
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">User Name</label>
                <input
                  value={form.user_name}
                  onChange={(e) => setForm({ ...form, user_name: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">Email Address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">Department</label>
                <input
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Category <span className="text-slate-400 font-normal">(Optional - AI will classify)</span>
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">Auto-predict via AI Model</option>
                  <option value="Hardware">Hardware</option>
                  <option value="Software">Software</option>
                  <option value="Network">Network</option>
                  <option value="Access Management">Access Management</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Urgency Indicators for XGBoost Model */}
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
                <Cpu size={15} className="text-blue-600" />
                Urgency & Impact Signals for XGBoost Model
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs text-slate-600">Affected Users</label>
                  <select
                    value={form.affected_users}
                    onChange={(e) => setForm({ ...form, affected_users: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-blue-500"
                  >
                    <option value={1}>Single user (1)</option>
                    <option value={5}>Small group (2-10)</option>
                    <option value={35}>Team / Department (10-50)</option>
                    <option value={150}>Entire Organization (50+)</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs text-slate-600">Business Impact</label>
                  <select
                    value={form.business_impact}
                    onChange={(e) => setForm({ ...form, business_impact: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-blue-500"
                  >
                    <option value="Low">Low - Minor Inconvenience</option>
                    <option value="Medium">Medium - Workflow Slowdown</option>
                    <option value="High">High - Core Process Impaired</option>
                    <option value="Critical">Critical - Production Outage</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs text-slate-600">System Downtime</label>
                  <select
                    value={form.downtime}
                    onChange={(e) => setForm({ ...form, downtime: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-blue-500"
                  >
                    <option value="None">None - System Online</option>
                    <option value="Partial">Partial - Intermittent</option>
                    <option value="Total Outage">Total Outage - System Down</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">Device / System</label>
                <input
                  value={form.device}
                  onChange={(e) => setForm({ ...form, device: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">Location</label>
                <input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">Attachment (Screenshot or Logs)</label>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition">
                  <FileUp size={16} />
                  Choose File
                  <input type="file" onChange={handleFileUpload} className="hidden" />
                </label>
                <span className="text-xs text-slate-500">
                  {attachmentName ? attachmentName : 'No file chosen (PNG, JPG, LOG max 10MB)'}
                </span>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">Additional Information</label>
              <textarea
                rows="2"
                value={form.additional_information}
                onChange={(e) => setForm({ ...form, additional_information: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                placeholder="Any troubleshooting already attempted..."
              />
            </div>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700 flex items-center gap-2">
                <AlertTriangle size={16} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={processing}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:opacity-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  AI is analyzing and routing your ticket...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Submit Ticket & Trigger AI Triage
                </>
              )}
            </button>
          </form>
        </div>

        {/* Live AI Analysis & Routing Results Card */}
        <div className="space-y-6">
          <div className="card p-6 border-2 border-blue-100 shadow-md">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600 font-bold">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">AI Triage Intelligence</h3>
                  <p className="text-xs text-slate-500">Live inference & routing engine</p>
                </div>
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                Real-time
              </span>
            </div>

            {processing ? (
              <div className="py-16 text-center space-y-4">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600 animate-pulse">
                  <Sparkles size={32} />
                </div>
                <div>
                  <p className="text-base font-bold text-slate-900">AI is analyzing your ticket...</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    Tokenizing text, querying DistilBERT for category, calculating urgency vector for XGBoost, and querying KB embeddings...
                  </p>
                </div>
              </div>
            ) : result ? (
              <div className="mt-5 space-y-5">
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 flex items-center gap-2.5 text-xs text-emerald-800 font-medium">
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                  Ticket #{result.ticket.id} successfully created, triaged, and routed!
                </div>

                {/* Classification & Priority Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Category</p>
                    <p className="mt-1 text-lg font-bold text-slate-900">{result.analysis.category}</p>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Confidence</span>
                      <span className="font-bold text-blue-600">
                        {Math.round(result.analysis.category_confidence * 100)}%
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full" 
                        style={{ width: `${Math.round(result.analysis.category_confidence * 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Priority</p>
                    <p className={`mt-1 text-lg font-black ${
                      result.analysis.priority === 'Critical' ? 'text-rose-600' :
                      result.analysis.priority === 'High' ? 'text-amber-600' :
                      result.analysis.priority === 'Medium' ? 'text-blue-600' : 'text-slate-700'
                    }`}>
                      {result.analysis.priority}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Confidence</span>
                      <span className="font-bold text-indigo-600">
                        {Math.round(result.analysis.priority_confidence * 100)}%
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                      <div 
                        className="h-full bg-indigo-600 rounded-full" 
                        style={{ width: `${Math.round(result.analysis.priority_confidence * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Routing Assignment */}
                <div className="rounded-xl border border-slate-200 p-4 bg-white space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Assigned Team:</span>
                    <span className="font-bold text-slate-900 text-sm">{result.routing.team}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Specialist Agent:</span>
                    <span className="font-semibold text-slate-800">{result.routing.agent}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-100 text-slate-600">
                    <span className="font-semibold text-slate-700">Routing Reason:</span> {result.routing.routing_reason}
                  </div>
                </div>

                {/* Suggested Resolution & KB */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                    <BookOpen size={14} className="text-blue-600" />
                    Recommended Solutions ({result.suggestions?.length || 0})
                  </p>
                  <div className="space-y-2">
                    {result.suggestions?.map((item, i) => (
                      <div key={item.id || i} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-xs">
                        <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                          <span>{i + 1}. {item.title}</span>
                          <span className="text-blue-600 font-semibold">{item.match_score}% match</span>
                        </div>
                        <p className="text-slate-600 whitespace-pre-line line-clamp-3">{item.solution}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex flex-col gap-2">
                  <Link
                    to={`/tickets/${result.ticket.id}`}
                    className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-xs text-center hover:bg-blue-700 transition flex items-center justify-center gap-2"
                  >
                    Open Ticket #{result.ticket.id} Details <ArrowRight size={14} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => { setResult(null); setForm({ ...form, title: '', description: '' }); }}
                    className="w-full py-2 rounded-xl bg-slate-100 text-slate-700 font-medium text-xs hover:bg-slate-200 transition"
                  >
                    Submit Another Ticket
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 space-y-3">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <Cpu size={24} />
                </div>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Fill in the incident details on the left and submit. The AI model will predict the category, evaluate urgency, route the ticket, and suggest solutions.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
