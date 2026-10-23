'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Inbox,
  MessageSquare,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Search,
  PlusCircle,
  FileText,
  MapPin,
  ChevronRight,
  Boxes,
} from 'lucide-react';
import { useAuth } from '../../../lib/auth-context';
import { fetchApi } from '../../../lib/api';

export default function BuyerInquiriesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [chatStartingId, setChatStartingId] = useState<string | null>(null);

  const loadInquiries = async () => {
    setLoading(true);
    const res = await fetchApi<any[]>('/inquiries/my');
    if (res.success && Array.isArray(res.data)) {
      setInquiries(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      loadInquiries();
    }
  }, [authLoading, user]);

  // 1-Click start chat with supplier for this inquiry/product
  const handleStartChat = async (businessId: string, productId?: string, inquiryId?: string) => {
    setChatStartingId(inquiryId || businessId);
    try {
      const res = await fetchApi<any>('/messages/conversations', {
        method: 'POST',
        body: JSON.stringify({ businessId, productId, inquiryId }),
      });

      if (res.success && res.data) {
        router.push(`/dashboard/messages?conversationId=${res.data.id}`);
      } else {
        alert(res.message || 'Failed to start chat with supplier');
      }
    } catch (err: any) {
      alert(err.message || 'Error initiating chat');
    } finally {
      setChatStartingId(null);
    }
  };

  const filteredInquiries = inquiries.filter((inq) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const prodName = inq.product?.name?.toLowerCase() || '';
    const bizName = inq.business?.name?.toLowerCase() || '';
    const msg = inq.message?.toLowerCase() || '';
    return prodName.includes(q) || bizName.includes(q) || msg.includes(q);
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
            <Inbox className="w-4 h-4" />
            <span>Buyer Requirements & Inquiry Hub</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            My Sent Inquiries & Quotation Requests
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track all product requirements and inquiries you have sent to verified suppliers. Chat directly or view GST quotes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/requirements/new"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post New Buying RFQ</span>
          </Link>
          <Link
            href="/dashboard/quotations"
            className="border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <FileText className="w-4 h-4 text-purple-600" />
            <span>Received Quotes</span>
          </Link>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Total Inquiries Sent</span>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">{inquiries.length}</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Inbox className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Active Suppliers Contacted</span>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">
              {new Set(inquiries.map((i) => i.businessId)).size}
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Building2 className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">B2B Trade Status</span>
            <div className="text-xs font-bold text-emerald-700 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100% Free Direct Connect
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Clock className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by product, supplier name, or message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white"
          />
        </div>

        <span className="text-xs text-slate-400">
          Showing {filteredInquiries.length} of {inquiries.length} inquiries
        </span>
      </div>

      {/* Inquiries Cards List */}
      {loading ? (
        <div className="py-16 flex justify-center">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredInquiries.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
          <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No sent inquiries yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            When you browse products and click "Contact Supplier / Get Best Quote", your inquiries will appear here so you can track seller responses and chat in real time.
          </p>
          <Link
            href="/search"
            className="mt-4 inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Discover Products & Suppliers</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInquiries.map((inq) => {
            const product = inq.product;
            const business = inq.business;
            const primaryImg = product?.images?.[0]?.url || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758';
            const city = business?.addresses?.[0]?.city || '';
            const state = business?.addresses?.[0]?.state || '';

            return (
              <div
                key={inq.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition space-y-4"
              >
                {/* Header row: Product + Supplier */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-start gap-3.5">
                    <div className="w-14 h-14 rounded-xl border border-slate-200 overflow-hidden bg-slate-100 flex-shrink-0">
                      <img src={primaryImg} alt={product?.name || 'Product'} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      {product ? (
                        <Link
                          href={`/products/${product.slug}`}
                          className="font-bold text-sm text-slate-900 hover:text-emerald-700 transition"
                        >
                          {product.name}
                        </Link>
                      ) : (
                        <span className="font-bold text-sm text-slate-900">General Product Requirement</span>
                      )}
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span>Quantity Inquired: <strong className="text-slate-800">{inq.quantity} {inq.unitOfMeasure}</strong></span>
                        {product?.unitPrice && (
                          <>
                            <span>•</span>
                            <span className="font-semibold text-emerald-700">₹{product.unitPrice?.toLocaleString('en-IN')} / {product.unitOfMeasure}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Supplier info */}
                  <div className="text-left sm:text-right sm:border-l sm:border-slate-100 sm:pl-4">
                    <div className="flex items-center sm:justify-end gap-1.5">
                      <Link
                        href={`/store/${business?.slug}`}
                        className="font-bold text-xs text-slate-800 hover:text-emerald-700 transition"
                      >
                        {business?.name || 'Verified Supplier'}
                      </Link>
                      {business?.gstinVerified && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> GST
                        </span>
                      )}
                    </div>
                    {(city || state) && (
                      <div className="text-[11px] text-slate-400 flex items-center sm:justify-end gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{city}{city && state ? ', ' : ''}{state}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Message Body */}
                <div className="bg-slate-50/70 rounded-xl p-3 border border-slate-200/60 text-xs">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Your Inquired Requirement:
                  </div>
                  <p className="text-slate-700 font-medium">"{inq.message || 'Please share product details, best quotation, and lead time.'}"</p>
                </div>

                {/* Footer Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Sent on {new Date(inq.createdAt).toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Chat with Supplier button */}
                    <button
                      onClick={() => handleStartChat(inq.businessId, inq.productId, inq.id)}
                      disabled={chatStartingId === inq.id}
                      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{chatStartingId === inq.id ? 'Connecting...' : 'Chat with Supplier'}</span>
                    </button>

                    {/* View Supplier Storefront */}
                    {business?.slug && (
                      <Link
                        href={`/store/${business.slug}`}
                        target="_blank"
                        className="border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition"
                      >
                        <Building2 className="w-3.5 h-3.5 text-slate-500" />
                        <span>Storefront</span>
                      </Link>
                    )}

                    {/* View Product Details */}
                    {product?.slug && (
                      <Link
                        href={`/products/${product.slug}`}
                        target="_blank"
                        className="p-1.5 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-lg transition"
                        title="View Product Page"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

