import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getOnboardingRoute } from '../../utils/navigation';
import { User } from '../../types';
import {
  Mail,
  ArrowLeft,
  ArrowRight,
  Zap,
  ShieldCheck,
  Users,
  Clock,
  Lock,
  Sun,
  Sparkles,
  Loader2,
  CheckCircle
} from 'lucide-react';

export const VerifyEmailPage: React.FC = () => {
  const [digits, setDigits] = useState<string[]>(['2', '7', '4', '9', '1', '6']);
  const [countdown, setCountdown] = useState(28);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { verifyLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get('email') || '';
  const requestId = queryParams.get('requestId') || 'req-default-id';

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleDigitChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pasted = value.slice(0, 6).split('');
      const newDigits = [...digits];
      pasted.forEach((char, i) => {
        if (i < 6) newDigits[i] = char;
      });
      setDigits(newDigits);
      if (inputRefs.current[Math.min(pasted.length, 5)]) {
        inputRefs.current[Math.min(pasted.length, 5)]?.focus();
      }
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = digits.join('');
    if (code.length < 6) {
      setError('Please enter all 6 digits of the code');
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      const result = await verifyLogin(requestId, code);
      if ('redirectTo' in result && result.redirectTo) {
        window.location.href = result.redirectTo;
        return;
      }
      navigate(getOnboardingRoute(result as User));
    } catch (err: any) {
      setError('Invalid or expired verification code. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    setCountdown(30);
    setCanResend(false);
  };

  return (
    <div className="min-h-screen bg-[#06080e] text-slate-100 flex flex-col justify-between px-6 lg:px-14 py-8 relative overflow-hidden font-sans selection:bg-blue-600 selection:text-white">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-10 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[160px] pointer-events-none" />

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
        {/* Left Column: Value Proposition & 3D Envelope Illustration */}
        <div className="lg:col-span-4 space-y-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              One step closer <br />
              to smarter <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                conversations
              </span>
            </h1>
            <p className="text-sm text-zinc-400 mt-3 leading-relaxed">
              Verify your email to activate your Samvada AI account and start building amazing voice experiences.
            </p>
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-900/30 border border-zinc-800/60">
              <div className="w-9 h-9 rounded-lg bg-blue-950/60 border border-blue-500/20 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">Fast & secure</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">Get started in seconds</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-900/30 border border-zinc-800/60">
              <div className="w-9 h-9 rounded-lg bg-blue-950/60 border border-blue-500/20 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">Your data is safe</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">We use industry-standard security</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-900/30 border border-zinc-800/60">
              <div className="w-9 h-9 rounded-lg bg-blue-950/60 border border-blue-500/20 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">Join a growing community</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">Build, automate, and scale with Samvada AI</p>
              </div>
            </div>
          </div>

          {/* 3D Envelope with Verified Checkmark */}
          <div className="relative pt-2 flex flex-col items-center">
            <div className="relative w-44 h-36 flex items-center justify-center">
              <div className="absolute inset-0 bg-blue-500/20 rounded-3xl blur-2xl pointer-events-none" />
              <div className="w-28 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-700 p-0.5 shadow-2xl relative flex items-center justify-center border border-blue-400/40">
                <div className="w-8 h-8 rounded-full bg-blue-400/30 border border-white/40 flex items-center justify-center text-white">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <Sparkles className="w-4 h-4 text-cyan-300 absolute -top-2 -right-2 animate-bounce" />
                <Sparkles className="w-3 h-3 text-blue-300 absolute bottom-1 -left-3" />
              </div>
            </div>
            <span className="font-serif italic text-blue-300 text-xs tracking-wide mt-2">
              "More conversations, A brighter tomorrow"
            </span>
          </div>
        </div>

        {/* Center Column: OTP Card */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-full max-w-[460px] bg-[#0c101b]/95 border border-zinc-800/80 rounded-2xl p-7 sm:p-8 shadow-2xl backdrop-blur-xl">
            <div className="w-12 h-12 rounded-xl bg-blue-950/60 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-5">
              <Mail className="w-6 h-6" />
            </div>

            <h2 className="text-2xl font-bold text-white tracking-tight">Verify your email</h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1.5 leading-relaxed">
              We've sent a 6-digit verification code to <br />
              <span className="text-blue-400 font-semibold">{email}</span>
            </p>
            <p className="text-xs text-zinc-500 mt-1">Enter the code below to continue.</p>

            {error && (
              <div className="my-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleVerify} className="space-y-5 mt-6">
              {/* 6 Digit Input Boxes */}
              <div className="flex items-center justify-between gap-2 sm:gap-2.5">
                {digits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (inputRefs.current[idx] = el)}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-bold bg-zinc-950/70 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner"
                  />
                ))}
              </div>

              <div className="text-center">
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                  >
                    Resend code now
                  </button>
                ) : (
                  <p className="text-xs text-zinc-400">
                    Didn't receive the code?{' '}
                    <span className="text-blue-400 font-semibold">Resend in 00:{countdown < 10 ? `0${countdown}` : countdown}</span>
                  </p>
                )}
              </div>

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
                onClick={handleResend}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-medium transition-all"
              >
                <Mail className="w-4 h-4 text-zinc-400" />
                <span>Send a new code</span>
              </button>

              <div className="text-center">
                <Link
                  to="/login"
                  className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  Change email address
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Verify & Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Information & Help Panel */}
        <div className="lg:col-span-3 space-y-4">
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-zinc-900/30 border border-zinc-800/60">
              <div className="w-8 h-8 rounded-lg bg-zinc-800/80 flex items-center justify-center text-zinc-300 shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">Check your inbox</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5 leading-normal">
                  The code has been sent to {email}. Also check your spam folder.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-zinc-900/30 border border-zinc-800/60">
              <div className="w-8 h-8 rounded-lg bg-zinc-800/80 flex items-center justify-center text-zinc-300 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">Code expires in 10 minutes</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5 leading-normal">
                  For your security, the code will expire shortly.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-zinc-900/30 border border-zinc-800/60">
              <div className="w-8 h-8 rounded-lg bg-zinc-800/80 flex items-center justify-center text-zinc-300 shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">Having trouble?</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5 leading-normal">
                  Try resending the code or contact our support team.
                </p>
                <Link
                  to="/help"
                  className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-semibold mt-2"
                >
                  <span>Contact Support</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
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
