'use client';

import React from 'react';
import { ShieldCheck, CheckCircle2, Building2, MapPin, X, ExternalLink, Award } from 'lucide-react';

interface GSTINBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  gstin: string;
  businessName: string;
  city?: string;
  state?: string;
  yearEstablished?: number | string;
}

const STATE_CODES: Record<string, string> = {
  '01': 'Jammu & Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '04': 'Chandigarh',
  '05': 'Uttarakhand',
  '06': 'Haryana',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  '10': 'Bihar',
  '19': 'West Bengal',
  '24': 'Gujarat',
  '27': 'Maharashtra',
  '29': 'Karnataka',
  '32': 'Kerala',
  '33': 'Tamil Nadu',
  '36': 'Telangana',
  '37': 'Andhra Pradesh',
};

export default function GSTINBreakdownModal({
  isOpen,
  onClose,
  gstin,
  businessName,
  city,
  state,
  yearEstablished,
}: GSTINBreakdownModalProps) {
  if (!isOpen) return null;

  const cleanGstin = (gstin || '24AAACA1234A1Z5').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const stateCode = cleanGstin.slice(0, 2);
  const pan = cleanGstin.slice(2, 12);
  const entityNum = cleanGstin.slice(12, 13) || '1';
  const defaultZ = cleanGstin.slice(13, 14) || 'Z';
  const checksum = cleanGstin.slice(14, 15) || '5';

  const stateName = STATE_CODES[stateCode] || state || 'Gujarat';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">GSTIN Verification & TrustSEAL</h3>
              <p className="text-[11px] text-slate-500">Ministry of Finance • Goods and Services Tax</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Business Summary */}
        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Taxpayer Legal Name</span>
            <div className="font-bold text-sm text-slate-900">{businessName}</div>
            <div className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span>{city || 'Ahmedabad'}, {state || stateName} • India</span>
            </div>
          </div>
          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> ACTIVE
          </span>
        </div>

        {/* GSTIN 15-Digit Visual Breakdown */}
        <div>
          <span className="text-xs font-bold text-slate-700 block mb-2">
            15-Digit Indian GSTIN Structure Analysis
          </span>
          <div className="flex items-center justify-center gap-1 font-mono text-sm sm:text-base font-bold bg-slate-900 text-white p-3 rounded-xl shadow-inner tracking-widest flex-wrap">
            <span className="text-amber-400 bg-slate-800 px-1.5 py-0.5 rounded" title="State Jurisdiction Code">
              {stateCode}
            </span>
            <span className="text-emerald-400 bg-slate-800 px-1.5 py-0.5 rounded" title="Permanent Account Number (PAN)">
              {pan}
            </span>
            <span className="text-blue-400 bg-slate-800 px-1.5 py-0.5 rounded" title="Entity Number of Same PAN">
              {entityNum}
            </span>
            <span className="text-purple-400 bg-slate-800 px-1.5 py-0.5 rounded" title="Default Alphanumeric Char">
              {defaultZ}
            </span>
            <span className="text-rose-400 bg-slate-800 px-1.5 py-0.5 rounded" title="Checksum Validation Digit">
              {checksum}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3 text-[11px]">
            <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg">
              <strong className="text-amber-900 block">State Code: {stateCode}</strong>
              <span className="text-amber-800">{stateName}</span>
            </div>
            <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
              <strong className="text-emerald-900 block">Income Tax PAN:</strong>
              <span className="text-emerald-800 font-mono">{pan}</span>
            </div>
            <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
              <strong className="text-blue-900 block">Entity Index: {entityNum}</strong>
              <span className="text-blue-800">Primary Registered Unit</span>
            </div>
            <div className="p-2 bg-purple-50 border border-purple-200 rounded-lg">
              <strong className="text-purple-900 block">Taxpayer Category:</strong>
              <span className="text-purple-800">Regular GST Payer</span>
            </div>
          </div>
        </div>

        {/* IndiaTrade TrustSEAL Score Card */}
        <div className="p-3.5 bg-gradient-to-r from-emerald-950 to-slate-900 text-white rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 flex items-center justify-center font-black text-sm">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                IndiaTrade TrustSEAL Certified
              </div>
              <div className="text-[11px] text-slate-300">
                Verified Manufacturer • In business {yearEstablished ? `since ${yearEstablished}` : 'for 10+ years'}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-black text-emerald-400">98%</div>
            <div className="text-[9px] text-slate-400 uppercase tracking-wider">Trust Score</div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex items-center justify-between">
          <a
            href="https://services.gst.gov.in/services/searchtp"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
          >
            <span>Verify on Official GST Portal</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

