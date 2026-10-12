'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { lostFoundService } from '@/lib/services/lostFoundService';
import { LostFoundItem } from '@/lib/types/dashboard';
import { Package, Search, Plus, MapPin, Clock, X, Radio } from 'lucide-react';

export default function LostFoundPage() {
  const { t } = useLanguage();
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Unclaimed' | 'Claimed'>('All');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LostFoundItem | null>(null);
  const [isLive, setIsLive] = useState(false);

  // Form states
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Personal Accessories');
  const [formLocation, setFormLocation] = useState('');
  const [formDesc, setFormDesc] = useState('');

  useEffect(() => {
    const update = () => {
      setItems(lostFoundService.getItems());
      setIsLive(lostFoundService.isAppwriteLive());
    };
    update();
    const unsub = lostFoundService.subscribe(update);
    return () => unsub();
  }, []);

  const filteredItems = items.filter((item) => {
    const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.foundLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formLocation) return;

    await lostFoundService.addItem({
      title: formName,
      category: formCategory,
      description: formDesc || 'Deposited item recorded by officer on duty.',
      imageUrl: '/wallet.jpg',
      foundLocation: formLocation,
      coords: { lat: 11.9338, lng: 79.8297 },
      status: 'Unclaimed',
      contactPerson: 'Control Desk Supervisor'
    });

    setFormName('');
    setFormLocation('');
    setFormDesc('');
    setShowRegisterModal(false);
  };

  const handleStatusChange = async (status: LostFoundItem['status']) => {
    if (selectedItem) {
      await lostFoundService.updateStatus(selectedItem.id, status);
      setSelectedItem({ ...selectedItem, status });
    }
  };

  return (
    <div className="h-full flex flex-col gap-3 overflow-y-auto pr-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-[var(--card-inner-border)] gap-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#1677FF]/20 border border-[#1677FF]/40 flex items-center justify-center text-[#1677FF] shrink-0">
            <Package size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold theme-title tracking-wide">
                {t.nav.lostFound} — Custody & Recovery Register
              </h1>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1 border ${
                isLive 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                  : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
              }`}>
                <Radio size={10} className={isLive ? 'animate-pulse text-emerald-400' : 'text-blue-400'} />
                {isLive ? 'Appwrite Cloud Sync' : 'Local + Realtime'}
              </span>
            </div>
            <p className="text-xs theme-sub font-medium">
              Official catalog of recovered citizen property deposited at Puducherry stations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 theme-subtle" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items or locations..."
              className="pl-8 pr-3 py-1.5 rounded-lg theme-inner-card border border-[var(--card-inner-border)] text-xs theme-title placeholder:text-[var(--input-placeholder)] focus:outline-none focus:border-[#1677FF] w-48 sm:w-56"
            />
          </div>

          <button
            onClick={() => setShowRegisterModal(true)}
            className="px-3 py-1.5 rounded-lg bg-[#1677FF] hover:bg-[#1677FF]/80 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <Plus size={14} />
            <span>{t.lostFound.registerItem}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {(['All', 'Unclaimed', 'Claimed'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              filterStatus === status
                ? 'bg-[#1677FF] text-white shadow-xs'
                : 'theme-inner-card theme-sub hover:theme-title border border-[var(--card-inner-border)]'
            }`}
          >
            {status}
            <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-black/20">
              {status === 'All' ? items.length : items.filter(i => i.status === status).length}
            </span>
          </button>
        ))}
      </div>

      {/* Grid of Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 flex-1">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className="police-card rounded-xl p-3 flex flex-col justify-between border hover:border-[#1677FF] transition-all cursor-pointer group shadow-sm hover:shadow-md"
          >
            <div>
              <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-[var(--card-inner-border)] bg-black mb-2.5">
                <Image 
                  src={item.imageUrl} 
                  alt={item.title} 
                  fill 
                  unoptimized
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover group-hover:scale-102 transition-transform" 
                />
                <span className={`absolute top-2 right-2 text-[10px] font-extrabold px-2 py-0.5 rounded tracking-wider uppercase shadow-xs ${
                  item.status === 'Claimed' ? 'bg-[#00D68F] text-[#0A192F]' : 'bg-[#FFB800] text-[#0A192F]'
                }`}>
                  {item.status}
                </span>
              </div>

              <h3 className="font-bold text-sm theme-title truncate">{item.title}</h3>
              <p className="text-xs theme-sub line-clamp-2 mt-1 leading-snug">
                {item.description}
              </p>
            </div>

            <div className="pt-2 border-t border-[var(--card-inner-border)] mt-3 text-xs theme-sub flex items-center justify-between">
              <span className="flex items-center gap-1 text-[11px] truncate">
                <MapPin size={11} className="text-[#1677FF] shrink-0" /> {item.foundLocation}
              </span>
              <span className="text-[10px] theme-subtle font-mono shrink-0">
                {item.reportedTime}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Register Item Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form onSubmit={handleRegister} className="bg-[var(--modal-bg)] border-2 border-[#1677FF] rounded-xl max-w-sm w-full p-4 sm:p-5 shadow-2xl text-[var(--text-main)] space-y-3 relative">
            <button
              type="button"
              onClick={() => setShowRegisterModal(false)}
              className="absolute top-3.5 right-3.5 theme-sub hover:opacity-80 cursor-pointer"
            >
              <X size={18} />
            </button>

            <h3 className="font-bold text-base theme-title pb-2 border-b border-[var(--card-inner-border)] flex items-center gap-2">
              <Package size={18} className="text-[#00D68F]" /> {t.lostFound.registerItem}
            </h3>

            <div>
              <label className="block text-xs font-bold theme-sub mb-1">{t.lostFound.itemName} *</label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Leather Bag, iPhone 14"
                className="w-full px-3 py-1.5 rounded theme-inner-card border border-[var(--card-inner-border)] text-xs theme-title focus:outline-none focus:border-[#1677FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold theme-sub mb-1">{t.lostFound.foundAt} *</label>
              <input
                type="text"
                required
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
                placeholder="e.g. White Town / Goubert Market"
                className="w-full px-3 py-1.5 rounded theme-inner-card border border-[var(--card-inner-border)] text-xs theme-title focus:outline-none focus:border-[#1677FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold theme-sub mb-1">Description</label>
              <textarea
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Physical markers, color, contents..."
                rows={2}
                className="w-full px-3 py-1.5 rounded theme-inner-card border border-[var(--card-inner-border)] text-xs theme-title focus:outline-none focus:border-[#1677FF]"
              />
            </div>

            <div className="pt-2 border-t border-[var(--card-inner-border)] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowRegisterModal(false)}
                className="px-3 py-1.5 rounded theme-inner-card text-xs theme-sub border border-[var(--card-inner-border)] cursor-pointer"
              >
                {t.common.cancel}
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-[#1677FF] hover:bg-[#1677FF]/80 text-xs font-bold text-white cursor-pointer"
              >
                {t.lostFound.submitRecord}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Item Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--modal-bg)] border-2 border-[#1677FF] rounded-xl max-w-sm w-full p-4 sm:p-5 shadow-2xl text-[var(--text-main)] relative">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-3.5 right-3.5 theme-sub hover:opacity-80 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[var(--card-inner-border)]">
              <Package size={17} className="text-[#1677FF]" />
              <div>
                <h3 className="font-bold text-sm theme-title">{selectedItem.title}</h3>
                <span className="text-[10px] theme-sub font-mono">{selectedItem.id}</span>
              </div>
            </div>

            <div className="relative w-full h-40 rounded-lg overflow-hidden border border-[var(--card-inner-border)] mb-3">
              <Image 
                src={selectedItem.imageUrl} 
                alt={selectedItem.title} 
                fill 
                unoptimized
                sizes="380px"
                className="object-cover" 
              />
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2 rounded theme-inner-card border border-[var(--card-inner-border)]">
                <div className="theme-sub font-bold mb-0.5">Description:</div>
                <p className="theme-title">{selectedItem.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded theme-inner-card border border-[var(--card-inner-border)]">
                  <div className="theme-sub font-bold mb-0.5">{t.lostFound.foundAt}:</div>
                  <div className="theme-title truncate">{selectedItem.foundLocation}</div>
                </div>
                <div className="p-2 rounded theme-inner-card border border-[var(--card-inner-border)]">
                  <div className="theme-sub font-bold mb-0.5">Custodian:</div>
                  <div className="theme-title truncate">{selectedItem.contactPerson}</div>
                </div>
              </div>

              {/* Status Update Options */}
              <div className="p-2 rounded theme-inner-card border border-[var(--card-inner-border)] flex items-center justify-between">
                <span className="font-bold theme-title text-[11px]">Item Status:</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleStatusChange('Unclaimed')}
                    className={`px-2.5 py-1 rounded text-[10px] font-black cursor-pointer transition-all ${
                      selectedItem.status === 'Unclaimed'
                        ? 'bg-[#FFB800] text-black ring-2 ring-amber-300'
                        : 'bg-black/20 theme-sub hover:theme-title'
                    }`}
                  >
                    UNCLAIMED
                  </button>
                  <button
                    onClick={() => handleStatusChange('Claimed')}
                    className={`px-2.5 py-1 rounded text-[10px] font-black cursor-pointer transition-all ${
                      selectedItem.status === 'Claimed'
                        ? 'bg-[#00D68F] text-black ring-2 ring-emerald-300'
                        : 'bg-black/20 theme-sub hover:theme-title'
                    }`}
                  >
                    CLAIMED
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[var(--card-inner-border)] flex justify-end">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-1.5 rounded bg-[#1677FF] hover:bg-[#1677FF]/80 text-xs font-bold text-white transition-colors cursor-pointer"
              >
                {t.common.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
