'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  PlusCircle,
  Search,
  Filter,
  MapPin,
  Clock,
  Building2,
  CheckCircle2,
  Send,
  Boxes,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  User,
  X,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { fetchApi } from '../../lib/api';

const INDIAN_CITIES = [
  'All India',
  'Mumbai',
  'Delhi',
  'Ahmedabad',
  'Surat',
  'Bengaluru',
  'Pune',
  'Chennai',
  'Kolkata',
  'Hyderabad',
  'Rajkot',
  'Ludhiana',
  'Indore',
  'Jaipur',
];

export default function RequirementsBoardPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [requirements, setRequirements] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCity, setSelectedCity] = useState('All India');

  // Response Modal State
  const [selectedRfq, setSelectedRfq] = useState<any | null>(null);
  const [quoteMessage, setQuoteMessage] = useState('');
  const [offeredPrice, setOfferedPrice] = useState<number | ''>('');
  const [submittingQuote, setSubmittingQuote] = useState(false);
  const [quoteSuccess, setQuoteSuccess] = useState(false);

  const primaryBusiness = user?.businessMemberships?.[0];

  const loadData = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCategory) params.set('categoryId', selectedCategory);
    if (selectedCity !== 'All India') params.set('city', selectedCity);
    if (searchQuery.trim()) params.set('search', searchQuery.trim());

    const [rfqRes, catRes] = await Promise.all([
      fetchApi<any[]>(`/requirements?${params.toString()}`),
      fetchApi<any[]>('/categories'),
    ]);

    if (rfqRes.success && Array.isArray(rfqRes.data)) {
      setRequirements(rfqRes.data);
    }
    if (catRes.success && Array.isArray(catRes.data)) {
      setCategories(catRes.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, selectedCity]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleOpenQuoteModal = (rfq: any) => {
    if (!user) {
      router.push('/login?redirect=/requirements');
      return;
    }
    if (!primaryBusiness) {
      alert('You need to setup your seller business profile first before submitting B2B quotations.');
      router.push('/dashboard/onboarding');
      return;
    }
    setSelectedRfq(rfq);
    setQuoteMessage(
      `Dear ${rfq.buyer?.fullName || 'Buyer'}, we at ${primaryBusiness.businessName} are verified suppliers of this material/equipment. We can supply the required quantity of ${rfq.quantity} ${rfq.unitOfMeasure} with immediate dispatch to ${rfq.deliveryCity}.`
    );
    setOfferedPrice(rfq.targetPrice ? Number(rfq.targetPrice) : '');
    setQuoteSuccess(false);
  };

  const handleSubmitQuoteResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRfq || !primaryBusiness) return;

    setSubmittingQuote(true);
    const res = await fetchApi(`/requirements/${selectedRfq.id}/respond`, {
      method: 'POST',
      body: JSON.stringify({
        businessId: primaryBusiness.businessId,
        message: quoteMessage,
        offeredPrice: offeredPrice ? Number(offeredPrice) : undefined,
      }),
    });

    if (res.success) {
      setQuoteSuccess(true);
      setTimeout(() => {
        setSelectedRfq(null);
        setQuoteSuccess(false);
        loadData();
      }, 1500);
    } else {
      alert(res.message || 'Failed to submit quote response');
    }
    setSubmittingQuote(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-2">
            <PlusCircle className="w-4 h-4" /> Live B2B Request For Quotation (RFQ) Board
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Discover Verified Buyer Requirements Across India
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
            Businesses and institutional procurement managers post raw material, machinery, and wholesale requirements daily. Quote directly with zero lead commission.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <Link
            href="/requirements/new"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post a Requirement</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2 w-full">
          {/* City filter */}
          <div className="flex items-center gap-1.5 border border-slate-300 rounded-lg px-2.5 py-2 text-xs bg-white text-slate-700">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-transparent outline-none cursor-pointer font-medium"
            >
              {INDIAN_CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Category filter */}
          <div className="border border-slate-300 rounded-lg px-2.5 py-2 text-xs bg-white text-slate-700">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent outline-none cursor-pointer font-medium"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search buyer requirements (e.g. CNC Lathe, Cotton Yarn, Solar Panels)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white"
            />
          </div>

          <button
            type="submit"
            className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-semibold transition"
          >
            Search
          </button>
        </form>
      </div>

      {/* RFQ Listings Grid */}
      {loading ? (
        <div className="py-16 flex justify-center">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : requirements.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
          <Boxes className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No active buyer requirements found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Be the first to post a buying requirement or try adjusting your city or category filter.
          </p>
          <Link
            href="/requirements/new"
            className="mt-4 inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post Buying Requirement</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {requirements.map((rfq) => (
            <div
              key={rfq.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Header tags */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200">
                    {rfq.category?.name || 'Industrial'}
                  </span>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{new Date(rfq.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="font-bold text-base text-slate-900 leading-snug">{rfq.title}</h3>
                  {rfq.description && (
                    <p className="text-xs text-slate-600 line-clamp-2 mt-1.5 leading-relaxed">
                      {rfq.description}
                    </p>
                  )}
                </div>

                {/* Requirement Specs Pill Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50/80 p-3 rounded-xl border border-slate-200/60">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Quantity Required:</span>
                    <strong className="text-slate-900 font-bold">{rfq.quantity} {rfq.unitOfMeasure}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Target Price:</span>
                    <strong className="text-emerald-700 font-bold">
                      {rfq.targetPrice ? `₹${Number(rfq.targetPrice).toLocaleString('en-IN')}` : 'Best Market Quote'}
                    </strong>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-slate-200/50 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-slate-600 text-[11px]">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>Delivery Location: <strong>{rfq.deliveryCity}{rfq.deliveryState ? `, ${rfq.deliveryState}` : ''}</strong></span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {rfq._count?.responses || 0} Quotes Received
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Buyer: <strong>{rfq.buyer?.fullName?.split(' ')[0] || 'Verified Buyer'}</strong></span>
                </div>

                <button
                  onClick={() => handleOpenQuoteModal(rfq)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Quote</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quote Submission Modal */}
      {selectedRfq && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Submit Quotation</span>
                <h3 className="font-bold text-sm text-slate-900">{selectedRfq.title}</h3>
              </div>
              <button onClick={() => setSelectedRfq(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {quoteSuccess ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">Quotation Sent Successfully!</h4>
                <p className="text-xs text-slate-500">The buyer will be notified with your proposal and offered unit price.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitQuoteResponse} className="space-y-3.5 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-600 space-y-1">
                  <div>Required: <strong>{selectedRfq.quantity} {selectedRfq.unitOfMeasure}</strong></div>
                  <div>Delivery Destination: <strong>{selectedRfq.deliveryCity}</strong></div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Offered Unit Price (₹ INR / {selectedRfq.unitOfMeasure})
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 2400"
                    value={offeredPrice}
                    onChange={(e) => setOfferedPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Proposal Message & Commercial Terms *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={quoteMessage}
                    onChange={(e) => setQuoteMessage(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedRfq(null)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingQuote}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submittingQuote ? 'Sending Quote...' : 'Submit Quote Now'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

