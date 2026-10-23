'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ShieldAlert,
  ShieldCheck,
  Building2,
  Users,
  Boxes,
  Inbox,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Search,
  Filter,
  Trash2,
  LogIn,
  Eye,
  AlertCircle,
  Tag,
  DollarSign,
  Package,
  Download,
  PlusCircle,
  FolderTree,
  Send,
  Plus,
  X,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { fetchApi } from '../../lib/api';

function AdminDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading, impersonate } = useAuth();

  const [stats, setStats] = useState<any | null>(null);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [productsList, setProductsList] = useState<any[]>([]);
  const [inquiriesList, setInquiriesList] = useState<any[]>([]);
  const [rfqsList, setRfqsList] = useState<any[]>([]);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);

  const initialTab = (searchParams.get('tab') as any) || 'sellers';
  const [activeTab, setActiveTab] = useState<
    'sellers' | 'buyers' | 'products' | 'categories' | 'rfqs' | 'inquiries'
  >(['sellers', 'buyers', 'products', 'categories', 'rfqs', 'inquiries'].includes(initialTab) ? initialTab : 'sellers');

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['sellers', 'buyers', 'products', 'categories', 'rfqs', 'inquiries'].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, [searchParams]);

  const switchTab = (tab: 'sellers' | 'buyers' | 'products' | 'categories' | 'rfqs' | 'inquiries') => {
    setActiveTab(tab);
    router.replace(`/admin?tab=${tab}`, { scroll: false });
  };
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Category modal
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [catName, setCatName] = useState('');
  const [catDescription, setCatDescription] = useState('');
  const [catImageUrl, setCatImageUrl] = useState('');
  const [catIcon, setCatIcon] = useState('Cpu');
  const [submittingCat, setSubmittingCat] = useState(false);

  const isAdmin = user?.roles?.some((r) => r === 'ADMIN' || r === 'SUPER_ADMIN');

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/login');
    }
  }, [authLoading, isAdmin, router]);

  const loadAdminData = async () => {
    setLoading(true);
    const [statsRes, bizRes, usersRes, prodRes, inqRes, rfqRes, catRes] = await Promise.all([
      fetchApi('/admin/stats'),
      fetchApi(`/admin/businesses${filterStatus ? `?status=${filterStatus}` : ''}`),
      fetchApi('/admin/users'),
      fetchApi('/admin/products'),
      fetchApi('/admin/inquiries'),
      fetchApi('/requirements/admin/all'),
      fetchApi('/categories'),
    ]);

    if (statsRes.success) setStats(statsRes.data);
    if (bizRes.success) setBusinesses(bizRes.data || []);
    if (usersRes.success) setUsersList(usersRes.data || []);
    if (prodRes.success) setProductsList(prodRes.data || []);
    if (inqRes.success) setInquiriesList(inqRes.data || []);
    if (rfqRes.success) setRfqsList(rfqRes.data || []);
    if (catRes.success) setCategoriesList(catRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin, filterStatus]);

  // Split users into buyers vs sellers
  const sellersUsers = usersList.filter(
    (u) =>
      u.businessMembers?.length > 0 ||
      u.roles?.some((r: any) => (r.role?.name || r.name) === 'SELLER')
  );

  const buyersUsers = usersList.filter(
    (u) =>
      !u.businessMembers?.length &&
      !u.roles?.some((r: any) => (r.role?.name || r.name)?.includes('ADMIN'))
  );

  const handleVerifyBusiness = async (bizId: string, status: string, gstinVerified: boolean = true) => {
    setActionLoading(bizId);
    const res = await fetchApi(`/admin/businesses/${bizId}/verify`, {
      method: 'PATCH',
      body: JSON.stringify({ status, gstinVerified }),
    });

    if (res.success) {
      await loadAdminData();
    } else {
      alert(res.message || 'Failed to update business status');
    }
    setActionLoading(null);
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    setActionLoading(userId);
    const res = await fetchApi(`/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: nextStatus }),
    });

    if (res.success) {
      await loadAdminData();
    } else {
      alert(res.message || 'Failed to update user status');
    }
    setActionLoading(null);
  };

  // 1-Click Login As User (Impersonate)
  const handleImpersonateUser = async (targetUser: any) => {
    const confirmed = window.confirm(
      `Login as "${targetUser.fullName || targetUser.email}"? You will be able to inspect their dashboard, view their inquiries, and manage or delete their products as this user.`
    );
    if (!confirmed) return;

    setActionLoading(`impersonate-${targetUser.id}`);
    const res = await fetchApi<any>(`/admin/impersonate/${targetUser.id}`, {
      method: 'POST',
    });

    if (res.success && res.data) {
      impersonate(res.data.accessToken, res.data.user);
      router.push('/dashboard');
    } else {
      alert(res.message || 'Failed to impersonate user');
    }
    setActionLoading(null);
  };

  // Open account session in a separate browser tab
  const handleOpenInNewTab = async (targetUser: any, role: string = 'SELLER') => {
    setActionLoading(`tab-${targetUser.id}`);
    try {
      const res = await fetchApi<any>(`/admin/impersonate/${targetUser.id}`, {
        method: 'POST',
      });
      if (res.success && res.data?.accessToken) {
        const token = res.data.accessToken;
        const targetName = targetUser.fullName || targetUser.email;
        const redirectPath = role === 'BUYER' ? '/dashboard/inquiries' : '/dashboard';
        const url = `/impersonate?token=${encodeURIComponent(token)}&name=${encodeURIComponent(
          targetName
        )}&role=${encodeURIComponent(role)}&redirect=${encodeURIComponent(redirectPath)}`;
        window.open(url, '_blank');
      } else {
        alert(res.message || 'Failed to generate impersonation token');
      }
    } catch (err: any) {
      alert(err.message || 'Error opening user session in new tab');
    } finally {
      setActionLoading(null);
    }
  };

  // Admin Delete Product
  const handleDeleteProduct = async (product: any) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete the product listing "${product.name}" listed by ${product.business?.name}? This action cannot be undone.`
    );
    if (!confirmed) return;

    setActionLoading(`del-prod-${product.id}`);
    const res = await fetchApi(`/admin/products/${product.id}`, {
      method: 'DELETE',
    });

    if (res.success) {
      await loadAdminData();
    } else {
      alert(res.message || 'Failed to delete product listing');
    }
    setActionLoading(null);
  };

  // Admin Category Creation
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    setSubmittingCat(true);
    const res = await fetchApi('/categories', {
      method: 'POST',
      body: JSON.stringify({
        name: catName.trim(),
        description: catDescription.trim() || undefined,
        imageUrl: catImageUrl.trim() || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758',
        icon: catIcon || 'Boxes',
      }),
    });

    if (res.success) {
      setIsCatModalOpen(false);
      setCatName('');
      setCatDescription('');
      setCatImageUrl('');
      await loadAdminData();
    } else {
      alert(res.message || 'Failed to create category');
    }
    setSubmittingCat(false);
  };

  // Admin Delete Category
  const handleDeleteCategory = async (cat: any) => {
    const confirmed = window.confirm(`Delete category "${cat.name}"?`);
    if (!confirmed) return;

    const res = await fetchApi(`/categories/${cat.id}`, { method: 'DELETE' });
    if (res.success) {
      await loadAdminData();
    } else {
      alert(res.message || 'Cannot delete category with listed products');
    }
  };

  // Admin Delete RFQ
  const handleDeleteRfq = async (rfqId: string) => {
    const confirmed = window.confirm('Permanently remove this buyer requirement?');
    if (!confirmed) return;

    const res = await fetchApi(`/requirements/admin/${rfqId}`, { method: 'DELETE' });
    if (res.success) {
      await loadAdminData();
    } else {
      alert(res.message || 'Failed to delete requirement');
    }
  };

  // CSV Export Helper
  const exportToCsv = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportSellersCsv = () => {
    const headers = ['Business Name', 'Owner Name', 'Email', 'Phone', 'GSTIN', 'Status', 'City', 'State', 'Product Count'];
    const rows = businesses.map((b) => {
      const owner = b.members?.[0]?.user;
      return [
        b.name,
        owner?.fullName || '',
        owner?.email || '',
        owner?.phone || '',
        b.gstin || 'N/A',
        b.verificationStatus,
        b.city || b.addresses?.[0]?.city || '',
        b.state || b.addresses?.[0]?.state || '',
        b._count?.products || 0,
      ];
    });
    exportToCsv('indiatrade_sellers_report', headers, rows);
  };

  const handleExportBuyersCsv = () => {
    const headers = ['Buyer Name', 'Email', 'Phone', 'Inquiries Sent', 'RFQs Posted', 'Account Status', 'Registered On'];
    const rows = buyersUsers.map((b) => [
      b.fullName || 'User',
      b.email,
      b.phone || 'N/A',
      b._count?.buyerInquiries || 0,
      b._count?.buyerRequirements || 0,
      b.status,
      new Date(b.createdAt).toLocaleDateString('en-IN'),
    ]);
    exportToCsv('indiatrade_buyers_report', headers, rows);
  };

  if (authLoading || (!isAdmin && loading)) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-xs text-slate-500">
        Verifying administrative authorization...
      </div>
    );
  }

  // Filtered lists by query
  const q = searchQuery.toLowerCase().trim();

  const filteredBusinesses = businesses.filter((b) => {
    if (!q) return true;
    const owner = b.members?.[0]?.user;
    return (
      b.name?.toLowerCase().includes(q) ||
      b.gstin?.toLowerCase().includes(q) ||
      owner?.fullName?.toLowerCase().includes(q) ||
      owner?.email?.toLowerCase().includes(q)
    );
  });

  const filteredBuyers = buyersUsers.filter((b) => {
    if (!q) return true;
    return (
      b.fullName?.toLowerCase().includes(q) ||
      b.email?.toLowerCase().includes(q) ||
      b.phone?.toLowerCase().includes(q)
    );
  });

  const filteredProducts = productsList.filter((p) => {
    if (!q) return true;
    return (
      p.name?.toLowerCase().includes(q) ||
      p.sku?.toLowerCase().includes(q) ||
      p.business?.name?.toLowerCase().includes(q) ||
      p.category?.name?.toLowerCase().includes(q)
    );
  });

  const filteredRfqs = rfqsList.filter((r) => {
    if (!q) return true;
    return (
      r.title?.toLowerCase().includes(q) ||
      r.buyer?.fullName?.toLowerCase().includes(q) ||
      r.deliveryCity?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4" /> Super Administrator Console
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Marketplace Operations & Moderation</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage all sellers & buyers, verify 15-digit GSTINs, moderate products, control categories, and audit RFQs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2 rounded-lg text-xs font-semibold transition"
          >
            My Workspace
          </Link>
          <button
            onClick={() => loadAdminData()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { label: 'Sellers / Suppliers', value: businesses.length, icon: Building2, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Registered Buyers', value: buyersUsers.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Live Products', value: stats?.totalProducts || productsList.length, icon: Boxes, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Buyer RFQs', value: rfqsList.length, icon: PlusCircle, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Platform Inquiries', value: stats?.totalInquiries || inquiriesList.length, icon: Inbox, color: 'text-amber-600', bg: 'bg-amber-50' },
          {
            label: 'Pending GSTIN',
            value: stats?.pendingVerifications || 0,
            icon: ShieldCheck,
            color: 'text-rose-600',
            bg: 'bg-rose-50',
          },
        ].map((item, idx) => (
          <div key={idx} className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-medium">{item.label}</span>
              <div className={`p-1.5 rounded-lg ${item.bg} ${item.color}`}>
                <item.icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-xl font-bold text-slate-900 mt-1">{item.value}</div>
          </div>
        ))}
      </div>

      {/* Main Tabs Navigation */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            onClick={() => switchTab('sellers')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'sellers'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Sellers List ({businesses.length})</span>
          </button>

          <button
            onClick={() => switchTab('buyers')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'buyers'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Buyers List ({buyersUsers.length})</span>
          </button>

          <button
            onClick={() => switchTab('products')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'products'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Products ({productsList.length})</span>
          </button>

          <button
            onClick={() => switchTab('categories')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'categories'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <FolderTree className="w-4 h-4" />
            <span>Categories ({categoriesList.length})</span>
          </button>

          <button
            onClick={() => switchTab('rfqs')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'rfqs'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Buyer RFQs ({rfqsList.length})</span>
          </button>

          <button
            onClick={() => switchTab('inquiries')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'inquiries'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Inquiries ({inquiriesList.length})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search within tab..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white"
          />
        </div>
      </div>

      {/* TAB 1: ALL SELLERS / SUPPLIERS */}
      {activeTab === 'sellers' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
            <div>
              <h2 className="font-bold text-sm text-slate-900">All Registered Sellers & Manufacturers</h2>
              <p className="text-xs text-slate-500">
                Verify 15-digit GSTIN, inspect storefronts, login as seller, or download supplier reports.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white font-medium"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="VERIFIED">Verified</option>
                <option value="REJECTED">Rejected</option>
              </select>

              <button
                onClick={handleExportSellersCsv}
                className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {filteredBusinesses.length === 0 ? (
              <div className="p-8 text-center text-slate-400">No sellers match your criteria.</div>
            ) : (
              filteredBusinesses.map((biz) => {
                const owner = biz.members?.[0]?.user;
                return (
                  <div key={biz.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm truncate">{biz.name}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            biz.verificationStatus === 'VERIFIED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : biz.verificationStatus === 'REJECTED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {biz.verificationStatus}
                        </span>
                        {biz.gstinVerified && (
                          <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                            GSTIN Verified
                          </span>
                        )}
                        <span className="text-[10px] bg-purple-100 text-purple-800 font-medium px-2 py-0.5 rounded-full">
                          {biz.businessType}
                        </span>
                      </div>

                      <div className="text-slate-600 flex items-center gap-3 text-[11px] flex-wrap">
                        <span>
                          <strong>GSTIN:</strong>{' '}
                          <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono font-bold text-slate-800">
                            {biz.gstin || 'Not Provided'}
                          </code>
                        </span>
                        <span>•</span>
                        <span>City: <strong>{biz.city || biz.addresses?.[0]?.city || 'N/A'}, {biz.state || biz.addresses?.[0]?.state || ''}</strong></span>
                        <span>•</span>
                        <span>Catalogue: <strong className="text-emerald-700">{biz._count?.products || 0} Products</strong></span>
                      </div>

                      <div className="text-[11px] text-slate-400">
                        Primary Owner: <strong>{owner?.fullName || owner?.email || 'N/A'}</strong> (Phone: {owner?.phone || 'No phone'}) • Email: {owner?.email}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Login as Seller options */}
                      {owner && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenInNewTab(owner, 'SELLER')}
                            disabled={actionLoading === `tab-${owner.id}`}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1 transition shadow-xs text-xs"
                            title="Open seller account directly in a separate browser tab without disturbing admin tab"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Login New Tab</span>
                          </button>

                          <button
                            onClick={() => handleImpersonateUser(owner)}
                            disabled={actionLoading === `impersonate-${owner.id}`}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-2 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition text-xs"
                            title="Switch account in this tab"
                          >
                            <LogIn className="w-3 h-3 text-slate-500" />
                            <span>This Tab</span>
                          </button>
                        </div>
                      )}

                      <Link
                        href={`/store/${biz.slug}`}
                        target="_blank"
                        className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 font-medium flex items-center gap-1 transition"
                      >
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                        <span>Store</span>
                      </Link>

                      {biz.verificationStatus !== 'VERIFIED' && (
                        <button
                          onClick={() => handleVerifyBusiness(biz.id, 'VERIFIED', true)}
                          disabled={actionLoading === biz.id}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Verify GST</span>
                        </button>
                      )}

                      {biz.verificationStatus !== 'REJECTED' && (
                        <button
                          onClick={() => handleVerifyBusiness(biz.id, 'REJECTED', false)}
                          disabled={actionLoading === biz.id}
                          className="border border-rose-200 text-rose-700 hover:bg-rose-50 px-2 py-1.5 rounded-lg font-semibold transition"
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ALL BUYERS */}
      {activeTab === 'buyers' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
            <div>
              <h2 className="font-bold text-sm text-slate-900">All Registered Procurement Buyers</h2>
              <p className="text-xs text-slate-500">
                Track buyer accounts, inquiries count, login as buyer to troubleshoot, or export data.
              </p>
            </div>
            <button
              onClick={handleExportBuyersCsv}
              className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Export Buyers CSV</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {filteredBuyers.length === 0 ? (
              <div className="p-8 text-center text-slate-400">No buyers found.</div>
            ) : (
              filteredBuyers.map((b) => (
                <div key={b.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/50 transition">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{b.fullName || 'Buyer Account'}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          b.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>
                    <div className="text-slate-600 flex items-center gap-3 text-[11px] flex-wrap">
                      <span>Email: <strong>{b.email}</strong></span>
                      {b.phone && <span>• Phone: <strong>{b.phone}</strong></span>}
                      <span>• Registered: <strong>{new Date(b.createdAt).toLocaleDateString('en-IN')}</strong></span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Inquiries Sent: <strong className="text-blue-700">{b._count?.buyerInquiries || 0}</strong> • RFQs Posted:{' '}
                      <strong className="text-emerald-700">{b._count?.buyerRequirements || 0}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenInNewTab(b, 'BUYER')}
                        disabled={actionLoading === `tab-${b.id}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1 transition shadow-xs text-xs"
                        title="Open buyer account in a separate browser tab without disturbing admin tab"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Login New Tab</span>
                      </button>

                      <button
                        onClick={() => handleImpersonateUser(b)}
                        disabled={actionLoading === `impersonate-${b.id}`}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-2 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition text-xs"
                        title="Switch account in this tab"
                      >
                        <LogIn className="w-3 h-3 text-slate-500" />
                        <span>This Tab</span>
                      </button>
                    </div>

                    <button
                      onClick={() => handleToggleUserStatus(b.id, b.status)}
                      disabled={actionLoading === b.id}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                        b.status === 'ACTIVE'
                          ? 'border border-slate-300 text-slate-700 hover:bg-rose-50 hover:text-rose-700'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      {b.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: PRODUCTS MODERATION */}
      {activeTab === 'products' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
            <div>
              <h2 className="font-bold text-sm text-slate-900">Marketplace Products Moderation</h2>
              <p className="text-xs text-slate-500">Inspect catalogue listings across all stores and purge spam.</p>
            </div>
            <span className="text-xs text-slate-500 font-semibold">{filteredProducts.length} listings</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {filteredProducts.length === 0 ? (
              <div className="p-8 text-center text-slate-400">No products match your search.</div>
            ) : (
              filteredProducts.map((p) => {
                const img = p.images?.[0]?.url || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758';
                return (
                  <div key={p.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition">
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      <div className="w-16 h-16 rounded-xl border border-slate-200 overflow-hidden bg-slate-100 flex-shrink-0">
                        <img src={img} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-slate-900 truncate">{p.name}</h3>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                              p.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {p.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 text-[11px] flex-wrap">
                          <span className="font-semibold text-emerald-700">₹{p.unitPrice?.toLocaleString('en-IN')} / {p.unitOfMeasure}</span>
                          <span>•</span>
                          <span>MOQ: <strong>{p.minOrderQuantity} {p.unitOfMeasure}</strong></span>
                          <span>•</span>
                          <span>Category: <strong>{p.category?.name || 'General'}</strong></span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          Seller: <strong className="text-slate-700">{p.business?.name}</strong> (GST: {p.business?.gstin || 'N/A'}) • Inquiries: {p._count?.inquiries || 0}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Link
                        href={`/products/${p.slug}`}
                        target="_blank"
                        className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 font-medium flex items-center gap-1 transition shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>View</span>
                      </Link>

                      <button
                        onClick={() => handleDeleteProduct(p)}
                        disabled={actionLoading === `del-prod-${p.id}`}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        <span>Delete Listing</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 4: CATEGORIES MANAGER */}
      {activeTab === 'categories' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
            <div>
              <h2 className="font-bold text-sm text-slate-900">Product Categories & Taxonomy Manager</h2>
              <p className="text-xs text-slate-500">Create, update, or remove top-level sectors and industrial categories.</p>
            </div>
            <button
              onClick={() => setIsCatModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Category</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {categoriesList.map((cat) => (
              <div key={cat.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/50 transition">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                    <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{cat.name}</h3>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Slug: <code className="font-mono bg-slate-100 px-1 py-0.2 rounded">{cat.slug}</code> • Products: <strong>{cat.productCount || 0}</strong> • Subcategories: <strong>{cat.children?.length || 0}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/search?category=${cat.slug}`}
                    target="_blank"
                    className="p-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100"
                    title="View Products in Category"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    onClick={() => handleDeleteCategory(cat)}
                    className="p-1.5 border border-slate-200 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Delete Category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: BUYER RFQS & REQUIREMENTS */}
      {activeTab === 'rfqs' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
            <div>
              <h2 className="font-bold text-sm text-slate-900">Live Buyer Requirements (RFQs) Moderation</h2>
              <p className="text-xs text-slate-500">Inspect buyer RFQs posted on the B2B marketplace board.</p>
            </div>
            <Link
              href="/requirements"
              target="_blank"
              className="text-xs text-emerald-700 font-semibold hover:underline flex items-center gap-1"
            >
              <span>Public RFQ Board</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {filteredRfqs.length === 0 ? (
              <div className="p-8 text-center text-slate-400">No buyer requirements posted yet.</div>
            ) : (
              filteredRfqs.map((r) => (
                <div key={r.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/50 transition">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{r.title}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {r.status}
                      </span>
                      <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">
                        {r.category?.name}
                      </span>
                    </div>
                    <div className="text-slate-600 flex items-center gap-3 text-[11px] flex-wrap">
                      <span>Buyer: <strong>{r.buyer?.fullName || r.buyer?.email}</strong> (Phone: {r.buyer?.phone || 'N/A'})</span>
                      <span>•</span>
                      <span>Required: <strong>{r.quantity} {r.unitOfMeasure}</strong></span>
                      <span>•</span>
                      <span>Target Price: <strong>{r.targetPrice ? `₹${r.targetPrice}` : 'Negotiable'}</strong></span>
                      <span>•</span>
                      <span>Delivery: <strong>{r.deliveryCity}</strong></span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Posted on {new Date(r.createdAt).toLocaleDateString('en-IN')} • Supplier Quotes: {r._count?.responses || 0}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleDeleteRfq(r.id)}
                      className="text-rose-600 border border-rose-200 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 6: INQUIRIES AUDIT */}
      {activeTab === 'inquiries' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
            <div>
              <h2 className="font-bold text-sm text-slate-900">Platform-Wide Inquiries Audit</h2>
              <p className="text-xs text-slate-500">Live feed of requirements and direct contact requests across India.</p>
            </div>
            <span className="text-xs text-slate-500 font-semibold">{inquiriesList.length} inquiries</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {inquiriesList.map((inq) => (
              <div key={inq.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{inq.buyer?.fullName || inq.buyer?.email || 'Buyer'}</span>
                    <span className="text-[10px] text-slate-400">➔ to</span>
                    <strong className="text-emerald-700">{inq.business?.name}</strong>
                  </div>
                  <div className="text-xs text-slate-700 font-medium">
                    Product: {inq.product?.name || 'General Product Inquiry'} (Qty: {inq.quantity || 1} {inq.product?.unitOfMeasure})
                  </div>
                  {inq.message && <p className="text-[11px] text-slate-500 line-clamp-1">"{inq.message}"</p>}
                  <div className="text-[10px] text-slate-400">
                    Buyer Contact: {inq.buyer?.phone || inq.buyer?.email} • Date: {new Date(inq.createdAt).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900">Create New Product Category</h3>
              <button onClick={() => setIsCatModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Solar Energy & Renewable Equipment"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Category scope and application description..."
                  value={catDescription}
                  onChange={(e) => setCatDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Cover Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={catImageUrl}
                  onChange={(e) => setCatImageUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCat}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm transition"
                >
                  {submittingCat ? 'Creating...' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AdminDashboardContent />
    </React.Suspense>
  );
}
