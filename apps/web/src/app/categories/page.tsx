'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Cpu, Shirt, Zap, Layers, ChevronRight, Boxes } from 'lucide-react';
import { fetchApi } from '../../lib/api';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      setLoading(true);
      const res = await fetchApi('/categories');
      if (res.success && res.data) {
        setCategories(res.data);
      }
      setLoading(false);
    }
    loadCategories();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
          <Link href="/" className="hover:text-emerald-700">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="font-semibold text-slate-800">All Categories</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          Browse All Marketplace Categories & Industry Sectors
        </h1>
        <p className="text-xs md:text-sm text-slate-500 mt-1">
          Explore complete product hierarchies across Indian manufacturing, agriculture, chemicals, and consumer sectors.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl h-48 animate-pulse p-6"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg">
                    <Boxes className="w-6 h-6" />
                  </div>
                  <div>
                    <Link
                      href={`/search?category=${cat.slug}`}
                      className="text-base font-bold text-slate-900 hover:text-emerald-700 transition"
                    >
                      {cat.name}
                    </Link>
                    <div className="text-xs text-slate-400">{cat.productCount || 0} Products</div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mb-4">{cat.description}</p>

                {cat.children && cat.children.length > 0 && (
                  <div className="space-y-2 border-t border-slate-100 pt-3">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Subcategories</div>
                    <ul className="space-y-1.5 text-xs">
                      {cat.children.map((sub: any) => (
                        <li key={sub.id}>
                          <Link
                            href={`/search?category=${sub.slug}`}
                            className="text-slate-700 hover:text-emerald-700 flex items-center justify-between group"
                          >
                            <span className="group-hover:translate-x-1 transition-transform">{sub.name}</span>
                            <span className="text-[11px] text-slate-400">{sub.productCount || 0}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <Link
                  href={`/search?category=${cat.slug}`}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                >
                  Explore {cat.name} <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

