import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getOnboardingRoute } from '../../utils/navigation';
import { User } from '../../types';
import {
  Mail,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Phone,
  Users,
  BarChart3,
  Puzzle,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [requestId, setRequestId] = useState('');
  const [loginChallenge, setLoginChallenge] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { loginWithOTP, verifyLogin } = useAuth();
  const navigate = useNavigate();

  // PKCE Flash Cookie Pattern: Read login_challenge from URL param or browser flash cookie
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryChallenge = params.get('login_challenge');
    if (queryChallenge) {
      setLoginChallenge(queryChallenge);
      return;
    }

    const match = document.cookie.match(/(?:^|;\s*)login_challenge=([^;]+)/);
    if (match && match[1]) {
      const challengeVal = decodeURIComponent(match[1]);
      setLoginChallenge(challengeVal);
      // Immediately delete flash cookie to prevent stale reuse
      document.cookie = 'login_challenge=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
    }
  }, []);

  // Timer countdown for OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    } else if (step === 'otp' && countdown === 0) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [step, countdown]);

  // Step 1: Request OTP from backend /api/v1/auth/login
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const reqId = await loginWithOTP(email.trim().toLowerCase());
      setRequestId(reqId);
      setStep('otp');
      setCountdown(30);
      setCanResend(false);
      setOtpDigits(['', '', '', '', '', '']);
      // Focus first OTP input after DOM renders
      setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || err?.message || 'Unable to send verification code. Please check your email.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDevOtp = async () => {
    try {
      const res = await fetch('/api/dev/latest-otp');
      const data = await res.json();
      if (data?.success && data.otp && data.otp.length === 6) {
        setOtpDigits(data.otp.split(''));
        setTimeout(() => otpInputRefs.current[5]?.focus(), 50);
      }
    } catch (err) {
      console.warn('Could not fetch dev OTP', err);
    }
  };

  useEffect(() => {
    if (step === 'otp') {
      const t = setTimeout(() => {
        fetchDevOtp();
      }, 800);
      return () => clearTimeout(t);
    }
  }, [step]);

  // Step 2: Handle individual digit input & pasting
  const handleOtpChange = (index: number, value: string) => {
    // Handle pasting a full 6-digit code
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, '').slice(0, 6).split('');
      const newDigits = [...otpDigits];
      pasted.forEach((char, i) => {
        if (i < 6) newDigits[i] = char;
      });
      setOtpDigits(newDigits);
      const nextIndex = Math.min(pasted.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
      return;
    }

    // Only accept numeric digit
    const cleaned = value.replace(/\D/g, '');
    const newDigits = [...otpDigits];
    newDigits[index] = cleaned;
    setOtpDigits(newDigits);

    if (cleaned && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Step 2: Verify OTP with backend /api/v1/auth/login/verify
  const handleVerifyOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = otpDigits.join('');
    if (code.length < 6) {
      setError('Please enter all 6 digits of the verification code.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const result = await verifyLogin(requestId, code, loginChallenge);
      // If OIDC login challenge is active, follow the OAuth Hydra consent -> callback PKCE exchange
      if ('redirectTo' in result && result.redirectTo) {
        window.location.href = result.redirectTo;
        return;
      }
      // Dynamic onboarding redirect: sends user to pending step or /home
      const targetRoute = getOnboardingRoute(result as User);
      navigate(targetRoute);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || err?.message || 'Invalid or expired verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend || isLoading) return;
    setError('');
    setIsLoading(true);
    try {
      const reqId = await loginWithOTP(email.trim().toLowerCase());
      setRequestId(reqId);
      setCountdown(30);
      setCanResend(false);
      setOtpDigits(['', '', '', '', '', '']);
      otpInputRefs.current[0]?.focus();
    } catch (err: any) {
      setError('Failed to resend verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Navigate to Live Interactive Voice Demo
  const handleLiveDemo = () => {
    navigate('/demo');
  };

  return (
    <div className="min-h-screen bg-[#06080e] text-slate-100 flex flex-col justify-between px-6 lg:px-14 py-8 relative overflow-hidden font-sans selection:bg-blue-600 selection:text-white">
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-[600px] h-[350px] bg-indigo-600/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Top Header Navigation */}
      <header className="flex items-center justify-between z-20 mb-6">
        <Link to="/" className="flex items-center gap-3 group">
          {/* Samvada Soundwave Logo */}
          <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center gap-1 shadow-lg shadow-blue-500/10">
            <div className="w-1 h-3 bg-blue-500 rounded-full animate-pulse" />
            <div className="w-1 h-6 bg-blue-400 rounded-full" />
            <div className="w-1 h-4 bg-blue-500 rounded-full" />
            <div className="w-1 h-2 bg-blue-600 rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-white tracking-tight">Samvada</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-none mt-0.5">Voice AI for a more human world</p>
          </div>
        </Link>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <Link
            to="/demo"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
          >
            <Phone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Try</span> Live Demo
          </Link>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center flex-1 z-10 max-w-7xl mx-auto w-full py-4">
        {/* Left Column: Brand & Value Proposition */}
        <div className="lg:col-span-7 space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-5">
              <span>ENTERPRISE VOICE AI PLATFORM</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
              Conversations <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-400">
                that work.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-zinc-400 mt-5 max-w-xl leading-relaxed">
              Build, deploy and scale human-level voice AI agents with passwordless cryptographic security and automated enterprise onboarding.
            </p>
          </div>

          {/* 4 Feature Cards */}
          <div className="grid grid-cols-2 gap-3.5 max-w-lg">
            <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-sm flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-blue-950/60 border border-blue-500/20 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-zinc-200">
                Make & receive calls at scale
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-sm flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-blue-950/60 border border-blue-500/20 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-zinc-200">
                Human-like conversations
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-sm flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-blue-950/60 border border-blue-500/20 flex items-center justify-center shrink-0">
                <BarChart3 className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-zinc-200">
                Works in Indian languages
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-sm flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-blue-950/60 border border-blue-500/20 flex items-center justify-center shrink-0">
                <Puzzle className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-zinc-200">
                Easy integrations
              </span>
            </div>
          </div>

          {/* Soundwave Wave Visual & Quote */}
          <div className="relative pt-2">
            <div className="h-20 w-full max-w-lg relative overflow-hidden flex items-center">
              <svg className="w-full h-16 text-blue-500/60" viewBox="0 0 500 80" fill="none">
                <path
                  d="M0,40 Q50,5 100,40 T200,40 T300,40 T400,40 T500,40"
                  stroke="url(#blue-grad-1)"
                  strokeWidth="2.5"
                  fill="none"
                />
                <path
                  d="M0,40 Q70,75 140,40 T280,40 T420,40 T500,40"
                  stroke="url(#blue-grad-2)"
                  strokeWidth="1.8"
                  opacity="0.75"
                  fill="none"
                />
                <path
                  d="M0,40 Q30,10 60,40 T120,40 T180,40 T240,40 T300,40 T360,40 T420,40 T480,40"
                  stroke="#38bdf8"
                  strokeWidth="1"
                  opacity="0.5"
                  fill="none"
                />
                <defs>
                  <linearGradient id="blue-grad-1" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity="0.2" />
                    <stop offset="50%" stopColor="#38bdf8" stopOpacity="1" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.2" />
                  </linearGradient>
                  <linearGradient id="blue-grad-2" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0.1" />
                    <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div className="absolute right-12 bottom-0 transform rotate-[-3deg]">
              <span className="font-serif italic text-blue-300 text-sm tracking-wide drop-shadow">
                "More conversations, A brighter tomorrow"
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Authentication Card */}
        <div className="lg:col-span-5 flex flex-col items-center lg:items-end w-full">
          <div className="w-full max-w-[440px] bg-[#0c101b]/95 border border-zinc-800/80 rounded-2xl p-7 sm:p-8 shadow-2xl backdrop-blur-xl relative">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  {step === 'email' ? 'Get Started with Samvada' : 'Check your inbox'}
                </h2>
                {step === 'otp' && (
                  <button
                    type="button"
                    onClick={() => {
                      setStep('email');
                      setError('');
                    }}
                    className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Change</span>
                  </button>
                )}
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                {step === 'email'
                  ? 'Enter your work email to get started or sign in'
                  : `We sent a 6-digit verification code to ${email}`}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-xs text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* STEP 1: Enter Email Form */}
            {step === 'email' ? (
              <form onSubmit={handleRequestOTP} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      autoFocus
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-zinc-400 bg-blue-950/20 border border-blue-500/20 p-2.5 rounded-xl">
                  <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Passwordless OTP: No passwords to remember or lose. We authenticate securely via email codes.</span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all duration-200 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending code...</span>
                    </>
                  ) : (
                    <>
                      <span>Get Started</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleLiveDemo}
                  className="w-full py-2.5 px-3 rounded-xl border border-blue-500/30 bg-blue-950/30 hover:bg-blue-900/40 text-blue-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>⚡ Try Live Interactive Demo</span>
                </button>
              </form>
            ) : (
              /* STEP 2: 6-Digit OTP Verification Form */
              <form onSubmit={handleVerifyOTP} className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-2.5 text-center">
                    Enter the 6-digit verification code
                  </label>
                  <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                    {otpDigits.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (otpInputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-xl bg-zinc-950/90 border border-zinc-800 text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all shadow-inner"
                      />
                    ))}
                  </div>
                </div>

                {/* Resend timer */}
                <div className="flex items-center justify-between text-xs px-1">
                  <span className="text-zinc-500">
                    {canResend ? "Didn't receive code?" : `Resend code in ${countdown}s`}
                  </span>
                  <button
                    type="button"
                    disabled={!canResend || isLoading}
                    onClick={handleResendOTP}
                    className={`font-semibold flex items-center gap-1 transition-colors ${
                      canResend
                        ? 'text-blue-400 hover:text-blue-300 cursor-pointer'
                        : 'text-zinc-600 cursor-not-allowed'
                    }`}
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Resend Code</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={fetchDevOtp}
                  className="w-full py-1.5 px-3 rounded-lg border border-blue-500/20 bg-blue-950/20 hover:bg-blue-900/30 text-blue-400 hover:text-blue-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Fetch Real OTP from Auth Logs</span>
                </button>

                <button
                  type="submit"
                  disabled={isLoading || otpDigits.join('').length < 6}
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all duration-200 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying code...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Verify & Continue</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* SSO Options */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase">
                <span className="bg-[#0c101b] px-3 text-zinc-500 font-medium">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  window.location.href = '/api/v1/auth/google';
                }}
                className="flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-medium transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.4 8.9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5.1 3.7-8.8z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.7s.1-2 .4-2.7L1.6 6.4C.6 8.3 0 10.5 0 12s.6 3.7 1.6 5.6l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5L1.6 16.2C3.5 20.1 7.4 23 12 23z"
                  />
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setError('Microsoft Entra ID SSO is an enterprise add-on. Please use Google or Email verification code.');
                }}
                className="flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-medium transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 23 23">
                  <path fill="#f35325" d="M1 1h10v10H1z" />
                  <path fill="#81bc06" d="M12 1h10v10H12z" />
                  <path fill="#05a6f0" d="M1 12h10v10H1z" />
                  <path fill="#ffba08" d="M12 12h10v10H12z" />
                </svg>
                <span>Microsoft</span>
              </button>
            </div>

            <p className="text-[11px] text-zinc-500 text-center mt-5 leading-normal">
              By continuing, you agree to our{' '}
              <a href="#" className="underline hover:text-zinc-400">Terms of Service</a> and{' '}
              <a href="#" className="underline hover:text-zinc-400">Privacy Policy</a>.
            </p>
          </div>

          {/* Reassurance Security Banner below card */}
          <div className="w-full max-w-[440px] mt-4 p-4 rounded-xl bg-[#0a0d16]/80 border border-zinc-800/80 flex items-center gap-3.5 backdrop-blur-sm">
            <div className="w-9 h-9 rounded-lg bg-blue-950/60 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">HttpOnly Cookie Session Security</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Zero tokens in localStorage. Fully immune to XSS token theft.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer: Enterprise Trust & Security Badges */}
      <footer className="z-10 mt-6 pt-6 border-t border-zinc-900 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Enterprise-Grade Voice Infrastructure
          </p>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-zinc-400 text-xs">
            <div className="flex items-center gap-1.5 text-zinc-300 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>&lt; 350ms Latency</span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-300 font-medium">
              <span>🛡️ SOC 2 Type II Certified</span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-300 font-medium">
              <span>🔒 HIPAA & GDPR Ready</span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-300 font-medium">
              <span>⚡ 99.99% Uptime SLA</span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-300 font-medium">
              <span>🌐 25+ Global & Indic Dialects</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default LoginPage;
