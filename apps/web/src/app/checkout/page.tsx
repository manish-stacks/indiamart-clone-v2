'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  Truck,
  CreditCard,
  QrCode,
  MapPin,
  Building2,
  FileText,
  Printer,
  Sparkles,
  AlertCircle,
  Clock,
  Check,
} from 'lucide-react';
import { useAuth } from '../../lib/auth-context';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const productId = searchParams.get('productId') || '';
  const initialName = searchParams.get('name') || 'Industrial CNC Lathe Machine';
  const initialPrice = Number(searchParams.get('price')) || 250000;
  const initialQty = Number(searchParams.get('qty')) || 1;
  const supplierName = searchParams.get('store') || 'Apex Machinery & Automation Ltd';

  const [qty, setQty] = useState(initialQty);
  const [unitPrice, setUnitPrice] = useState(initialPrice);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'COD'>('UPI');

  // Address fields
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '9876543210');
  const [pincode, setPincode] = useState('380001');
  const [city, setCity] = useState('Ahmedabad');
  const [stateName, setStateName] = useState('Gujarat');
  const [addressLine, setAddressLine] = useState('Plot 42, GIDC Phase II, Vatva Industrial Zone');

  // Checkout submission states
  const [processing, setProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [orderDate, setOrderDate] = useState('');

  // Calculations
  const subtotal = qty * unitPrice;
  const gstRate = 18;
  const gstAmount = Math.round((subtotal * gstRate) / 100);
  const cgst = Math.round(gstAmount / 2);
  const sgst = Math.round(gstAmount / 2);
  const grandTotal = subtotal + gstAmount;

  // Auto-fill city/state based on pincode demo
  useEffect(() => {
    if (pincode.startsWith('38')) {
      setCity('Ahmedabad');
      setStateName('Gujarat');
    } else if (pincode.startsWith('39')) {
      setCity('Surat');
      setStateName('Gujarat');
    } else if (pincode.startsWith('11')) {
      setCity('New Delhi');
      setStateName('Delhi');
    } else if (pincode.startsWith('40')) {
      setCity('Mumbai');
      setStateName('Maharashtra');
    } else if (pincode.startsWith('56')) {
      setCity('Bengaluru');
      setStateName('Karnataka');
    }
  }, [pincode]);

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    setTimeout(() => {
      const generatedOrderId = `ORD-${Date.now().toString().slice(-6)}`;
      setOrderId(generatedOrderId);
      setOrderDate(new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }));
      setProcessing(false);
      setOrderComplete(true);
    }, 1200);
  };

  const handlePrintTaxInvoice = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>GST Tax Invoice - ${orderId}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #0f172a; line-height: 1.5; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #059669; padding-bottom: 16px; }
            .title { font-size: 22px; font-weight: bold; color: #047857; }
            .inv-badge { background: #ecfdf5; color: #047857; padding: 4px 10px; border-radius: 4px; font-weight: bold; font-size: 11px; border: 1px solid #10b981; }
            table { width: 100%; border-collapse: collapse; margin-top: 24px; font-size: 13px; }
            th { background: #f8fafc; border: 1px solid #cbd5e1; padding: 10px; text-align: left; }
            td { border: 1px solid #cbd5e1; padding: 10px; }
            .totals { margin-top: 20px; width: 340px; margin-left: auto; font-size: 13px; }
            .totals td { padding: 6px 12px; }
            .bold { font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">IndiaTrade B2B Portal</div>
              <div style="font-size: 12px; color: #64748b;">Original Tax Invoice (Triplicate for Buyer)</div>
              <div style="font-size: 12px; color: #64748b; margin-top: 4px;"><strong>Supplier:</strong> ${supplierName}</div>
            </div>
            <div style="text-align: right;">
              <span class="inv-badge">TAX INVOICE</span>
              <div style="font-size: 14px; font-weight: bold; margin-top: 6px;">Invoice No: ${orderId}</div>
              <div style="font-size: 12px; color: #64748b;">Date: ${orderDate}</div>
            </div>
          </div>

          <div style="margin-top: 20px; font-size: 12px; display: flex; justify-content: space-between;">
            <div>
              <strong>Billed & Shipped To:</strong><br />
              ${fullName}<br />
              ${addressLine}<br />
              ${city}, ${stateName} - ${pincode}<br />
              Phone: +91 ${phone}
            </div>
            <div style="text-align: right;">
              <strong>Payment Status:</strong> Paid via ${paymentMethod}<br />
              <strong>Place of Supply:</strong> ${stateName} (Inter-State / Intra-State GST)<br />
              <strong>Logistics Mode:</strong> Surface Express Road Cargo
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Rate (₹)</th>
                <th>Taxable Value (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>${initialName}</strong><br /><span style="font-size: 11px; color: #64748b;">HSN: 84581100 • 1 Year Warranty Included</span></td>
                <td>${qty}</td>
                <td>₹${unitPrice.toLocaleString('en-IN')}</td>
                <td>₹${subtotal.toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>

          <table class="totals">
            <tr>
              <td>Taxable Subtotal:</td>
              <td class="bold">₹${subtotal.toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td>CGST (9%):</td>
              <td>₹${cgst.toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td>SGST (9%):</td>
              <td>₹${sgst.toLocaleString('en-IN')}</td>
            </tr>
            <tr style="background: #f1f5f9; font-size: 14px;">
              <td class="bold">Total Amount Paid:</td>
              <td class="bold" style="color: #047857;">₹${grandTotal.toLocaleString('en-IN')}</td>
            </tr>
          </table>

          <div style="margin-top: 35px; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 11px; color: #64748b; text-align: center;">
            Thank you for buying through IndiaTrade. 100% genuine guaranteed with commercial proforma reconciliation.
          </div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (orderComplete) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="bg-emerald-50 text-emerald-700 font-bold text-xs px-3 py-1 rounded-full border border-emerald-200">
              Order Confirmed & Paid
            </span>
            <h1 className="text-2xl font-bold text-slate-900">Thank You for Your Order!</h1>
            <p className="text-xs text-slate-500">
              Your order <span className="font-bold text-slate-800 font-mono">{orderId}</span> has been dispatched to{' '}
              <span className="font-semibold text-slate-800">{supplierName}</span> for immediate fulfilment.
            </p>
          </div>

          {/* Order Details Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs space-y-2.5">
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Order Reference:</span>
              <span className="font-mono font-bold text-slate-900">{orderId}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Item:</span>
              <span className="font-semibold text-slate-900">{initialName} (×{qty})</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Delivery Address:</span>
              <span className="font-medium text-slate-800 text-right max-w-xs">{addressLine}, {city}, {stateName} - {pincode}</span>
            </div>
            <div className="flex justify-between font-bold text-sm text-slate-900 pt-1">
              <span>Total Paid (Incl. 18% GST):</span>
              <span className="text-emerald-700 font-extrabold">₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handlePrintTaxInvoice}
              className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Download & Print GST Tax Invoice</span>
            </button>
            <Link
              href="/dashboard/inquiries"
              className="w-full sm:w-auto border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs px-5 py-2.5 rounded-xl transition text-center"
            >
              View Inquiries & Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            href={`/products/${productId || 'automatic-cnc-lathe-machine'}`}
            className="text-xs text-slate-500 hover:text-emerald-700 flex items-center gap-1 mb-2 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Product Listing
          </Link>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Truck className="w-6 h-6 text-emerald-600" />
            <span>Secure Marketplace Checkout</span>
          </h1>
          <p className="text-xs text-slate-500">
            IndiaTrade B2B + B2C direct buyer order placement with commercial GST invoice.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>IndiaTrade Safe Trade Buyer Guarantee</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form & Payment */}
        <form onSubmit={handlePlaceOrder} className="lg:col-span-7 space-y-6 text-xs">
          {/* Shipping Address Section */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>1. Delivery & Billing Address</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Buyer / Consignee Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Patel"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mobile Number (for SMS & Dispatch) *</label>
                <div className="flex">
                  <span className="bg-slate-100 border border-r-0 border-slate-300 rounded-l-lg px-2.5 py-2 text-slate-500 font-semibold">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="9876543210"
                    className="w-full px-3 py-2 border border-slate-300 rounded-r-lg text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Factory / Workshop / Street Address *</label>
              <input
                type="text"
                required
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
                placeholder="Plot / Shed Number, Industrial Area, Landmark"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">PIN Code *</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="380001"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">City / Industrial Cluster</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">State</label>
                <input
                  type="text"
                  required
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Section */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>2. Select Indian Payment Option</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('UPI')}
                className={`p-4 rounded-xl border text-left transition flex items-start gap-3 ${
                  paymentMethod === 'UPI'
                    ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">Instant UPI Payment</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">PhonePe, Google Pay, Paytm, BHIM QR</div>
                  <div className="text-[10px] text-emerald-700 font-semibold mt-1">Zero transaction fee • Instant dispatch</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('COD')}
                className={`p-4 rounded-xl border text-left transition flex items-start gap-3 ${
                  paymentMethod === 'COD'
                    ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">Cash on Delivery (COD)</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Pay balance upon delivery of consignment</div>
                  <div className="text-[10px] text-slate-400 mt-1">Available for verified Indian PIN codes</div>
                </div>
              </button>
            </div>

            {/* UPI QR Showcase */}
            {paymentMethod === 'UPI' && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4">
                <div className="w-28 h-28 bg-white border border-slate-300 rounded-xl p-2 flex flex-col items-center justify-center shadow-xs flex-shrink-0">
                  <QrCode className="w-20 h-20 text-slate-800" />
                  <span className="text-[8px] font-mono text-slate-400 mt-0.5">BHIM UPI QR</span>
                </div>
                <div className="space-y-1.5 text-center sm:text-left">
                  <div className="font-bold text-slate-900">Scan QR Code from any UPI App</div>
                  <div className="text-slate-600 text-[11px]">
                    UPI ID: <span className="font-mono font-bold text-emerald-800 bg-emerald-100/60 px-1.5 py-0.5 rounded">indiatrade.escrow@icici</span>
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center justify-center sm:justify-start gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Dynamic session valid for 10:00 mins</span>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={processing}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm transition transform hover:-translate-y-0.5"
            >
              <Check className="w-5 h-5" />
              <span>{processing ? 'Processing Payment & Generating Invoice...' : `Confirm Order & Pay ₹${grandTotal.toLocaleString('en-IN')}`}</span>
            </button>
          </div>
        </form>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 text-xs">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>Order Summary</span>
              <span className="text-xs text-slate-500 font-normal">1 Item</span>
            </h2>

            {/* Product Item Card */}
            <div className="flex items-start gap-3 border-b border-slate-100 pb-4">
              <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 font-bold flex-shrink-0">
                IT
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-slate-900 text-xs truncate">{initialName}</div>
                <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{supplierName}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-slate-500">Qty:</span>
                  <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setQty((prev) => Math.max(1, prev - 1))}
                      className="px-2 py-0.5 hover:bg-slate-100 font-bold"
                    >
                      -
                    </button>
                    <span className="px-2.5 py-0.5 font-bold font-mono">{qty}</span>
                    <button
                      type="button"
                      onClick={() => setQty((prev) => prev + 1)}
                      className="px-2 py-0.5 hover:bg-slate-100 font-bold"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-emerald-700 font-bold font-mono ml-auto">
                    ₹{(qty * unitPrice).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2 pt-1 text-slate-600">
              <div className="flex justify-between">
                <span>Taxable Amount:</span>
                <span className="font-medium text-slate-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>CGST (9%):</span>
                <span>+₹{cgst.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>SGST (9%):</span>
                <span>+₹{sgst.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Logistics / Freight:</span>
                <span className="uppercase text-[10px] bg-emerald-100 px-1.5 py-0.5 rounded">FREE (Pan-India)</span>
              </div>
              <div className="flex justify-between font-extrabold text-base text-slate-900 pt-3 border-t border-slate-200">
                <span>Total Payable:</span>
                <span className="text-emerald-700">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Indian Trade Guarantees */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 space-y-1.5 text-[11px] text-emerald-900">
              <div className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>GST Tax Invoice Included</span>
              </div>
              <p className="text-emerald-800 text-[10px] leading-relaxed">
                Eligible for 18% Input Tax Credit (ITC) claiming under Indian GST Act.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto px-4 py-16 text-center text-xs text-slate-500">
          Loading checkout session...
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}

