import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowRight, BarChart3, BookOpen, Bot, Headphones, Megaphone, Plug } from 'lucide-react';

const homeDestinations = [
  {
    title: 'Voice agents',
    description: 'Create and manage agents, knowledge sources, and safety boundaries.',
    to: '/agents',
    icon: Bot,
    tone: 'bg-emerald-50 text-emerald-800 ring-emerald-100',
  },
  {
    title: 'Live calls',
    description: 'Monitor active conversations and step in when a call needs attention.',
    to: '/calls/live',
    icon: Headphones,
    tone: 'bg-sky-50 text-sky-800 ring-sky-100',
  },
  {
    title: 'Campaigns',
    description: 'Set up and track outbound calling campaigns for your workspace.',
    to: '/campaigns',
    icon: Megaphone,
    tone: 'bg-violet-50 text-violet-800 ring-violet-100',
  },
  {
    title: 'Analytics',
    description: 'Review call outcomes, agent performance, and conversation trends.',
    to: '/analytics',
    icon: BarChart3,
    tone: 'bg-amber-50 text-amber-800 ring-amber-100',
  },
  {
    title: 'Knowledge base',
    description: 'Manage approved information your agents can retrieve during calls.',
    to: '/knowledge',
    icon: BookOpen,
    tone: 'bg-indigo-50 text-indigo-800 ring-indigo-100',
  },
  {
    title: 'Integrations',
    description: 'Connect the systems and tools agents are allowed to use.',
    to: '/integrations',
    icon: Plug,
    tone: 'bg-slate-100 text-slate-700 ring-slate-200',
  },
];

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const firstName = user?.profile?.firstName || user?.displayName?.split(' ')[0] || 'Builder';

  return (
    <div className="mx-auto max-w-6xl space-y-8 py-5 text-slate-900 sm:py-8">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-white to-emerald-50/70 p-6 shadow-sm sm:p-9">
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-emerald-100/50 blur-3xl" />
        <div className="relative max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3 py-1 text-xs font-semibold text-emerald-900">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
            Workspace overview
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            Welcome back, {firstName}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Manage your voice agents, calls, and customer conversations from one place.
          </p>
        </div>
      </section>

      <section aria-labelledby="workspace-shortcuts-heading">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 id="workspace-shortcuts-heading" className="text-base font-semibold text-slate-950">Workspace shortcuts</h2>
            <p className="mt-1 text-sm text-slate-500">Go to the part of your voice operation you want to manage.</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {homeDestinations.map(({ title, description, to, icon: Icon, tone }) => (
            <Link
              key={title}
              to={to}
              className="group flex min-h-36 flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 sm:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${tone}`}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <ArrowRight className="mt-1 h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-emerald-800" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-slate-950">{title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};
