import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Bot, Cable, CheckCircle2, Database, Headphones, Sparkles } from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Draft an agent',
    description: 'Open Agents to write a brief, connect approved knowledge, and set guardrails for your voice agent.',
    action: 'Open Voice Agents',
    to: '/agents?create=1',
    icon: Bot,
  },
  {
    number: '02',
    title: 'Add your knowledge',
    description: 'Give the agent approved answers, policies, and procedures so it can respond in your context.',
    action: 'Add reference material',
    to: '/knowledge',
    icon: Database,
  },
  {
    number: '03',
    title: 'Connect when you’re ready',
    description: 'Set up calling or other tools after you’ve reviewed and refined the agent draft.',
    action: 'Explore integrations',
    to: '/integrations',
    icon: Cable,
  },
];

export const GettingStartedPage: React.FC = () => (
  <main className="mx-auto w-full max-w-5xl space-y-7 pb-12">
    <header className="max-w-2xl">
      <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
        <Sparkles className="h-3.5 w-3.5" /> A simple path to your first agent
      </div>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Start with a draft. Refine it before you go live.</h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">Build an agent around one real customer task. Add the information it needs, review how it behaves, then connect calling or other tools when you’re ready.</p>
    </header>

    <section aria-label="Getting started steps" className="grid gap-4 lg:grid-cols-3">
      {steps.map(({ number, title, description, action, to, icon: Icon }, index) => (
        <article key={number} className="flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wide text-slate-400">STEP {number}</span>
            <span className="rounded-xl bg-slate-100 p-2.5 text-slate-700"><Icon className="h-5 w-5" /></span>
          </div>
          <h2 className="mt-5 text-base font-semibold text-slate-900">{title}</h2>
          <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{description}</p>
          <Link
            to={to}
            className={`mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 ${index === 0 ? 'bg-emerald-950 text-white hover:bg-emerald-900' : 'border border-slate-200 bg-white text-slate-800 hover:bg-slate-50'}`}
          >
            {action}<ArrowRight className="h-4 w-4" />
          </Link>
        </article>
      ))}
    </section>

    <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div className="flex items-start gap-3">
        <span className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700"><CheckCircle2 className="h-5 w-5" /></span>
        <div>
          <h2 className="text-sm font-semibold text-slate-900">You choose when to connect live services</h2>
          <p className="mt-1 max-w-2xl text-sm leading-5 text-slate-600">Creating a draft is a starting point. Review the instructions and test the experience before connecting a phone number or contacting customers.</p>
        </div>
      </div>
      <Link to="/help" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700">
        <BookOpen className="h-4 w-4" /> Browse help <ArrowRight className="h-4 w-4" />
      </Link>
    </section>

    <p className="flex items-center gap-2 text-xs text-slate-500"><Headphones className="h-4 w-4" /> Need a hand? <Link to="/help" className="font-medium text-slate-700 underline underline-offset-2">Visit Help & Support</Link></p>
  </main>
);
