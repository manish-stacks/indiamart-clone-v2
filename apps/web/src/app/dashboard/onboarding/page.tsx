'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building2, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { fetchApi } from '../../../lib/api';
import { useAuth } from '../../../lib/auth-context';
import { BusinessType } from '@marketplace/shared';

export default function BusinessOnboardingPage() {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();

  const [name, setName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [gstin, setGstin] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType>(BusinessType.MANUFACTURER);
  const [description, setDescription] = useState('');
  const [yearEstablished, setYearEstablished] = useState<number>(2018);
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetchApi('/businesses', {
      method: 'POST',
      body: JSON.stringify({
        name,
        legalName: legalName || undefined,
        gstin: gstin ? gstin.toUpperCase().trim() : undefined,
        businessType,
        description: description || undefined,
        yearEstablished: Number(yearEstablished) || undefined,
        street: street || undefined,
        city: city || undefined,
        state: state || undefined,
        postalCode: postalCode || undefined,
      }),
    });

    if (res.success && res.data) {
      await refreshProfile();
      router.push(`/store/${res.data.slug}`);
    } else {
      setError(res.message || 'Failed to register business storefront.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <div className="border-b border-slate-100 pb-5 mb-6">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" /> Seller Onboarding
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Set Up Your Business Storefront
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            List your manufacturing plant, wholesale firm, or distributorship for free.
          </p>
        </div>

        {error && (
          <div className="mb-5 bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3.5 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Display Business / Brand Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Acme Precision Tools"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Legal Registered Entity Name</label>
              <input
                type="text"
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                placeholder="e.g. Acme Precision Tools Pvt Ltd"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">15-Digit Indian GSTIN</label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value.toUpperCase())}
                placeholder="e.g. 27AABCU9603R1ZM"
                maxLength={15}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none font-mono uppercase focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Business Classification</label>
              <select
                aria-label="Business Classification"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value as BusinessType)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none bg-white font-medium"
              >
                <option value={BusinessType.MANUFACTURER}>Manufacturer / Factory</option>
                <option value={BusinessType.WHOLESALER}>Wholesaler / Bulk Trader</option>
                <option value={BusinessType.DISTRIBUTOR}>Distributor / Channel Partner</option>
                <option value={BusinessType.EXPORTER}>Exporter / International</option>
                <option value={BusinessType.SERVICE_PROVIDER}>Industrial Service Provider</option>
                <option value={BusinessType.RETAILER}>Retailer</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Year Established</label>
              <input
                type="number"
                value={yearEstablished}
                onChange={(e) => setYearEstablished(Number(e.target.value))}
                min={1950}
                max={new Date().getFullYear()}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Company Description & Capabilities</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe manufacturing infrastructure, machinery, certifications (ISO), capacity, etc."
              className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-2 border-t border-slate-100">
            <span className="font-bold text-slate-800 block mb-2">Registered Address</span>
            <div className="space-y-3">
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="Plot/Shop number, Industrial Estate, Street"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City (e.g. Surat)"
                  className="border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="State (e.g. Gujarat)"
                  className="border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="PIN Code"
                  className="border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-emerald-50/60 p-3 rounded-lg border border-emerald-100">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Storefront creation is completely free. Zero listing fees and zero lead unlock charges.</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm transition shadow-sm"
          >
            {loading ? 'Creating Storefront...' : 'Launch Free Business Storefront'}
          </button>
        </form>
      </div>
    </div>
  );
}

