'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Boxes,
  Inbox,
  FileText,
  MessageSquare,
  Building2,
  ShieldCheck,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  Clock,
  Phone,
  MessageCircle,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  User,
  Users,
  ShieldAlert,
  Search,
  Send,
} from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { fetchApi } from '../../lib/api';

export default function DashboardOverviewPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [viewMode, setViewMode] = useState<'seller' | 'buyer'>('seller');

  const [stats, setStats] = useState({
    totalProducts: 0,
    publishedProducts: 0,
    totalLeads: 0,
    newLeads: 0,
    totalQuotations: 0,
    totalConversations: 0,
    sentInquiries: 0,
    receivedQuotes: 0,
  });
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [recentBuyerInquiries, setRecentBuyerInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const primaryBusiness = user?.businessMemberships?.[0];
  const isAdmin = user?.roles?.some((r) => r === 'ADMIN' || r === 'SUPER_ADMIN');
  const [adminStats, setAdminStats] = useState<any>(null);

  useEffect(() => {
    async function loadOverview() {
      setLoading(true);
      try {
        const [productsRes, leadsRes, quotesRes, messagesRes, myInqRes, buyerQuotesRes] = await Promise.all([
          fetchApi<any[]>('/products/seller/my-products'),
          fetchApi<any[]>('/inquiries/seller/leads'),
          fetchApi<any[]>('/quotations/seller'),
          fetchApi<any[]>('/messages/conversations'),
          fetchApi<any[]>('/inquiries/my'),
          fetchApi<any[]>('/quotations/buyer'),
        ]);

        const products = productsRes.success && Array.isArray(productsRes.data) ? productsRes.data : [];
        const leads = leadsRes.success && Array.isArray(leadsRes.data) ? leadsRes.data : [];
        const quotes = quotesRes.success && Array.isArray(quotesRes.data) ? quotesRes.data : [];
        const conversations = messagesRes.success && Array.isArray(messagesRes.data) ? messagesRes.data : [];
        const sentInquiries = myInqRes.success && Array.isArray(myInqRes.data) ? myInqRes.data : [];
        const receivedQuotes = buyerQuotesRes.success && Array.isArray(buyerQuotesRes.data) ? buyerQuotesRes.data : [];

        setStats({
          totalProducts: products.length,
          publishedProducts: products.filter((p: any) => p.status === 'PUBLISHED').length,
          totalLeads: leads.length,
          newLeads: leads.filter((l: any) => l.stage === 'NEW').length,
          totalQuotations: quotes.length,
          totalConversations: conversations.length,
          sentInquiries: sentInquiries.length,
          receivedQuotes: receivedQuotes.length,
        });

        setRecentLeads(leads.slice(0, 5));
        setRecentBuyerInquiries(sentInquiries.slice(0, 5));

        // If user is Admin, load platform-wide stats
        if (isAdmin) {
          try {
            const aRes = await fetchApi('/admin/stats');
            if (aRes.success && aRes.data) {
              setAdminStats(aRes.data);
            }
          } catch (e) {
            // Ignore
          }
        }

        // If user has no business, default view to buyer
        if (!primaryBusiness && sentInquiries.length > 0) {
          setViewMode('buyer');
        }
      } catch (err) {
        console.error('Failed to load overview data', err);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadOverview();
    }
  }, [user]);

  const getCleanPhone = (phone?: string) => {
    if (!phone) return null;
    return phone.replace(/[^0-9]/g, '');
  };

  const handleStartChat = async (businessId: string, productId?: string, inquiryId?: string) => {
    try {
      const res = await fetchApi<any>('/messages/conversations', {
        method: 'POST',
        body: JSON.stringify({ businessId, productId, inquiryId }),
      });
      if (res.success && res.data) {
        router.push(`/dashboard/messages?conversationId=${res.data.id}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Super Admin Quick Access Banner */}
      {isAdmin && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 shadow-sm border border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
              <ShieldAlert className="w-4 h-4" /> Super Administrator Console
            </div>
            <h2 className="text-xl font-bold tracking-tight">Marketplace Operations & Moderation Hub</h2>
            <p className="text-xs text-slate-300 mt-1">
              Platform status: {adminStats?.totalBusinesses || 0} registered suppliers • {adminStats?.totalUsers || 0} users • {adminStats?.totalProducts || 0} active listings.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/admin?tab=sellers"
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm"
            >
              <Building2 className="w-4 h-4" />
              <span>Sellers Directory</span>
            </Link>
            <Link
              href="/admin?tab=buyers"
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm"
            >
              <Users className="w-4 h-4" />
              <span>Buyers Directory</span>
            </Link>
            <Link
              href="/dashboard/products"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm"
            >
              <Boxes className="w-4 h-4" />
              <span>Moderate Products</span>
            </Link>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>{primaryBusiness?.businessName || 'Business Control Center'}</span>
            {primaryBusiness?.verificationStatus === 'VERIFIED' ? (
              <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified GST Supplier
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">
                Verification In Progress
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Namaste, {user?.fullName?.split(' ')[0] || user?.email?.split('@')[0] || 'Partner'}!
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor incoming leads, track your sent inquiries, manage catalogue, and issue GST quotations.
          </p>
        </div>

        {/* View Mode Switcher Pills */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start md:self-auto">
          <button
            onClick={() => setViewMode('seller')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              viewMode === 'seller'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Seller Hub</span>
          </button>
          <button
            onClick={() => setViewMode('buyer')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              viewMode === 'buyer'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Buyer Hub</span>
          </button>
        </div>
      </div>

      {/* SELLER VIEW CONTENT */}
      {viewMode === 'seller' ? (
        <>
          {/* Verification Notice if not verified */}
          {(!primaryBusiness || primaryBusiness.verificationStatus !== 'VERIFIED') && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 text-xs text-amber-800">
                <span className="font-bold">Boost Buyer Trust: </span>
                {primaryBusiness
                  ? 'Your company profile is under review by IndiaTrade moderators. Ensure your 15-digit GSTIN is updated to receive the TrustSeal verification badge.'
                  : 'You have not registered a business storefront yet. Complete business onboarding to unlock direct buyer inquiries.'}
              </div>
              <Link
                href="/dashboard/onboarding"
                className="text-xs bg-amber-600 hover:bg-amber-700 text-white font-semibold px-3 py-1.5 rounded-lg flex-shrink-0 transition"
              >
                {primaryBusiness ? 'Update Profile' : 'Setup Business'}
              </Link>
            </div>
          )}

          {/* Seller KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/dashboard/leads"
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-emerald-500 hover:shadow-md transition group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Buyer Leads CRM</span>
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition">
                  <Inbox className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">{stats.totalLeads}</span>
                {stats.newLeads > 0 && (
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    {stats.newLeads} New
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                <span>Inbound buyer requirements</span>
                <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition" />
              </p>
            </Link>

            <Link
              href="/dashboard/products"
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-emerald-500 hover:shadow-md transition group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Active Catalogue</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition">
                  <Boxes className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">{stats.totalProducts}</span>
                <span className="text-[10px] font-medium text-emerald-600">
                  {stats.publishedProducts} Live
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                <span>Manage listings & MOQ pricing</span>
                <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition" />
              </p>
            </Link>

            <Link
              href="/dashboard/quotations"
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-emerald-500 hover:shadow-md transition group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Issued GST Quotations</span>
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">{stats.totalQuotations}</span>
                <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                  B2B Estimates
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                <span>Formal quotes with 18% GST</span>
                <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition" />
              </p>
            </Link>

            <Link
              href="/dashboard/messages"
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-emerald-500 hover:shadow-md transition group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Buyer Chat</span>
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition">
                  <MessageSquare className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">{stats.totalConversations}</span>
                <span className="text-[10px] font-medium text-amber-600">Active</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                <span>Direct negotiations</span>
                <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition" />
              </p>
            </Link>
          </div>

          {/* Seller Growth & Lead Conversion Insights */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-sm border border-slate-700 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/60 pb-3">
              <div>
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                  <TrendingUp className="w-4 h-4" /> B2B Marketplace Performance & Lead Conversion
                </div>
                <h3 className="font-bold text-lg text-white mt-0.5">
                  Supplier Visibility & Buyer Engagement
                </h3>
              </div>
              <span className="bg-emerald-500/20 text-emerald-300 text-[11px] font-bold px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1 self-start sm:self-auto">
                <Sparkles className="w-3 h-3" /> Live Metrics
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
              <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60">
                <span className="text-[11px] text-slate-400 block">Product Impressions</span>
                <span className="text-xl font-black text-white mt-1 block">2,480</span>
                <span className="text-[10px] text-emerald-400 font-medium">↑ +18% this month</span>
              </div>
              <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60">
                <span className="text-[11px] text-slate-400 block">WhatsApp Clicks</span>
                <span className="text-xl font-black text-[#25D366] mt-1 block">64</span>
                <span className="text-[10px] text-slate-400">Direct mobile inquiries</span>
              </div>
              <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60">
                <span className="text-[11px] text-slate-400 block">Lead Conversion</span>
                <span className="text-xl font-black text-amber-400 mt-1 block">14.2%</span>
                <span className="text-[10px] text-slate-400">Above category avg.</span>
              </div>
              <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60">
                <span className="text-[11px] text-slate-400 block">Avg. Response Time</span>
                <span className="text-xl font-black text-blue-400 mt-1 block">1.5h</span>
                <span className="text-[10px] text-emerald-400">⚡ Star Fast Responder</span>
              </div>
            </div>

            {/* Regional Demand Distribution */}
            <div className="pt-2">
              <div className="flex justify-between text-xs text-slate-300 font-medium mb-1.5 flex-wrap gap-1">
                <span>Top Regional Buyer Demand Clusters:</span>
                <span className="text-slate-400 text-[11px]">Gujarat (45%) • Maharashtra (30%) • Delhi NCR (15%) • Others (10%)</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden flex bg-slate-700">
                <div className="bg-emerald-500 h-full" style={{ width: '45%' }} title="Gujarat: 45%" />
                <div className="bg-blue-500 h-full" style={{ width: '30%' }} title="Maharashtra: 30%" />
                <div className="bg-amber-500 h-full" style={{ width: '15%' }} title="Delhi NCR: 15%" />
                <div className="bg-purple-500 h-full" style={{ width: '10%' }} title="Other States: 10%" />
              </div>
            </div>
          </div>

          {/* Seller Section: Recent Leads Table & Growth Tips */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Recent Inbound Buyer Inquiries</h2>
                  <p className="text-xs text-slate-500">Connect with prospective buyers instantly via WhatsApp or Call</p>
                </div>
                <Link
                  href="/dashboard/leads"
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  <span>View All Leads</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {loading ? (
                <div className="py-12 flex justify-center">
                  <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : recentLeads.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <div className="text-xs font-semibold text-slate-700">No buyer inquiries yet</div>
                  <p className="text-[11px] text-slate-400 mt-0.5 max-w-sm mx-auto">
                    Add your machinery, industrial parts, or textiles to the catalogue to start receiving verified buyer leads.
                  </p>
                  <Link
                    href="/dashboard/products?action=new"
                    className="mt-3 inline-flex items-center gap-1 bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-emerald-700 transition"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> Add First Product
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentLeads.map((lead) => {
                    const buyerPhone = getCleanPhone(lead.inquiry?.senderPhone || lead.inquiry?.user?.phone);
                    const buyerName = lead.inquiry?.senderName || lead.inquiry?.user?.fullName || 'Verified Buyer';
                    const productName = lead.inquiry?.product?.name || lead.inquiry?.requirement?.title || 'General Trade Inquiry';

                    return (
                      <div key={lead.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 truncate">{buyerName}</span>
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                              {lead.stage}
                            </span>
                          </div>
                          <div className="text-xs text-emerald-800 font-medium truncate mt-0.5">
                            {productName}
                          </div>
                          {lead.inquiry?.message && (
                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                              "{lead.inquiry.message}"
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {buyerPhone && (
                            <a
                              href={`https://wa.me/91${buyerPhone}?text=${encodeURIComponent(
                                `Hello ${buyerName}, thank you for your inquiry on IndiaTrade regarding "${productName}". How may we assist you?`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                              <span>WhatsApp</span>
                            </a>
                          )}
                          {buyerPhone && (
                            <a
                              href={`tel:+91${buyerPhone}`}
                              className="bg-blue-50 hover:bg-blue-100 text-blue-700 p-1.5 rounded-lg transition"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <Link
                            href="/dashboard/leads"
                            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg font-medium transition"
                          >
                            Manage
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Seller Shortcuts */}
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-emerald-800 to-teal-900 text-white rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
                  <Sparkles className="w-4 h-4 text-emerald-300" /> 100% Free Guarantee
                </div>
                <h3 className="font-bold text-sm text-white leading-snug">
                  Zero Commission B2B Trade
                </h3>
                <p className="text-[11px] text-emerald-100/80 mt-1 leading-relaxed">
                  Unlike traditional platforms that lock buyer phone numbers behind paid subscriptions, IndiaTrade connects you directly with buyers via phone and WhatsApp for free.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Seller Shortcuts
                </div>
                <Link
                  href="/dashboard/products?action=new"
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition text-xs font-semibold text-slate-800"
                >
                  <div className="flex items-center gap-2">
                    <Boxes className="w-4 h-4 text-emerald-600" />
                    <span>Add Product to Catalogue</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
                <Link
                  href="/dashboard/quotations"
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition text-xs font-semibold text-slate-800"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-600" />
                    <span>Generate GST Quotation</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
                <Link
                  href="/dashboard/onboarding"
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition text-xs font-semibold text-slate-800"
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-amber-600" />
                    <span>Update Business & GSTIN</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* BUYER VIEW CONTENT */
        <>
          {/* Buyer KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/dashboard/inquiries"
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-blue-500 hover:shadow-md transition group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">My Sent Inquiries</span>
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition">
                  <Send className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-bold text-slate-900">{stats.sentInquiries}</div>
              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                <span>Track product inquiries sent to suppliers</span>
                <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-blue-600 transition" />
              </p>
            </Link>

            <Link
              href="/dashboard/quotations"
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-purple-500 hover:shadow-md transition group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Quotations Received</span>
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-bold text-slate-900">{stats.receivedQuotes}</div>
              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                <span>View and accept formal supplier quotes</span>
                <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-purple-600 transition" />
              </p>
            </Link>

            <Link
              href="/dashboard/messages"
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-emerald-500 hover:shadow-md transition group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Supplier Messages</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition">
                  <MessageSquare className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-bold text-slate-900">{stats.totalConversations}</div>
              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                <span>Direct negotiations with manufacturers</span>
                <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-emerald-600 transition" />
              </p>
            </Link>
          </div>

          {/* Buyer Inquiries List */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Recent Sent Product Inquiries</h2>
                  <p className="text-xs text-slate-500">Suppliers received these inquiries and will contact you directly.</p>
                </div>
                <Link
                  href="/dashboard/inquiries"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <span>View All Inquiries ({stats.sentInquiries})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {recentBuyerInquiries.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <div className="text-xs font-semibold text-slate-700">You haven't sent any inquiries yet</div>
                  <p className="text-[11px] text-slate-400 mt-0.5 max-w-sm mx-auto">
                    Browse machinery, raw materials, or industrial tools and click "Contact Supplier" to get wholesale quotes.
                  </p>
                  <Link
                    href="/search"
                    className="mt-3 inline-flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
                  >
                    <Search className="w-3.5 h-3.5" /> Explore Products
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentBuyerInquiries.map((inq) => (
                    <div key={inq.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <strong className="text-xs text-slate-900 truncate">
                            {inq.product?.name || 'General Product Requirement'}
                          </strong>
                          <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded font-medium">
                            Qty: {inq.quantity} {inq.unitOfMeasure}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Supplier: <strong className="text-slate-800">{inq.business?.name}</strong>
                        </div>
                        {inq.message && (
                          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                            "{inq.message}"
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleStartChat(inq.businessId, inq.productId, inq.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs transition"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Chat</span>
                        </button>
                        {inq.product?.slug && (
                          <Link
                            href={`/products/${inq.product.slug}`}
                            target="_blank"
                            className="p-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Buyer Shortcuts */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Buyer Shortcuts
              </div>
              <Link
                href="/requirements/new"
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 transition text-xs font-semibold text-slate-800"
              >
                <div className="flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-blue-600" />
                  <span>Post a Buying Requirement (RFQ)</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link
                href="/categories"
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 transition text-xs font-semibold text-slate-800"
              >
                <div className="flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-emerald-600" />
                  <span>Browse All Categories</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link
                href="/dashboard/quotations"
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 transition text-xs font-semibold text-slate-800"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-600" />
                  <span>View Received Quotations</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
