'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/lib/auth-context';
import { retailDataStore } from '@/lib/data-store';
import { Customer } from '@/types';
import { generateLuxuryWhatsAppDraft } from '@/lib/ai-engine';
import { formatIDR } from '@/lib/kpi';
import {
  Search,
  Filter,
  MessageCircle,
  Copy,
  ExternalLink,
  Gift,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';

function CustomersContent() {
  const searchParams = useSearchParams();
  const { currentProfile, stores } = useAuth();
  const customers = retailDataStore.getCustomers();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showDraftModal, setShowDraftModal] = useState(false);

  const [templateType, setTemplateType] = useState<
    | 'birthday_greeting'
    | 'vip_new_arrival'
    | 'inactive_reactivation'
    | 'appointment_followup'
    | 'post_visit_followup'
  >('birthday_greeting');
  const [customContext] = useState('');
  const [draftResult, setDraftResult] = useState<{
    allowed: boolean;
    blockReason?: string;
    messageText: string;
    whatsappUrl?: string;
  } | null>(null);
  const [editedMessage, setEditedMessage] = useState('');
  const [copyFeedback, setCopyFeedback] = useState(false);

  const [interactionOutcome, setInteractionOutcome] = useState<
    'positive' | 'neutral' | 'no_response' | 'declined' | 'opt_out'
  >('positive');
  const [interactionNotes, setInteractionNotes] = useState('');
  const [interactionFeedback, setInteractionFeedback] = useState('');

  const handledQueryRef = React.useRef<string | null>(null);

  useEffect(() => {
    const action = searchParams.get('action');
    const customerId = searchParams.get('customerId');
    if (!customerId) return;

    const queryKey = `${action}:${customerId}`;
    if (handledQueryRef.current === queryKey) return;
    handledQueryRef.current = queryKey;

    const cust = retailDataStore.getCustomers().find(c => c.id === customerId);
    if (cust) {
      if (action === 'draft') {
        handleOpenDraft(cust);
      } else {
        setSelectedCustomer(cust);
      }
    }
  }, [searchParams]);

  const filteredCustomers = customers.filter(cust => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      cust.full_name.toLowerCase().includes(term) ||
      cust.customer_ref.toLowerCase().includes(term) ||
      (cust.phone && cust.phone.includes(term));

    const matchesTier = selectedTier === 'all' || cust.tier === selectedTier;
    return matchesSearch && matchesTier;
  });

  const handleOpenDraft = (cust: Customer) => {
    setSelectedCustomer(cust);
    setShowDraftModal(true);

    const storeName = stores[0]?.name.replace('[DEMO] ', '') || 'Maison de Luxe Boutique';
    const staffName = currentProfile.full_name.replace('[DEMO] ', '');

    const res = generateLuxuryWhatsAppDraft({
      customer: cust,
      staffName,
      storeName,
      templateType,
      customContext,
    });

    setDraftResult(res);
    setEditedMessage(res.messageText);
  };

  const handleTemplateChange = (newType: typeof templateType) => {
    setTemplateType(newType);
    if (!selectedCustomer) return;

    const storeName = stores[0]?.name.replace('[DEMO] ', '') || 'Maison de Luxe Boutique';
    const staffName = currentProfile.full_name.replace('[DEMO] ', '');

    const res = generateLuxuryWhatsAppDraft({
      customer: selectedCustomer,
      staffName,
      storeName,
      templateType: newType,
      customContext,
    });

    setDraftResult(res);
    setEditedMessage(res.messageText);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(editedMessage);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2500);
  };

  const handleLogInteraction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    retailDataStore.logInteraction({
      organization_id: selectedCustomer.organization_id,
      customer_id: selectedCustomer.id,
      staff_id: currentProfile.id,
      channel: 'whatsapp',
      interaction_type: 'outreach',
      interaction_date: new Date().toISOString(),
      outcome: interactionOutcome,
      notes: interactionNotes || `Template: ${templateType}`,
    });

    setInteractionFeedback(`Interaksi dengan ${selectedCustomer.full_name} berhasil dicatat.`);
    setShowDraftModal(false);
    setTimeout(() => setInteractionFeedback(''), 3000);
  };

  return (
    <AppLayout
      title="Daftar Tamu & Clienteling"
      subtitle="Manajemen data tamu VIP, status izin komunikasi & draf pesan concierge"
    >
      <div className="space-y-5">
        {interactionFeedback && (
          <div className="bg-[#EBF7EE] border border-[#D1EED5] p-3 rounded text-xs text-[#1E7E34] flex items-center justify-between">
            <span>✓ {interactionFeedback}</span>
            <button onClick={() => setInteractionFeedback('')} className="font-bold">
              ×
            </button>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-lg border border-[#EAEAEA]">
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama, telepon, atau referensi..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-[#EAEAEA] rounded focus:outline-none focus:border-[#888888]"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs">
              <Filter className="w-3.5 h-3.5 text-[#777777]" />
              <span className="text-[#777777]">Tier:</span>
              <select
                value={selectedTier}
                onChange={e => setSelectedTier(e.target.value)}
                className="text-xs border border-[#EAEAEA] rounded px-2 py-1 bg-white"
              >
                <option value="all">Semua Tier</option>
                <option value="VIP">VIP</option>
                <option value="Platinum">Platinum</option>
                <option value="Gold">Gold</option>
              </select>
            </div>
            <span className="text-xs text-[#888888]">{filteredCustomers.length} Tamu</span>
          </div>
        </div>

        {/* Customer Directory Table */}
        <div className="bg-white rounded-lg border border-[#EAEAEA] overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAFAFA] text-[#666666] border-b border-[#EAEAEA] text-[11px] font-medium">
              <tr>
                <th className="py-2.5 px-3.5 font-normal">Nama Tamu</th>
                <th className="py-2.5 px-3.5 font-normal">Tier</th>
                <th className="py-2.5 px-3.5 font-normal">No. WhatsApp</th>
                <th className="py-2.5 px-3.5 font-normal">Ulang Tahun</th>
                <th className="py-2.5 px-3.5 font-normal">Total Belanja</th>
                <th className="py-2.5 px-3.5 font-normal">Izin Kontak</th>
                <th className="py-2.5 px-3.5 font-normal text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F5F5]">
              {filteredCustomers.map(cust => {
                const isOptedOut = cust.do_not_contact || cust.consent_status === 'opted_out';

                return (
                  <tr key={cust.id} className="hover:bg-[#FAFAFA] transition-colors">
                    <td className="py-2.5 px-3.5">
                      <div className="font-medium text-[#111111]">
                        {cust.full_name.replace('[DEMO] ', '')}
                      </div>
                      <div className="text-[10px] text-[#888888]">{cust.customer_ref}</div>
                    </td>
                    <td className="py-2.5 px-3.5">
                      <span className="bg-[#F5F5F5] text-[#333333] px-1.5 py-0.5 rounded text-[10px] font-medium">
                        {cust.tier || 'Regular'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 text-[#666666]">{cust.phone || '-'}</td>
                    <td className="py-2.5 px-3.5 text-[#666666]">
                      {cust.birthday ? (
                        <span className="inline-flex items-center gap-1">
                          <Gift className="w-3 h-3 text-[#888888]" />
                          {cust.birthday}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-2.5 px-3.5 text-[#111111] font-medium">
                      {cust.total_spend ? formatIDR(cust.total_spend) : 'N/A'}
                    </td>
                    <td className="py-2.5 px-3.5">
                      {isOptedOut ? (
                        <span className="inline-flex items-center gap-1 bg-[#FDF0ED] text-[#C0392B] px-1.5 py-0.5 rounded text-[10px]">
                          <ShieldAlert className="w-3 h-3" />
                          Do Not Contact
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-[#EBF7EE] text-[#1E7E34] px-1.5 py-0.5 rounded text-[10px]">
                          <ShieldCheck className="w-3 h-3" />
                          Opted-In
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3.5 text-right">
                      <button
                        onClick={() => handleOpenDraft(cust)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                          isOptedOut
                            ? 'bg-[#F5F5F5] text-[#A0A0A0] cursor-not-allowed'
                            : 'bg-[#1A1A1A] hover:bg-[#333333] text-white'
                        }`}
                      >
                        <MessageCircle className="w-3 h-3" />
                        Draft Pesan
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* WhatsApp Draft Generator Modal */}
      {showDraftModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-xl w-full p-5 shadow-lg border border-[#EAEAEA] my-6">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#F0F0F0] mb-3.5">
              <div>
                <h3 className="text-xs font-semibold text-[#111111] uppercase tracking-wider">
                  Draf Pesan WhatsApp Concierge
                </h3>
                <p className="text-[11px] text-[#777777]">
                  Tamu: <strong>{selectedCustomer.full_name.replace('[DEMO] ', '')}</strong> (
                  {selectedCustomer.tier})
                </p>
              </div>
              <button
                onClick={() => setShowDraftModal(false)}
                className="text-[#888888] hover:text-[#111111] text-sm"
              >
                ✕
              </button>
            </div>

            {/* If Customer Opted Out */}
            {draftResult && !draftResult.allowed ? (
              <div className="p-5 bg-[#FDF0ED] border border-[#F5C6CB] rounded-md text-center space-y-2">
                <ShieldAlert className="w-8 h-8 text-[#C0392B] mx-auto" />
                <h4 className="text-xs font-semibold text-[#721C24]">
                  Komunikasi Dibatasi Kebijakan Privasi
                </h4>
                <p className="text-[11px] text-[#721C24]">{draftResult.blockReason}</p>
                <div className="pt-2">
                  <button
                    onClick={() => setShowDraftModal(false)}
                    className="px-3.5 py-1.5 bg-[#C0392B] text-white rounded text-xs"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5 text-xs">
                {/* Template Selector */}
                <div>
                  <label className="block text-[#444444] font-medium mb-1.5">
                    Pilih Template Pesan
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: 'birthday_greeting', label: 'Ucapan Ulang Tahun' },
                      { id: 'vip_new_arrival', label: 'Koleksi Baru' },
                      { id: 'inactive_reactivation', label: 'Reaktivasi Tamu' },
                      { id: 'appointment_followup', label: 'Konfirmasi Janji' },
                      { id: 'post_visit_followup', label: 'Follow-Up Kunjungan' },
                    ].map(tpl => (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => handleTemplateChange(tpl.id as typeof templateType)}
                        className={`px-2.5 py-1 rounded text-[11px] border transition-colors ${
                          templateType === tpl.id
                            ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                            : 'bg-[#FAFAFA] text-[#666666] border-[#EAEAEA] hover:border-[#CCCCCC]'
                        }`}
                      >
                        {tpl.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generated Message Editor */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[#444444] font-medium">Teks Pesan (Dapat Diedit)</label>
                    <span className="text-[10px] text-[#888888]">Nada sopan & personal</span>
                  </div>
                  <textarea
                    rows={7}
                    value={editedMessage}
                    onChange={e => setEditedMessage(e.target.value)}
                    className="w-full p-2.5 border border-[#EAEAEA] rounded text-xs leading-relaxed focus:outline-none focus:border-[#888888] font-sans"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#F5F5F5]">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyMessage}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#EAEAEA] bg-white text-[#333333] hover:bg-[#F5F5F5]"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copyFeedback ? 'Tersalin' : 'Salin Teks'}
                    </button>

                    {draftResult?.whatsappUrl && (
                      <a
                        href={draftResult.whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1A1A1A] text-white hover:bg-[#333333]"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Buka WhatsApp
                      </a>
                    )}
                  </div>
                </div>

                {/* Log Interaction Section */}
                <form
                  onSubmit={handleLogInteraction}
                  className="mt-3 pt-3 border-t border-[#EAEAEA] bg-[#FAFAFA] p-3 rounded"
                >
                  <span className="text-[11px] font-semibold text-[#111111] uppercase tracking-wider block mb-2">
                    Catat Riwayat Kontak
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-2.5">
                    <div>
                      <label className="block text-[10px] text-[#666666] mb-0.5">Hasil Kontak</label>
                      <select
                        value={interactionOutcome}
                        onChange={e =>
                          setInteractionOutcome(e.target.value as typeof interactionOutcome)
                        }
                        className="w-full p-1.5 border border-[#EAEAEA] rounded bg-white text-xs"
                      >
                        <option value="positive">Positif (Tertarik / Janji Temu)</option>
                        <option value="neutral">Netral (Pesan terkirim)</option>
                        <option value="no_response">Belum Ada Respon</option>
                        <option value="declined">Menolak</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-[#666666] mb-0.5">Catatan Tambahan</label>
                      <input
                        type="text"
                        placeholder="Misal: Tamu meminta info tas burgundy..."
                        value={interactionNotes}
                        onChange={e => setInteractionNotes(e.target.value)}
                        className="w-full p-1.5 border border-[#EAEAEA] rounded bg-white text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-[#1A1A1A] text-white rounded hover:bg-[#333333] text-xs font-medium"
                    >
                      Simpan Catatan
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </AppLayout>
  );
}

export default function CustomersPage() {
  return (
    <React.Suspense fallback={<div className="p-6 text-xs text-[#888888]">Memuat Tamu VIP...</div>}>
      <CustomersContent />
    </React.Suspense>
  );
}
