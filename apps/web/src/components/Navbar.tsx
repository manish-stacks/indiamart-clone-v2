'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchApi } from '../lib/api';
import {
  Search,
  MapPin,
  Building2,
  User as UserIcon,
  PlusCircle,
  LogOut,
  ShoppingBag,
  ShieldCheck,
  LayoutDashboard,
  Inbox,
  MessageSquare,
  ShieldAlert,
  Bell,
  Volume2,
  CheckCheck,
  Globe,
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

const NAV_DICT = {
  en: {
    placeholder: 'Search products, machinery, textiles, chemicals, or suppliers...',
    search: 'Search',
    dashboard: 'Dashboard',
    leads: 'Leads',
    chat: 'Chat',
    postRfq: 'Post RFQ',
    allIndia: 'All India',
    login: 'Sign In',
    register: 'Free Supplier Join',
    superAdmin: 'Super Admin',
  },
  hi: {
    placeholder: 'मशीनरी, कच्चा माल, कपड़ा, केमिकल या सप्लायर खोजें...',
    search: 'खोजें',
    dashboard: 'डैशबोर्ड',
    leads: 'व्यापार लीड्स',
    chat: 'सीधी चैट',
    postRfq: 'आवश्यकता भेजें (RFQ)',
    allIndia: 'अखिल भारतीय',
    login: 'लॉग इन',
    register: 'निःशुल्क सप्लायर पंजीकरण',
    superAdmin: 'सुपर एडमिन',
  },
};

export default function Navbar() {
  const router = useRouter();
  const { user, logout, isImpersonating, isTabImpersonating, exitImpersonation } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('All India');
  const [userDropdown, setUserDropdown] = useState(false);
  const [notifDropdown, setNotifDropdown] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [lang, setLang] = useState<'en' | 'hi'>('en');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('indiatrade_lang') as 'en' | 'hi';
      if (savedLang === 'hi' || savedLang === 'en') {
        setLang(savedLang);
      }
    }
  }, []);

  const toggleLanguage = () => {
    const nextLang = lang === 'en' ? 'hi' : 'en';
    setLang(nextLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('indiatrade_lang', nextLang);
    }
  };

  const t = NAV_DICT[lang];

  const playLeadChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const audioCtx = new AudioCtx();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.12); // A5

      gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.45);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.45);
    } catch (e) {
      // Audio not permitted
    }
  };

  const loadNotifications = async () => {
    if (!user) return;
    try {
      const res = await fetchApi<any>('/notifications');
      if (res.success && res.data) {
        setNotifications(res.data.notifications || []);
        setUnreadNotifCount(res.data.unreadCount || 0);
      }
    } catch (e) {
      // Ignore
    }
  };

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const isAdmin = user?.roles?.some((r) => r === 'ADMIN' || r === 'SUPER_ADMIN');
  const isSeller =
    user?.roles?.includes('SELLER') ||
    Boolean(user?.businessMemberships && user.businessMemberships.length > 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set('q', searchTerm.trim());
    if (selectedCity !== 'All India') params.set('city', selectedCity);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <>
      {/* Admin Impersonation Notice Bar */}
      {isImpersonating && (
        <div className="bg-amber-400 text-slate-950 px-4 py-2 text-xs flex items-center justify-between font-bold border-b border-amber-500 sticky top-0 z-50 shadow-md">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-slate-950 flex-shrink-0" />
            <span>
              {isTabImpersonating
                ? `👁️ New Tab Inspection Mode: Active as ${user?.fullName || user?.email} (${user?.roles?.join(', ')}). Your original admin tab remains untouched.`
                : `Admin Impersonation Mode: Active as ${user?.fullName || user?.email} (${user?.roles?.join(', ')}). All actions will be performed as this account.`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exitImpersonation()}
              className="bg-slate-950 hover:bg-slate-800 text-white text-[11px] font-bold px-3 py-1 rounded-md shadow-xs transition ml-2"
            >
              {isTabImpersonating ? 'Close / Exit Tab' : 'Exit Impersonation'}
            </button>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
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
            {isAdmin && (
              <Link
                href="/admin"
                className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
              >
                <ShieldAlert className="w-3.5 h-3.5" /> Super Admin Console
              </Link>
            )}
            <Link href="/categories" className="hover:text-white transition">
              All Categories
            </Link>
            <Link href="/requirements" className="text-yellow-400 hover:text-yellow-300 font-semibold">
              Live Buyer RFQs
            </Link>
            <Link href="/requirements/new" className="text-emerald-400 hover:text-emerald-300">
              Post RFQ
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
              {isAdmin && (
                <Link
                  href="/admin"
                  className="text-xs bg-amber-500 text-slate-900 px-2 py-1 rounded font-bold"
                >
                  Admin
                </Link>
              )}
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
              placeholder={t.placeholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm text-slate-800 bg-white outline-none"
            />

            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 text-sm font-medium flex items-center gap-1.5 transition"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">{t.search}</span>
            </button>
          </form>

          {/* Action CTAs & Account */}
          <div className="hidden md:flex items-center gap-2">
            {/* Language Switcher Pill */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 transition"
              title="Switch Language / भाषा बदलें"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>{lang === 'en' ? 'हिन्दी' : 'EN'}</span>
            </button>

            {/* Dashboard Overview button */}
            {user && (
              <Link
                href="/dashboard"
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
                title="Open Seller & Buyer Dashboard"
              >
                <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                <span>{t.dashboard}</span>
              </Link>
            )}

            {/* Seller Leads CRM button */}
            {user && (
              <Link
                href="/dashboard/leads"
                className="border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                title="View inquiries and leads received from buyers"
              >
                <Inbox className="w-4 h-4 text-emerald-600" />
                <span>{t.leads}</span>
              </Link>
            )}

            {/* Chat button */}
            {user && (
              <Link
                href="/dashboard/messages"
                className="border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                title="Chat with buyers and suppliers"
              >
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span>{t.chat}</span>
              </Link>
            )}

            <Link
              href="/requirements/new"
              className="border border-emerald-600 text-emerald-700 hover:bg-emerald-50 px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              <span>{t.postRfq}</span>
            </Link>

            {/* Notification Bell with Audio Chime */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => {
                    setNotifDropdown(!notifDropdown);
                    setUserDropdown(false);
                  }}
                  className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 transition relative"
                  title="Trade & Lead Notifications"
                >
                  <Bell className="w-4 h-4 text-slate-700" />
                  {unreadNotifCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                      {unreadNotifCount}
                    </span>
                  )}
                </button>

                {notifDropdown && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl py-2 z-50 text-xs divide-y divide-slate-100 animate-in fade-in zoom-in-95">
                    {/* Header */}
                    <div className="px-4 py-2.5 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900 text-sm">Trade Notifications</div>
                        <div className="text-[10px] text-slate-500">Live lead & RFQ stream</div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => playLeadChime()}
                          className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition flex items-center gap-1 text-[10px] font-semibold"
                          title="Test Lead Alert Chime"
                        >
                          <Volume2 className="w-3 h-3 text-emerald-600" />
                          <span>Chime</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setUnreadNotifCount(0);
                            fetchApi('/notifications/mark-all-read', { method: 'PATCH' });
                          }}
                          className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition flex items-center gap-0.5 text-[10px]"
                          title="Mark all as read"
                        >
                          <CheckCheck className="w-3 h-3 text-blue-600" />
                          <span>Clear</span>
                        </button>
                      </div>
                    </div>

                    {/* Notification Items */}
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-slate-400 text-xs">
                          No notifications yet. You will receive live alerts for incoming buyer leads.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <Link
                            key={n.id}
                            href={n.link}
                            onClick={() => setNotifDropdown(false)}
                            className={`p-3 block hover:bg-slate-50 transition ${
                              n.unread ? 'bg-amber-50/40' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                                {n.unread && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 flex-shrink-0" />
                                )}
                                <span>{n.title}</span>
                              </div>
                              <span className="text-[10px] text-slate-400 whitespace-nowrap">
                                {new Date(n.createdAt).toLocaleTimeString('en-IN', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">
                              {n.description}
                            </p>
                          </Link>
                        ))
                      )}
                    </div>

                    {/* Footer */}
                    <div className="p-2 text-center bg-slate-50">
                      <Link
                        href="/dashboard/leads"
                        onClick={() => setNotifDropdown(false)}
                        className="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold"
                      >
                        Open CRM Lead Management →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdown(!userDropdown)}
                  className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg text-xs font-medium text-slate-800 transition"
                >
                  <UserIcon className="w-4 h-4 text-slate-600" />
                  <span className="font-semibold">
                    {user.fullName
                      ? user.fullName.split(' ')[0]
                      : user.email
                      ? user.email.split('@')[0]
                      : 'Account'}
                  </span>
                </button>

                {userDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 text-xs divide-y divide-slate-100">
                    <div className="px-4 py-2.5">
                      <div className="font-bold text-slate-800">{user.fullName || user.email}</div>
                      <div className="text-[11px] text-slate-400">{user.email}</div>
                      {isAdmin && (
                        <span className="mt-1 inline-block bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px]">
                          Administrator
                        </span>
                      )}
                    </div>

                    {/* Role specific links */}
                    <div className="py-1">
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setUserDropdown(false)}
                          className="flex items-center gap-2 px-4 py-2 hover:bg-amber-50 text-amber-900 font-bold"
                        >
                          <ShieldAlert className="w-4 h-4 text-amber-600" /> Super Admin Console
                        </Link>
                      )}

                      <Link
                        href="/dashboard"
                        onClick={() => setUserDropdown(false)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-800 font-bold"
                      >
                        <LayoutDashboard className="w-4 h-4 text-emerald-600" /> Dashboard Overview
                      </Link>

                      <Link
                        href="/dashboard/products"
                        onClick={() => setUserDropdown(false)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700 font-medium"
                      >
                        <ShoppingBag className="w-4 h-4 text-emerald-600" /> Product Catalogue & Pricing
                      </Link>

                      <Link
                        href="/dashboard/leads"
                        onClick={() => setUserDropdown(false)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700 font-medium"
                      >
                        <Inbox className="w-4 h-4 text-emerald-600" /> Seller Leads CRM & Inquiries
                      </Link>

                      <Link
                        href="/dashboard/quotations"
                        onClick={() => setUserDropdown(false)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700 font-medium"
                      >
                        <ShieldCheck className="w-4 h-4 text-purple-600" /> GST Quotations & Estimates
                      </Link>

                      <Link
                        href="/dashboard/messages"
                        onClick={() => setUserDropdown(false)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700 font-medium"
                      >
                        <MessageSquare className="w-4 h-4 text-blue-600" /> Buyer-Seller Chat
                      </Link>

                      {user.businessMemberships && user.businessMemberships.length > 0 && (
                        <Link
                          href={`/store/${user.businessMemberships[0].businessSlug}`}
                          onClick={() => setUserDropdown(false)}
                          className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700 font-medium"
                        >
                          <Building2 className="w-4 h-4 text-emerald-600" /> My Public Storefront
                        </Link>
                      )}

                      <Link
                        href="/dashboard/onboarding"
                        onClick={() => setUserDropdown(false)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700 font-medium"
                      >
                        <Building2 className="w-4 h-4 text-slate-400" /> Seller Business Setup
                      </Link>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setUserDropdown(false);
                          logout();
                        }}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 font-medium"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-slate-700 hover:text-emerald-700 px-3 py-2 text-xs font-semibold transition"
                >
                  {t.login}
                </Link>
                <Link
                  href="/register"
                  className="bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-lg text-xs font-semibold transition"
                >
                  {t.register}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  </>
  );
}
