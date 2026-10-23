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
  Layers,
  MapPin,
  TrendingUp,
  Sparkles,
  PhoneCall,
  MessageSquare,
  HelpCircle,
  Check,
  X,
} from 'lucide-react';
import { fetchApi } from '../lib/api';
import ProductCard from '../components/ProductCard';
import InquiryModal from '../components/InquiryModal';

const MANUFACTURING_HUBS = [
  { city: 'Ahmedabad', state: 'Gujarat', focus: 'CNC Machinery, Chemical Plants & Engineering', tag: 'Engineering Hub' },
  { city: 'Surat', state: 'Gujarat', focus: 'Manmade Textiles, Cotton Weaving & Synthetic Yarns', tag: 'Textile Capital' },
  { city: 'Delhi', state: 'NCR', focus: 'Industrial Hardware, Electricals & Packaging Supplies', tag: 'Wholesale Trade' },
  { city: 'Mumbai', state: 'Maharashtra', focus: 'Bulk Chemicals, Export Goods & Polymers', tag: 'Commercial Center' },
  { city: 'Bengaluru', state: 'Karnataka', focus: 'Precision Electronics, CNC Automation & Tech Tools', tag: 'Precision Tech' },
  { city: 'Pune', state: 'Maharashtra', focus: 'Automotive Components, Heavy Castings & Forgings', tag: 'Automotive Hub' },
];

const RECENT_RFQS = [
  { title: 'Need 500 Meters Pure Cotton Twill Fabric 120 GSM', city: 'Surat, Gujarat', qty: '500 Meters', time: '10 mins ago' },
  { title: 'Requirement for 2 CNC Horizontal Lathe Machines 3000 RPM', city: 'Pune, Maharashtra', qty: '2 Units', time: '25 mins ago' },
  { title: 'Urgent: Semi-Automatic Carton Box Strapping Machine', city: 'Delhi NCR', qty: '4 Sets', time: '40 mins ago' },
  { title: 'Bulk Supply: Polyester Spun Yarn 150D for Loom Unit', city: 'Ahmedabad, Gujarat', qty: '1000 KG', time: '1 hour ago' },
];

export default function HomePage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  useEffect(() => {
    async function loadData() {
      const [catRes, prodRes, bizRes] = await Promise.all([
        fetchApi('/categories'),
        fetchApi('/products/search?limit=12'),
        fetchApi('/businesses?limit=4&verifiedOnly=true'),
      ]);

      if (catRes.success && catRes.data) setCategories(catRes.data);
      if (prodRes.success && prodRes.data?.data) setProducts(prodRes.data.data);
      if (bizRes.success && bizRes.data?.data) setBusinesses(bizRes.data.data);
    }
    loadData();
  }, []);

  const machineryProducts = products.filter(
    (p) =>
      p.category?.slug === 'cnc-lathe-machines' ||
      p.category?.slug === 'packaging-machinery' ||
      p.category?.slug === 'industrial-machinery',
  );

  const textileProducts = products.filter(
    (p) =>
      p.category?.slug === 'cotton-fabrics' ||
      p.category?.slug === 'industrial-yarns' ||
      p.category?.slug === 'textiles-fabrics',
  );

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 bg-emerald-950/80 border border-emerald-700/60 text-emerald-400 text-xs px-3.5 py-1 rounded-full font-medium shadow-sm">
                <ShieldCheck className="w-4 h-4" /> 100% Free Marketplace • Zero Commission on Leads
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
                Connect Directly With India’s Top <span className="text-emerald-400">Manufacturers</span> & Wholesalers
              </h1>
              <p className="text-slate-300 text-xs md:text-sm max-w-xl leading-relaxed">
                India’s free B2B & B2C marketplace. Discover verified Indian suppliers, request wholesale quotations, compare bulk prices, or contact verified GSTIN sellers with zero middlemen fees.
              </p>

              {/* Quick Category Badges */}
              <div className="pt-2 flex flex-wrap gap-2 text-xs">
                <span className="text-slate-400 self-center font-medium">Popular:</span>
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
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider mb-1">
                  <PlusCircle className="w-4 h-4 text-emerald-600" /> B2B Buying Requirement (RFQ)
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Get Instant Quotes from Verified Suppliers
                </h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  Tell us what machinery, fabric, or raw material you need. Verified Indian sellers will reach out with customized quotes.
                </p>

                <Link
                  href="/requirements/new"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-xl text-center block text-xs transition shadow-sm"
                >
                  Post Your Buying Requirement for Free →
                </Link>

                <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 text-center text-[11px] text-slate-500">
                  <div>
                    <span className="font-bold text-slate-800 block text-xs">100% Free</span> Zero Paywalls
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block text-xs">Direct Contact</span> WhatsApp / Calls
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

      {/* Live Recent Buying Inquiries Ticker */}
      <section className="max-w-7xl mx-auto px-4 -mt-6">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-emerald-900 flex-shrink-0">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Live Buyer Inquiries Across India:</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-slate-700 text-xs">
            {RECENT_RFQS.slice(0, 2).map((rfq, i) => (
              <span key={i} className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md border border-emerald-200/60 shadow-xs">
                <span className="font-medium text-slate-800 truncate max-w-xs">{rfq.title}</span>
                <span className="text-[10px] text-slate-400">({rfq.city})</span>
              </span>
            ))}
          </div>
          <Link
            href="/requirements/new"
            className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 flex-shrink-0"
          >
            Post Your RFQ <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 space-y-12">
        {/* Curated Section 1: Industrial Machinery & Plants */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 border-b border-slate-100 pb-4">
            <div>
              <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5" /> Industrial Manufacturing Equipment
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                Industrial Machinery, CNC Lathes & Packaging Plants
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Precision machine tools, automated cartooning, and heavy engineering equipment direct from factories.
              </p>
            </div>
            <Link
              href="/search?category=industrial-machinery"
              className="text-emerald-700 hover:text-emerald-800 font-semibold text-xs flex items-center gap-1 flex-shrink-0"
            >
              View All Machinery <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {(machineryProducts.length > 0 ? machineryProducts : products.slice(0, 4)).map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onContactSupplier={(p) => setSelectedProduct(p)}
              />
            ))}
          </div>
        </section>

        {/* Curated Section 2: Textiles, Cotton Fabrics & Yarns */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 border-b border-slate-100 pb-4">
            <div>
              <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Shirt className="w-3.5 h-3.5" /> Bulk Apparel & Fabric Mill Hub
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                Textiles, Organic Cotton Fabrics & Industrial Yarns
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Surat and Ahmedabad textile mills with wholesale tier discounts and export-grade certifications.
              </p>
            </div>
            <Link
              href="/search?category=textiles-fabrics"
              className="text-emerald-700 hover:text-emerald-800 font-semibold text-xs flex items-center gap-1 flex-shrink-0"
            >
              View All Textiles <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {(textileProducts.length > 0 ? textileProducts : products.slice(0, 4)).map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onContactSupplier={(p) => setSelectedProduct(p)}
              />
            ))}
          </div>
        </section>

        {/* Key Indian Manufacturing Hubs & Industrial Clusters */}
        <section>
          <div className="mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" /> Major Indian Trade Hubs & Industrial Clusters
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Source directly from specialized regional manufacturing belts across India.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {MANUFACTURING_HUBS.map((hub) => (
              <Link
                key={hub.city}
                href={`/search?city=${hub.city}`}
                className="bg-white border border-slate-200 rounded-xl p-5 hover:border-emerald-500 hover:shadow-md transition group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition">
                    {hub.city}, {hub.state}
                  </span>
                  <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                    {hub.tag}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  {hub.focus}
                </p>
                <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                  Browse {hub.city} Suppliers <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Why IndiaTrade Free Marketplace Comparison Box */}
        <section className="bg-slate-900 text-white rounded-2xl p-6 md:p-10 shadow-lg">
          <div className="max-w-3xl mb-8 space-y-2">
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> The Free Marketplace Pledge
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Why Indian Businesses Choose IndiaTrade Over Paid Lead Portals
            </h2>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              Traditional B2B directories charge ₹25,000 to ₹1,00,000 per year and force sellers to purchase "lead credits" just to see buyer mobile numbers. IndiaTrade is committed to 100% free inquiry delivery.
            </p>
          </div>

          <div className="overflow-x-auto bg-slate-800/80 rounded-xl border border-slate-700">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800 text-slate-300 border-b border-slate-700">
                <tr>
                  <th className="py-3 px-4 font-semibold">Feature / Capability</th>
                  <th className="py-3 px-4 font-semibold text-rose-400">Traditional Paid Portals</th>
                  <th className="py-3 px-4 font-bold text-emerald-400">IndiaTrade Marketplace</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60">
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Cost per Buyer Lead / Inquiry</td>
                  <td className="py-3 px-4 text-slate-400">₹200 to ₹500 per lead consumed</td>
                  <td className="py-3 px-4 font-bold text-emerald-400 flex items-center gap-1">
                    <Check className="w-4 h-4" /> ₹0 (100% Free Forever)
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Buyer Contact Details (Phone & WhatsApp)</td>
                  <td className="py-3 px-4 text-slate-400">Masked behind paid credit barrier</td>
                  <td className="py-3 px-4 font-bold text-emerald-400 flex items-center gap-1">
                    <Check className="w-4 h-4" /> Direct 1-Click WhatsApp & Calling
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Annual Membership Fees</td>
                  <td className="py-3 px-4 text-slate-400">₹25,000 - ₹1,50,000 mandatory subscription</td>
                  <td className="py-3 px-4 font-bold text-emerald-400 flex items-center gap-1">
                    <Check className="w-4 h-4" /> ₹0 Free Storefront & Unlimited Catalog
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">In-App Live Chat & Quotation Negotiation</td>
                  <td className="py-3 px-4 text-slate-400">Limited or requires paid tier</td>
                  <td className="py-3 px-4 font-bold text-emerald-400 flex items-center gap-1">
                    <Check className="w-4 h-4" /> Built-in Direct Chat & CRM Pipeline
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-sm"
            >
              Register Your Business 100% Free
            </Link>
            <Link
              href="/requirements/new"
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs px-5 py-2.5 rounded-xl transition"
            >
              Post Buyer Requirement (RFQ)
            </Link>
          </div>
        </section>

        {/* Featured Verified Suppliers Showcase */}
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
                Suppliers with confirmed 15-digit GSTIN and active lead response records.
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
