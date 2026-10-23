'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Boxes,
  Inbox,
  Send,
  FileText,
  MessageSquare,
  Building2,
  ShieldAlert,
  ShieldCheck,
  ExternalLink,
  PlusCircle,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Store,
} from 'lucide-react';
import { useAuth } from '../../lib/auth-context';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout, isImpersonating, isTabImpersonating, exitImpersonation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = user?.roles?.some((r) => r === 'ADMIN' || r === 'SUPER_ADMIN');
  const primaryBusiness = user?.businessMemberships?.[0];

  const navItems = [
    {
      label: 'Overview',
      href: '/dashboard',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: 'Catalogue & Products',
      href: '/dashboard/products',
      icon: Boxes,
      badge: 'Seller',
    },
    {
      label: 'Seller Leads CRM',
      href: '/dashboard/leads',
      icon: Inbox,
      badge: 'Leads',
    },
    {
      label: 'My Sent Inquiries',
      href: '/dashboard/inquiries',
      icon: Send,
      badge: 'Buyer',
    },
    {
      label: 'Quotations & Invoices',
      href: '/dashboard/quotations',
      icon: FileText,
      badge: 'GST',
    },
    {
      label: 'Buyer-Seller Chat',
      href: '/dashboard/messages',
      icon: MessageSquare,
      badge: 'Live',
    },
    {
      label: 'Business Profile',
      href: '/dashboard/onboarding',
      icon: Building2,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-md w-full text-center">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Store className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Sign in to Access Dashboard</h2>
          <p className="text-xs text-slate-500 mb-6">
            Manage your IndiaTrade product catalogue, respond to buyer leads, and create quotations.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/login"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-xs font-semibold shadow-sm transition"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-lg text-xs font-semibold transition"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Mobile Header Bar */}
      <div className="md:hidden bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-emerald-600 flex items-center justify-center font-bold text-xs text-white">
            IT
          </div>
          <span className="font-bold text-sm tracking-tight">IndiaTrade Hub</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col justify-between transition-transform transform md:translate-x-0 md:static md:inset-auto ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Business Info Header */}
          <div className="p-4 border-b border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  IT
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-sm text-white tracking-tight">IndiaTrade</span>
                  <span className="text-[10px] text-emerald-400 font-medium tracking-wide uppercase">
                    Seller & Buyer Hub
                  </span>
                </div>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="md:hidden text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Active Business Badge or Super Admin Badge */}
            {isAdmin ? (
              <div className="bg-gradient-to-r from-amber-950/70 to-slate-800 rounded-xl p-3 border border-amber-500/40">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                    <span>Super Admin Console</span>
                  </div>
                  <span className="text-[9px] bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded font-extrabold uppercase">
                    Admin
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 mt-1">
                  Full Platform Moderation & Management
                </div>
                <div className="mt-2.5 pt-2 border-t border-slate-700/60 grid grid-cols-2 gap-1.5 text-center text-[10px] font-semibold">
                  <Link
                    href="/admin?tab=sellers"
                    className="bg-slate-800/80 hover:bg-amber-600 hover:text-white text-slate-200 py-1 px-1.5 rounded transition"
                  >
                    🏢 Sellers
                  </Link>
                  <Link
                    href="/admin?tab=buyers"
                    className="bg-slate-800/80 hover:bg-blue-600 hover:text-white text-slate-200 py-1 px-1.5 rounded transition"
                  >
                    👥 Buyers
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60">
                <div className="text-xs font-semibold text-white truncate">
                  {primaryBusiness?.businessName || 'Business Workspace'}
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  {primaryBusiness?.verificationStatus === 'VERIFIED' ? (
                    <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded font-medium border border-emerald-800">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" /> GST Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] bg-amber-950 text-amber-300 px-1.5 py-0.5 rounded font-medium border border-amber-800">
                      Pending Verification
                    </span>
                  )}
                  {primaryBusiness?.businessSlug && (
                    <Link
                      href={`/store/${primaryBusiness.businessSlug}`}
                      target="_blank"
                      className="text-[10px] text-slate-400 hover:text-white flex items-center gap-0.5 ml-auto"
                      title="View public storefront"
                    >
                      <span>Store</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Nav Items */}
          <nav className="p-3 space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Core Management
            </div>

            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname?.startsWith(item.href);

              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                        isActive
                          ? 'bg-emerald-700 text-emerald-100'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* Super Admin Console Shortcut */}
            {isAdmin && (
              <div className="pt-2">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-400/80">
                  Platform Admin
                </div>
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold bg-amber-950/40 text-amber-300 border border-amber-800/50 hover:bg-amber-900/40 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    <span>Super Admin</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-amber-400/70" />
                </Link>
              </div>
            )}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="p-3 border-t border-slate-800">
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <div className="truncate mr-2">
              <div className="text-xs font-semibold text-white truncate">
                {user.fullName || user.email}
              </div>
              <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
            </div>
            <button
              onClick={() => logout()}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-700 rounded-md transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 px-1">
            <Link href="/" className="hover:text-slate-300 transition">
              Marketplace Home
            </Link>
            <span>•</span>
            <Link href="/requirements/new" className="text-emerald-400 hover:text-emerald-300">
              Post RFQ
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto min-h-screen">
        {children}
      </main>
    </div>
  );
}

