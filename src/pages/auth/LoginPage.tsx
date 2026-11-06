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
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  Lock,
  CheckCircle2,
  Sparkles
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
  const { loginWithOTP, verifyLogin, devLogin } = useAuth();
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
    <div className="min-h-screen bg-[#fafafa] flex flex-col" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Header */}
      <header className="w-full border-b border-slate-200/90 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center gap-[3px]">
              <div className="w-[3px] h-3 bg-white/70 rounded-full" />
              <div className="w-[3px] h-5 bg-white rounded-full" />
              <div className="w-[3px] h-3.5 bg-white/70 rounded-full" />
              <div className="w-[3px] h-2 bg-white/50 rounded-full" />
            </div>
            <div>
              <span className="text-[15px] font-semibold text-slate-900 tracking-tight">Samvada</span>
              <p className="text-[10px] text-slate-500 leading-none mt-0.5 font-mono">Telephony Voice AI</p>
            </div>
          </Link>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="hidden sm:inline">Need assistance?</span>
            <a href="mailto:support@samvada.ai" className="font-medium text-slate-800 hover:text-slate-950 transition-colors">
              support@samvada.ai
            </a>
          </div>
        </div>
      </header>

      {/* Split Main */}
      <main className="flex-1 flex">

        {/* LEFT: Technical telephony preview */}
        <div className="hidden lg:flex lg:flex-1 bg-slate-50 relative flex-col items-center justify-center px-12 xl:px-20 py-16 overflow-hidden border-r border-slate-200/90">
          <div className="relative z-10 w-full max-w-lg space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold text-slate-900 tracking-tight leading-snug">
                Autonomous voice agents for enterprise telephony
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed max-w-md">
                Sub-second latency voice pipelines for inbound customer support, outbound qualification, and live CRM actions.
              </p>
            </div>
            <LiveVoiceDemoCard />
          </div>
        </div>

        {/* RIGHT: Auth panel */}
        <div className="flex-1 lg:max-w-[500px] xl:max-w-[540px] flex items-center justify-center bg-white px-10 sm:px-14 py-12">
        <div className="w-full max-w-[400px]">


              {/* Header */}
              <div className="mb-7">
                <div className="flex items-center justify-between">
                  <h1 className="text-[22px] font-bold text-[#0f172a] tracking-tight">
                    {step === 'email' ? 'Sign in to Samvada AI' : 'Check your inbox'}
                  </h1>
                  {step === 'otp' && (
                    <button
                      type="button"
                      onClick={() => { setStep('email'); setError(''); }}
                      className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-medium transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Change</span>
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
                  {step === 'email'
                    ? 'Enter your work email to receive a secure sign-in code.'
                    : <>We sent a 6-digit code to <span className="font-semibold text-[#0f172a]">{email}</span></>
                  }
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                  <span className="font-medium leading-relaxed">{error}</span>
                </div>
              )}

              {/* â”€â”€ STEP 1: Email â”€â”€ */}
              {step === 'email' ? (
                <form onSubmit={handleRequestOTP} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Work email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        autoFocus
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !email}
                    className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /><span>Sending code...</span></>
                    ) : (
                      <><span>Continue</span><ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>

                  {(import.meta as any).env?.DEV && (import.meta as any).env?.VITE_ENABLE_DEMO_ACCESS === 'true' && <button
                    type="button"
                    onClick={() => {
                      devLogin?.();
                      navigate('/agents');
                    }}
                    className="w-full py-2 px-4 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <span className="font-mono text-[10px] text-slate-500">[demo]</span>
                    <span>Instant sandbox access (Dev Demo)</span>
                  </button>}

                  {/* Divider */}
                  <div className="relative my-5">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-[11px]">
                      <span className="bg-white px-3 text-gray-400 font-medium">or continue with</span>
                    </div>
                  </div>

                  {/* SSO Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => { window.location.href = '/api/v1/auth/google/login'; }}
                      className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 transition-colors cursor-pointer"
                    >
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
                        <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                      </svg>
                      <span>Google</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { window.location.href = '/api/v1/auth/oauth/login'; }}
                      className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 transition-colors cursor-pointer"
                    >
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 21 21">
                        <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                        <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                        <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                        <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
                      </svg>
                      <span>Microsoft</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 text-center pt-2 leading-relaxed">
                    By continuing, you agree to our{' '}
                    <a href="#" className="underline hover:text-slate-600">Terms of Service</a>{' '}
                    and{' '}
                    <a href="#" className="underline hover:text-slate-600">Privacy Policy</a>.
                  </p>
                </form>
              ) : (
                /* Step 2: OTP */
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-3 text-center">
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
                          className="w-10 h-12 sm:w-11 sm:h-12 text-center text-lg font-mono font-medium rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 transition-colors"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Resend timer */}
                  <div className="flex items-center justify-between text-xs px-1">
                    <span className="text-slate-400">
                      {canResend ? "Didn't receive code?" : `Resend code in ${countdown}s`}
                    </span>
                    <button
                      type="button"
                      disabled={!canResend || isLoading}
                      onClick={handleResendOTP}
                      className={`font-medium flex items-center gap-1 transition-colors ${
                        canResend
                          ? 'text-slate-900 hover:underline cursor-pointer'
                          : 'text-slate-300 cursor-not-allowed'
                      }`}
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Resend code</span>
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || otpDigits.join('').length < 6}
                    className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /><span>Verifying...</span></>
                    ) : (
                      <><span>Verify and continue</span><ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </form>
              )}

          {/* Below-card note */}
          <p className="text-center text-xs text-slate-400 mt-5">
            Don't have an account?{' '}
            <span className="text-slate-800 font-medium">
              Sign in with work email to provision automatically.
            </span>
          </p>
        </div>
        </div>{/* end right auth panel */}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/90 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <span>&copy; {new Date().getFullYear()} Samvada Technologies, Inc.</span>
          <div className="flex items-center gap-5">
            <a href="#" className="hover:text-slate-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-slate-600 transition-colors">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;
