'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  MessageSquare,
  Send,
  Building2,
  User,
  Boxes,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Sparkles,
  FileText,
  Printer,
  CheckCheck,
  X,
  BadgeIndianRupee,
  Calendar,
  Truck,
} from 'lucide-react';
import { useAuth } from '../../../lib/auth-context';
import { fetchApi } from '../../../lib/api';

const QUICK_REPLIES = [
  'Can you share your latest product catalogue / brochure?',
  'What is your best bulk price including 18% GST?',
  'Is delivery available to my location?',
  'Can you supply a sample unit before placing bulk order?',
  'What are your payment terms and advance requirements?',
];

function MessagesChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlConvId = searchParams.get('conversationId');
  const { user, loading: authLoading } = useAuth();

  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversation, setActiveConversation] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Quote Generation Modal state
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quoteItemName, setQuoteItemName] = useState('');
  const [quoteQty, setQuoteQty] = useState<number>(10);
  const [quoteUnit, setQuoteUnit] = useState('PIECE');
  const [quoteUnitPrice, setQuoteUnitPrice] = useState<number>(1000);
  const [quoteGstRate, setQuoteGstRate] = useState<number>(18);
  const [quoteDeliveryTimeline, setQuoteDeliveryTimeline] = useState('3-5 Business Days');
  const [quotePaymentTerms, setQuotePaymentTerms] = useState('50% Advance, 50% on Dispatch');
  const [quoteNotes, setQuoteNotes] = useState('Ex-Factory price. Freight charged at actuals.');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadConversations = async () => {
    const res = await fetchApi<any[]>('/messages/conversations');
    if (res.success && Array.isArray(res.data)) {
      setConversations(res.data);
      if (urlConvId) {
        const found = res.data.find((c: any) => c.id === urlConvId);
        if (found) {
          setActiveConversation(found);
        } else if (res.data.length > 0 && !activeConversation) {
          setActiveConversation(res.data[0]);
        }
      } else if (!activeConversation && res.data.length > 0) {
        setActiveConversation(res.data[0]);
      }
    }
    setLoading(false);
  };

  const loadMessages = async (convId: string) => {
    const res = await fetchApi(`/messages/${convId}`);
    if (res.success && res.data) {
      setMessages(res.data);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      loadConversations();
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation.id);
      if (activeConversation.product) {
        setQuoteItemName(activeConversation.product.name);
        setQuoteUnitPrice(Number(activeConversation.product.unitPrice || 1000));
        setQuoteUnit(activeConversation.product.unitOfMeasure || 'PIECE');
        setQuoteQty(Number(activeConversation.product.minOrderQuantity || 10));
      }
      const interval = setInterval(() => {
        loadMessages(activeConversation.id);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [activeConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const content = textToSend || messageInput;
    if (!content.trim() || !activeConversation) return;

    setSending(true);
    const res = await fetchApi(`/messages/${activeConversation.id}`, {
      method: 'POST',
      body: JSON.stringify({ content: content.trim() }),
    });

    if (res.success && res.data) {
      setMessages((prev) => [...prev, res.data]);
      setMessageInput('');
      loadConversations();
    }
    setSending(false);
  };

  const handleSendOfficialQuote = async () => {
    if (!quoteItemName.trim() || !activeConversation) return;

    const subtotal = Number(quoteQty) * Number(quoteUnitPrice);
    const gstAmount = Math.round((subtotal * quoteGstRate) / 100);
    const total = subtotal + gstAmount;

    const quotePayload = {
      type: 'PROFORMA_QUOTATION',
      quoteNumber: `QT-${Date.now().toString().slice(-6)}`,
      itemName: quoteItemName.trim(),
      quantity: Number(quoteQty),
      unit: quoteUnit,
      unitPrice: Number(quoteUnitPrice),
      gstRate: quoteGstRate,
      subtotal,
      cgst: gstAmount / 2,
      sgst: gstAmount / 2,
      total,
      deliveryTimeline: quoteDeliveryTimeline,
      paymentTerms: quotePaymentTerms,
      notes: quoteNotes,
      createdAt: new Date().toISOString(),
    };

    const quoteMessage = `[QUOTATION_PROFORMA]${JSON.stringify(quotePayload)}`;
    await handleSendMessage(quoteMessage);
    setIsQuoteModalOpen(false);
  };

  const handleAcceptQuote = (quoteData: any) => {
    handleSendMessage(`✅ QUOTATION ACCEPTED: We accept quotation ${quoteData.quoteNumber} for ₹${quoteData.total.toLocaleString('en-IN')}. Please share bank details & proforma invoice.`);
  };

  const handlePrintQuote = (quoteData: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>IndiaTrade GST Proforma Quotation - ${quoteData.quoteNumber}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1e293b; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #059669; padding-bottom: 20px; }
            .badge { background: #ecfdf5; color: #047857; font-weight: bold; padding: 4px 10px; border-radius: 4px; border: 1px solid #10b981; }
            table { width: 100%; border-collapse: collapse; margin-top: 24px; font-size: 13px; }
            th { background: #f8fafc; border: 1px solid #cbd5e1; padding: 10px; text-align: left; }
            td { border: 1px solid #cbd5e1; padding: 10px; }
            .totals { margin-top: 20px; width: 350px; margin-left: auto; }
            .totals td { padding: 8px 12px; }
            .bold { font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 style="color: #047857; margin: 0; font-size: 24px;">IndiaTrade B2B Portal</h1>
              <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Commercial Proforma Quotation</div>
            </div>
            <div style="text-align: right;">
              <span class="badge">GST COMMERCIAL PROFORMA</span>
              <div style="font-size: 14px; font-weight: bold; margin-top: 8px;">Ref: ${quoteData.quoteNumber}</div>
              <div style="font-size: 12px; color: #64748b;">Date: ${new Date(quoteData.createdAt).toLocaleDateString('en-IN')}</div>
            </div>
          </div>

          <div style="margin-top: 24px; font-size: 13px; line-height: 1.6;">
            <div><strong>Product / Scope:</strong> ${quoteData.itemName}</div>
            <div><strong>Delivery Timeline:</strong> ${quoteData.deliveryTimeline}</div>
            <div><strong>Payment Terms:</strong> ${quoteData.paymentTerms}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item Description</th>
                <th>Qty</th>
                <th>Unit</th>
                <th>Rate (₹)</th>
                <th>Subtotal (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>${quoteData.itemName}</strong></td>
                <td>${quoteData.quantity}</td>
                <td>${quoteData.unit}</td>
                <td>₹${Number(quoteData.unitPrice).toLocaleString('en-IN')}</td>
                <td>₹${Number(quoteData.subtotal).toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>

          <table class="totals">
            <tr>
              <td>Subtotal:</td>
              <td class="bold">₹${Number(quoteData.subtotal).toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td>CGST (${quoteData.gstRate / 2}%):</td>
              <td>₹${Number(quoteData.cgst).toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td>SGST (${quoteData.gstRate / 2}%):</td>
              <td>₹${Number(quoteData.sgst).toLocaleString('en-IN')}</td>
            </tr>
            <tr style="background: #f1f5f9; font-size: 15px;">
              <td class="bold">Grand Total (Incl. GST):</td>
              <td class="bold" style="color: #047857;">₹${Number(quoteData.total).toLocaleString('en-IN')}</td>
            </tr>
          </table>

          <div style="margin-top: 40px; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 10px;">
            This is a computer-generated commercial proforma quotation generated via IndiaTrade Free B2B Marketplace. No signature required.
          </div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-xs text-slate-500">
        Loading buyer-seller messages...
      </div>
    );
  }

  const isMeBuyer = activeConversation?.buyerId === user?.id;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Title */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-600" /> Buyer-Seller Direct Trade Chat
          </h1>
          <p className="text-xs text-slate-500">
            IndiaMART-style real-time commercial negotiation, live GST proforma quotations, and instant supplier messaging.
          </p>
        </div>
        {activeConversation && !isMeBuyer && (
          <button
            onClick={() => setIsQuoteModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm self-start sm:self-auto"
          >
            <FileText className="w-4 h-4" />
            <span>Generate GST Quotation</span>
          </button>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 h-[680px]">
        {/* Left Column: Conversations List */}
        <div className="md:col-span-4 border-r border-slate-200 flex flex-col h-full bg-slate-50/50">
          <div className="p-3.5 border-b border-slate-200 font-bold text-xs text-slate-800 flex items-center justify-between">
            <span>Inquiries & Chats</span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
              {conversations.length} Active
            </span>
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No active conversations yet. Conversations start automatically when an inquiry is initiated on any product listing.
              </div>
            ) : (
              conversations.map((conv) => {
                const isSelected = activeConversation?.id === conv.id;
                const isUserBuyer = conv.buyerId === user?.id;
                const counterpartName = isUserBuyer
                  ? conv.business?.name
                  : conv.buyer?.fullName || conv.buyer?.email;
                const lastMsg = conv.messages?.[0];

                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConversation(conv)}
                    className={`w-full text-left p-3.5 transition flex items-start gap-3 ${
                      isSelected ? 'bg-white border-l-4 border-l-emerald-600 shadow-sm' : 'hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 flex-shrink-0 text-xs shadow-xs">
                      {counterpartName ? counterpartName.charAt(0).toUpperCase() : 'C'}
                    </div>

                    <div className="flex-1 min-w-0 text-xs">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-slate-900 truncate">{counterpartName}</span>
                        {lastMsg && (
                          <span className="text-[10px] text-slate-400 flex-shrink-0">
                            {new Date(lastMsg.createdAt).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        )}
                      </div>

                      {conv.product && (
                        <div className="text-[11px] text-emerald-700 font-semibold truncate mt-0.5">
                          {conv.product.name}
                        </div>
                      )}

                      <div className="text-slate-500 truncate mt-1 text-[11px]">
                        {lastMsg
                          ? lastMsg.content?.startsWith('[QUOTATION_PROFORMA]')
                            ? '📄 Commercial Proforma Quotation'
                            : lastMsg.content
                          : 'No messages yet'}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Chat Window */}
        <div className="md:col-span-8 flex flex-col h-full bg-slate-50/20">
          {activeConversation ? (
            <>
              {/* Chat Header with Product Details */}
              <div className="p-3.5 border-b border-slate-200 bg-white flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {activeConversation.buyerId === user?.id
                      ? activeConversation.business?.name?.charAt(0)
                      : activeConversation.buyer?.fullName?.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm truncate">
                        {activeConversation.buyerId === user?.id
                          ? activeConversation.business?.name
                          : activeConversation.buyer?.fullName || activeConversation.buyer?.email}
                      </span>
                      <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Verified Trade
                      </span>
                    </div>
                    {activeConversation.product && (
                      <div className="text-[11px] text-slate-500 truncate">
                        Product Context:{' '}
                        <span className="font-semibold text-slate-800">
                          {activeConversation.product.name}
                        </span>{' '}
                        (₹{Number(activeConversation.product.unitPrice).toLocaleString('en-IN')})
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {!isMeBuyer && (
                    <button
                      onClick={() => setIsQuoteModalOpen(true)}
                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-semibold px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Send Quote</span>
                    </button>
                  )}
                  {activeConversation.product && (
                    <Link
                      href={`/products/${activeConversation.product.slug}`}
                      className="border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                    >
                      View Listing
                    </Link>
                  )}
                </div>
              </div>

              {/* Message Thread */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-xs text-slate-400">
                    <MessageSquare className="w-10 h-10 text-slate-300 mb-2" />
                    <div>Start direct negotiation with this supplier/buyer.</div>
                    <div className="text-[11px] mt-1">Use the quick pills below or send an official proforma quote.</div>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = m.senderId === user?.id;
                    const isQuotation = m.content?.startsWith('[QUOTATION_PROFORMA]');

                    let quoteData: any = null;
                    if (isQuotation) {
                      try {
                        quoteData = JSON.parse(m.content.replace('[QUOTATION_PROFORMA]', ''));
                      } catch (err) {
                        quoteData = null;
                      }
                    }

                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div className="text-[10px] text-slate-400 mb-1 px-1">
                          {isMe ? 'You' : m.sender?.fullName || 'Counterpart'} •{' '}
                          {new Date(m.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>

                        {isQuotation && quoteData ? (
                          <div className="max-w-[85%] sm:max-w-md bg-white border border-emerald-300 rounded-2xl shadow-md overflow-hidden text-xs">
                            {/* Proforma Header */}
                            <div className="bg-gradient-to-r from-emerald-700 to-emerald-800 text-white p-3.5 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-emerald-200" />
                                <span className="font-bold tracking-wide">Commercial Proforma Quotation</span>
                              </div>
                              <span className="bg-emerald-900/60 text-emerald-200 text-[10px] font-mono px-2 py-0.5 rounded font-semibold border border-emerald-600/50">
                                {quoteData.quoteNumber}
                              </span>
                            </div>

                            {/* Proforma Body */}
                            <div className="p-4 space-y-3">
                              <div>
                                <div className="text-[11px] text-slate-400 uppercase font-semibold">Item & Scope</div>
                                <div className="font-bold text-slate-900 text-sm">{quoteData.itemName}</div>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                                <div>
                                  <span className="text-slate-500 block text-[11px]">Quantity:</span>
                                  <span className="font-bold text-slate-800">{quoteData.quantity} {quoteData.unit}</span>
                                </div>
                                <div>
                                  <span className="text-slate-500 block text-[11px]">Quoted Rate:</span>
                                  <span className="font-bold text-emerald-700">₹{Number(quoteData.unitPrice).toLocaleString('en-IN')} / {quoteData.unit}</span>
                                </div>
                              </div>

                              {/* Price Calculations */}
                              <div className="space-y-1.5 pt-1 text-xs border-t border-slate-100">
                                <div className="flex justify-between text-slate-600">
                                  <span>Subtotal:</span>
                                  <span>₹{Number(quoteData.subtotal).toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                  <span>GST ({quoteData.gstRate}% - CGST+SGST):</span>
                                  <span>+₹{Number(quoteData.cgst + quoteData.sgst).toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between font-bold text-sm text-slate-900 pt-1.5 border-t border-slate-200">
                                  <span>Grand Total (All-Incl):</span>
                                  <span className="text-emerald-700 font-extrabold">₹{Number(quoteData.total).toLocaleString('en-IN')}</span>
                                </div>
                              </div>

                              <div className="text-[11px] text-slate-500 bg-amber-50/70 border border-amber-200 p-2 rounded-lg space-y-1">
                                <div><strong>Delivery:</strong> {quoteData.deliveryTimeline}</div>
                                <div><strong>Terms:</strong> {quoteData.paymentTerms}</div>
                              </div>

                              {/* Actions */}
                              <div className="pt-2 flex items-center gap-2">
                                <button
                                  onClick={() => handlePrintQuote(quoteData)}
                                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 text-xs"
                                >
                                  <Printer className="w-3.5 h-3.5" />
                                  <span>Print / PDF</span>
                                </button>
                                {isMeBuyer && (
                                  <button
                                    onClick={() => handleAcceptQuote(quoteData)}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 text-xs shadow-sm"
                                  >
                                    <CheckCheck className="w-3.5 h-3.5" />
                                    <span>Accept Quote</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div
                            className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-sm ${
                              isMe
                                ? 'bg-emerald-600 text-white rounded-br-none'
                                : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                            }`}
                          >
                            {m.content}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Reply Pills */}
              <div className="p-2 border-t border-slate-200 bg-slate-50/70 overflow-x-auto flex gap-1.5 flex-nowrap text-[11px]">
                <span className="text-slate-400 self-center pl-1 font-semibold flex-shrink-0 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" /> Quick:
                </span>
                {QUICK_REPLIES.map((qr, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(qr)}
                    className="bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 px-2.5 py-1 rounded-full whitespace-nowrap transition flex-shrink-0"
                  >
                    {qr}
                  </button>
                ))}
              </div>

              {/* Input Area */}
              <div className="p-3 bg-white border-t border-slate-200">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    placeholder="Type your message, delivery terms, or negotiation requirements..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    className="flex-1 border border-slate-300 rounded-xl px-3.5 py-2 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="submit"
                    disabled={sending || !messageInput.trim()}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              Select a conversation from the left to view messages.
            </div>
          )}
        </div>
      </div>

      {/* Official GST Quotation Modal */}
      {isQuoteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 text-xs">
            {/* Modal Header */}
            <div className="px-5 py-4 bg-emerald-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-200" />
                <h2 className="text-sm font-bold">Generate GST Commercial Quotation</h2>
              </div>
              <button
                onClick={() => setIsQuoteModalOpen(false)}
                className="text-emerald-200 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Item / Scope of Supply *</label>
                <input
                  type="text"
                  value={quoteItemName}
                  onChange={(e) => setQuoteItemName(e.target.value)}
                  placeholder="e.g. Industrial Lathe Machine Model APX-300"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    value={quoteQty}
                    onChange={(e) => setQuoteQty(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit</label>
                  <select
                    value={quoteUnit}
                    onChange={(e) => setQuoteUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {['PIECE', 'SET', 'BOX', 'KG', 'TON', 'METER', 'LITRE'].map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit Rate (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    value={quoteUnitPrice}
                    onChange={(e) => setQuoteUnitPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 font-bold font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">GST Rate (%)</label>
                  <select
                    value={quoteGstRate}
                    onChange={(e) => setQuoteGstRate(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value={0}>0% (Exempt)</option>
                    <option value={5}>5% GST</option>
                    <option value={12}>12% GST</option>
                    <option value={18}>18% GST (Standard Industrial)</option>
                    <option value={28}>28% GST</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estimated Delivery</label>
                  <input
                    type="text"
                    value={quoteDeliveryTimeline}
                    onChange={(e) => setQuoteDeliveryTimeline(e.target.value)}
                    placeholder="e.g. 3-5 Business Days"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Terms</label>
                <input
                  type="text"
                  value={quotePaymentTerms}
                  onChange={(e) => setQuotePaymentTerms(e.target.value)}
                  placeholder="e.g. 50% Advance, 50% on Dispatch"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Dynamic Live Price Summary */}
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 space-y-1.5 font-sans">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal ({quoteQty} {quoteUnit} × ₹{quoteUnitPrice.toLocaleString('en-IN')}):</span>
                  <span className="font-semibold">₹{(quoteQty * quoteUnitPrice).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST ({quoteGstRate}%):</span>
                  <span className="font-semibold">+₹{Math.round(((quoteQty * quoteUnitPrice) * quoteGstRate) / 100).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t border-emerald-200">
                  <span>Total Quoted Amount:</span>
                  <span className="text-emerald-700 font-extrabold">
                    ₹{((quoteQty * quoteUnitPrice) + Math.round(((quoteQty * quoteUnitPrice) * quoteGstRate) / 100)).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsQuoteModalOpen(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendOfficialQuote}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <FileText className="w-4 h-4" />
                <span>Send Quotation to Buyer</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MessagesChatPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-16 text-center text-xs text-slate-500">
          Loading buyer-seller messages...
        </div>
      }
    >
      <MessagesChatContent />
    </Suspense>
  );
}
