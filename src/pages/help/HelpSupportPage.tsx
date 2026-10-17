import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  MessageSquare,
  Send,
  Rocket,
  Bot,
  Megaphone,
  Phone,
  Link2,
  CreditCard,
  Code2,
  Wrench,
  Lightbulb,
  ChevronRight,
  ArrowRight,
  Calendar,
  BookOpen,
  Users,
  ExternalLink,
  HelpCircle,
  CheckCircle2,
  X
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { SUPPORT_FAQS, SUPPORT_POPULAR_TOPICS } from '../../utils/constants';

export const HelpSupportPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [priority, setPriority] = useState('Normal (General Question)');
  const [submitted, setSubmitted] = useState(false);

  const categories = [
    {
      icon: <Rocket className="w-5 h-5 text-blue-400" />,
      iconBg: 'bg-blue-600/15 border-blue-500/30',
      title: 'Getting Started',
      desc: 'Set up your account and make your first call',
      count: 12
    },
    {
      icon: <Bot className="w-5 h-5 text-purple-400" />,
      iconBg: 'bg-purple-600/15 border-purple-500/30',
      title: 'Voice Agents',
      desc: 'Configure agents, prompts and behaviors',
      count: 28
    },
    {
      icon: <Megaphone className="w-5 h-5 text-emerald-400" />,
      iconBg: 'bg-emerald-600/15 border-emerald-500/30',
      title: 'Campaigns',
      desc: 'Create and manage outbound campaigns',
      count: 18
    },
    {
      icon: <Phone className="w-5 h-5 text-amber-400" />,
      iconBg: 'bg-amber-600/15 border-amber-500/30',
      title: 'Telephony & Providers',
      desc: 'Setup with Plivo, Twilio, Exotel and more',
      count: 16
    },
    {
      icon: <Link2 className="w-5 h-5 text-rose-400" />,
      iconBg: 'bg-rose-600/15 border-rose-500/30',
      title: 'Integrations',
      desc: 'Connect with your favorite tools and services',
      count: 24
    },
    {
      icon: <CreditCard className="w-5 h-5 text-teal-400" />,
      iconBg: 'bg-teal-600/15 border-teal-500/30',
      title: 'Billing & Plans',
      desc: 'Manage your subscription, usage and invoices',
      count: 14
    },
    {
      icon: <Code2 className="w-5 h-5 text-red-400" />,
      iconBg: 'bg-red-600/15 border-red-500/30',
      title: 'API & Webhooks',
      desc: 'Build with our APIs and webhooks',
      count: 22
    },
    {
      icon: <Wrench className="w-5 h-5 text-emerald-400" />,
      iconBg: 'bg-emerald-600/15 border-emerald-500/30',
      title: 'Troubleshooting',
      desc: 'Common issues and solutions',
      count: 30
    },
    {
      icon: <Lightbulb className="w-5 h-5 text-purple-400" />,
      iconBg: 'bg-purple-600/15 border-purple-500/30',
      title: 'Best Practices',
      desc: 'Tips to get the most out of Samvada AI',
      count: 20
    }
  ];

  const faqs = SUPPORT_FAQS;
  const popularTopics = SUPPORT_POPULAR_TOPICS;

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.error('Support requests are not connected yet. Your message was not sent.');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Help & Support</h1>
          <p className="text-sm text-zinc-400 mt-0.5">
            Find answers, learn best practices, or get in touch with our team.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setTicketModalOpen(true)}
            className="help-support-secondary flex items-center gap-2 px-3.5 py-2 rounded-xl border border-zinc-800 bg-[#0e1320] hover:bg-zinc-800 text-zinc-200 text-xs font-semibold transition-all shadow-sm"
          >
            <MessageSquare className="w-4 h-4 text-zinc-400" />
            <span>Open a Support Ticket</span>
          </button>
          <button
            onClick={() => setContactModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-lg shadow-blue-600/25"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Contact Support</span>
          </button>
        </div>
      </div>

      {/* Hero Search Banner */}
      <div className="help-search-hero rounded-2xl border border-blue-500/20 bg-gradient-to-r from-[#0c1427] via-[#091020] to-[#0d162a] p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="max-w-xl z-10 w-full">
          <h2 className="text-xl font-bold text-white tracking-tight">How can we help you?</h2>
          <p className="help-hero-description text-xs text-zinc-400 mt-1">
            Search our knowledge base, guides, or ask a specific question.
          </p>

          <div className="flex items-center gap-2 mt-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for help articles, tutorials, or topics..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#080b11] border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors shadow-inner"
              />
            </div>
            <button className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-md shadow-blue-600/25 shrink-0">
              Search
            </button>
          </div>

          {/* Popular Topics */}
          <div className="flex flex-wrap items-center gap-2 mt-3.5">
            <span className="help-topic-label text-[11px] text-zinc-400 font-medium">Popular topics:</span>
            {popularTopics.map((topic) => (
              <button
                key={topic}
                onClick={() => setSearchQuery(topic)}
                className="px-2.5 py-1 rounded-lg border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 hover:text-white text-[11px] transition-colors"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        {/* Right Graphic: 3D Chat Bubble with Waveform & Tagline */}
        <div className="flex flex-col items-center md:items-end justify-center shrink-0 z-10">
          <div className="w-24 h-16 rounded-2xl bg-blue-600/25 border border-blue-400/40 p-3 flex flex-col justify-center gap-1.5 shadow-lg shadow-blue-600/20 relative">
            <div className="w-12 h-2 bg-blue-300 rounded-full"></div>
            <div className="w-8 h-2 bg-blue-400/70 rounded-full"></div>
            <div className="absolute -bottom-2 right-4 w-4 h-4 bg-blue-600/40 rotate-45 border-r border-b border-blue-400/40"></div>
          </div>
          <p className="font-serif italic text-blue-200/80 text-xs tracking-wide mt-3 text-center md:text-right">
            "We're here<br />to help you succeed"
          </p>
        </div>
      </div>

      {/* Main Grid: Left 9 Categories, Right FAQs & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Browse by Category (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div>
            <h2 className="text-base font-bold text-white">Browse by Category</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Explore our documentation and guides.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat, idx) => (
              <div
                key={idx}
                className="p-5 bg-[#0c101b] border border-zinc-800/80 hover:border-zinc-700 rounded-2xl transition-all shadow-md flex flex-col justify-between group cursor-pointer"
              >
                <div className="space-y-3">
                  <div
                    className={`w-10 h-10 rounded-xl ${cat.iconBg} border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}
                  >
                    {cat.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 leading-snug">{cat.desc}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center gap-1 text-xs font-semibold text-blue-400 group-hover:text-blue-300 transition-colors">
                  <span>{cat.count} articles</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: FAQs & Status & Contact (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Frequently Asked Questions Card */}
          <div className="bg-[#0c101b] border border-zinc-800/80 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-white">Frequently Asked Questions</h2>
              <button className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-0.5">
                <span>View All</span>
                <span>&rarr;</span>
              </button>
            </div>

            <div className="space-y-2">
              {faqs.map((faq, idx) => (
                <div key={idx} className="rounded-xl border border-zinc-800/60 bg-[#080b11] overflow-hidden">
                  <button
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="w-full p-3 text-left flex items-center justify-between gap-3 text-xs hover:bg-zinc-800/30 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-md bg-blue-500/15 border border-blue-500/30 text-blue-400 font-bold flex items-center justify-center text-[10px] shrink-0">
                        Q
                      </span>
                      <span className="font-semibold text-zinc-200 group-hover:text-white transition-colors">
                        {faq.q}
                      </span>
                    </div>
                    <ChevronRight
                      className={`w-3.5 h-3.5 text-zinc-500 transition-transform shrink-0 ${
                        activeFaq === idx ? 'rotate-90 text-blue-400' : ''
                      }`}
                    />
                  </button>
                  {activeFaq === idx && (
                    <div className="px-3.5 pb-3 text-[11px] text-zinc-400 leading-relaxed border-t border-zinc-800/60 pt-2 bg-zinc-900/20">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* System Status Card */}
          <div className="bg-[#0c101b] border border-zinc-800/80 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">System Status</h2>
                <span className="inline-flex items-center gap-1.5 text-xs text-zinc-300 font-medium bg-zinc-800 px-2 py-0.5 rounded-md border border-zinc-700">
                  Status unknown
                </span>
              </div>
              <button className="text-xs font-semibold text-blue-400 hover:text-blue-300">
                View Status &rarr;
              </button>
            </div>
            <p className="text-xs text-zinc-400 mt-1 mb-3">Live service health is not connected to this page.</p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-xl bg-[#080b11] border border-zinc-800/80 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-zinc-500"></span>
                <span className="text-zinc-300 font-medium">API · Unknown</span>
              </div>
              <div className="p-2 rounded-xl bg-[#080b11] border border-zinc-800/80 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-zinc-500"></span>
                <span className="text-zinc-300 font-medium">Telephony · Unknown</span>
              </div>
              <div className="p-2 rounded-xl bg-[#080b11] border border-zinc-800/80 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-zinc-500"></span>
                <span className="text-zinc-300 font-medium">Voice Agents · Unknown</span>
              </div>
              <div className="p-2 rounded-xl bg-[#080b11] border border-zinc-800/80 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-zinc-500"></span>
                <span className="text-zinc-300 font-medium">Dashboard · Unknown</span>
              </div>
            </div>
          </div>

          {/* Still Need Help Card */}
          <div className="bg-[#0c101b] border border-zinc-800/80 rounded-2xl p-5 shadow-lg space-y-4">
            <div>
              <h2 className="text-base font-bold text-white">Still need help?</h2>
              <p className="text-xs text-zinc-400 mt-1">
                Support requests from this page are not connected yet.
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => setContactModalOpen(true)}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/25 active:scale-[0.985]"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Contact Support</span>
              </button>
            </div>

            {/* Footer External Links */}
            <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400">
              <a
                href="https://docs.samvada.ai"
                target="_blank"
                rel="noreferrer"
                className="hover:text-blue-400 flex items-center gap-1 transition-colors"
              >
                <BookOpen className="w-3 h-3" />
                <span>Documentation</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-purple-400 flex items-center gap-1 transition-colors"
              >
                <Users className="w-3 h-3" />
                <span>Community</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
              <button
                onClick={() => toast.info('The feature request portal is not connected yet.')}
                className="hover:text-amber-400 flex items-center gap-1 transition-colors"
              >
                <Lightbulb className="w-3 h-3" />
                <span>Feature Requests</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contact / Ticket Modal */}
      {(ticketModalOpen || contactModalOpen) && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0c101b] border border-zinc-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => {
                setTicketModalOpen(false);
                setContactModalOpen(false);
              }}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Contact Samvada AI Support</h3>
                <p className="text-xs text-zinc-400">This form is not connected to a support service. Do not include sensitive information.</p>
              </div>
            </div>

            {submitted ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>Ticket submitted successfully! We'll email you updates shortly.</span>
              </div>
            ) : (
              <form onSubmit={handleTicketSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SIP Trunk Latency or Cartesia TTS voice setup"
                    className="w-full px-3 py-2 bg-[#080b11] border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <CustomSelect
                    label="Priority"
                    value={priority}
                    onChange={setPriority}
                    options={[
                      'Normal (General Question)',
                      'High (Campaign Interrupted)',
                      'Urgent (Production Down)'
                    ]}
                    size="sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">Message</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide details about your query or error logs..."
                    className="w-full px-3 py-2 bg-[#080b11] border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled
                  className="w-full py-2.5 rounded-xl bg-zinc-700 text-zinc-400 font-semibold flex items-center justify-center gap-2 cursor-not-allowed"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Ticket</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
