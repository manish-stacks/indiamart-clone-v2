'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PlusCircle, CheckCircle2, ShieldCheck, MapPin } from 'lucide-react';
import { fetchApi } from '../../../lib/api';
import { useAuth } from '../../../lib/auth-context';

export default function PostRequirementPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [categories, setCategories] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [quantity, setQuantity] = useState<number>(100);
  const [unitOfMeasure, setUnitOfMeasure] = useState('PIECE');
  const [targetPrice, setTargetPrice] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('');
  const [deliveryState, setDeliveryState] = useState('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function getCategories() {
      const res = await fetchApi('/categories');
      if (res.success && res.data) {
        setCategories(res.data);
        if (res.data[0]) setCategoryId(res.data[0].id);
      }
    }
    getCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login?redirect=/requirements/new');
      return;
    }

    setLoading(true);
    const res = await fetchApi('/requirements', {
      method: 'POST',
      body: JSON.stringify({
        title,
        categoryId,
        quantity: Number(quantity),
        unitOfMeasure,
        targetPrice: targetPrice ? Number(targetPrice) : undefined,
        deliveryCity: deliveryCity || 'All India',
        deliveryState: deliveryState || '',
        description,
      }),
    });

    if (res.success) {
      setSubmitted(true);
    } else {
      alert(res.message || 'Failed to publish requirement');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <div className="border-b border-slate-100 pb-5 mb-6">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider mb-1">
            <PlusCircle className="w-4 h-4" /> B2B Request For Quotation (RFQ)
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Post Your Buying Requirement
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Describe what product, machinery, or raw materials you need. Verified Indian manufacturers will quote directly.
          </p>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">RFQ Published Successfully!</h2>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Your requirement for <span className="font-semibold text-slate-900">{title}</span> is now active. Matching verified suppliers will review your specifications and submit formal quotations.
            </p>
            <div className="pt-4 flex justify-center gap-3">
              <Link
                href="/search"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-lg text-xs transition"
              >
                Browse Existing Suppliers
              </Link>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setTitle('');
                  setDescription('');
                }}
                className="border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold px-5 py-2.5 rounded-lg text-xs transition"
              >
                Post Another Requirement
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Requirement Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g. Need 500 Meters Cotton Twill Fabric 120 GSM"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Product Category</label>
              <select
                aria-label="Select product category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none bg-white font-medium"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Required Quantity</label>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  required
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Unit of Measure</label>
                <select
                  aria-label="Select unit of measure"
                  value={unitOfMeasure}
                  onChange={(e) => setUnitOfMeasure(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none bg-white font-medium"
                >
                  <option value="PIECE">Piece / Unit</option>
                  <option value="BOX">Box / Carton</option>
                  <option value="TON">Metric Ton</option>
                  <option value="KG">Kilogram (Kg)</option>
                  <option value="METER">Meter</option>
                  <option value="LITRE">Litre</option>
                  <option value="SET">Set / Kit</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Delivery City</label>
                <input
                  type="text"
                  value={deliveryCity}
                  onChange={(e) => setDeliveryCity(e.target.value)}
                  required
                  placeholder="e.g. Mumbai, Delhi, Ahmedabad"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">State / UT</label>
                <input
                  type="text"
                  value={deliveryState}
                  onChange={(e) => setDeliveryState(e.target.value)}
                  required
                  placeholder="e.g. Maharashtra, Gujarat"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Target Budget / Unit Price (INR, Optional)
              </label>
              <input
                type="number"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder="e.g. 150 per meter"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Detailed Specifications & Technical Needs
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                placeholder="Provide details about material grade, size tolerance, packaging, target delivery date, etc."
                className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-emerald-50/60 p-3 rounded-lg border border-emerald-100">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Buyer Privacy Protection: Your phone number and email are guarded. Only quotes from verified suppliers are delivered.</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm transition shadow-sm"
            >
              {loading ? 'Submitting RFQ...' : 'Publish Buying Requirement (Free)'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

