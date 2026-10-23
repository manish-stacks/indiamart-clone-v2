'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Building2,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  Star,
  Clock,
  Calendar,
  Send,
  Boxes,
  MessageCircle,
  Phone,
  Award,
  ExternalLink,
} from 'lucide-react';
import { fetchApi } from '../../../lib/api';
import ProductCard from '../../../components/ProductCard';
import InquiryModal from '../../../components/InquiryModal';
import GSTINBreakdownModal from '../../../components/GSTINBreakdownModal';

export default function StorefrontPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [business, setBusiness] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [showGstinModal, setShowGstinModal] = useState(false);

  useEffect(() => {
    async function loadStore() {
      setLoading(true);
      const res = await fetchApi(`/businesses/${slug}`);
      if (res.success && res.data) {
        setBusiness(res.data);
      }
      setLoading(false);
    }
    if (slug) {
      loadStore();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse space-y-6">
        <div className="h-44 bg-slate-200 rounded-2xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-48 bg-slate-200 rounded-xl"></div>
          <div className="h-48 bg-slate-200 rounded-xl"></div>
          <div className="h-48 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-900">Supplier Storefront Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">The requested supplier is either unverified or has changed handle.</p>
        <Link href="/search" className="mt-4 inline-block bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-lg">
          Browse All Suppliers
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Store Banner & Profile Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-emerald-700 text-white font-extrabold text-2xl flex items-center justify-center shadow-md flex-shrink-0">
              {business.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{business.name}</h1>
                {business.gstinVerified && (
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> GSTIN Verified
                  </span>
                )}
              </div>
              {business.legalName && (
                <div className="text-xs text-slate-400 font-medium mt-0.5">{business.legalName}</div>
              )}
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-600 flex-wrap">
                <span className="capitalize font-semibold text-slate-800">{business.businessType.toLowerCase()}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {business.city}, {business.state} (PIN: {business.postalCode})
                </span>
                {business.yearEstablished && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> Estd. {business.yearEstablished}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6 text-xs">
            <div>
              <div className="text-slate-400 text-[11px]">Trust Score</div>
              <div className="text-base font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> {business.trustScore}
              </div>
            </div>
            <div className="border-l border-slate-200 pl-4">
              <div className="text-slate-400 text-[11px]">Avg. Response</div>
              <div className="text-base font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                <Clock className="w-4 h-4 text-emerald-600" /> {business.responseTimeHours}h
              </div>
            </div>
            <div className="border-l border-slate-200 pl-4">
              <div className="text-slate-400 text-[11px]">Products</div>
              <div className="text-base font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                <Boxes className="w-4 h-4 text-blue-600" /> {business.productCount}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Actions Bar with WhatsApp & TrustSEAL */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGstinModal(true)}
              className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>TrustSEAL & GSTIN Breakdown</span>
            </button>
            <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
              GSTIN: <strong>{business.gstin || '24AAACA1234A1Z5'}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`https://wa.me/919825012345?text=${encodeURIComponent(`Namaste ${business.name}! I am contacting you through your IndiaTrade public storefront.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] hover:bg-[#20ba5a] text-slate-950 px-3.5 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition shadow-xs"
            >
              <MessageCircle className="w-4 h-4 text-slate-950" />
              <span>WhatsApp Store</span>
            </a>
            <a
              href="tel:+919825012345"
              className="bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Call: +91 98250 XXXXX</span>
            </a>
          </div>
        </div>

        {/* Company Description */}
        {business.description && (
          <div className="mt-6 pt-6 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">About Company</h3>
            <p className="text-xs md:text-sm text-slate-600 leading-relaxed max-w-4xl">
              {business.description}
            </p>
          </div>
        )}
      </div>

      {/* Store Products Catalogue */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Product Catalogue by {business.name}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Direct factory prices with genuine B2B minimum order quantities and bulk pricing.
            </p>
          </div>
        </div>

        {business.products && business.products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {business.products.map((p: any) => (
              <ProductCard
                key={p.id}
                product={{
                  ...p,
                  business: {
                    name: business.name,
                    slug: business.slug,
                    city: business.city,
                    state: business.state,
                    gstinVerified: business.gstinVerified,
                  },
                }}
                onContactSupplier={(prod) => setSelectedProduct(prod)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-500">
            This supplier has not added public products yet.
          </div>
        )}
      </section>

      {/* Inquiry Modal */}
      {selectedProduct && (
        <InquiryModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* GSTIN Breakdown Modal */}
      {showGstinModal && (
        <GSTINBreakdownModal
          isOpen={showGstinModal}
          onClose={() => setShowGstinModal(false)}
          gstin={business.gstin}
          businessName={business.name}
          city={business.city}
          state={business.state}
          yearEstablished={business.yearEstablished}
        />
      )}
    </div>
  );
}

