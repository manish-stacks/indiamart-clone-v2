'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  X,
  Send,
  ShieldCheck,
  CheckCircle2,
  User as UserIcon,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../lib/auth-context';
import { fetchApi } from '../lib/api';

interface InquiryModalProps {
  product: {
    id: string;
    name: string;
    unitPrice: number;
    unitOfMeasure: string;
    minOrderQuantity: number;
    business: {
      name: string;
    };
  } | null;
  onClose: () => void;
}

export default function InquiryModal({ product, onClose }: InquiryModalProps) {
  const { user } = useAuth();

  const [quantity, setQuantity] = useState(product?.minOrderQuantity || 1);
  const [message, setMessage] = useState(
    `Hello, I am interested in purchasing ${product?.name}. Please send your best quotation including GST and delivery schedule to my location.`
  );

  // Buyer contact fields (pre-filled if logged in)
  const [buyerName, setBuyerName] = useState(user?.fullName || '');
  const [buyerEmail, setBuyerEmail] = useState(user?.email || '');
  const [buyerPhone, setBuyerPhone] = useState(user?.phone || '');
  const [buyerCity, setBuyerCity] = useState('');

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [inquiryResult, setInquiryResult] = useState<any | null>(null);

  if (!product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload = {
      productId: product.id,
      quantity,
      unitOfMeasure: product.unitOfMeasure,
      message,
      buyerName: user ? (user.fullName || buyerName) : buyerName,
      buyerEmail: user ? user.email : buyerEmail,
      buyerPhone: buyerPhone || undefined,
      buyerCity: buyerCity || undefined,
    };

    const res = await fetchApi('/inquiries', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (res.success && res.data) {
      setInquiryResult(res.data);
      setSubmitted(true);
    } else {
      setError(res.message || 'Failed to submit inquiry. Please check your details.');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Contact Verified Supplier
            </h3>
            <p className="text-xs text-slate-500">
              Direct inquiry to: <span className="font-semibold text-emerald-800">{product.business.name}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900">Inquiry Delivered Directly!</h4>
              <p className="text-xs text-slate-600 mt-1.5 max-w-sm mx-auto leading-relaxed">
                Your requirement for <span className="font-semibold text-slate-800">{quantity} {product.unitOfMeasure}</span> has been logged in <span className="font-semibold text-slate-800">{product.business.name}</span>'s supplier CRM inbox.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-left space-y-1.5 max-w-sm mx-auto">
              <div className="flex justify-between">
                <span className="text-slate-500">Buyer Name:</span>
                <span className="font-semibold text-slate-800">{inquiryResult?.buyerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Contact Email:</span>
                <span className="font-medium text-slate-800">{inquiryResult?.buyerEmail}</span>
              </div>
              {inquiryResult?.buyerPhone && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Contact Phone:</span>
                  <span className="font-medium text-slate-800">{inquiryResult?.buyerPhone}</span>
                </div>
              )}
              <div className="flex justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-500">Lead Status:</span>
                <span className="font-bold text-emerald-700">Delivered (Direct)</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="mt-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-6 py-2.5 rounded-xl transition shadow-sm"
            >
              Done & Return to Catalogue
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Product Summary */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="font-bold text-slate-800 text-xs line-clamp-1">{product.name}</div>
              <div className="text-slate-500 mt-1 flex items-center justify-between">
                <span>Min. Order: <strong className="text-slate-800">{product.minOrderQuantity} {product.unitOfMeasure}</strong></span>
                <span className="font-bold text-slate-900 text-sm">₹{Number(product.unitPrice).toLocaleString('en-IN')} <span className="text-[10px] font-normal text-slate-500">/ {product.unitOfMeasure}</span></span>
              </div>
            </div>

            {/* Buyer Identity Section */}
            {user ? (
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5 text-emerald-700" /> Inquiring as Verified Buyer
                  </span>
                  <span className="text-[10px] bg-emerald-200/80 text-emerald-900 font-semibold px-2 py-0.5 rounded">
                    Logged In
                  </span>
                </div>
                <div className="text-slate-700 font-semibold">
                  {user.fullName || user.email}
                </div>
                <div className="text-slate-500 text-[11px] mt-0.5">
                  {user.email} {user.phone ? `• ${user.phone}` : ''}
                </div>

                {/* Optional Phone if not on profile */}
                {!user.phone && (
                  <div className="mt-2.5 pt-2 border-t border-emerald-200/60">
                    <label className="block text-[11px] font-semibold text-emerald-950 mb-1">
                      Mobile Number (for instant supplier WhatsApp/call quote)
                    </label>
                    <input
                      type="tel"
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full border border-emerald-300 rounded-lg px-2.5 py-1.5 text-xs outline-none bg-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <UserIcon className="w-3.5 h-3.5 text-slate-500" /> Your Buyer Contact Details
                  </span>
                  <Link href="/login" className="text-emerald-700 font-bold hover:underline text-[11px]">
                    Sign In
                  </Link>
                </div>
                <p className="text-[11px] text-slate-500">
                  The supplier will use these contact details to reply with price quotations and shipping terms.
                </p>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    required
                    placeholder="e.g. Rajesh Kumar"
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Phone Number (+91) *</label>
                    <input
                      type="tel"
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      required
                      placeholder="+91 98250 12345"
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      value={buyerEmail}
                      onChange={(e) => setBuyerEmail(e.target.value)}
                      required
                      placeholder="rajesh@company.com"
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Delivery City (Optional)</label>
                  <input
                    type="text"
                    value={buyerCity}
                    onChange={(e) => setBuyerCity(e.target.value)}
                    placeholder="e.g. Ahmedabad, Mumbai, Delhi"
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
              </div>
            )}

            {/* Requirement Quantity */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Required Quantity ({product.unitOfMeasure}) *
              </label>
              <input
                type="number"
                min={product.minOrderQuantity}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                required
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Requirement Details */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Specific Requirement / Inquiry Note
              </label>
              <textarea
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Free Protection Guarantee */}
            <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-100">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>100% Free Inquiry. Supplier contacts you directly with zero brokerage.</span>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 rounded-xl font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                {loading ? 'Delivering Inquiry...' : 'Send Inquiry Now'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
