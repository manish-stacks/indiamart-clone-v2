import React from 'react';
import Link from 'next/link';
import { ShieldCheck, CheckCircle2, PhoneCall } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-16">
      {/* Trust & Free Marketplace Value Props */}
      <div className="border-b border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Free For Indian Businesses</h4>
              <p className="mt-1 text-slate-400">
                Sellers are never forced to purchase lead credits, subscription packages, or pay commissions for core marketplace inquiries.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">GSTIN & Profile Verification</h4>
              <p className="mt-1 text-slate-400">
                Verified Indian businesses undergo GSTIN cross-checking and profile validation to protect buyers and prevent fraudulent listings.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Direct Buyer-Seller Quotations</h4>
              <p className="mt-1 text-slate-400">
                Connect directly with manufacturers, wholesalers, and exporters across Ahmedabad, Mumbai, Surat, Delhi, Bengaluru, and Pune.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h5 className="text-white font-semibold text-sm mb-3">Top B2B Categories</h5>
          <ul className="space-y-2">
            <li>
              <Link href="/search?category=cnc-lathe-machines" className="hover:text-emerald-400 transition">
                CNC & Lathe Machines
              </Link>
            </li>
            <li>
              <Link href="/search?category=packaging-machinery" className="hover:text-emerald-400 transition">
                Packaging Machinery
              </Link>
            </li>
            <li>
              <Link href="/search?category=cotton-fabrics" className="hover:text-emerald-400 transition">
                Cotton Fabrics & Textiles
              </Link>
            </li>
            <li>
              <Link href="/search?category=industrial-yarns" className="hover:text-emerald-400 transition">
                Industrial Yarns & Threads
              </Link>
            </li>
            <li>
              <Link href="/search?category=electrical-electronics" className="hover:text-emerald-400 transition">
                Transformers & Electricals
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h5 className="text-white font-semibold text-sm mb-3">Key Indian Trade Hubs</h5>
          <ul className="space-y-2">
            <li>
              <Link href="/search?city=Ahmedabad" className="hover:text-emerald-400 transition">
                Suppliers in Ahmedabad
              </Link>
            </li>
            <li>
              <Link href="/search?city=Surat" className="hover:text-emerald-400 transition">
                Textile Manufacturers in Surat
              </Link>
            </li>
            <li>
              <Link href="/search?city=Mumbai" className="hover:text-emerald-400 transition">
                Chemical & Importers in Mumbai
              </Link>
            </li>
            <li>
              <Link href="/search?city=Delhi" className="hover:text-emerald-400 transition">
                Wholesalers in Delhi NCR
              </Link>
            </li>
            <li>
              <Link href="/search?city=Bengaluru" className="hover:text-emerald-400 transition">
                Precision Tech in Bengaluru
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h5 className="text-white font-semibold text-sm mb-3">For Buyers & Sellers</h5>
          <ul className="space-y-2">
            <li>
              <Link href="/requirements/new" className="hover:text-emerald-400 transition">
                Post Buying Requirement (RFQ)
              </Link>
            </li>
            <li>
              <Link href="/register" className="hover:text-emerald-400 transition">
                Register as Supplier
              </Link>
            </li>
            <li>
              <Link href="/dashboard/onboarding" className="hover:text-emerald-400 transition">
                Business GSTIN Onboarding
              </Link>
            </li>
            <li>
              <Link href="/help" className="hover:text-emerald-400 transition">
                Help Center & FAQs
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h5 className="text-white font-semibold text-sm mb-3">Legal & Compliance</h5>
          <ul className="space-y-2">
            <li>
              <Link href="/terms" className="hover:text-emerald-400 transition">
                Terms and Conditions
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-emerald-400 transition">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/seller-guidelines" className="hover:text-emerald-400 transition">
                Seller Guidelines
              </Link>
            </li>
            <li>
              <Link href="/return-policy" className="hover:text-emerald-400 transition">
                Return & Refund Policy
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-slate-800 py-4 px-4 text-center text-slate-500">
        <p>
          © {new Date().getFullYear()} IndiaTrade Marketplace. Demo Development Architecture. Built for Indian B2B & B2C Commerce.
        </p>
      </div>
    </footer>
  );
}

