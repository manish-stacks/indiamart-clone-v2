'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Filter,
  Search,
  CheckCircle2,
  X,
  MapPin,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';
import { fetchApi } from '../../lib/api';
import ProductCard from '../../components/ProductCard';
import InquiryModal from '../../components/InquiryModal';

const POPULAR_CITIES = ['All India', 'Ahmedabad', 'Surat', 'Mumbai', 'Delhi', 'Bengaluru', 'Pune'];

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';
  const cityParam = searchParams.get('city') || '';
  const verifiedOnlyParam = searchParams.get('verifiedOnly') === 'true';
  const tradeTypeParam = searchParams.get('tradeType') || '';
  const sortByParam = searchParams.get('sortBy') || '';

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  // Local filter states
  const [q, setQ] = useState(queryParam);
  const [city, setCity] = useState(cityParam || 'All India');
  const [verifiedOnly, setVerifiedOnly] = useState(verifiedOnlyParam);
  const [tradeType, setTradeType] = useState(tradeTypeParam);
  const [sortBy, setSortBy] = useState(sortByParam);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [moqFilter, setMoqFilter] = useState<string>('ALL');

  useEffect(() => {
    async function executeSearch() {
      setLoading(true);
      const params = new URLSearchParams();
      if (queryParam) params.set('q', queryParam);
      if (categoryParam) params.set('category', categoryParam);
      if (cityParam && cityParam !== 'All India') params.set('city', cityParam);
      if (verifiedOnlyParam) params.set('verifiedOnly', 'true');
      if (tradeTypeParam) params.set('tradeType', tradeTypeParam);
      if (sortByParam) params.set('sortBy', sortByParam);

      const res = await fetchApi(`/products/search?${params.toString()}`);
      if (res.success && res.data) {
        setProducts(res.data.data || []);
        setTotalCount(res.data.meta?.total || 0);
      } else {
        setProducts([]);
        setTotalCount(0);
      }
      setLoading(false);
    }
    executeSearch();
  }, [searchParams]);

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (categoryParam) params.set('category', categoryParam);
    if (city !== 'All India') params.set('city', city);
    if (verifiedOnly) params.set('verifiedOnly', 'true');
    if (tradeType) params.set('tradeType', tradeType);
    if (sortBy) params.set('sortBy', sortBy);

    router.push(`/search?${params.toString()}`);
  };

  const resetFilters = () => {
    setQ('');
    setCity('All India');
    setVerifiedOnly(false);
    setTradeType('');
    setSortBy('');
    setMinPrice('');
    setMaxPrice('');
    setMoqFilter('ALL');
    router.push('/search');
  };

  const filteredProducts = products
    .filter((p) => {
      if (minPrice && Number(p.unitPrice) < Number(minPrice)) return false;
      if (maxPrice && Number(p.unitPrice) > Number(maxPrice)) return false;
      if (moqFilter === 'RETAIL_1_5' && Number(p.minOrderQuantity || 1) > 5) return false;
      if (
        moqFilter === 'WHOLESALE_10_50' &&
        (Number(p.minOrderQuantity || 1) < 10 || Number(p.minOrderQuantity || 1) > 50)
      )
        return false;
      if (moqFilter === 'BULK_100' && Number(p.minOrderQuantity || 1) < 100) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return Number(a.unitPrice) - Number(b.unitPrice);
      if (sortBy === 'price_desc') return Number(b.unitPrice) - Number(a.unitPrice);
      return 0;
    });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb & Header */}
      <div className="mb-6">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
          <span>Marketplace</span>
          <ChevronRight className="w-3 h-3" />
          <span className="font-semibold text-slate-800">Product Search</span>
          {categoryParam && (
            <>
              <ChevronRight className="w-3 h-3" />
              <span className="text-emerald-700 font-semibold">{categoryParam}</span>
            </>
          )}
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {queryParam ? `Results for "${queryParam}"` : 'All Industrial & Commercial Products'}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Showing {totalCount} verified products from Indian manufacturers, wholesalers, and exporters.
        </p>

        {/* City Quick Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-4 text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1 flex-shrink-0">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Hubs:
          </span>
          {POPULAR_CITIES.map((c) => (
            <button
              key={c}
              onClick={() => {
                setCity(c);
                const params = new URLSearchParams(searchParams.toString());
                if (c === 'All India') params.delete('city');
                else params.set('city', c);
                router.push(`/search?${params.toString()}`);
              }}
              className={`px-3 py-1 rounded-full font-semibold transition whitespace-nowrap text-xs ${
                (cityParam === c || (c === 'All India' && !cityParam))
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-emerald-600" /> Filter Results
              </span>
              <button
                onClick={resetFilters}
                className="text-xs text-slate-400 hover:text-rose-600 transition"
              >
                Reset All
              </button>
            </div>

            {/* Keyword refinement */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Keyword</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. lathe, cotton, yarn..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* City Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Supplier City</label>
              <select
                aria-label="Filter products by city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs outline-none bg-white font-medium"
              >
                {POPULAR_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Trade Type Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Trade Type</label>
              <div className="space-y-1.5 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="tradeType"
                    checked={tradeType === ''}
                    onChange={() => setTradeType('')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>All Listings</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="tradeType"
                    checked={tradeType === 'b2b'}
                    onChange={() => setTradeType('b2b')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>B2B Bulk Orders Only</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="tradeType"
                    checked={tradeType === 'b2c'}
                    onChange={() => setTradeType('b2c')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>B2C / Single Units</span>
                </label>
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Price Range (₹)</label>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <input
                  type="number"
                  placeholder="₹ Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
                <input
                  type="number"
                  placeholder="₹ Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>
              <div className="flex flex-wrap gap-1 text-[10px]">
                {[
                  { label: '< ₹5k', min: '', max: '5000' },
                  { label: '₹5k-50k', min: '5000', max: '50000' },
                  { label: '₹50k-5L', min: '50000', max: '500000' },
                  { label: '₹5L+', min: '500000', max: '' },
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setMinPrice(chip.min);
                      setMaxPrice(chip.max);
                    }}
                    className="bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 px-2 py-0.5 rounded text-slate-600 transition"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Minimum Order Quantity (MOQ) Filter */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Minimum Order Quantity (MOQ)</label>
              <div className="space-y-1.5 text-xs">
                {[
                  { label: 'Any MOQ', value: 'ALL' },
                  { label: 'Retail (1 - 5 units)', value: 'RETAIL_1_5' },
                  { label: 'Wholesale (10 - 50 units)', value: 'WHOLESALE_10_50' },
                  { label: 'Bulk Industrial (100+ units)', value: 'BULK_100' },
                ].map((item) => (
                  <label key={item.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="moqFilter"
                      checked={moqFilter === item.value}
                      onChange={() => setMoqFilter(item.value)}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Verification Checkbox */}
            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Verified Suppliers Only
                </span>
              </label>
            </div>

            {/* Sort Order */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Sort By</label>
              <select
                aria-label="Sort products by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs outline-none bg-white"
              >
                <option value="">Featured / Relevance</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>

            {/* Apply Button */}
            <button
              onClick={applyFilters}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-lg text-xs transition"
            >
              Apply Filters
            </button>
          </div>
        </aside>

        {/* Products Grid */}
        <main className="lg:col-span-9">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-xl h-80 animate-pulse p-4">
                  <div className="bg-slate-200 h-44 rounded-lg mb-3"></div>
                  <div className="bg-slate-200 h-4 w-3/4 rounded mb-2"></div>
                  <div className="bg-slate-200 h-4 w-1/2 rounded"></div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onContactSupplier={(prod) => setSelectedProduct(prod)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
              <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No Products Found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                We couldn't find any listings matching your search criteria. Try removing some filters or searching with generic keywords.
              </p>
              <button
                onClick={resetFilters}
                className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Contact Supplier Modal */}
      {selectedProduct && (
        <InquiryModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-500">Loading catalog...</div>}>
      <SearchContent />
    </Suspense>
  );
}

