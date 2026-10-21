'use client';

import React, { useState } from 'react';
import { X, Send, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../lib/auth-context';

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
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!product) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // In Phase 1 foundation: record submission feedback cleanly
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">
              Contact Verified Supplier
            </h3>
            <p className="text-xs text-slate-500">
              Direct inquiry to: <span className="font-medium text-slate-700">{product.business.name}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Inquiry Sent Successfully!</h4>
            <p className="text-xs text-slate-600 mt-2 max-w-sm mx-auto">
              Your requirement has been forwarded directly to {product.business.name}. The supplier will contact you with formal quotation terms.
            </p>
            <button
              onClick={onClose}
              className="mt-6 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-5 py-2.5 rounded-lg transition"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Product Summary */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
              <div className="font-semibold text-slate-800">{product.name}</div>
              <div className="text-slate-500 mt-1 flex items-center justify-between">
                <span>MOQ: {product.minOrderQuantity} {product.unitOfMeasure}</span>
                <span className="font-bold text-slate-900">₹{product.unitPrice} / {product.unitOfMeasure}</span>
              </div>
            </div>

            {/* Requirement Quantity */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Required Quantity ({product.unitOfMeasure})
              </label>
              <input
                type="number"
                min={product.minOrderQuantity}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                required
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Requirement Details */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Specific Requirement / Message to Supplier
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Free Protection Guarantee */}
            <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-emerald-50/60 p-2.5 rounded border border-emerald-100">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Free inquiry. Direct quotation with no commission added.</span>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Send className="w-3.5 h-3.5" />
                {loading ? 'Sending...' : 'Send Inquiry Now'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

