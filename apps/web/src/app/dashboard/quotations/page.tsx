'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FileText,
  PlusCircle,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Printer,
  Building2,
  User,
  Plus,
  Minus,
  AlertCircle,
  Calendar,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../../lib/auth-context';
import { fetchApi } from '../../../lib/api';

const PAYMENT_TERMS_PRESETS = [
  '50% advance, balance on dispatch',
  '100% advance against Proforma Invoice',
  '25% advance, balance against BL / LR copy',
  'Net 30 days for approved corporate credit',
  'Immediate online payment / RTGS / NEFT',
];

interface QuoteLineItem {
  description: string;
  quantity: number;
  unitOfMeasure: string;
  unitPrice: number;
}

export default function QuotationsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<'seller' | 'buyer'>('seller');
  const [sellerQuotes, setSellerQuotes] = useState<any[]>([]);
  const [buyerQuotes, setBuyerQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingQuote, setViewingQuote] = useState<any | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form fields
  const [buyerId, setBuyerId] = useState('');
  const [buyerNameInput, setBuyerNameInput] = useState('');
  const [inquiryId, setInquiryId] = useState('');
  const [validityDays, setValidityDays] = useState<number>(15);
  const [paymentTerms, setPaymentTerms] = useState(PAYMENT_TERMS_PRESETS[0]);
  const [taxPercent, setTaxPercent] = useState<number>(18);
  const [shippingAmount, setShippingAmount] = useState<number>(0);
  const [items, setItems] = useState<QuoteLineItem[]>([
    {
      description: 'Industrial Equipment / Material Supply',
      quantity: 1,
      unitOfMeasure: 'PIECE',
      unitPrice: 50000,
    },
  ]);

  // Lead candidates for quote creation
  const [availableLeads, setAvailableLeads] = useState<any[]>([]);

  const primaryBusiness = user?.businessMemberships?.[0];

  const loadQuotations = async () => {
    setLoading(true);
    const [sellerRes, buyerRes, leadsRes] = await Promise.all([
      fetchApi<any[]>('/quotations/seller'),
      fetchApi<any[]>('/quotations/buyer'),
      fetchApi<any[]>('/inquiries/seller/leads'),
    ]);

    if (sellerRes.success && Array.isArray(sellerRes.data)) {
      setSellerQuotes(sellerRes.data);
    }
    if (buyerRes.success && Array.isArray(buyerRes.data)) {
      setBuyerQuotes(buyerRes.data);
    }
    if (leadsRes.success && Array.isArray(leadsRes.data)) {
      setAvailableLeads(leadsRes.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      loadQuotations();
    }
  }, [authLoading, user]);

  const handleStatusUpdate = async (quoteId: string, status: string) => {
    const res = await fetchApi(`/quotations/${quoteId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });

    if (res.success) {
      await loadQuotations();
    } else {
      alert(res.message || 'Failed to update quotation status');
    }
  };

  const handleLeadSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLeadId = e.target.value;
    if (!selectedLeadId) return;

    const lead = availableLeads.find((l) => l.id === selectedLeadId);
    if (lead) {
      setInquiryId(lead.inquiryId || '');
      setBuyerId(lead.inquiry?.userId || '');
      setBuyerNameInput(lead.inquiry?.senderName || lead.inquiry?.user?.fullName || 'Buyer');
      if (lead.inquiry?.product) {
        setItems([
          {
            description: lead.inquiry.product.name,
            quantity: lead.inquiry.quantity || lead.inquiry.product.minOrderQuantity || 1,
            unitOfMeasure: lead.inquiry.product.unitOfMeasure || 'PIECE',
            unitPrice: lead.inquiry.product.unitPrice || 1000,
          },
        ]);
      }
    }
  };

  // Line item helpers
  const handleItemChange = (index: number, field: keyof QuoteLineItem, value: any) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;
    setItems(updated);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      { description: '', quantity: 1, unitOfMeasure: 'PIECE', unitPrice: 0 },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Calculations
  const calculatedSubtotal = items.reduce(
    (sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0),
    0
  );
  const calculatedTax = (calculatedSubtotal * (Number(taxPercent) || 0)) / 100;
  const calculatedTotal = calculatedSubtotal + calculatedTax + (Number(shippingAmount) || 0);

  const handleCreateQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!primaryBusiness?.businessId) {
      setModalError('Business storefront required to issue quotations.');
      return;
    }

    if (!buyerId) {
      // In development fallback, if buyerId not provided, select user self or lead
      if (availableLeads.length > 0 && availableLeads[0].inquiry?.userId) {
        setBuyerId(availableLeads[0].inquiry.userId);
      } else {
        setModalError('Please select a buyer or inquiry to issue this quotation to.');
        return;
      }
    }

    setSubmitting(true);
    setModalError(null);

    const payload = {
      businessId: primaryBusiness.businessId,
      buyerId: buyerId || user?.id,
      inquiryId: inquiryId || undefined,
      validityDays: Number(validityDays) || 15,
      paymentTerms,
      taxPercent: Number(taxPercent),
      shippingAmount: Number(shippingAmount) || 0,
      items: items.map((it) => ({
        description: it.description,
        quantity: Number(it.quantity) || 1,
        unitOfMeasure: it.unitOfMeasure,
        unitPrice: Number(it.unitPrice) || 0,
      })),
    };

    const res = await fetchApi('/quotations', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (res.success) {
      setIsModalOpen(false);
      await loadQuotations();
    } else {
      setModalError(res.message || 'Failed to create quotation.');
    }
    setSubmitting(false);
  };

  const currentQuotes = activeTab === 'seller' ? sellerQuotes : buyerQuotes;

  const filteredQuotes = currentQuotes.filter((q) => {
    if (statusFilter !== 'ALL' && q.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const qLower = searchQuery.toLowerCase();
      const matchNum = q.quoteNumber?.toLowerCase().includes(qLower);
      const matchBuyer = q.buyer?.fullName?.toLowerCase().includes(qLower);
      const matchSeller = q.business?.name?.toLowerCase().includes(qLower);
      if (!matchNum && !matchBuyer && !matchSeller) return false;
    }
    return true;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4" />
            <span>B2B Quotations & Estimates</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            GST Invoices & Trade Estimates
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Generate formal B2B price estimates with 18% GST calculation, shipping terms, and digital acceptance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Generate New Quotation</span>
          </button>
        </div>
      </div>

      {/* Role Tabs & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Seller vs Buyer tab toggle */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => {
              setActiveTab('seller');
              setStatusFilter('ALL');
            }}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'seller'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Issued as Seller ({sellerQuotes.length})</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('buyer');
              setStatusFilter('ALL');
            }}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'buyer'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Received as Buyer ({buyerQuotes.length})</span>
          </button>
        </div>

        {/* Status Filters & Search */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <div className="flex items-center gap-1">
            {['ALL', 'SENT', 'ACCEPTED', 'REJECTED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="relative flex-1 md:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search quote # or party..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Quotation Listings */}
      {loading ? (
        <div className="py-16 flex justify-center">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredQuotes.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No quotations found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            {activeTab === 'seller'
              ? 'You have not issued any formal price quotations yet. Click "+ Generate New Quotation" to send a formal PDF-ready estimate to a prospective buyer.'
              : 'You have not received any formal quotations from suppliers yet.'}
          </p>
          {activeTab === 'seller' && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Generate First Quotation</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuotes.map((quote) => {
            const isSent = quote.status === 'SENT';
            const isAccepted = quote.status === 'ACCEPTED';
            const isRejected = quote.status === 'REJECTED';

            return (
              <div
                key={quote.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900 tracking-tight">
                          {quote.quoteNumber}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            isAccepted
                              ? 'bg-emerald-100 text-emerald-800'
                              : isRejected
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {quote.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Issued on {new Date(quote.createdAt).toLocaleDateString('en-IN')} • Valid until{' '}
                        {new Date(quote.validityDate).toLocaleDateString('en-IN')}
                      </div>
                    </div>
                  </div>

                  {/* Party Information */}
                  <div className="text-right sm:border-l sm:border-slate-100 sm:pl-4">
                    <div className="text-xs font-bold text-slate-800">
                      {activeTab === 'seller'
                        ? `To: ${quote.buyer?.fullName || quote.buyer?.email || 'Valued Buyer'}`
                        : `From: ${quote.business?.name || 'Verified Supplier'}`}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {activeTab === 'seller' ? quote.buyer?.phone || '' : `GSTIN: ${quote.business?.gstin || 'Registered'}`}
                    </div>
                  </div>
                </div>

                {/* Line Items Table */}
                <div className="bg-slate-50/70 rounded-xl overflow-hidden border border-slate-200/60 text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100/80 text-[11px] text-slate-500 uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3 font-semibold">Item & Specifications</th>
                        <th className="py-2 px-3 font-semibold text-center">Qty / Unit</th>
                        <th className="py-2 px-3 font-semibold text-right">Unit Price</th>
                        <th className="py-2 px-3 font-semibold text-right">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/50">
                      {(quote.items || []).map((item: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-100/40">
                          <td className="py-2 px-3 font-medium text-slate-800">{item.description}</td>
                          <td className="py-2 px-3 text-center text-slate-600">
                            {item.quantity} {item.unitOfMeasure}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-slate-600">
                            ₹{item.unitPrice?.toLocaleString('en-IN')}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                            ₹{item.totalAmount?.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Summary Financials & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                  <div className="text-xs text-slate-500 space-y-0.5">
                    <div>
                      <strong>Payment Terms:</strong> {quote.paymentTerms}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Subtotal: ₹{quote.subtotal?.toLocaleString('en-IN')} + GST 18%: ₹
                      {quote.taxAmount?.toLocaleString('en-IN')}
                      {quote.shippingAmount > 0 && ` + Shipping: ₹${quote.shippingAmount?.toLocaleString('en-IN')}`}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <div className="text-right">
                      <div className="text-[11px] text-slate-400 font-medium">Grand Total (Incl. GST)</div>
                      <div className="text-lg font-black text-emerald-700">
                        ₹{quote.totalAmount?.toLocaleString('en-IN')}
                      </div>
                    </div>

                    {/* Buyer Acceptance Actions */}
                    {activeTab === 'buyer' && isSent && (
                      <div className="flex items-center gap-1.5 ml-2">
                        <button
                          onClick={() => handleStatusUpdate(quote.id, 'ACCEPTED')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm transition"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Accept Quote</span>
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(quote.id, 'REJECTED')}
                          className="border border-slate-300 hover:bg-rose-50 text-slate-600 hover:text-rose-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                        >
                          Decline
                        </button>
                      </div>
                    )}

                    {/* Print / View */}
                    <button
                      onClick={() => setViewingQuote(quote)}
                      className="p-2 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg transition"
                      title="View & Print Official GST Quotation"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Quotation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                  <FileText className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-slate-900">
                  Generate Formal B2B Quotation
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateQuotation} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
              {modalError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* Recipient Selection */}
              <div className="space-y-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  1. Recipient Buyer Details
                </div>

                {availableLeads.length > 0 && (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Pick from Recent Buyer Inquiries (Autofills details):
                    </label>
                    <select
                      onChange={handleLeadSelect}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 bg-white outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">-- Choose Lead to Quote --</option>
                      {availableLeads.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.inquiry?.senderName || l.inquiry?.user?.fullName || 'Buyer'} -{' '}
                          {l.inquiry?.product?.name || l.inquiry?.requirement?.title || 'Inquiry'}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Buyer Name / Company
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Acme Industries Ltd"
                      value={buyerNameInput}
                      onChange={(e) => setBuyerNameInput(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Buyer User ID (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="ID or select above"
                      value={buyerId}
                      onChange={(e) => setBuyerId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Line Items */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    2. Line Items & Pricing
                  </div>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 text-[11px]"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Row
                  </button>
                </div>

                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <div className="flex-1">
                        <input
                          type="text"
                          required
                          placeholder="Product description / item name"
                          value={item.description}
                          onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        />
                      </div>
                      <div className="w-20">
                        <input
                          type="number"
                          required
                          min="1"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                          className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-center font-bold"
                        />
                      </div>
                      <div className="w-28">
                        <input
                          type="number"
                          required
                          min="0"
                          step="any"
                          placeholder="Unit Price ₹"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(idx, 'unitPrice', Number(e.target.value))}
                          className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-mono font-bold"
                        />
                      </div>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-slate-400 hover:text-rose-500 p-1"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Taxes, Shipping & Terms */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  3. Commercial Terms & GST
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">GST Rate (%)</label>
                    <select
                      value={taxPercent}
                      onChange={(e) => setTaxPercent(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 bg-white outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                    >
                      <option value="18">18% (Standard GST)</option>
                      <option value="12">12%</option>
                      <option value="5">5%</option>
                      <option value="28">28%</option>
                      <option value="0">0% (Exempt)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Freight / Shipping (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={shippingAmount}
                      onChange={(e) => setShippingAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Quote Validity (Days)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={validityDays}
                      onChange={(e) => setValidityDays(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Terms</label>
                  <select
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 bg-white outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {PAYMENT_TERMS_PRESETS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Total Summary Preview Box */}
              <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-3.5 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono">₹{calculatedSubtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST ({taxPercent}%):</span>
                  <span className="font-mono">₹{calculatedTax.toLocaleString('en-IN')}</span>
                </div>
                {shippingAmount > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Shipping:</span>
                    <span className="font-mono">₹{shippingAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-slate-900 pt-1.5 border-t border-emerald-200 text-sm">
                  <span>Total Quotation Amount:</span>
                  <span className="text-emerald-700 font-black">
                    ₹{calculatedTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>Issue & Send Quotation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Formal Indian GST Quotation & Proforma Invoice Print Modal */}
      {viewingQuote && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 border border-slate-300">
            {/* Action Bar (hidden when printing) */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 print:hidden">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Official GST Quotation Preview
                </span>
                <span className="bg-emerald-100 text-emerald-800 font-mono font-bold text-xs px-2 py-0.5 rounded">
                  {viewingQuote.quoteNumber}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  onClick={() => setViewingQuote(null)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Document Area */}
            <div className="space-y-6 text-xs text-slate-800 font-sans print:m-0 print:p-0">
              {/* Document Header */}
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
                <div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight">
                    {viewingQuote.business?.name || 'Verified Supplier'}
                  </h1>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Manufacturer, Wholesaler & Industrial Exporter
                  </p>
                  <div className="text-[11px] font-mono mt-1">
                    GSTIN: <strong>{viewingQuote.business?.gstin || '24AAACA1234A1Z5'}</strong>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-base font-extrabold text-slate-900 uppercase tracking-wide">
                    COMMERCIAL QUOTATION / PROFORMA
                  </div>
                  <div className="text-xs font-mono font-bold text-emerald-700 mt-1">
                    {viewingQuote.quoteNumber}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Date: <strong>{new Date(viewingQuote.createdAt).toLocaleDateString('en-IN')}</strong>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Valid Until: <strong>{new Date(viewingQuote.validityDate).toLocaleDateString('en-IN')}</strong>
                  </div>
                </div>
              </div>

              {/* Consignee / Buyer Details Box */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    SUPPLIER (CONSIGNOR)
                  </span>
                  <div className="font-bold text-slate-900">{viewingQuote.business?.name}</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    {viewingQuote.business?.addresses?.[0]?.city || 'Ahmedabad'},{' '}
                    {viewingQuote.business?.addresses?.[0]?.state || 'Gujarat'} - India
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                    GSTIN: {viewingQuote.business?.gstin || '24AAACA1234A1Z5'}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    QUOTED TO (BUYER / CONSIGNEE)
                  </span>
                  <div className="font-bold text-slate-900">
                    {viewingQuote.buyer?.fullName || viewingQuote.buyer?.email || 'Valued Client'}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    Email: {viewingQuote.buyer?.email || 'N/A'}
                  </div>
                  {viewingQuote.buyer?.phone && (
                    <div className="text-[11px] text-slate-600">Phone: {viewingQuote.buyer?.phone}</div>
                  )}
                  <div className="text-[11px] text-slate-400 mt-0.5">Place of Supply: India</div>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-slate-300 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-900 text-white text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3 w-10 text-center">#</th>
                      <th className="py-2.5 px-3">Item Description & Specifications</th>
                      <th className="py-2.5 px-3 text-center">HSN/SAC</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Unit Rate (₹)</th>
                      <th className="py-2.5 px-3 text-right">Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {(viewingQuote.items || []).map((it: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 text-center text-slate-400">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{it.description}</td>
                        <td className="py-2.5 px-3 text-center font-mono text-slate-500">8458</td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-700">
                          {it.quantity} {it.unitOfMeasure}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                          ₹{Number(it.unitPrice).toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                          ₹{Number(it.totalAmount).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial Calculation Breakdown */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="space-y-1 text-slate-500 text-[11px] max-w-sm">
                  <div>
                    <strong>Payment Terms:</strong> {viewingQuote.paymentTerms}
                  </div>
                  <div>
                    <strong>Delivery Terms:</strong> Ex-Works / Door Delivery as agreed
                  </div>
                  <div className="pt-2 text-[10px] text-slate-400">
                    * This is a computer-generated formal quotation. Applicable taxes and statutory GST rules apply as per Govt of India norms.
                  </div>
                </div>

                <div className="w-full sm:w-64 space-y-1.5 border border-slate-200 p-3 rounded-xl bg-slate-50 text-right">
                  <div className="flex justify-between text-slate-600">
                    <span>Taxable Value:</span>
                    <span className="font-mono font-semibold">
                      ₹{Number(viewingQuote.subtotal).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Integrated GST (18%):</span>
                    <span className="font-mono font-semibold">
                      ₹{Number(viewingQuote.taxAmount).toLocaleString('en-IN')}
                    </span>
                  </div>
                  {Number(viewingQuote.shippingAmount) > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Freight / Delivery:</span>
                      <span className="font-mono font-semibold">
                        ₹{Number(viewingQuote.shippingAmount).toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between font-extrabold text-slate-900 text-sm pt-2 border-t border-slate-300">
                    <span>Net Payable:</span>
                    <span className="text-emerald-700 font-black">
                      ₹{Number(viewingQuote.totalAmount).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Signatory & Bank Details */}
              <div className="pt-6 border-t border-slate-200 flex justify-between items-end">
                <div className="text-[10px] text-slate-500 space-y-0.5">
                  <strong className="text-slate-700 block">Bank RTGS / NEFT Details:</strong>
                  <div>Bank: HDFC Bank Ltd / State Bank of India</div>
                  <div>A/C Name: {viewingQuote.business?.name || 'Authorized Business'}</div>
                  <div>IFSC: HDFC0001234 • Current Account</div>
                </div>

                <div className="text-center">
                  <div className="w-36 border-b border-slate-400 mb-1"></div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">
                    Authorized Signatory
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

