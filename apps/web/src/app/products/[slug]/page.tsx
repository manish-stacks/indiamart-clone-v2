'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Building2,
  Send,
  ShoppingCart,
  ChevronRight,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';
import { fetchApi } from '../../../lib/api';
import InquiryModal from '../../../components/InquiryModal';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>('');
  const [showInquiryModal, setShowInquiryModal] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      const res = await fetchApi(`/products/${slug}`);
      if (res.success && res.data) {
        setProduct(res.data);
        setActiveImage(res.data.images[0]?.url || '');
      }
      setLoading(false);
    }
    if (slug) {
      loadProduct();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse space-y-6">
        <div className="h-6 bg-slate-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-96 bg-slate-200 rounded-xl"></div>
          <div className="space-y-4">
            <div className="h-8 bg-slate-200 rounded w-3/4"></div>
            <div className="h-6 bg-slate-200 rounded w-1/3"></div>
            <div className="h-32 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-900">Product Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">The requested product listing does not exist or has been archived.</p>
        <Link href="/search" className="mt-4 inline-block bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-lg">
          Browse All Products
        </Link>
      </div>
    );
  }

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(product.unitPrice);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/" className="hover:text-emerald-700">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/search" className="hover:text-emerald-700">Catalogue</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href={`/search?category=${product.category.slug}`} className="hover:text-emerald-700">
          {product.category.name}
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-800 font-semibold truncate max-w-xs">{product.name}</span>
      </div>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Product Images Gallery */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden h-96 flex items-center justify-center p-4">
            <img
              src={activeImage || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80'}
              alt={product.name}
              className="max-h-full max-w-full object-contain rounded-lg"
            />
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.images.map((img: any) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(img.url)}
                  className={`w-16 h-16 rounded-lg border-2 overflow-hidden flex-shrink-0 ${
                    activeImage === img.url ? 'border-emerald-600' : 'border-slate-200'
                  }`}
                >
                  <img src={img.url} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Center: Details & Pricing */}
        <div className="lg:col-span-4 space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {product.isB2B && (
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded">
                  B2B Bulk Supply
                </span>
              )}
              {product.isB2C && (
                <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded">
                  Direct Retail Available
                </span>
              )}
              {product.sku && (
                <span className="text-slate-400 text-[11px]">SKU: {product.sku}</span>
              )}
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 leading-snug">
              {product.name}
            </h1>
          </div>

          {/* Price Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="text-xs text-slate-500 font-medium">Estimated Unit Price</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              {formattedPrice} <span className="text-xs font-normal text-slate-600">/ {product.unitOfMeasure}</span>
            </div>
            <div className="text-xs font-semibold text-slate-700 mt-2">
              Minimum Order Quantity (MOQ): <span className="text-emerald-700 font-bold">{product.minOrderQuantity} {product.unitOfMeasure}</span>
            </div>
          </div>

          {/* Bulk Wholesale Pricing Tiers */}
          {product.priceTiers && product.priceTiers.length > 0 && (
            <div className="border border-slate-200 rounded-xl p-4 bg-white">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-600" /> Wholesale Bulk Discount Tiers
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3 font-semibold">Quantity ({product.unitOfMeasure})</th>
                      <th className="py-2 px-3 font-semibold text-right">Price per {product.unitOfMeasure}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {product.priceTiers.map((tier: any, i: number) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="py-2 px-3 text-slate-800">
                          {tier.minQuantity} {tier.maxQuantity ? `- ${tier.maxQuantity}` : '+'}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-emerald-700">
                          ₹{Number(tier.price).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Primary CTA */}
          <div className="space-y-2 pt-2">
            <button
              onClick={() => setShowInquiryModal(true)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm transition"
            >
              <Send className="w-4 h-4" /> Contact Supplier / Get Best Quote
            </button>
            {product.isB2C && (
              <button
                onClick={() => alert(`Item added to cart! Proceed to checkout in Phase 3 commerce flow.`)}
                className="w-full border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition"
              >
                <ShoppingCart className="w-4 h-4 text-slate-600" /> Buy 1 Unit Online (B2C)
              </button>
            )}
            <p className="text-[11px] text-center text-slate-400">
              100% Free Inquiry. Direct supplier response with GST invoice options.
            </p>
          </div>
        </div>

        {/* Right: Supplier Business Profile Card */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Seller Information
              </span>
              <Link
                href={`/store/${product.business.slug}`}
                className="font-bold text-slate-900 text-base hover:text-emerald-700 transition"
              >
                {product.business.name}
              </Link>
              <div className="text-xs text-slate-500 capitalize mt-0.5">
                {product.business.businessType?.toLowerCase()}
              </div>
            </div>

            {/* Verification & Trust badges */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">GSTIN Status:</span>
                <span className="font-semibold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Trust Score:</span>
                <span className="font-bold text-slate-900">★ {product.business.trustScore} / 5.0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Avg. Response:</span>
                <span className="font-medium text-slate-800">{product.business.responseTimeHours} Hours</span>
              </div>
              {product.business.yearEstablished && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Established:</span>
                  <span className="font-medium text-slate-800">{product.business.yearEstablished}</span>
                </div>
              )}
            </div>

            {/* Location */}
            <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 flex items-start gap-2">
              <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-800 block">
                  {product.business.city}, {product.business.state}
                </span>
                <span className="text-slate-400 text-[11px]">India</span>
              </div>
            </div>

            {/* Storefront Link Button */}
            <Link
              href={`/store/${product.business.slug}`}
              className="block text-center border border-emerald-600 text-emerald-700 hover:bg-emerald-50 text-xs font-semibold py-2 rounded-lg transition"
            >
              Visit Seller Storefront →
            </Link>
          </div>
        </div>
      </div>

      {/* Specifications & Description */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">
            Product Specifications
          </h3>
          {product.specifications && Object.keys(product.specifications).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-xs">
              {Object.entries(product.specifications).map(([key, val]: [string, any]) => (
                <div key={key} className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">{key}</span>
                  <span className="text-slate-800 font-semibold">{String(val)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">Standard specifications apply. Inquire for customized data sheets.</p>
          )}
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-3">
            Product Overview & Description
          </h3>
          <p className="text-xs md:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {product.description || 'No additional description provided.'}
          </p>
        </div>
      </div>

      {/* Inquiry Modal */}
      {showInquiryModal && (
        <InquiryModal
          product={product}
          onClose={() => setShowInquiryModal(false)}
        />
      )}
    </div>
  );
}

