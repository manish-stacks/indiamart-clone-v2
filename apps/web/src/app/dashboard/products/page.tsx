'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Boxes,
  PlusCircle,
  Search,
  Filter,
  Edit,
  Trash2,
  ExternalLink,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Layers,
  Tag,
  DollarSign,
  Package,
  X,
  Image as ImageIcon,
  ChevronDown,
  Building2,
  Users,
  ShieldAlert,
  Upload,
  Download,
  FileSpreadsheet,
  Plus,
  Minus,
} from 'lucide-react';
import { useAuth } from '../../../lib/auth-context';
import { fetchApi } from '../../../lib/api';

const UNITS_OF_MEASURE = [
  'PIECE',
  'BOX',
  'CARTON',
  'TON',
  'KG',
  'GRAM',
  'METER',
  'SQUARE_METER',
  'LITRE',
  'SET',
  'PACK',
  'HOUR',
];

interface SpecItem {
  key: string;
  value: string;
}

export default function SellerProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [currentProductId, setCurrentProductId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [allBusinesses, setAllBusinesses] = useState<any[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('');

  // Form fields
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [sku, setSku] = useState('');
  const [unitOfMeasure, setUnitOfMeasure] = useState('PIECE');
  const [minOrderQuantity, setMinOrderQuantity] = useState<number>(1);
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState<'PUBLISHED' | 'DRAFT'>('PUBLISHED');
  
  // Wholesale price tier
  const [tierMinQty, setTierMinQty] = useState<number>(10);
  const [tierPrice, setTierPrice] = useState<number>(0);
  const [enableWholesaleTier, setEnableWholesaleTier] = useState(false);

  // Specifications
  const [specs, setSpecs] = useState<SpecItem[]>([
    { key: 'Material', value: '' },
    { key: 'Brand', value: '' },
  ]);

  // CSV Import / Export State
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [csvPreview, setCsvPreview] = useState<any[]>([]);
  const [csvFileName, setCsvFileName] = useState('');
  const [csvError, setCsvError] = useState<string | null>(null);
  const [csvImporting, setCsvImporting] = useState(false);
  const [csvSuccessMsg, setCsvSuccessMsg] = useState<string | null>(null);

  const downloadSampleTemplate = () => {
    const csvContent =
      'Name,Category,SKU,UnitPrice,UnitOfMeasure,MinOrderQuantity,Description,ImageUrl,Material,Brand\n' +
      'Automatic CNC Lathe Machine,Industrial Machinery,APX-CNC-01,250000,SET,1,High precision industrial CNC turning and milling lathe machine.,https://images.unsplash.com/photo-1581092160607-ee22621dd758,Cast Iron & Alloy,Apex Machinery\n' +
      'Combed Cotton Grey Yarn 30s,Textiles & Fabrics,STX-YRN-30,220,KG,500,100% combed organic ring spun cotton yarn for high-speed weaving.,https://images.unsplash.com/photo-1607344645866-009c320b5ab8,100% Cotton,Surat Tex\n' +
      'Liquid Caustic Soda 48%,Chemicals & Solvents,CHM-CS-48,34,LITRE,200,Industrial grade technical caustic soda solution for paper and dye industries.,https://images.unsplash.com/photo-1532187863486-abf9dbad1b69,Aqueous NaOH,Gujarat Alkali\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'IndiaTrade_Bulk_Product_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFileName(file.name);
    setCsvError(null);
    setCsvSuccessMsg(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 2) {
          setCsvError('CSV file is empty or missing data rows.');
          return;
        }

        const headers = lines[0].split(',').map((h) => h.trim());
        const parsedRows: any[] = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map((v) => v.trim());
          if (!values[0]) continue;

          const rowObj: any = {};
          headers.forEach((h, index) => {
            rowObj[h] = values[index] || '';
          });

          parsedRows.push({
            name: rowObj.Name || rowObj.name,
            category: rowObj.Category || rowObj.category,
            sku: rowObj.SKU || rowObj.sku,
            unitPrice: Number(rowObj.UnitPrice || rowObj.unitPrice || 0),
            unitOfMeasure: rowObj.UnitOfMeasure || rowObj.unitOfMeasure || 'PIECE',
            minOrderQuantity: Number(rowObj.MinOrderQuantity || rowObj.minOrderQuantity || 1),
            description: rowObj.Description || rowObj.description,
            imageUrl: rowObj.ImageUrl || rowObj.imageUrl,
            material: rowObj.Material || rowObj.material,
            brand: rowObj.Brand || rowObj.brand,
          });
        }

        setCsvPreview(parsedRows);
      } catch (err: any) {
        setCsvError('Failed to parse CSV file: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteBulkImport = async () => {
    if (csvPreview.length === 0) {
      setCsvError('No valid rows found to import.');
      return;
    }

    const effectiveBusinessId = isAdmin
      ? selectedBusinessId || allBusinesses[0]?.id || primaryBusiness?.businessId
      : primaryBusiness?.businessId;

    setCsvImporting(true);
    setCsvError(null);
    try {
      const res = await fetchApi<any>('/products/bulk-import', {
        method: 'POST',
        body: JSON.stringify({
          products: csvPreview,
          businessId: effectiveBusinessId,
        }),
      });

      if (res.success && res.data) {
        setCsvSuccessMsg(`Successfully imported ${res.data.importedCount} products into your catalogue!`);
        await loadData();
        setTimeout(() => {
          setIsCsvModalOpen(false);
          setCsvPreview([]);
          setCsvSuccessMsg(null);
        }, 1800);
      } else {
        setCsvError(res.message || 'Failed to import products');
      }
    } catch (err: any) {
      setCsvError(err.message || 'Error occurred during bulk import');
    } finally {
      setCsvImporting(false);
    }
  };

  const handleExportCatalogueCsv = () => {
    if (products.length === 0) {
      alert('No products available to export.');
      return;
    }

    const headers = ['Name', 'SKU', 'Category', 'UnitPrice', 'UnitOfMeasure', 'MinOrderQuantity', 'Status', 'Supplier'];
    const rows = products.map((p) => [
      `"${(p.name || '').replace(/"/g, '""')}"`,
      `"${p.sku || ''}"`,
      `"${p.category?.name || ''}"`,
      p.unitPrice || 0,
      p.unitOfMeasure || 'PIECE',
      p.minOrderQuantity || 1,
      p.status || 'PUBLISHED',
      `"${p.business?.name || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `IndiaTrade_Catalogue_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isAdmin = user?.roles?.some((r: any) => {
    const roleName = typeof r === 'string' ? r : r.role?.name || r.name || '';
    return roleName.toUpperCase() === 'ADMIN' || roleName.toUpperCase() === 'SUPER_ADMIN';
  });
  const primaryBusiness = user?.businessMemberships?.[0];

  const loadData = async () => {
    setLoading(true);
    const prodEndpoint = isAdmin ? '/admin/products' : '/products/seller/my-products';
    const [prodRes, catRes, bizRes] = await Promise.all([
      fetchApi<any[]>(prodEndpoint),
      fetchApi<any[]>('/categories'),
      isAdmin ? fetchApi<any[]>('/admin/businesses') : Promise.resolve({ success: false, data: [] }),
    ]);

    if (prodRes.success && Array.isArray(prodRes.data)) {
      setProducts(prodRes.data);
    }
    if (catRes.success && Array.isArray(catRes.data)) {
      setCategories(catRes.data);
      if (catRes.data.length > 0 && !categoryId) {
        setCategoryId(catRes.data[0].id);
      }
    }
    if (bizRes.success && Array.isArray(bizRes.data)) {
      setAllBusinesses(bizRes.data);
      if (bizRes.data.length > 0 && !selectedBusinessId) {
        setSelectedBusinessId(bizRes.data[0].id);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      loadData();
    }
  }, [authLoading, user]);

  // Open modal if URL query param action=new is present
  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      openCreateModal();
    }
  }, [searchParams]);

  const openCreateModal = () => {
    setModalMode('create');
    setCurrentProductId(null);
    setName('');
    setSku('');
    setUnitOfMeasure('PIECE');
    setMinOrderQuantity(1);
    setUnitPrice(0);
    setDescription('');
    setImageUrl('https://images.unsplash.com/photo-1581092160607-ee22621dd758');
    setStatus('PUBLISHED');
    setEnableWholesaleTier(false);
    setTierMinQty(10);
    setTierPrice(0);
    setSpecs([
      { key: 'Material', value: 'Standard Grade' },
      { key: 'Warranty', value: '1 Year' },
    ]);
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: any) => {
    setModalMode('edit');
    setCurrentProductId(product.id);
    setName(product.name || '');
    setCategoryId(product.categoryId || (categories[0]?.id || ''));
    setSku(product.sku || '');
    setUnitOfMeasure(product.unitOfMeasure || 'PIECE');
    setMinOrderQuantity(product.minOrderQuantity || 1);
    setUnitPrice(product.unitPrice || 0);
    setDescription(product.description || '');
    setImageUrl(product.images?.[0]?.url || '');
    setStatus(product.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT');

    if (product.priceTiers && product.priceTiers.length > 0) {
      setEnableWholesaleTier(true);
      setTierMinQty(product.priceTiers[0].minQuantity || 10);
      setTierPrice(product.priceTiers[0].price || 0);
    } else {
      setEnableWholesaleTier(false);
      setTierMinQty(10);
      setTierPrice(0);
    }

    if (product.specifications && typeof product.specifications === 'object') {
      const specList = Object.entries(product.specifications).map(([key, value]) => ({
        key,
        value: String(value),
      }));
      setSpecs(specList.length > 0 ? specList : [{ key: 'Material', value: '' }]);
    } else {
      setSpecs([{ key: 'Material', value: '' }]);
    }

    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setModalError('Product name is required.');
      return;
    }
    const effectiveBusinessId = isAdmin
      ? selectedBusinessId || allBusinesses[0]?.id || primaryBusiness?.businessId
      : primaryBusiness?.businessId;

    if (!effectiveBusinessId) {
      setModalError('You must register or select a business storefront first before adding products.');
      return;
    }

    setSubmitting(true);
    setModalError(null);

    // Build specs record
    const specRecord: Record<string, string> = {};
    specs.forEach((s) => {
      if (s.key.trim() && s.value.trim()) {
        specRecord[s.key.trim()] = s.value.trim();
      }
    });

    // Build images array
    const imagesPayload = imageUrl.trim()
      ? [{ url: imageUrl.trim(), altText: name.trim(), isPrimary: true }]
      : [];

    // Build price tiers array
    const priceTiersPayload =
      enableWholesaleTier && tierPrice > 0
        ? [{ minQuantity: Number(tierMinQty), price: Number(tierPrice) }]
        : [];

    const payload: any = {
      name: name.trim(),
      categoryId,
      sku: sku.trim() || undefined,
      unitOfMeasure,
      minOrderQuantity: Number(minOrderQuantity) || 1,
      unitPrice: Number(unitPrice) || 0,
      description: description.trim() || undefined,
      status,
      specifications: specRecord,
      images: imagesPayload,
      priceTiers: priceTiersPayload,
    };

    try {
      if (modalMode === 'create') {
        payload.businessId = effectiveBusinessId;
        const res = await fetchApi('/products', {
          method: 'POST',
          body: JSON.stringify(payload),
        });

        if (res.success) {
          setIsModalOpen(false);
          await loadData();
        } else {
          setModalError(res.message || 'Failed to create product listing.');
        }
      } else if (modalMode === 'edit' && currentProductId) {
        const res = await fetchApi(`/products/${currentProductId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });

        if (res.success) {
          setIsModalOpen(false);
          await loadData();
        } else {
          setModalError(res.message || 'Failed to update product listing.');
        }
      }
    } catch (err: any) {
      setModalError(err.message || 'An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (product: any) => {
    const nextStatus = product.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    const res = await fetchApi(`/products/${product.id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: nextStatus }),
    });

    if (res.success) {
      await loadData();
    } else {
      alert(res.message || 'Failed to toggle product status');
    }
  };

  const handleDeleteProduct = async (product: any) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${product.name}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    const endpoint = isAdmin ? `/admin/products/${product.id}` : `/products/${product.id}`;
    const res = await fetchApi(endpoint, {
      method: 'DELETE',
    });

    if (res.success) {
      await loadData();
    } else {
      alert(res.message || 'Failed to delete product listing');
    }
  };

  // Filter products locally for search & status
  const filteredProducts = products.filter((p) => {
    if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
    if (categoryFilter && p.categoryId !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name?.toLowerCase().includes(q);
      const matchSku = p.sku?.toLowerCase().includes(q);
      const matchCat = p.category?.name?.toLowerCase().includes(q);
      if (!matchName && !matchSku && !matchCat) return false;
    }
    return true;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
            <Boxes className="w-4 h-4" />
            <span>Product Catalogue Management</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Manage Products & Wholesale Pricing
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Add industrial machinery, raw materials, or consumer goods. Edit specs, update prices, and control visibility.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCatalogueCsv}
            className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3.5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
            title="Download full catalogue as CSV"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={() => {
              setIsCsvModalOpen(true);
              setCsvError(null);
              setCsvPreview([]);
              setCsvFileName('');
            }}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 px-3.5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            title="Bulk import products from CSV template"
          >
            <Upload className="w-4 h-4 text-emerald-600" />
            <span>Bulk Import (CSV)</span>
          </button>

          <button
            onClick={openCreateModal}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

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
                  Super Admin Mode
                </span>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300">
                  Platform Catalogue ({products.length} Listings)
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm mt-0.5">
                Displaying all marketplace products across all registered suppliers in India
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                As Super Administrator, you have complete authority to moderate products, inspect supplier storefronts, or delete listings.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href="/admin?tab=sellers"
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm"
            >
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>Sellers Directory</span>
            </Link>
            <Link
              href="/admin?tab=buyers"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm"
            >
              <Users className="w-4 h-4" />
              <span>Buyers Directory</span>
            </Link>
          </div>
        </div>
      )}

      {/* Warning if no business registered (for regular sellers only) */}
      {!primaryBusiness && !isAdmin && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center justify-between text-xs text-rose-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>You need to register your business storefront before you can add products to the catalogue.</span>
          </div>
          <Link
            href="/dashboard/onboarding"
            className="bg-rose-600 hover:bg-rose-700 text-white font-semibold px-3 py-1.5 rounded-lg transition"
          >
            Setup Business
          </Link>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {[
            { label: 'All Products', value: 'ALL', count: products.length },
            {
              label: 'Active (Live)',
              value: 'PUBLISHED',
              count: products.filter((p) => p.status === 'PUBLISHED').length,
            },
            {
              label: 'Drafts',
              value: 'DRAFT',
              count: products.filter((p) => p.status === 'DRAFT').length,
            },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
                statusFilter === tab.value
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  statusFilter === tab.value ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Category Filter */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-slate-300 rounded-lg px-2.5 py-2 text-xs text-slate-700 bg-white outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Search Box */}
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search product, SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Product List / Cards */}
      {loading ? (
        <div className="py-16 flex justify-center">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
          <Boxes className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No products match your criteria</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            {products.length === 0
              ? 'Your product catalogue is empty. Click "+ Add New Product" to list your first item with photo, MOQ, and wholesale pricing.'
              : 'Try adjusting your search query or status filter to see listings.'}
          </p>
          {products.length === 0 && (
            <button
              onClick={openCreateModal}
              className="mt-4 inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add First Product</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((p) => {
            const primaryImg = p.images?.[0]?.url || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758';
            const inquiriesCount = p._count?.inquiries || 0;
            const hasWholesale = p.priceTiers && p.priceTiers.length > 0;

            return (
              <div
                key={p.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  {/* Thumbnail & Status Header */}
                  <div className="relative h-44 bg-slate-100 overflow-hidden group">
                    <img
                      src={primaryImg}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          p.status === 'PUBLISHED'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-slate-700 text-slate-200'
                        }`}
                      >
                        {p.status}
                      </span>
                      {p.sku && (
                        <span className="text-[10px] font-mono bg-black/60 text-white px-1.5 py-0.5 rounded backdrop-blur-xs">
                          {p.sku}
                        </span>
                      )}
                    </div>

                    <div className="absolute top-2.5 right-2.5">
                      <span className="text-[10px] font-bold bg-white/90 text-slate-800 px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                        {p.category?.name || 'Industrial'}
                      </span>
                    </div>
                  </div>

                  {/* Body Details */}
                  <div className="p-4 space-y-2.5">
                    <h3 className="font-bold text-sm text-slate-900 line-clamp-1" title={p.name}>
                      {p.name}
                    </h3>

                    {/* Supplier info (Visible for Super Admin) */}
                    {p.business && (
                      <div className="flex items-center justify-between text-[11px] bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5">
                        <span className="text-slate-500 font-medium">Supplier:</span>
                        <Link
                          href={`/store/${p.business.slug}`}
                          target="_blank"
                          className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 truncate max-w-[180px]"
                        >
                          <span>{p.business.name}</span>
                          <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
                        </Link>
                      </div>
                    )}

                    {/* Pricing and MOQ */}
                    <div className="flex items-baseline justify-between pt-1 border-t border-slate-100">
                      <div>
                        <div className="text-base font-extrabold text-emerald-700">
                          ₹{p.unitPrice?.toLocaleString('en-IN')}
                          <span className="text-[11px] font-normal text-slate-500"> / {p.unitOfMeasure}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          Min. Order: <strong className="text-slate-800">{p.minOrderQuantity} {p.unitOfMeasure}</strong>
                        </div>
                      </div>

                      {inquiriesCount > 0 && (
                        <div className="text-right">
                          <span className="inline-flex items-center gap-1 text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold">
                            {inquiriesCount} Inquiries
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Wholesale Tier Highlight */}
                    {hasWholesale && (
                      <div className="bg-amber-50/70 border border-amber-200/60 rounded-lg px-2.5 py-1 text-[11px] text-amber-900 flex items-center justify-between">
                        <span>Wholesale (≥{p.priceTiers[0].minQuantity} {p.unitOfMeasure}):</span>
                        <strong className="text-amber-800">₹{p.priceTiers[0].price?.toLocaleString('en-IN')}</strong>
                      </div>
                    )}

                    {/* Technical Specs Tags */}
                    {p.specifications && Object.keys(p.specifications).length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {Object.entries(p.specifications).slice(0, 3).map(([k, v]) => (
                          <span
                            key={k}
                            className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 truncate max-w-[140px]"
                          >
                            <strong>{k}:</strong> {String(v)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs gap-1.5">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(p)}
                      className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 hover:text-emerald-700 hover:border-emerald-300 font-medium flex items-center gap-1 transition shadow-xs"
                      title="Edit Product Details"
                    >
                      <Edit className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="hidden sm:inline">Edit</span>
                    </button>

                    <button
                      onClick={() => handleToggleStatus(p)}
                      className={`p-1.5 rounded-lg border font-medium flex items-center gap-1 transition shadow-xs ${
                        p.status === 'PUBLISHED'
                          ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                          : 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100'
                      }`}
                      title={p.status === 'PUBLISHED' ? 'Hide / Move to Draft' : 'Publish Listing'}
                    >
                      {p.status === 'PUBLISHED' ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                          <span className="hidden sm:inline">Draft</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="hidden sm:inline">Publish</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <Link
                      href={`/products/${p.slug}`}
                      target="_blank"
                      className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 transition shadow-xs"
                      title="View Public Listing"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      onClick={() => handleDeleteProduct(p)}
                      className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-rose-600 hover:border-rose-300 transition shadow-xs"
                      title="Delete Product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                  <Boxes className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-slate-900">
                  {modalMode === 'create' ? 'Add New Product Listing' : 'Edit Product Catalogue Listing'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
              {modalError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* Basic Details */}
              <div className="space-y-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  1. Basic Details
                </div>

                {isAdmin && allBusinesses.length > 0 && (
                  <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3">
                    <label className="block font-bold text-amber-950 mb-1 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-amber-700" />
                      <span>Assign to Supplier / Storefront (Admin Super Power) *</span>
                    </label>
                    <select
                      value={selectedBusinessId}
                      onChange={(e) => setSelectedBusinessId(e.target.value)}
                      className="w-full px-3 py-2 border border-amber-300 rounded-lg text-slate-900 bg-white font-medium outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      {allBusinesses.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.city || 'India'}) • {b.verificationStatus}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-amber-800 mt-1">
                      Listing will be published under this verified supplier's storefront catalogue.
                    </p>
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Product Title / Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Heavy Duty CNC Lathe Machine 3000 RPM"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Product Category *
                    </label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 bg-white outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      SKU / Model Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. LATHE-CNC-3000"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Description & Applications
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe technical features, production capacity, machine warranty, and intended applications..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* B2B Pricing & MOQ */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  2. Pricing & Minimum Order Quantity (MOQ)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Base Price (₹ INR) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="any"
                      placeholder="e.g. 250000"
                      value={unitPrice || ''}
                      onChange={(e) => setUnitPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Unit of Measure *
                    </label>
                    <select
                      value={unitOfMeasure}
                      onChange={(e) => setUnitOfMeasure(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 bg-white outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {UNITS_OF_MEASURE.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Minimum Order (MOQ) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 1"
                      value={minOrderQuantity || ''}
                      onChange={(e) => setMinOrderQuantity(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Wholesale Tier Checkbox */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                    <input
                      type="checkbox"
                      checked={enableWholesaleTier}
                      onChange={(e) => setEnableWholesaleTier(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span>Add B2B Wholesale Discount Tier (Bulk Purchase Price)</span>
                  </label>

                  {enableWholesaleTier && (
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="block text-slate-600 mb-1">Bulk Min Quantity</label>
                        <input
                          type="number"
                          min="2"
                          placeholder="e.g. 10"
                          value={tierMinQty || ''}
                          onChange={(e) => setTierMinQty(Number(e.target.value))}
                          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 mb-1">Discounted Unit Price (₹)</label>
                        <input
                          type="number"
                          min="0"
                          placeholder="e.g. 220000"
                          value={tierPrice || ''}
                          onChange={(e) => setTierPrice(Number(e.target.value))}
                          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-bold text-emerald-700"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Photo & Media */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  3. Product Photo & Image
                </div>

                <div className="flex gap-3 items-start">
                  <div className="flex-1">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Image URL (Direct HTTP / Unsplash)
                    </label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-[11px]"
                    />
                  </div>

                  {imageUrl && (
                    <div className="w-16 h-16 rounded-lg border border-slate-300 overflow-hidden bg-slate-100 flex-shrink-0">
                      <img
                        src={imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Specifications Key-Value Pairs */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    4. Technical Specifications & Attributes
                  </div>
                  <button
                    type="button"
                    onClick={() => setSpecs([...specs, { key: '', value: '' }])}
                    className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 text-[11px]"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Attribute
                  </button>
                </div>

                <div className="space-y-2">
                  {specs.map((spec, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="e.g. Material, Grade, Capacity"
                        value={spec.key}
                        onChange={(e) => {
                          const updated = [...specs];
                          updated[idx].key = e.target.value;
                          setSpecs(updated);
                        }}
                        className="w-1/2 px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <input
                        type="text"
                        placeholder="e.g. Stainless Steel 304"
                        value={spec.value}
                        onChange={(e) => {
                          const updated = [...specs];
                          updated[idx].value = e.target.value;
                          setSpecs(updated);
                        }}
                        className="w-1/2 px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      {specs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setSpecs(specs.filter((_, i) => i !== idx))}
                          className="text-slate-400 hover:text-rose-500 p-1"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Visibility Status */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800">Publishing Status:</span>
                  <p className="text-[11px] text-slate-500">
                    Published listings appear immediately on IndiaTrade search.
                  </p>
                </div>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 bg-white font-semibold outline-none"
                >
                  <option value="PUBLISHED">Published (Active)</option>
                  <option value="DRAFT">Draft (Hidden)</option>
                </select>
              </div>

              {/* Modal Actions Footer */}
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
                  <span>{modalMode === 'create' ? 'Publish Listing' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Bulk Import Modal */}
      {isCsvModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Bulk Product Import via CSV</h3>
                  <p className="text-xs text-slate-500">
                    Upload dozens or hundreds of industrial machinery, textiles, or chemicals in one click.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCsvModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Template Download Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-bold text-xs text-slate-800 block">Need the standard spreadsheet format?</span>
                <span className="text-[11px] text-slate-500">
                  Download our pre-formatted sample template with columns for Name, SKU, MOQ, Price, and Image.
                </span>
              </div>
              <button
                type="button"
                onClick={downloadSampleTemplate}
                className="bg-white hover:bg-slate-100 text-emerald-700 border border-emerald-300 font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition flex-shrink-0 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Sample CSV</span>
              </button>
            </div>

            {/* File Upload Drop Zone */}
            <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-6 text-center transition bg-slate-50/50">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <label className="cursor-pointer">
                <span className="text-xs font-bold text-emerald-700 hover:underline">
                  Click to select CSV file
                </span>
                <span className="text-xs text-slate-500"> or drag and drop</span>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleCsvFileUpload}
                  className="hidden"
                />
              </label>
              <div className="text-[11px] text-slate-400 mt-1">
                {csvFileName ? (
                  <span className="text-emerald-700 font-bold font-mono">Selected: {csvFileName}</span>
                ) : (
                  'Supported file types: .csv (Comma-Separated Values)'
                )}
              </div>
            </div>

            {/* Error & Success Messages */}
            {csvError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-3 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{csvError}</span>
              </div>
            )}

            {csvSuccessMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{csvSuccessMsg}</span>
              </div>
            )}

            {/* CSV Preview Table */}
            {csvPreview.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">
                    Previewing {csvPreview.length} Rows to Import:
                  </span>
                  <span className="text-emerald-700 font-semibold text-[11px]">Validation Passed</span>
                </div>
                <div className="border border-slate-200 rounded-xl overflow-x-auto max-h-44 text-[11px]">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0">
                      <tr>
                        <th className="py-2 px-3">#</th>
                        <th className="py-2 px-3">Product Name</th>
                        <th className="py-2 px-3">Category</th>
                        <th className="py-2 px-3">Price (₹)</th>
                        <th className="py-2 px-3">MOQ</th>
                        <th className="py-2 px-3">SKU</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {csvPreview.slice(0, 10).map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-1.5 px-3 text-slate-400">{idx + 1}</td>
                          <td className="py-1.5 px-3 font-semibold text-slate-900 truncate max-w-[180px]">
                            {row.name}
                          </td>
                          <td className="py-1.5 px-3 text-slate-600">{row.category || 'General'}</td>
                          <td className="py-1.5 px-3 font-mono font-bold text-emerald-700">
                            ₹{Number(row.unitPrice).toLocaleString('en-IN')}
                          </td>
                          <td className="py-1.5 px-3">
                            {row.minOrderQuantity} {row.unitOfMeasure}
                          </td>
                          <td className="py-1.5 px-3 font-mono text-slate-500">{row.sku || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {csvPreview.length > 10 && (
                  <p className="text-[10px] text-slate-400 text-right">
                    ...and {csvPreview.length - 10} more rows will be imported.
                  </p>
                )}
              </div>
            )}

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsCsvModalOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteBulkImport}
                disabled={csvImporting || csvPreview.length === 0}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-1.5"
              >
                {csvImporting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                <span>
                  {csvImporting
                    ? 'Importing Products...'
                    : `Import ${csvPreview.length > 0 ? csvPreview.length : ''} Products`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

