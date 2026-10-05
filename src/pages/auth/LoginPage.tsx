import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getOnboardingRoute } from '../../utils/navigation';
import { User } from '../../types';
import { LiveVoiceDemoCard } from '../../components/ui/LiveVoiceDemoCard';
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Phone,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  Lock,
  CheckCircle2
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
      // Delete flash cookie to prevent stale reuse
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
      setError('Please enter your work email');
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
      setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      setError(
        err?.response?.data?.error?.message ||
        err?.message ||
        'Unable to send verification code. Please check your email.'
      );
    } finally {
      setIsLoading(false);
    }
  };

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
      if ('redirectTo' in result && result.redirectTo) {
        window.location.href = result.redirectTo;
        return;
      }
      const targetRoute = getOnboardingRoute(result as User);
      navigate(targetRoute);
    } catch (err: any) {
      setError(
        err?.response?.data?.error?.message ||
        err?.message ||
        'Invalid or expired verification code. Please try again.'
      );
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

  return (
    <div className="min-h-screen bg-[#070b16] text-slate-100 flex flex-col justify-between px-6 sm:px-12 lg:px-20 py-7 relative overflow-hidden font-sans selection:bg-blue-600 selection:text-white">
      {/* Refined, formal enterprise ambient backdrop (inspired by Stripe / Twilio) */}
      <div className="absolute top-0 inset-x-0 h-[480px] bg-gradient-to-b from-blue-950/25 via-slate-900/10 to-transparent pointer-events-none" />
      <div className="absolute -top-32 right-1/4 w-[650px] h-[350px] bg-blue-600/8 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-20 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Top Header Navigation */}
      <header className="flex items-center justify-between w-full max-w-7xl mx-auto z-20">
        <Link to="/" className="flex items-center gap-3 group">
          {/* Samvada AI Soundwave Logo */}
          <div className="w-10 h-10 rounded-2xl bg-[#0d1424] border border-blue-500/30 flex items-center justify-center gap-1 shadow-lg shadow-blue-500/10 group-hover:border-blue-500/50 transition-all">
            <div className="w-1 h-3.5 bg-blue-500 rounded-full animate-pulse" />
            <div className="w-1 h-6 bg-blue-400 rounded-full" />
            <div className="w-1 h-4 bg-blue-500 rounded-full" />
            <div className="w-1 h-2 bg-blue-600 rounded-full" />
          </div>
          <div>
            <span className="text-lg font-bold text-white tracking-tight block">Samvada AI</span>
            <p className="text-[11px] text-zinc-400 font-normal leading-tight">AI voice agents for real conversations.</p>
          </div>
        </Link>

        {/* Try Live Demo outline pill button */}
        <Link
          to="/live-demo"
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-950/20 hover:bg-blue-900/30 hover:border-blue-500/60 text-blue-300 hover:text-white text-xs font-semibold transition-all shadow-sm active:scale-[0.98]"
        >
          <Phone className="w-3.5 h-3.5 text-blue-400" />
          <span>Try Live Demo</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Main Content Layout */}
      <main className="flex-1 flex items-center w-full max-w-7xl mx-auto py-8 sm:py-12 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center w-full">
          
          {/* Left Column: Hero Headline & Live Voice Demo Card */}
          <div className="lg:col-span-7 space-y-6 flex flex-col justify-center">
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold text-white tracking-tight leading-[1.08]">
                Conversations <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400">
                  that work.
                </span>
              </h1>
              <p className="text-base sm:text-lg text-zinc-300 font-normal max-w-lg leading-relaxed pt-1">
                Build, deploy and scale AI voice agents for real business conversations.
              </p>
            </div>

            {/* Pixel-perfect Live Voice Demo Card with 60 FPS Living Soundwave */}
            <LiveVoiceDemoCard />
          </div>

          {/* Right Column: Authentication Card */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end w-full">
            <div className="w-full max-w-[430px] bg-[#0c1222]/95 border border-zinc-800/80 rounded-3xl p-7 sm:p-9 shadow-2xl backdrop-blur-xl relative">
              
              {/* Card Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    {step === 'email' ? 'Welcome to Samvada AI' : 'Check your inbox'}
                  </h2>
                  {step === 'otp' && (
                    <button
                      type="button"
                      onClick={() => {
                        setStep('email');
                        setError('');
                      }}
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Change</span>
                    </button>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                  {step === 'email'
                    ? 'Sign in or create your workspace account.'
                    : `We sent a 6-digit verification code to ${email}`}
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-xs text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {/* STEP 1: Enter Email Form */}
              {step === 'email' ? (
                <form onSubmit={handleRequestOTP} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-2">
                      Work email
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
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#080d19] border border-blue-900/40 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors shadow-inner"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !email}
                    className="w-full mt-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-all duration-200 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending code...</span>
                      </>
                    ) : (
                      <>
                        <span>Continue</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Or continue with divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-zinc-800/80" />
                    </div>
                    <div className="relative flex justify-center text-[11px] uppercase">
                      <span className="bg-[#0c1222] px-3 text-zinc-500 font-medium lowercase">or continue with</span>
                    </div>
                  </div>

                  {/* Google & Microsoft Social SSO Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        window.location.href = '/api/v1/auth/google/login';
                      }}
                      className="flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-xl bg-[#111728] hover:bg-[#161e33] border border-zinc-800/80 text-xs font-semibold text-zinc-200 transition-colors cursor-pointer"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                        />
                      </svg>
                      <span>Google</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        window.location.href = '/api/v1/auth/oauth/login';
                      }}
                      className="flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-xl bg-[#111728] hover:bg-[#161e33] border border-zinc-800/80 text-xs font-semibold text-zinc-200 transition-colors cursor-pointer"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 21 21">
                        <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                        <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                        <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                        <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
                      </svg>
                      <span>Microsoft</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-zinc-500 text-center pt-3 leading-relaxed">
                    By continuing, you agree to our{' '}
                    <a href="#" className="underline hover:text-zinc-400">Terms of Service</a>{' '}
                    and{' '}
                    <a href="#" className="underline hover:text-zinc-400">Privacy Policy</a>.
                  </p>

                  {/* Enterprise Compliance & Security Row */}
                  <div className="pt-4 mt-2 border-t border-zinc-800/70 flex items-center justify-center gap-3 text-[11px] text-zinc-500">
                    <span className="flex items-center gap-1 text-zinc-400">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      SOC 2 Type II
                    </span>
                    <span className="text-zinc-700">•</span>
                    <span className="flex items-center gap-1 text-zinc-400">
                      <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      HIPAA Ready
                    </span>
                    <span className="text-zinc-700">•</span>
                    <span className="flex items-center gap-1 text-zinc-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      99.99% SLA
                    </span>
                  </div>
                </form>
              ) : (
                /* STEP 2: 6-Digit OTP Verification Form */
                <form onSubmit={handleVerifyOTP} className="space-y-5">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-3 text-center">
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
                          className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-xl bg-[#080d19] border border-blue-900/40 text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all shadow-inner"
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
                    type="submit"
                    disabled={isLoading || otpDigits.join('').length < 6}
                    className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all duration-200 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying code...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify & Continue</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

            </div>
          </div>

        </div>
      </main>

      {/* Clean subtle bottom space without heavy footer clutter */}
      <div className="w-full max-w-7xl mx-auto py-2 z-10" />
    </div>
  );
};

export default LoginPage;
