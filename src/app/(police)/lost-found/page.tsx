'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { lostFoundService } from '@/lib/services/lostFoundService';
import { LostFoundItem } from '@/lib/types/dashboard';
import { Package, Search, Plus, MapPin, Clock, Tag, X, Check } from 'lucide-react';

export default function LostFoundPage() {
  const { t } = useLanguage();
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Unclaimed' | 'Claimed'>('All');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LostFoundItem | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Personal Accessories');
  const [formLocation, setFormLocation] = useState('');
  const [formDesc, setFormDesc] = useState('');

  useEffect(() => {
    const update = () => {
      setItems(lostFoundService.getItems());
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

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formLocation) return;

    lostFoundService.addItem({
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

  return (
    <div className="h-full flex flex-col gap-3 text-white overflow-y-auto pr-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-[#132B52] gap-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#1677FF]/20 border border-[#1677FF]/40 flex items-center justify-center text-[#1677FF]">
            <Package size={20} />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-white tracking-wide">
              {t.nav.lostFound} — Custody & Recovery Register
            </h1>
            <p className="text-xs text-[#AFC4E8]/70">
              Official catalog of recovered citizen property deposited at Puducherry stations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#AFC4E8]/60" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items or locations..."
              className="pl-8 pr-3 py-1.5 rounded-lg bg-[#0A1B39] border border-[#132B52] text-xs text-white placeholder-[#AFC4E8]/40 focus:outline-none focus:border-[#1677FF] w-48 sm:w-56"
            />
          </div>

          <button
            onClick={() => setShowRegisterModal(true)}
            className="px-3 py-1.5 rounded-lg bg-[#1677FF] hover:bg-[#1677FF]/80 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
          >
            <Plus size={14} />
            <span>{t.lostFound.registerItem}</span>
          </button>
        </div>
      </div>

      {/* Grid of Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 flex-1">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className="police-card rounded-xl p-3 flex flex-col justify-between border hover:border-[#1677FF] transition-all cursor-pointer group"
          >
            <div>
              <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-[#132B52] bg-black mb-2.5">
                <Image src={item.imageUrl} alt={item.title} fill className="object-cover group-hover:scale-102 transition-transform" />
                <span className="absolute top-2 right-2 text-[10px] font-extrabold px-2 py-0.5 rounded bg-[#FFB800] text-black tracking-wider uppercase">
                  {item.status}
                </span>
              </div>

              <h3 className="font-bold text-sm text-white truncate">{item.title}</h3>
              <p className="text-xs text-[#AFC4E8]/80 line-clamp-2 mt-1 leading-snug">
                {item.description}
              </p>
            </div>

            <div className="pt-2 border-t border-[#132B52]/60 mt-3 text-xs text-[#AFC4E8] flex items-center justify-between">
              <span className="flex items-center gap-1 text-[11px] truncate">
                <MapPin size={11} className="text-[#1677FF]" /> {item.foundLocation}
              </span>
              <span className="text-[10px] text-[#AFC4E8]/60 font-mono">
                {item.reportedTime}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Register Item Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form onSubmit={handleRegister} className="bg-[#06152F] border border-[#1677FF]/50 rounded-xl max-w-sm w-full p-5 shadow-2xl text-white space-y-3 relative">
            <button
              type="button"
              onClick={() => setShowRegisterModal(false)}
              className="absolute top-3.5 right-3.5 text-[#AFC4E8] hover:text-white"
            >
              <X size={18} />
            </button>

            <h3 className="font-bold text-base text-white pb-2 border-b border-[#132B52] flex items-center gap-2">
              <Package size={18} className="text-[#00D68F]" /> {t.lostFound.registerItem}
            </h3>

            <div>
              <label className="block text-xs font-bold text-[#AFC4E8] mb-1">{t.lostFound.itemName} *</label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Leather Bag, iPhone 14"
                className="w-full px-3 py-1.5 rounded bg-[#0A1B39] border border-[#132B52] text-xs text-white focus:outline-none focus:border-[#1677FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#AFC4E8] mb-1">{t.lostFound.foundAt} *</label>
              <input
                type="text"
                required
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
                placeholder="e.g. White Town / Goubert Market"
                className="w-full px-3 py-1.5 rounded bg-[#0A1B39] border border-[#132B52] text-xs text-white focus:outline-none focus:border-[#1677FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#AFC4E8] mb-1">Description</label>
              <textarea
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Physical markers, color, contents..."
                rows={2}
                className="w-full px-3 py-1.5 rounded bg-[#0A1B39] border border-[#132B52] text-xs text-white focus:outline-none focus:border-[#1677FF]"
              />
            </div>

            <div className="pt-2 border-t border-[#132B52] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowRegisterModal(false)}
                className="px-3 py-1.5 rounded bg-[#0A1B39] text-xs text-[#AFC4E8]"
              >
                {t.common.cancel}
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-[#1677FF] hover:bg-[#1677FF]/80 text-xs font-bold text-white"
              >
                {t.lostFound.submitRecord}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
