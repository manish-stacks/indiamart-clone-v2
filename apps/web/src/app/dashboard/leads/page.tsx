'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Inbox,
  Phone,
  MessageSquare,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Send,
  PlusCircle,
  FileText,
  User,
  ShieldAlert,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../../lib/auth-context';
import { fetchApi } from '../../../lib/api';

const LEAD_STAGES = [
  { value: 'NEW', label: 'New Lead', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'CONTACTED', label: 'Contacted', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'QUALIFIED', label: 'Qualified', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { value: 'QUOTATION_SENT', label: 'Quote Sent', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { value: 'NEGOTIATION', label: 'Negotiation', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { value: 'WON', label: 'Deal Won', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'LOST', label: 'Lost', color: 'bg-slate-100 text-slate-600 border-slate-200' },
];

export default function SellerLeadsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const isAdmin = user?.roles?.some((r) => r === 'ADMIN' || r === 'SUPER_ADMIN');

  const [leads, setLeads] = useState<any[]>([]);
  const [selectedStage, setSelectedStage] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [activeNoteLeadId, setActiveNoteLeadId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [updatingLeadId, setUpdatingLeadId] = useState<string | null>(null);

  const loadLeads = async () => {
    setLoading(true);
    const res = await fetchApi('/inquiries/seller/leads');
    if (res.success && res.data) {
      setLeads(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      loadLeads();
    }
  }, [authLoading, user, router]);

  const handleStageChange = async (leadId: string, stage: string) => {
    setUpdatingLeadId(leadId);
    const res = await fetchApi(`/inquiries/leads/${leadId}/stage`, {
      method: 'PATCH',
      body: JSON.stringify({ stage }),
    });

    if (res.success) {
      await loadLeads();
    } else {
      alert(res.message || 'Failed to update stage');
    }
    setUpdatingLeadId(null);
  };

  const handleAddNote = async (leadId: string) => {
    if (!noteText.trim()) return;
    const res = await fetchApi(`/inquiries/leads/${leadId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ note: noteText.trim() }),
    });

    if (res.success) {
      setNoteText('');
      setActiveNoteLeadId(null);
      await loadLeads();
    } else {
      alert(res.message || 'Failed to save note');
    }
  };

  const filteredLeads =
    selectedStage === 'ALL'
      ? leads
      : leads.filter((l) => l.stage === selectedStage);

  const getCleanPhone = (phone?: string) => {
    if (!phone) return null;
    return phone.replace(/[^0-9]/g, '');
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-xs text-slate-500">
        Loading seller inquiries and buyer leads...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Super Admin Notice Banner */}
      {isAdmin && (
        <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-white border border-amber-300 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-800 rounded-xl mt-0.5 border border-amber-400/40">
              <ShieldAlert className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-amber-900 text-xs uppercase tracking-wider">
                  Super Admin Privileges
                </span>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300">
                  CRM Moderation
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm mt-0.5">
                Audit marketplace buyer inquiries or inspect any supplier's leads directly
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                To audit all platform leads across all sellers, use the Inquiries Audit tab in Admin Console, or click "Login in New Tab" on any seller.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href="/admin?tab=inquiries"
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm"
            >
              <Inbox className="w-4 h-4 text-amber-400" />
              <span>Inquiries Audit</span>
            </Link>
            <Link
              href="/admin?tab=sellers"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm"
            >
              <Building2 className="w-4 h-4" />
              <span>Sellers Directory</span>
            </Link>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider mb-1">
            <Inbox className="w-4 h-4" /> Seller Lead CRM & Inquiries
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Direct Buyer Inquiries & Leads Inbox
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Free buyer leads generated for your business. Connect directly via WhatsApp or call, update quotation status, and track sales stages.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/messages"
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-sm"
          >
            <MessageSquare className="w-3.5 h-3.5" /> Buyer-Seller Chat
          </Link>
        </div>
      </div>

      {/* Stage Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setSelectedStage('ALL')}
          className={`px-3.5 py-1.5 rounded-full font-semibold border transition ${
            selectedStage === 'ALL'
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          All Inquiries ({leads.length})
        </button>
        {LEAD_STAGES.map((s) => {
          const count = leads.filter((l) => l.stage === s.value).length;
          return (
            <button
              key={s.value}
              onClick={() => setSelectedStage(s.value)}
              className={`px-3.5 py-1.5 rounded-full font-semibold border transition flex items-center gap-1.5 ${
                selectedStage === s.value
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{s.label}</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-full">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Leads List */}
      {filteredLeads.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Inquiries Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {selectedStage === 'ALL'
              ? 'You have not received any inquiries yet. Ensure your products are published to start receiving free buyer leads.'
              : `No leads in '${selectedStage}' stage.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLeads.map((lead) => {
            const product = lead.inquiry?.product;
            const cleanPhone = getCleanPhone(lead.buyerPhone);
            const waText = encodeURIComponent(
              `Hello ${lead.buyerName}, thank you for your inquiry for "${product?.name || 'our products'}" on IndiaTrade. We are pleased to provide formal quotations and specifications.`,
            );

            return (
              <div
                key={lead.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition space-y-4"
              >
                {/* Header row: Buyer identity & Stage dropdown */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {lead.buyerName ? lead.buyerName.charAt(0).toUpperCase() : 'B'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{lead.buyerName}</span>
                        <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-semibold">
                          Direct Lead
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-3 mt-0.5 flex-wrap">
                        {lead.buyerEmail && <span>{lead.buyerEmail}</span>}
                        {lead.buyerPhone && (
                          <span className="font-semibold text-slate-700">{lead.buyerPhone}</span>
                        )}
                        <span>•</span>
                        <span className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Calendar className="w-3 h-3" />
                          {new Date(lead.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stage Selector */}
                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <span className="text-xs text-slate-500 font-medium">Stage:</span>
                    <select
                      aria-label="Lead Stage"
                      value={lead.stage}
                      onChange={(e) => handleStageChange(lead.id, e.target.value)}
                      disabled={updatingLeadId === lead.id}
                      className="border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-semibold bg-white outline-none"
                    >
                      {LEAD_STAGES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Middle row: Inquired Product & Buyer Requirement Note */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                  <div className="md:col-span-8 space-y-1.5">
                    <div className="font-semibold text-slate-800 flex items-center gap-2">
                      <span>Product:</span>
                      {product ? (
                        <Link
                          href={`/products/${product.slug}`}
                          className="text-emerald-700 hover:underline font-bold"
                        >
                          {product.name}
                        </Link>
                      ) : (
                        <span>General Requirement</span>
                      )}
                    </div>
                    {lead.inquiry?.message && (
                      <p className="text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200 italic">
                        "{lead.inquiry.message}"
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-4 border-t md:border-t-0 md:border-l border-slate-200 pt-2 md:pt-0 md:pl-4 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Requested Qty:</span>
                      <span className="font-bold text-slate-800">
                        {lead.inquiry?.quantity || 1} {lead.inquiry?.unitOfMeasure || 'PIECE'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Est. Order Value:</span>
                      <span className="font-extrabold text-emerald-800 text-sm">
                        ₹{Number(lead.estimatedValue || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom row: Direct Connect Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2">
                    {/* WhatsApp button */}
                    {cleanPhone && (
                      <a
                        href={`https://wa.me/${cleanPhone}?text=${waText}`}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition shadow-sm"
                      >
                        <span>WhatsApp Buyer</span>
                      </a>
                    )}

                    {/* Phone call button */}
                    {lead.buyerPhone && (
                      <a
                        href={`tel:${lead.buyerPhone}`}
                        className="border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition"
                      >
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        <span>Call {lead.buyerPhone}</span>
                      </a>
                    )}

                    {/* Direct Chat */}
                    <Link
                      href={`/dashboard/messages`}
                      className="border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-800 font-semibold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                      <span>Chat in App</span>
                    </Link>
                  </div>

                  {/* Private internal note toggle */}
                  <button
                    onClick={() =>
                      setActiveNoteLeadId(activeNoteLeadId === lead.id ? null : lead.id)
                    }
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>Private Notes ({lead.notes?.length || 0})</span>
                  </button>
                </div>

                {/* Private Notes Section */}
                {activeNoteLeadId === lead.id && (
                  <div className="pt-3 border-t border-slate-100 space-y-3 bg-slate-50/60 p-3.5 rounded-xl text-xs">
                    <div className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                      Internal Private Notes (Not visible to buyer)
                    </div>
                    {lead.notes && lead.notes.length > 0 && (
                      <div className="space-y-1.5">
                        {lead.notes.map((n: any) => (
                          <div
                            key={n.id}
                            className="bg-white p-2.5 rounded-lg border border-slate-200 text-slate-700 flex justify-between gap-2"
                          >
                            <span>{n.note}</span>
                            <span className="text-[10px] text-slate-400 flex-shrink-0">
                              {new Date(n.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add note: e.g. Promised 5% discount if 1000 units ordered..."
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        className="flex-1 border border-slate-300 rounded-lg px-3 py-1.5 text-xs outline-none bg-white focus:ring-2 focus:ring-emerald-500"
                      />
                      <button
                        onClick={() => handleAddNote(lead.id)}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-1.5 rounded-lg text-xs"
                      >
                        Save Note
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

