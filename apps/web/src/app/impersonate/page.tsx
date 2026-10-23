'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, Loader2, ExternalLink, ArrowRight } from 'lucide-react';
import { useAuth } from '../../lib/auth-context';

function ImpersonateHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshProfile } = useAuth();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const token = searchParams.get('token');
  const name = searchParams.get('name') || 'User';
  const role = searchParams.get('role') || 'SELLER';
  const redirectPath = searchParams.get('redirect') || '/dashboard';

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Missing authentication impersonation token.');
      return;
    }

    try {
      // Set session-scoped token and flag (per-tab isolation, does not affect admin in original tab)
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('is_tab_impersonation', 'true');
      sessionStorage.setItem('impersonated_name', name);
      sessionStorage.setItem('impersonated_role', role);

      // Refresh auth profile using the newly stored session token
      refreshProfile().then(() => {
        setStatus('success');
        setTimeout(() => {
          router.replace(redirectPath);
        }, 800);
      });
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'Failed to initialize impersonation session');
    }
  }, [token, name, role, redirectPath, refreshProfile, router]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-md w-full text-center text-white shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto mb-5 shadow-inner">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <h1 className="text-xl font-bold tracking-tight mb-2">
          Admin Inspection Session
        </h1>
        <p className="text-xs text-slate-400 mb-6">
          Opening isolated account session in a separate browser tab. Your original Super Admin tab remains active and undisturbed.
        </p>

        {status === 'loading' && (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-sm text-amber-300 font-semibold">
              <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
              <span>Authenticating as {name}...</span>
            </div>
            <div className="text-[11px] text-slate-400">
              Role: <span className="bg-slate-700 px-2 py-0.5 rounded text-amber-200 font-bold uppercase">{role}</span>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-3">
            <div className="text-sm font-semibold text-emerald-400 flex items-center justify-center gap-1.5">
              <span>Ready! Redirecting to {role === 'BUYER' ? 'Buyer Hub' : 'Seller Dashboard'}...</span>
            </div>
            <button
              onClick={() => router.replace(redirectPath)}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition"
            >
              <span>Go to Dashboard Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-xl text-xs">
              {errorMessage}
            </div>
            <button
              onClick={() => router.replace('/admin')}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-xl text-xs transition"
            >
              Return to Super Admin Console
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ImpersonatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ImpersonateHandler />
    </Suspense>
  );
}

