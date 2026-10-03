import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, AlertCircle, ArrowLeft, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { NavRoute } from '../layout/Navbar';
import { AquaLensLogo } from '../common/AquaLensLogo';

interface LoginViewProps {
  onSuccess: () => void;
  onCancel?: () => void;
  intendedActionLabel?: string;
  onRouteChange?: (route: NavRoute) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onSuccess,
  onCancel,
  intendedActionLabel,
  onRouteChange,
}) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Email is required.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setError('Password is required.');
      return;
    }

    if (password.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(trimmedEmail, password);
    setIsSubmitting(false);

    if (result.success) {
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 600);
    } else {
      setError(result.error || 'Invalid credentials. Please try again.');
    }
  };

  const handleDemoFill = (role: 'analyst' | 'admin') => {
    if (role === 'admin') {
      setEmail('admin@aqualens.org');
      setPassword('admin2026');
    } else {
      setEmail('field.analyst@aqualens.org');
      setPassword('stream2026');
    }
    setError(null);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-8 px-4 sm:px-6">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center gap-2 mb-1">
            <AquaLensLogo className="w-8 h-8 shrink-0" />
            <span className="text-xl font-bold tracking-tight text-slate-900">AquaLens</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back</h1>
          <p className="text-xs text-slate-500">
            {intendedActionLabel
              ? `Sign in required to ${intendedActionLabel.toLowerCase()}.`
              : 'Sign in to log observations and manage environmental telemetry.'}
          </p>
        </div>

        {/* Intended action alert banner if redirected */}
        {intendedActionLabel && (
          <div className="p-3 bg-teal-50 border border-teal-200/80 rounded-lg text-xs text-teal-800 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
            <span>
              Authentication required for: <strong>{intendedActionLabel}</strong>. You will be returned immediately after login.
            </span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Success State */}
        {isSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Authentication successful! Returning you to your task...</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5" htmlFor="email-input">
              Email
            </label>
            <div className="relative">
              <input
                id="email-input"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                disabled={isSubmitting || isSuccess}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2.5 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-teal-600 focus:ring-1 focus:ring-teal-600 outline-hidden transition-all disabled:opacity-50"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5" htmlFor="password-input">
              Password
            </label>
            <div className="relative">
              <input
                id="password-input"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                disabled={isSubmitting || isSuccess}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2.5 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-teal-600 focus:ring-1 focus:ring-teal-600 outline-hidden transition-all disabled:opacity-50"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isSuccess}
            className="w-full py-2.5 px-4 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Signed In</span>
              </>
            ) : (
              <span>Login</span>
            )}
          </button>
        </form>

        {/* Demo Fast Fill */}
        <div className="pt-4 border-t border-slate-100 text-center space-y-2">
          <div className="text-[11px] text-slate-400 font-mono">Demo Quick-Sign In:</div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => handleDemoFill('analyst')}
              className="px-2.5 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors cursor-pointer"
            >
              Field Analyst
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('admin')}
              className="px-2.5 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors cursor-pointer"
            >
              Administrator
            </button>
          </div>
        </div>

        {/* Cancel / Back to Dashboard */}
        {onCancel && (
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="text-[11px] text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Continue browsing as guest</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
