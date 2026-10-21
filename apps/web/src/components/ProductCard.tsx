'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, ShieldCheck, CheckCircle2, ChevronRight } from 'lucide-react';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    unitPrice: number;
    minOrderQuantity: number;
    unitOfMeasure: string;
    isB2B: boolean;
    isB2C: boolean;
    primaryImage?: string | null;
    category?: { name: string; slug: string };
    business: {
      name: string;
      slug: string;
      city?: string | null;
      state?: string | null;
      verificationStatus?: string;
      gstinVerified?: boolean;
    };
    priceTiers?: { minQuantity: number; price: number }[];
  };
  onContactSupplier?: (product: any) => void;
}

export default function ProductCard({ product, onContactSupplier }: ProductCardProps) {
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(product.unitPrice);

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between group">
      <div>
        {/* Product Image */}
        <Link href={`/products/${product.slug}`} className="block relative h-48 bg-slate-100 overflow-hidden">
          <img
            src={product.primaryImage || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap">
            {product.isB2B && (
              <span className="bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                B2B Bulk
              </span>
            )}
            {product.isB2C && (
              <span className="bg-blue-600/80 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                Retail / B2C
              </span>
            )}
          </div>
        </Link>

        {/* Product Details */}
        <div className="p-4">
          <Link href={`/products/${product.slug}`} className="block">
            <h3 className="font-semibold text-slate-800 text-sm line-clamp-2 hover:text-emerald-700 transition">
              {product.name}
            </h3>
          </Link>

          {/* Pricing & MOQ */}
          <div className="mt-2.5">
            <div className="text-base font-bold text-slate-900">
              {formattedPrice} <span className="text-xs font-normal text-slate-500">/ {product.unitOfMeasure}</span>
            </div>
            <div className="text-xs text-slate-600 font-medium mt-0.5">
              MOQ: <span className="text-slate-900">{product.minOrderQuantity} {product.unitOfMeasure}</span>
            </div>
            {product.priceTiers && product.priceTiers.length > 0 && (
              <div className="text-[11px] text-emerald-700 font-medium mt-1 bg-emerald-50 px-2 py-0.5 rounded w-fit">
                Bulk Tier Discounts Available
              </div>
            )}
          </div>

          {/* Supplier Info */}
          <div className="mt-3.5 pt-3 border-t border-slate-100">
            <Link
              href={`/store/${product.business.slug}`}
              className="text-xs font-medium text-slate-700 hover:text-emerald-700 flex items-center gap-1"
            >
              <span className="truncate">{product.business.name}</span>
              {product.business.gstinVerified && (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              )}
            </Link>

            {product.business.city && (
              <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>
                  {product.business.city}
                  {product.business.state ? `, ${product.business.state}` : ''}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 pt-0">
        <button
          onClick={() => (onContactSupplier ? onContactSupplier(product) : window.location.assign(`/products/${product.slug}`))}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-1 transition"
        >
          <span>Contact Supplier</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

