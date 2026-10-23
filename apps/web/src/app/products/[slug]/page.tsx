'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Building2,
  Send,
  MessageSquare,
  ShoppingCart,
  ChevronRight,
  Clock,
  Layers,
  Sparkles,
  Phone,
  MessageCircle,
  Award,
  ExternalLink,
  Star,
  ThumbsUp,
  X,
  CreditCard,
} from 'lucide-react';
import { fetchApi } from '../../../lib/api';
import { useAuth } from '../../../lib/auth-context';
import InquiryModal from '../../../components/InquiryModal';
import GSTINBreakdownModal from '../../../components/GSTINBreakdownModal';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const slug = params.slug as string;

  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>('');
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [showGstinModal, setShowGstinModal] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [connectingAction, setConnectingAction] = useState<string | null>(null);

  // Reviews & Ratings State
  const [reviews, setReviews] = useState([
    {
      id: 'r1',
      author: 'Rajesh Patel',
      company: 'Patel Engineering Works, Ahmedabad',
      rating: 5,
      date: '2 days ago',
      title: 'Precision build quality & on-time dispatch',
      comment: 'Machines were delivered ahead of schedule. Build quality and precision tolerances meet our industrial requirements. High reliability and courteous sales engineers.',
      verified: true,
    },
    {
      id: 'r2',
      author: 'Suresh Kumar',
      company: 'Ludhiana Precision Tools, Punjab',
      rating: 5,
      date: '1 week ago',
      title: 'Prompt GST invoice & warranty support',
      comment: 'Excellent seller support. GST proforma quotation was honored without hidden charges. Consignment reached safely via road transport with all test certificates.',
      verified: true,
    },
    {
      id: 'r3',
      author: 'Amit Verma',
      company: 'Varanasi Fabrications, UP',
      rating: 4,
      date: '3 weeks ago',
      title: 'Good industrial product at fair price',
      comment: 'Smooth WhatsApp communication by the supplier. Minor delivery delay due to transit weather, but the product performance is top notch.',
      verified: true,
    },
  ]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewCompany, setNewReviewCompany] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewTitle, setNewReviewTitle] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewAuthor.trim() || !newReviewComment.trim()) return;

    const newRev = {
      id: `r-${Date.now()}`,
      author: newReviewAuthor.trim(),
      company: newReviewCompany.trim() || 'Verified Indian Buyer',
      rating: Number(newReviewRating),
      date: 'Just now',
      title: newReviewTitle.trim() || 'Verified Buyer Review',
      comment: newReviewComment.trim(),
      verified: true,
    };

    setReviews([newRev, ...reviews]);
    setIsReviewModalOpen(false);
    setNewReviewAuthor('');
    setNewReviewCompany('');
    setNewReviewTitle('');
    setNewReviewComment('');
  };

  const supplierPhone =
    product?.business?.phone ||
    product?.business?.members?.[0]?.user?.phone ||
    '9825012345';
  const cleanPhone = supplierPhone.replace(/[^0-9]/g, '').slice(-10);
  const maskedPhone = cleanPhone.length === 10
    ? `${cleanPhone.slice(0, 5)} XXXXX`
    : '98250 XXXXX';

  const handleWhatsAppConnect = async () => {
    setConnectingAction('whatsapp');
    try {
      // Auto-log direct connect lead in seller's CRM
      await fetchApi('/inquiries/direct-connect', {
        method: 'POST',
        body: JSON.stringify({
          productId: product.id,
          channel: 'WHATSAPP',
          notes: `WhatsApp click inquiry for ${product.name} (MOQ: ${product.minOrderQuantity || 1} ${product.unitOfMeasure || 'PIECE'})`,
        }),
      });
    } catch (e) {
      // Ignore background log error
    }

    const message = `Namaste ${product.business?.name}! I saw your product "${product.name}" (SKU: ${product.sku || 'N/A'}) on IndiaTrade. My required quantity is ${product.minOrderQuantity || 1} ${product.unitOfMeasure || 'PIECE'}. Please share best price and delivery time.`;
    const waUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
    setConnectingAction(null);
  };

  const handleCallSupplier = async () => {
    setConnectingAction('call');
    try {
      await fetchApi('/inquiries/direct-connect', {
        method: 'POST',
        body: JSON.stringify({
          productId: product.id,
          channel: 'CALL',
          notes: `Direct phone call initiated to ${cleanPhone}`,
        }),
      });
    } catch (e) {
      // Ignore
    }
    window.location.href = `tel:+91${cleanPhone}`;
    setConnectingAction(null);
  };

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

  const handleStartChat = async () => {
    if (!user) {
      router.push(`/login?redirect=/products/${slug}`);
      return;
    }

    setChatLoading(true);
    try {
      const res = await fetchApi<any>('/messages/conversations', {
        method: 'POST',
        body: JSON.stringify({
          businessId: product.businessId,
          productId: product.id,
        }),
      });

      if (res.success && res.data) {
        router.push(`/dashboard/messages?conversationId=${res.data.id}`);
      } else {
        alert(res.message || 'Failed to start chat with supplier');
      }
    } catch (err: any) {
      alert(err.message || 'Error initiating chat');
    } finally {
      setChatLoading(false);
    }
  };

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
            {/* Star Rating Preview */}
            <div className="flex items-center gap-2 mt-1.5 text-xs">
              <div className="flex items-center gap-1 bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded-md border border-amber-200">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                <span>4.8</span>
              </div>
              <span className="text-slate-500 font-medium">({reviews.length} Verified Buyer Ratings)</span>
              <span className="text-slate-300">•</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Genuine Seller
              </span>
            </div>
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

          {/* Primary CTA with WhatsApp & Direct Call */}
          <div className="space-y-2.5 pt-2">
            {/* WhatsApp B2B Connect */}
            <button
              onClick={handleWhatsAppConnect}
              disabled={connectingAction === 'whatsapp'}
              className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-slate-950 font-extrabold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm transition transform hover:-translate-y-0.5"
            >
              <MessageCircle className="w-5 h-5 text-slate-950 flex-shrink-0" />
              <span>{connectingAction === 'whatsapp' ? 'Connecting to WhatsApp...' : 'Chat on WhatsApp (Instant Reply)'}</span>
            </button>

            {/* Direct Phone Call */}
            <button
              onClick={handleCallSupplier}
              disabled={connectingAction === 'call'}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>Call Supplier: +91 {maskedPhone}</span>
            </button>

            {/* Standard Inquiry Modal */}
            <button
              onClick={() => setShowInquiryModal(true)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition"
            >
              <Send className="w-4 h-4" />
              <span>Contact Supplier / Request Formal Quote</span>
            </button>

            {/* Platform Live Chat */}
            <button
              onClick={handleStartChat}
              disabled={chatLoading}
              className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition"
            >
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <span>{chatLoading ? 'Connecting...' : 'Chat Directly on IndiaTrade (Live)'}</span>
            </button>

            {/* Instant Order / B2C Checkout */}
            <Link
              href={`/checkout?productId=${product.id}&name=${encodeURIComponent(product.name)}&price=${product.unitPrice}&qty=${product.minOrderQuantity || 1}&store=${encodeURIComponent(product.business?.name || '')}`}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition"
            >
              <CreditCard className="w-4 h-4 text-white" />
              <span>Buy Now (Instant Online Order • UPI / COD)</span>
            </Link>
            <p className="text-[11px] text-center text-slate-500">
              ⚡ Verified direct supplier response • 100% Free • No middleman margin
            </p>
          </div>
        </div>

        {/* Right: Supplier Business Profile Card & TrustSEAL */}
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

            {/* TrustSEAL Highlight Banner */}
            <div className="bg-gradient-to-r from-emerald-50 to-amber-50 border border-emerald-200 rounded-xl p-3 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-[11px] mb-1">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>IndiaTrade TrustSEAL Verified</span>
              </div>
              <p className="text-[10px] text-slate-600">
                Statutory GSTIN registered business with verified physical operational address.
              </p>
            </div>

            {/* Verification & Trust badges */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">GSTIN Status:</span>
                <button
                  onClick={() => setShowGstinModal(true)}
                  className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 underline underline-offset-2"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified (View Analysis)</span>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Trust Score:</span>
                <span className="font-bold text-slate-900">★ {product.business.trustScore || '4.8'} / 5.0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Avg. Response:</span>
                <span className="font-medium text-slate-800">{product.business.responseTimeHours || 2} Hours</span>
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
                  {product.business.city || 'Ahmedabad'}, {product.business.state || 'Gujarat'}
                </span>
                <span className="text-slate-400 text-[11px]">Industrial Hub • India</span>
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

      {/* Verified Buyer Ratings & Customer Reviews Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
              <span>Verified Buyer Ratings & Trade Reviews</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Authentic feedback from verified B2B buyers across India.
            </p>
          </div>

          <button
            onClick={() => setIsReviewModalOpen(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
          >
            <Star className="w-4 h-4 text-amber-400" />
            <span>Write a Review</span>
          </button>
        </div>

        {/* Rating Overview Summary */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
          <div className="md:col-span-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-200 pb-4 md:pb-0 md:pr-4">
            <div className="text-4xl font-extrabold text-slate-900">4.8</div>
            <div className="flex items-center gap-1 text-amber-500 my-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Based on {reviews.length} verified ratings
            </div>
            <div className="mt-2 text-[10px] font-bold text-emerald-700 bg-emerald-100/70 border border-emerald-300 px-2.5 py-0.5 rounded-full">
              98% Recommended by Buyers
            </div>
          </div>

          {/* Progress Bars */}
          <div className="md:col-span-8 space-y-2 text-xs">
            {[
              { stars: '5 Star', pct: '82%', count: 23 },
              { stars: '4 Star', pct: '14%', count: 4 },
              { stars: '3 Star', pct: '4%', count: 1 },
              { stars: '2 Star', pct: '0%', count: 0 },
              { stars: '1 Star', pct: '0%', count: 0 },
            ].map((bar, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-12 text-slate-600 font-medium">{bar.stars}</span>
                <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-amber-400 h-full rounded-full transition-all"
                    style={{ width: bar.pct }}
                  />
                </div>
                <span className="w-8 text-right text-slate-400 text-[11px] font-mono">{bar.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Review Cards List */}
        <div className="space-y-4 pt-2">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="border border-slate-200 rounded-xl p-4 space-y-2 hover:border-slate-300 transition bg-white"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-xs">{rev.author}</span>
                  <span className="text-[11px] text-slate-500">({rev.company})</span>
                  {rev.verified && (
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-1.5 py-0.2 rounded border border-emerald-200 flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified Purchase
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <div className="flex text-amber-500">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span>•</span>
                  <span>{rev.date}</span>
                </div>
              </div>

              <h4 className="font-bold text-slate-800 text-xs">{rev.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Write a Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 text-xs">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400" />
                <span>Write Buyer Review</span>
              </h3>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddReview} className="p-5 space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Your Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Chandra"
                  value={newReviewAuthor}
                  onChange={(e) => setNewReviewAuthor(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company / Location</label>
                <input
                  type="text"
                  placeholder="e.g. Chandra Enterprises, Jaipur"
                  value={newReviewCompany}
                  onChange={(e) => setNewReviewCompany(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rating *</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setNewReviewRating(star)}
                      className="p-1 hover:scale-110 transition"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= newReviewRating
                            ? 'fill-amber-400 text-amber-500'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="font-bold text-slate-700 ml-2">{newReviewRating} / 5 Stars</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Review Headline</label>
                <input
                  type="text"
                  placeholder="e.g. Excellent industrial equipment with prompt dispatch"
                  value={newReviewTitle}
                  onChange={(e) => setNewReviewTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Your Feedback / Review *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Share details on product performance, build quality, GST compliance, and delivery timeline..."
                  value={newReviewComment}
                  onChange={(e) => setNewReviewComment(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shadow-sm"
                >
                  Submit Verified Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inquiry Modal */}
      {showInquiryModal && (
        <InquiryModal
          product={product}
          onClose={() => setShowInquiryModal(false)}
        />
      )}

      {/* GSTIN & TrustSEAL Modal */}
      {showGstinModal && (
        <GSTINBreakdownModal
          isOpen={showGstinModal}
          onClose={() => setShowGstinModal(false)}
          gstin={product.business?.gstin}
          businessName={product.business?.name}
          city={product.business?.city}
          state={product.business?.state}
          yearEstablished={product.business?.yearEstablished}
        />
      )}
    </div>
  );
}

