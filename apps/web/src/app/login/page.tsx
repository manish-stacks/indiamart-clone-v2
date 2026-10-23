'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, LogIn, AlertCircle } from 'lucide-react';
import { fetchApi } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (res.success && res.data) {
      login(res.data.accessToken, res.data.user);
      const redirectUrl = new URLSearchParams(window.location.search).get('redirect');
      const isAdminUser = res.data.user?.roles?.some((r: any) => r === 'ADMIN' || r === 'SUPER_ADMIN');
      if (redirectUrl) {
        router.push(redirectUrl);
      } else if (isAdminUser) {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } else {
      setError(res.message || 'Invalid email or password');
    }
    setLoading(false);
  };

  const fillDemoAccount = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <div className="text-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold text-xl flex items-center justify-center mx-auto mb-2 shadow-sm">
            IT
          </div>
          <h1 className="text-xl font-bold text-slate-900">Sign In to IndiaTrade</h1>
          <p className="text-xs text-slate-500 mt-1">
            Access your B2B supplier inquiries, quotations, and buyer requirements.
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="e.g. supplier@example.com"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">Password</label>
              <Link href="/help" className="text-[11px] text-emerald-700 hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-xs transition flex items-center justify-center gap-1.5"
          >
            <LogIn className="w-4 h-4" />
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Quick-Fill Section */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
            Quick-Fill Demo Accounts
          </div>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => fillDemoAccount('apex.machinery@demomarketplace.in', 'SellerDemo123!')}
              className="w-full text-left bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 p-2.5 rounded-lg text-xs transition"
            >
              <div className="font-semibold text-slate-800">Verified Seller (Apex Machinery)</div>
              <div className="text-[11px] text-slate-500">apex.machinery@demomarketplace.in</div>
            </button>

            <button
              type="button"
              onClick={() => fillDemoAccount('buyer.delhi@demomarketplace.in', 'BuyerDemo123!')}
              className="w-full text-left bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 p-2.5 rounded-lg text-xs transition"
            >
              <div className="font-semibold text-slate-800">Procurement Buyer (Rohit Sharma)</div>
              <div className="text-[11px] text-slate-500">buyer.delhi@demomarketplace.in</div>
            </button>

            <button
              type="button"
              onClick={() => fillDemoAccount('admin@demomarketplace.in', 'AdminDemo123!')}
              className="w-full text-left bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 p-2.5 rounded-lg text-xs transition"
            >
              <div className="font-semibold text-slate-800">Platform Administrator</div>
              <div className="text-[11px] text-slate-500">admin@demomarketplace.in</div>
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link href="/register" className="font-semibold text-emerald-700 hover:underline">
            Register for Free
          </Link>
        </div>
      </div>
    </div>
  );
}

