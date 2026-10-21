'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Building2,
  Cpu,
  Shirt,
  Zap,
  ArrowRight,
  CheckCircle2,
  PlusCircle,
  Truck,
  FileText,
  BadgeCheck,
} from 'lucide-react';
import { fetchApi } from '../lib/api';
import ProductCard from '../components/ProductCard';
import InquiryModal from '../components/InquiryModal';

export default function HomePage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  useEffect(() => {
    async function loadData() {
      // Fetch categories
      const catRes = await fetchApi('/categories');
      if (catRes.success && catRes.data) {
        setCategories(catRes.data);
      }

      // Fetch featured products
      const prodRes = await fetchApi('/products/search?limit=8');
      if (prodRes.success && prodRes.data?.data) {
        setProducts(prodRes.data.data);
      }

      // Fetch verified businesses
      const bizRes = await fetchApi('/businesses?limit=4&verifiedOnly=true');
      if (bizRes.success && bizRes.data?.data) {
        setBusinesses(bizRes.data.data);
      }
    }
    loadData();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 bg-emerald-950/80 border border-emerald-700/60 text-emerald-400 text-xs px-3 py-1 rounded-full font-medium">
                <ShieldCheck className="w-4 h-4" /> Free Marketplace • Zero Commission on Leads
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
                Connect Directly With India’s Top <span className="text-emerald-400">Manufacturers</span> & Wholesalers
              </h1>
              <p className="text-slate-300 text-sm md:text-base max-w-xl">
                Discover verified suppliers, request wholesale quotations, compare bulk prices, or purchase directly with Indian GSTIN transparency.
              </p>

              {/* Quick Category Badges */}
              <div className="pt-2 flex flex-wrap gap-2 text-xs">
                <span className="text-slate-400 self-center">Popular:</span>
                <Link
                  href="/search?category=cnc-lathe-machines"
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition"
                >
                  CNC Lathes
                </Link>
                <Link
                  href="/search?category=cotton-fabrics"
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition"
                >
                  Organic Cotton
                </Link>
                <Link
                  href="/search?category=packaging-machinery"
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition"
                >
                  Strapping Machines
                </Link>
                <Link
                  href="/search?city=Surat"
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition"
                >
                  Surat Textiles
                </Link>
              </div>
            </div>

            {/* Right Card: Post Buying Requirement Quick Box */}
            <div className="lg:col-span-5">
              <div className="bg-white text-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-100">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm mb-1">
                  <PlusCircle className="w-4 h-4 text-emerald-600" /> Post Buying Requirement (RFQ)
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Get Instant Quotes from Verified Suppliers
                </h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  Tell us what product or machine you need. Verified Indian sellers will reach out with customized quotes.
                </p>

                <Link
                  href="/requirements/new"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-xl text-center block text-sm transition shadow-sm"
                >
                  Post Your Requirement for Free →
                </Link>

                <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 text-center text-[11px] text-slate-500">
                  <div>
                    <span className="font-bold text-slate-800 block text-xs">100% Free</span> No Hidden Costs
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block text-xs">Direct Contact</span> No Middlemen
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block text-xs">Verified GST</span> Legitimate Sellers
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
        {/* Categories Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                Explore Top Industrial & Consumer Categories
              </h2>
              <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                Browse through verified Indian manufacturing sectors and supply chains.
              </p>
            </div>
            <Link
              href="/categories"
              className="text-emerald-700 hover:text-emerald-800 text-xs md:text-sm font-semibold flex items-center gap-1 transition"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <Link
                      href={`/search?category=${cat.slug}`}
                      className="font-bold text-slate-900 text-sm hover:text-emerald-700 transition"
                    >
                      {cat.name}
                    </Link>
                    <div className="text-[11px] text-slate-500">{cat.productCount || 0} Products Listed</div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                  {cat.description || 'Verified industrial supplies and wholesale catalogue.'}
                </p>

                {cat.children && cat.children.length > 0 && (
                  <div className="border-t border-slate-100 pt-3 flex flex-wrap gap-1.5">
                    {cat.children.map((sub: any) => (
                      <Link
                        key={sub.id}
                        href={`/search?category=${sub.slug}`}
                        className="text-[11px] bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 px-2 py-0.5 rounded transition"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Featured Products */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                Recently Added Products & Wholesale Catalogues
              </h2>
              <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                Direct factory prices with transparent minimum order quantities (MOQ).
              </p>
            </div>
            <Link
              href="/search"
              className="text-emerald-700 hover:text-emerald-800 text-xs md:text-sm font-semibold flex items-center gap-1 transition"
            >
              Browse Catalogue <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onContactSupplier={(p) => setSelectedProduct(p)}
              />
            ))}
          </div>
        </section>

        {/* Verified Suppliers Showcase */}
        <section className="bg-slate-100/70 border border-slate-200 rounded-2xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
                <BadgeCheck className="w-4 h-4" /> Verified Indian Businesses
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                Featured Verified Suppliers & Manufacturers
              </h2>
              <p className="text-xs md:text-sm text-slate-600 mt-0.5">
                Suppliers with confirmed GSTIN and active response records.
              </p>
            </div>
            <Link
              href="/register"
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-lg self-start transition"
            >
              Register Your Business Free
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {businesses.map((biz) => (
              <div
                key={biz.id}
                className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        href={`/store/${biz.slug}`}
                        className="font-bold text-slate-900 text-base hover:text-emerald-700 transition"
                      >
                        {biz.name}
                      </Link>
                      <div className="flex items-center gap-2 mt-1 text-xs">
                        <span className="bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> GSTIN Verified
                        </span>
                        <span className="text-slate-500 capitalize">{biz.businessType.toLowerCase()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-900">★ {Number(biz.trustScore).toFixed(1)}</div>
                      <div className="text-[10px] text-slate-400">Trust Score</div>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-slate-600">
                    Location: <span className="font-medium text-slate-800">{biz.city}, {biz.state}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Catalogue: <span className="font-medium text-slate-700">{biz.productCount || 0} Products Published</span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    href={`/store/${biz.slug}`}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition"
                  >
                    View Company Storefront →
                  </Link>
                  <Link
                    href={`/search?city=${biz.city}`}
                    className="text-xs text-slate-500 hover:text-slate-800"
                  >
                    More in {biz.city}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Free Marketplace Manifesto Banner */}
        <section className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-2xl p-8 md:p-10 shadow-lg">
          <div className="max-w-3xl space-y-3">
            <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              A Truly Free Indian B2B & B2C Marketplace
            </h3>
            <p className="text-slate-200 text-xs md:text-sm leading-relaxed">
              We believe Indian MSMEs, manufacturers, and traders shouldn’t be forced into costly lead subscription traps. On IndiaTrade, buyers post buying requirements for free, and suppliers receive inquiries directly without paying for lead unlocks.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="bg-white text-emerald-900 hover:bg-slate-100 font-bold px-5 py-2.5 rounded-lg text-xs transition"
              >
                Register as Free Seller
              </Link>
              <Link
                href="/requirements/new"
                className="bg-emerald-950/60 hover:bg-emerald-950 text-white font-bold px-5 py-2.5 rounded-lg text-xs border border-emerald-400/30 transition"
              >
                Post Buying RFQ
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* Inquiry Modal */}
      {selectedProduct && (
        <InquiryModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}

