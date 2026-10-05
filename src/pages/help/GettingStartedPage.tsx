import React from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import {
  ArrowRight,
  Play,
  CheckCircle2,
  Circle,
  BookOpen,
  Video,
  Headphones,
  Users,
  Bot,
  Megaphone,
  BarChart3,
  Puzzle,
  Settings2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export const GettingStartedPage: React.FC = () => {
  const navigate = useNavigate();

  const steps = [
    {
      num: 1,
      numBg: 'bg-blue-600',
      title: 'Set up your voice agent',
      desc: 'Choose a voice, set instructions, and configure behavior.',
      action: 'Create Agent',
      route: '/agents/create'
    },
    {
      num: 2,
      numBg: 'bg-purple-600',
      title: 'Connect a telephony provider',
      desc: 'Integrate with Plivo, Twilio, Exotel or other providers.',
      action: 'Connect',
      route: '/integrations'
    },
    {
      num: 3,
      numBg: 'bg-emerald-600',
      title: 'Import your contacts',
      desc: 'Upload a CSV file or sync from your CRM.',
      action: 'Import Contacts',
      route: '/contacts'
    },
    {
      num: 4,
      numBg: 'bg-amber-600',
      title: 'Create your first campaign',
      desc: 'Set your target audience and start calling.',
      action: 'Create Campaign',
      route: '/campaigns/create'
    },
    {
      num: 5,
      numBg: 'bg-rose-600',
      title: 'Monitor live calls',
      desc: 'Track call progress and see real-time transcripts.',
      action: 'Go to Live Calls',
      route: '/calls/live'
    },
    {
      num: 6,
      numBg: 'bg-indigo-600',
      title: 'View analytics',
      desc: 'Analyze performance and optimize your campaigns.',
      action: 'View Analytics',
      route: '/analytics'
    }
  ];

  const checklist = [
    { title: 'Create your account', completed: true },
    { title: 'Verify email address', completed: true },
    { title: 'Set up a voice agent', completed: false, route: '/agents/create' },
    { title: 'Add a telephony provider', completed: false, route: '/integrations' },
    { title: 'Import contacts', completed: false, route: '/contacts' },
    { title: 'Launch your first campaign', completed: false, route: '/campaigns/create' }
  ];

  const features = [
    {
      icon: <Bot className="w-5 h-5 text-emerald-400" />,
      iconBg: 'bg-emerald-500/15 border-emerald-500/30',
      title: 'Voice Agents',
      desc: 'Create natural, human-like voice agents.'
    },
    {
      icon: <Megaphone className="w-5 h-5 text-purple-400" />,
      iconBg: 'bg-purple-500/15 border-purple-500/30',
      title: 'Campaigns',
      desc: 'Run outbound calling campaigns at scale.'
    },
    {
      icon: <BarChart3 className="w-5 h-5 text-blue-400" />,
      iconBg: 'bg-blue-500/15 border-blue-500/30',
      title: 'Analytics',
      desc: 'Track performance and gain insights.'
    },
    {
      icon: <Puzzle className="w-5 h-5 text-rose-400" />,
      iconBg: 'bg-rose-500/15 border-rose-500/30',
      title: 'Integrations',
      desc: 'Connect your favorite tools and services.'
    },
    {
      icon: <Users className="w-5 h-5 text-amber-400" />,
      iconBg: 'bg-amber-500/15 border-amber-500/30',
      title: 'Team Management',
      desc: 'Invite and manage your team.'
    },
    {
      icon: <Settings2 className="w-5 h-5 text-cyan-400" />,
      iconBg: 'bg-cyan-500/15 border-cyan-500/30',
      title: 'Customization',
      desc: 'Tailor the platform to your needs.'
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Welcome to Samvada!</span>
            <span>👋</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-0.5">
            Let's get you set up and running in a few simple steps.
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors self-start sm:self-auto"
        >
          <span>Skip Tour</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Grid: Left Steps, Right Progress & Help */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Hero Banner */}
          <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-r from-[#0c1427] via-[#091020] to-[#0d162a] p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-md z-10">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Launch your first AI call campaign
              </h2>
              <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                Set up an agent, import contacts, and start calling in minutes.
              </p>
              <div className="flex items-center gap-3 mt-5">
                <button
                  onClick={() => navigate('/agents/create')}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-blue-600/25"
                >
                  <span>Start Setup</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button className="px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold flex items-center gap-2 transition-all">
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Watch Video</span>
                </button>
              </div>
            </div>

            {/* AI Bot Character Illustration */}
            <div className="relative flex items-center justify-center shrink-0 z-10">
              {/* Speech bubble */}
              <div className="absolute -top-3 right-2 bg-blue-950/80 border border-blue-500/40 px-3 py-1.5 rounded-xl text-[11px] text-blue-200 shadow-lg">
                <div className="font-semibold">Hello!</div>
                <div className="text-[10px] text-zinc-400">Let's get started.</div>
              </div>

              {/* Robot avatar container */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-b from-blue-500 to-indigo-600 p-1 shadow-xl shadow-blue-500/20 mt-4 flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-[#080b11] flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="w-10 h-6 bg-blue-900/40 rounded-full flex items-center justify-center gap-2 border border-blue-400/40">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-pulse"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-pulse"></div>
                  </div>
                  <div className="w-4 h-1 bg-cyan-400/60 rounded-full mt-1.5"></div>
                </div>
              </div>

              {/* Soundwaves next to bot */}
              <div className="flex items-center gap-1 ml-3">
                <div className="w-1 h-3 bg-blue-500/60 rounded-full animate-pulse"></div>
                <div className="w-1 h-6 bg-blue-400 rounded-full"></div>
                <div className="w-1 h-4 bg-cyan-400 rounded-full"></div>
                <div className="w-1 h-2 bg-blue-600 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Recommended Setup Steps */}
          <div>
            <h3 className="text-base font-bold text-white">Recommended Setup Steps</h3>
            <p className="text-xs text-zinc-400 mt-0.5 mb-4">
              Follow these steps to get the most out of Samvada.
            </p>

            <div className="relative pl-6 space-y-4">
              {/* Vertical connecting line */}
              <div className="absolute left-10 top-6 bottom-6 w-0.5 bg-zinc-800 pointer-events-none"></div>

              {steps.map((step) => (
                <div
                  key={step.num}
                  className="relative flex items-center justify-between p-4 bg-[#0c101b] border border-zinc-800/80 rounded-2xl hover:border-zinc-700 transition-all shadow-md group"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-9 h-9 rounded-full ${step.numBg} text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-md ring-4 ring-[#080b11] z-10`}
                    >
                      {step.num}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                        {step.title}
                      </h4>
                      <p className="text-[11px] text-zinc-400 mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(step.route)}
                    className="px-3.5 py-1.5 rounded-xl border border-zinc-800 bg-[#080b11] hover:bg-zinc-800 text-zinc-200 text-xs font-medium transition-colors shrink-0"
                  >
                    {step.action}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Your Setup Progress Card */}
          <div className="bg-[#0c101b] border border-zinc-800/80 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Your Setup Progress</h3>
              <span className="text-xs font-bold text-emerald-400">33%</span>
            </div>

            <div className="w-full h-2 bg-zinc-800/80 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '33%' }}></div>
            </div>

            <p className="text-xs text-zinc-400 mb-4">2 of 6 steps completed</p>

            <div className="space-y-2 divide-y divide-zinc-800/50">
              {checklist.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => item.route && navigate(item.route)}
                  className={`pt-2 flex items-center justify-between cursor-pointer group transition-colors`}
                >
                  <div className="flex items-center gap-2.5">
                    {item.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 fill-emerald-500/20" />
                    ) : (
                      <Circle className="w-4 h-4 text-zinc-600 shrink-0" />
                    )}
                    <span
                      className={`text-xs ${
                        item.completed ? 'text-zinc-300 line-through opacity-80' : 'text-zinc-200 group-hover:text-blue-400'
                      }`}
                    >
                      {item.title}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                </div>
              ))}
            </div>
          </div>

          {/* Need Help Card */}
          <div className="bg-[#0c101b] border border-zinc-800/80 rounded-2xl p-5 shadow-lg">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Need Help?</h3>
            <p className="text-[11px] text-zinc-400 mt-0.5 mb-3">
              Explore our documentation, video tutorials, or reach out to our support team.
            </p>

            <div className="space-y-2">
              <NavLink
                to="/help"
                className="flex items-center justify-between p-3 rounded-xl bg-[#080b11] border border-zinc-800/80 hover:border-zinc-700 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <BookOpen className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-blue-400 transition-colors">
                      Browse Documentation
                    </div>
                    <div className="text-[10px] text-zinc-500">Step-by-step guides and API references</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
              </NavLink>

              <NavLink
                to="/help"
                className="flex items-center justify-between p-3 rounded-xl bg-[#080b11] border border-zinc-800/80 hover:border-zinc-700 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                    <Video className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-purple-400 transition-colors">
                      Watch Video Tutorials
                    </div>
                    <div className="text-[10px] text-zinc-500">Learn with short, practical videos</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
              </NavLink>

              <NavLink
                to="/help"
                className="flex items-center justify-between p-3 rounded-xl bg-[#080b11] border border-zinc-800/80 hover:border-zinc-700 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <Headphones className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-emerald-400 transition-colors">
                      Contact Support
                    </div>
                    <div className="text-[10px] text-zinc-500">Our team is here to help 24/7</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
              </NavLink>
            </div>
          </div>

          {/* Join Discord Community Card */}
          <div className="bg-gradient-to-br from-[#181c32] to-[#0d1222] border border-indigo-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <h3 className="text-xs font-bold text-white tracking-tight">Join the Samvada Community</h3>
            <p className="text-[11px] text-zinc-400 mt-1 mb-4">
              Connect with other builders, share ideas, and get help.
            </p>

            <button
              onClick={() => window.open('https://discord.com', '_blank')}
              className="px-4 py-2 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-[#5865F2]/25"
            >
              <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
              <span>Join Discord</span>
            </button>
          </div>
        </div>
      </div>

      {/* Explore Key Features (Full Width Bottom Grid) */}
      <div className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Explore Key Features</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Discover what you can do with Samvada.</p>
          </div>
          <button
            onClick={() => navigate('/agents')}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
          >
            <span>View All Features</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="p-4 bg-[#0c101b] border border-zinc-800/80 hover:border-zinc-700 rounded-2xl transition-all shadow-sm space-y-3 group"
            >
              <div
                className={`w-10 h-10 rounded-xl ${feat.iconBg} border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}
              >
                {feat.icon}
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                  {feat.title}
                </h4>
                <p className="text-[11px] text-zinc-400 mt-1 leading-snug">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
