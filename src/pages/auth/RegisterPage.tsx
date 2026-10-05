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
  BarChart3,
  Globe,
  Puzzle,
  ShieldCheck,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [step, setStep] = useState<'info' | 'otp'>('info');
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

  // Read email & login_challenge from query param or flash cookie
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }

    const queryChallenge = params.get('login_challenge');
    if (queryChallenge) {
      setLoginChallenge(queryChallenge);
      return;
    }

    const match = document.cookie.match(/(?:^|;\s*)login_challenge=([^;]+)/);
    if (match && match[1]) {
      const challengeVal = decodeURIComponent(match[1]);
      setLoginChallenge(challengeVal);
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

  // Step 1: Request Registration OTP from backend /api/v1/auth/admin/register
  const handleRegisterRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please provide your work email address');
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
      setError(err?.response?.data?.error?.message || err?.message || 'Failed to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Handle OTP input & auto-focus
  const handleOtpChange = (index: number, value: string) => {
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

  // Step 2: Verify registration OTP with backend /api/v1/auth/admin/verify
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
      // Dynamically routes based on user's actual onboarding progress
      const targetRoute = getOnboardingRoute(result as User);
      navigate(targetRoute || '/onboarding/profile');
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || err?.message || 'Invalid or expired verification code.');
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

  const handleGoogleRegister = () => {
    window.location.href = '/api/v1/auth/google';
  };

  const handleMicrosoftRegister = () => {
    setError('Microsoft Entra ID SSO is available on Enterprise plans. Please use Google or Email verification code.');
  };

  return (
    <div className="min-h-screen bg-[#050814] text-slate-100 flex flex-col justify-between px-6 lg:px-14 py-8 relative overflow-hidden font-sans selection:bg-blue-600 selection:text-white">
      {/* Background ambient lighting effects matching login theme */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-blue-600/12 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-36 -left-36 w-[560px] h-[560px] rounded-full border border-blue-500/20 bg-gradient-to-tr from-blue-600/20 via-sky-500/5 to-transparent blur-xl pointer-events-none" />
      
      {/* Luminous orbital arc in bottom-left corner */}
      <svg className="absolute -bottom-16 -left-16 w-[450px] h-[450px] pointer-events-none opacity-40" viewBox="0 0 400 400" fill="none">
        <path d="M 0 400 A 360 360 0 0 1 360 40" stroke="url(#regArcBlueGrad)" strokeWidth="2.5" />
        <defs>
          <linearGradient id="regArcBlueGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#2563eb" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* Bottom-right ambient aura */}
      <div className="absolute -bottom-28 -right-28 w-[450px] h-[450px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header Navigation */}
      <header className="flex items-center justify-between z-20 mb-6">
        <Link to="/" className="flex items-center gap-3 group">
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

        <div className="flex items-center gap-2.5 sm:gap-3">
          <Link
            to="/demo"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
          >
            <Phone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Try</span> Live Demo
          </Link>
          <span className="text-sm text-zinc-400 hidden md:inline">Already have an account?</span>
          <Link
            to="/login"
            className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium border border-zinc-700/80 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200 hover:text-white transition-all duration-200 backdrop-blur-md shadow-sm"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center flex-1 z-10 max-w-7xl mx-auto w-full py-4">
        {/* Left Column: Brand & Value Proposition */}
        <div className="lg:col-span-7 space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-5">
              <span>GET STARTED IN MINUTES</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
              Launch Voice AI <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-400">
                in just 3 steps.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-zinc-400 mt-5 max-w-xl leading-relaxed">
              Create your corporate organization workspace, select your industry blueprints, and configure your first autonomous voice agent.
            </p>
          </div>

          {/* 3 Step Process Cards */}
          <div className="space-y-3 max-w-lg">
            <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-sm flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-bold text-sm text-blue-400 shrink-0">
                1
              </div>
              <div>
                <p className="text-sm font-medium text-white">Profile & Workspace Setup</p>
                <p className="text-xs text-zinc-400">Name, business type, and primary company profile</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-sm flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-bold text-sm text-blue-400 shrink-0">
                2
              </div>
              <div>
                <p className="text-sm font-medium text-white">Select Industry Blueprints</p>
                <p className="text-xs text-zinc-400">Pre-tuned prompts for BFSI, Healthcare, EdTech, Real Estate</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-sm flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-bold text-sm text-blue-400 shrink-0">
                3
              </div>
              <div>
                <p className="text-sm font-medium text-white">Create First AI Agent</p>
                <p className="text-xs text-zinc-400">Choose voice, language, knowledge base, and test immediately</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Registration Card */}
        <div className="lg:col-span-5 flex flex-col items-center lg:items-end w-full">
          <div className="w-full max-w-[440px] bg-[#0c101b]/95 border border-zinc-800/80 rounded-2xl p-7 sm:p-8 shadow-2xl backdrop-blur-xl relative">
            <div className="mb-5">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  {step === 'info' ? 'Create an account' : 'Verify your email'}
                </h2>
                {step === 'otp' && (
                  <button
                    type="button"
                    onClick={() => {
                      setStep('info');
                      setError('');
                    }}
                    className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                )}
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                {step === 'info'
                  ? 'Start your 14-day free enterprise voice trial'
                  : `Enter the 6-digit code sent to ${email}`}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 text-center">
                {error}
              </div>
            )}

            {step === 'info' ? (
              <>
                {/* SSO Buttons */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    type="button"
                    onClick={handleGoogleRegister}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-medium transition-all"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.4 8.9 5 12 5z"/>
                      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5.1 3.7-8.8z"/>
                      <path fill="#FBBC05" d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.7s.1-2 .4-2.7L1.6 6.4C.6 8.3 0 10.5 0 12s.6 3.7 1.6 5.6l3.7-2.9z"/>
                      <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5L1.6 16.2C3.5 20.1 7.4 23 12 23z"/>
                    </svg>
                    <span className="truncate">Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleMicrosoftRegister}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-medium transition-all"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 23 23">
                      <path fill="#f35325" d="M1 1h10v10H1z" />
                      <path fill="#81bc06" d="M12 1h10v10H12z" />
                      <path fill="#05a6f0" d="M1 12h10v10H1z" />
                      <path fill="#ffba08" d="M12 12h10v10H12z" />
                    </svg>
                    <span className="truncate">Microsoft</span>
                  </button>
                </div>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-800" />
                  </div>
                  <div className="relative flex justify-center text-[11px] lowercase">
                    <span className="bg-[#0c101b] px-3 text-zinc-500 font-medium">or register passwordless</span>
                  </div>
                </div>

                {/* Registration Form: Only Work Email */}
                <form onSubmit={handleRegisterRequest} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                      Work email
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
                    disabled={isLoading || !email}
                    className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all duration-200 cursor-pointer disabled:opacity-50"
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

                  <p className="text-[11px] text-zinc-500 text-center leading-relaxed pt-1">
                    By registering, you agree to our{' '}
                    <a href="#" className="text-zinc-400 hover:text-blue-400 underline">Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" className="text-zinc-400 hover:text-blue-400 underline">Privacy Policy</a>.
                  </p>
                </form>

                <div className="mt-5 pt-4 border-t border-zinc-800/80 text-center">
                  <span className="text-xs text-zinc-400">Already have an account? </span>
                  <Link
                    to={email ? `/login?email=${encodeURIComponent(email)}` : "/login"}
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
                  >
                    Sign in
                  </Link>
                </div>
              </>
            ) : (
              /* Step 2: OTP Verification */
              <form onSubmit={handleVerifyOTP} className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-2.5 text-center">
                    Enter the 6-digit code sent to your email
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
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all duration-200 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
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
          </div>

          <div className="w-full max-w-[440px] mt-4 p-4 rounded-xl bg-[#0a0d16]/80 border border-zinc-800/80 flex items-center gap-3.5 backdrop-blur-sm">
            <div className="w-9 h-9 rounded-lg bg-blue-950/60 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Passwordless Enterprise Security</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Zero passwords stored in databases. Authenticate seamlessly with single-use cryptographic codes.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
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
          </div>
        </div>
      </footer>
    </div>
  );
};
export default RegisterPage;
