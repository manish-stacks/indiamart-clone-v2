'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserPlus, AlertCircle, ShieldCheck } from 'lucide-react';
import { fetchApi } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import { UserRole } from '@marketplace/shared';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [initialRole, setInitialRole] = useState<UserRole>(UserRole.SELLER);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        fullName,
        email,
        phone: phone ? phone : undefined,
        password,
        initialRole,
      }),
    });

    if (res.success && res.data) {
      login(res.data.accessToken, res.data.user);
      if (initialRole === UserRole.SELLER) {
        router.push('/dashboard/onboarding');
      } else {
        router.push('/');
      }
    } else {
      setError(res.message || 'Registration failed. Please check your details.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <div className="text-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold text-xl flex items-center justify-center mx-auto mb-2 shadow-sm">
            IT
          </div>
          <h1 className="text-xl font-bold text-slate-900">Create Free Account</h1>
          <p className="text-xs text-slate-500 mt-1">
            Join thousands of Indian businesses with zero lead charges.
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">I am registering to:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setInitialRole(UserRole.SELLER)}
                className={`p-2.5 rounded-lg border text-xs font-semibold transition ${
                  initialRole === UserRole.SELLER
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Sell & Supply (B2B/B2C)
              </button>
              <button
                type="button"
                onClick={() => setInitialRole(UserRole.BUYER)}
                className={`p-2.5 rounded-lg border text-xs font-semibold transition ${
                  initialRole === UserRole.BUYER
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Procure & Buy
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="e.g. Ramesh Patel"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="e.g. ramesh@company.com"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number (Optional)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +91 98250 12345"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="At least 8 characters"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded border border-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Free membership forever. No mandatory subscriptions or paywalls.</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-xs transition flex items-center justify-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            {loading ? 'Creating Account...' : 'Complete Free Registration'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link href="/login" className="font-semibold text-emerald-700 hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

