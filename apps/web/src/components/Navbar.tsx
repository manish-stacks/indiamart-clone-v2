'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  MapPin,
  Building2,
  User as UserIcon,
  PlusCircle,
  LogOut,
  ShoppingBag,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../lib/auth-context';

const INDIAN_CITIES = [
  'All India',
  'Mumbai',
  'Delhi',
  'Ahmedabad',
  'Surat',
  'Bengaluru',
  'Pune',
  'Chennai',
  'Kolkata',
  'Hyderabad',
];

export default function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('All India');
  const [userDropdown, setUserDropdown] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set('q', searchTerm.trim());
    if (selectedCity !== 'All India') params.set('city', selectedCity);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      {/* Top Banner */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Free Marketplace for Buyers & Sellers
            </span>
            <span className="hidden sm:inline text-slate-400">|</span>
            <span className="hidden sm:inline">Zero Lead Commissions • Free Direct Contact</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/categories" className="hover:text-white transition">
              All Categories
            </Link>
            <Link href="/help" className="hover:text-white transition">
              Help Center
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Logo */}
          <div className="flex items-center justify-between w-full md:w-auto">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-sm">
                IT
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  India<span className="text-emerald-600">Trade</span>
                </span>
                <span className="block text-[10px] text-slate-500 font-medium -mt-1 tracking-wider uppercase">
                  B2B + B2C Free Portal
                </span>
              </div>
            </Link>

            {/* Mobile Actions */}
            <div className="flex md:hidden items-center gap-2">
              <Link
                href="/requirements/new"
                className="text-xs bg-emerald-600 text-white px-2.5 py-1.5 rounded font-medium flex items-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5" /> Post RFQ
              </Link>
            </div>
          </div>

          {/* Search Bar & City Selector */}
          <form
            onSubmit={handleSearch}
            className="flex-1 w-full flex items-center border border-slate-300 rounded-lg overflow-hidden bg-slate-50 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500"
          >
            {/* City Dropdown */}
            <div className="relative border-r border-slate-300 bg-white">
              <div className="flex items-center px-3 py-2 text-xs text-slate-600 gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <select
                  aria-label="Filter by Indian City"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="bg-transparent outline-none cursor-pointer pr-2 font-medium"
                >
                  {INDIAN_CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Search Input */}
            <input
              type="text"
              placeholder="Search products, suppliers, machinery, chemicals, or services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm text-slate-800 bg-white outline-none"
            />

            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 text-sm font-medium flex items-center gap-1.5 transition"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Search</span>
            </button>
          </form>

          {/* Action CTAs & Account */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/requirements/new"
              className="border border-emerald-600 text-emerald-700 hover:bg-emerald-50 px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              <span>Post Requirement</span>
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdown(!userDropdown)}
                  className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg text-xs font-medium text-slate-800 transition"
                >
                  <UserIcon className="w-4 h-4 text-slate-600" />
                  <span>{user.fullName.split(' ')[0]}</span>
                </button>

                {userDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50 text-xs">
                    <div className="px-3 py-2 border-b border-slate-100 font-medium text-slate-700">
                      <div>{user.fullName}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{user.email}</div>
                    </div>
                    {user.businessMemberships && user.businessMemberships.length > 0 && (
                      <Link
                        href={`/store/${user.businessMemberships[0].businessSlug}`}
                        onClick={() => setUserDropdown(false)}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700"
                      >
                        <Building2 className="w-3.5 h-3.5 text-emerald-600" /> My Storefront
                      </Link>
                    )}
                    <Link
                      href="/dashboard/onboarding"
                      onClick={() => setUserDropdown(false)}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700"
                    >
                      <Building2 className="w-3.5 h-3.5 text-slate-500" /> Seller Business Setup
                    </Link>
                    <button
                      onClick={() => {
                        setUserDropdown(false);
                        logout();
                      }}
                      className="w-full text-left flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-slate-700 hover:text-emerald-700 px-3 py-2 text-xs font-semibold transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-lg text-xs font-semibold transition"
                >
                  Sell Free
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

