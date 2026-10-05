import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Lock,
  Zap,
  HelpCircle,
  BookOpen,
  MessageSquare,
  Sparkles,
  ChevronRight,
  Sun,
  Loader2,
  CheckCircle2
} from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#050814] text-slate-100 flex flex-col justify-between px-6 lg:px-14 py-8 relative overflow-hidden font-sans selection:bg-blue-600 selection:text-white">
      {/* Background ambient lighting effects matching login theme */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-blue-600/12 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-36 -left-36 w-[560px] h-[560px] rounded-full border border-blue-500/20 bg-gradient-to-tr from-blue-600/20 via-sky-500/5 to-transparent blur-xl pointer-events-none" />
      
      {/* Luminous orbital arc in bottom-left corner */}
      <svg className="absolute -bottom-16 -left-16 w-[450px] h-[450px] pointer-events-none opacity-40" viewBox="0 0 400 400" fill="none">
        <path d="M 0 400 A 360 360 0 0 1 360 40" stroke="url(#forgotArcBlueGrad)" strokeWidth="2.5" />
        <defs>
          <linearGradient id="forgotArcBlueGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#2563eb" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* Bottom-right ambient aura */}
      <div className="absolute -bottom-28 -right-28 w-[450px] h-[450px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header */}
      <header className="flex items-center justify-between z-20 mb-4 max-w-7xl mx-auto w-full">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center gap-1 shadow-lg shadow-blue-500/10">
            <div className="w-1 h-3 bg-blue-500 rounded-full animate-pulse" />
            <div className="w-1 h-6 bg-blue-400 rounded-full" />
            <div className="w-1 h-4 bg-blue-500 rounded-full" />
            <div className="w-1 h-2 bg-blue-600 rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-white tracking-tight">Samvada AI</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-none mt-0.5">Voice AI for a more human world</p>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <button className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors">
            <Sun className="w-4 h-4" />
          </button>
          <Link
            to="/login"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-zinc-700/80 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200 hover:text-white transition-all backdrop-blur-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Login</span>
          </Link>
        </div>
      </header>

      {/* Main 3-Column Content Layout */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center flex-1 z-10 max-w-7xl mx-auto w-full py-4">
        {/* Left Column: Brand, Features & 3D Lock Illustration */}
        <div className="lg:col-span-4 space-y-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Reset your password <br />
              and <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">get back to building</span>
            </h1>
            <p className="text-sm text-zinc-400 mt-3 leading-relaxed">
              Secure access to your agents, campaigns, and conversations.
            </p>
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-900/30 border border-zinc-800/60">
              <div className="w-9 h-9 rounded-lg bg-blue-950/60 border border-blue-500/20 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">Your data is secure</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">We use industry-standard security.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-900/30 border border-zinc-800/60">
              <div className="w-9 h-9 rounded-lg bg-blue-950/60 border border-blue-500/20 flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">Quick & easy</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">Reset your password in minutes.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-900/30 border border-zinc-800/60">
              <div className="w-9 h-9 rounded-lg bg-blue-950/60 border border-blue-500/20 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">Get back to work</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">Continue building amazing voice experiences.</p>
              </div>
            </div>
          </div>

          {/* 3D Glowing Lock & Stars Illustration */}
          <div className="relative pt-3 flex flex-col items-center">
            <div className="relative w-44 h-36 flex items-center justify-center">
              <div className="absolute inset-0 bg-blue-500/20 rounded-3xl blur-2xl pointer-events-none" />
              <div className="w-24 h-28 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-700 p-0.5 shadow-2xl relative flex flex-col items-center justify-center border border-blue-400/30">
                <div className="w-12 h-8 rounded-t-full border-4 border-white/80 -mt-6 mb-2" />
                <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
                  <div className="w-1.5 h-2 bg-blue-900 rounded-sm" />
                </div>
                <Sparkles className="w-4 h-4 text-cyan-300 absolute -top-3 -right-3 animate-bounce" />
                <Sparkles className="w-3 h-3 text-blue-300 absolute bottom-2 -left-4" />
              </div>
            </div>
            <span className="font-serif italic text-blue-300 text-xs tracking-wide mt-2">
              "More conversations, A brighter tomorrow"
            </span>
          </div>
        </div>

        {/* Center Column: Reset Form Card */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-full max-w-[440px] bg-[#0c101b]/95 border border-zinc-800/80 rounded-2xl p-7 sm:p-8 shadow-2xl backdrop-blur-xl">
            <div className="w-12 h-12 rounded-xl bg-blue-950/60 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-5">
              <Mail className="w-6 h-6" />
            </div>

            <h2 className="text-2xl font-bold text-white tracking-tight">Forgot your password?</h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1.5 leading-relaxed">
              No worries! Enter your email address and we'll send you a link to reset your password.
            </p>

            {isSubmitted ? (
              <div className="my-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h3 className="text-sm font-semibold text-white">Reset link sent!</h3>
                <p className="text-xs text-zinc-400">
                  We've sent a password reset link to <span className="text-zinc-200 font-medium">{email}</span>. Please check your inbox.
                </p>
                <div className="pt-2">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Return to sign in
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending reset link...</span>
                    </>
                  ) : (
                    <>
                      <span>Send reset link</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-800" />
                  </div>
                  <div className="relative flex justify-center text-[11px] uppercase">
                    <span className="bg-[#0c101b] px-3 text-zinc-500 font-medium">OR</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsSubmitted(true)}
                  className="w-full flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-medium transition-all"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.4 8.9 5 12 5z"/>
                    <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5.1 3.7-8.8z"/>
                    <path fill="#FBBC05" d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.7s.1-2 .4-2.7L1.6 6.4C.6 8.3 0 10.5 0 12s.6 3.7 1.6 5.6l3.7-2.9z"/>
                    <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5L1.6 16.2C3.5 20.1 7.4 23 12 23z"/>
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <div className="pt-2 text-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
                  </Link>
                </div>

                <p className="text-[11px] text-zinc-500 text-center mt-3">
                  Didn't receive the email? Check your spam folder or{' '}
                  <button type="button" onClick={() => setEmail('')} className="text-blue-400 hover:underline">
                    try again
                  </button>.
                </p>
              </form>
            )}
          </div>
        </div>

        {/* Right Column: Support / Help Assistance Box */}
        <div className="lg:col-span-3 space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">Need more help?</h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              If you're still having trouble, reach out to our support team.
            </p>
          </div>

          <div className="space-y-2.5">
            <Link
              to="/help"
              className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900/40 hover:bg-zinc-800/60 border border-zinc-800/80 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300 group-hover:text-blue-400">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white group-hover:text-blue-400 transition-colors">Contact Support</h4>
                  <p className="text-[10px] text-zinc-500">Get help from our team</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              to="/help"
              className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900/40 hover:bg-zinc-800/60 border border-zinc-800/80 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300 group-hover:text-blue-400">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white group-hover:text-blue-400 transition-colors">Help Center</h4>
                  <p className="text-[10px] text-zinc-500">Browse our documentation</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              to="/help"
              className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900/40 hover:bg-zinc-800/60 border border-zinc-800/80 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300 group-hover:text-blue-400">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white group-hover:text-blue-400 transition-colors">View FAQs</h4>
                  <p className="text-[10px] text-zinc-500">Find quick answers</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="z-10 mt-6 pt-4 border-t border-zinc-900/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-zinc-400 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-zinc-400 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-zinc-400 transition-colors">Contact Us</a>
        </div>
        <p>© 2026 Samvada AI. All rights reserved.</p>
      </footer>
    </div>
  );
};
