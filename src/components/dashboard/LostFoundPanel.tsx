'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { lostFoundService } from '@/lib/services/lostFoundService';
import { LostFoundItem } from '@/lib/types/dashboard';
import { 
  Package, 
  Clock, 
  ChevronRight, 
  Plus, 
  X
} from 'lucide-react';

export function LostFoundPanel() {
  const { t } = useLanguage();
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<LostFoundItem | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

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

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formLocation) return;

    await lostFoundService.addItem({
      title: formName,
      category: formCategory,
      description: formDesc || 'Found item deposited at police control desk.',
      imageUrl: '/wallet.jpg',
      foundLocation: formLocation,
      coords: { lat: 11.9338, lng: 79.8297 },
      status: 'Unclaimed',
      contactPerson: 'Control Room Supervisor'
    });

    setFormName('');
    setFormLocation('');
    setFormDesc('');
    setShowRegisterModal(false);
  };

  const handleStatusUpdate = async (status: LostFoundItem['status']) => {
    if (selectedItem) {
      await lostFoundService.updateStatus(selectedItem.id, status);
      setSelectedItem({ ...selectedItem, status });
    }
  };

  return (
    <div className="police-card rounded-xl p-3 flex flex-col justify-between h-[46%] relative border-t-4 border-t-[#1677FF] shadow-lg select-none">
      {/* Header (No truncation, exactly matching reference image) */}
      <div className="flex items-center justify-between pb-2 border-b border-[var(--card-inner-border)] shrink-0 gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#1677FF] text-white flex items-center justify-center font-bold shadow-md shrink-0">
            <Package size={15} />
          </div>
          <h2 className="text-xs font-black theme-title tracking-wide uppercase">
            {t.lostFound.title}
          </h2>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowRegisterModal(true)}
            className="p-1 px-2.5 rounded bg-[#F52235] hover:bg-[#d8192b] text-white font-bold transition-colors shadow-xs flex items-center gap-1 text-[10px] cursor-pointer"
            title="Register newly found item"
          >
            <Plus size={12} />
            <span>Add</span>
          </button>
          <Link
            href="/lost-found"
            className="text-[10px] font-bold text-white bg-[#1677FF] hover:bg-[#0056cc] px-2 py-0.5 rounded flex items-center gap-0.5 transition-colors shadow-xs cursor-pointer"
          >
            <span>{t.common.viewAll}</span>
            <ChevronRight size={12} />
          </Link>
        </div>
      </div>

      {/* 3 Horizontal Item Cards matching reference image */}
      <div className="grid grid-cols-3 gap-2 my-2 flex-1">
        {items.slice(0, 3).map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className="rounded-lg bg-[var(--card-inner)] border border-[var(--card-inner-border)] hover:border-[#1677FF] p-2 flex flex-col justify-between cursor-pointer group transition-all shadow-sm hover:shadow-md"
          >
            {/* Square Photo Thumbnail */}
            <div className="relative w-full aspect-square rounded-md overflow-hidden bg-black/10 border border-black/10 mb-1.5">
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                unoptimized
                sizes="120px"
                className="object-cover group-hover:scale-105 transition-transform"
              />
            </div>

            {/* Info */}
            <div>
              <h3 className="text-[11px] font-black theme-title truncate leading-tight">
                {item.title}
              </h3>
              <div className="text-[9px] theme-sub truncate mt-0.5 font-medium">
                Found at: <b className="theme-title font-bold">{item.foundLocation}</b>
              </div>
              <div className="flex items-center gap-1 text-[8.5px] theme-subtle mt-1 font-mono">
                <Clock size={8.5} className="text-[#1677FF]" /> {item.reportedTime}
              </div>
            </div>

            {/* Status Pill */}
            <div className="mt-1.5">
              <span className={`block text-center text-[8.5px] font-black px-1.5 py-0.5 rounded tracking-wider uppercase shadow-xs ${
                item.status === 'Claimed' ? 'bg-[#00D68F] text-[#0A192F]' : 'bg-[#FFB800] text-[#0A192F]'
              }`}>
                {item.status === 'Claimed' ? 'CLAIMED' : 'UNCLAIMED'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Item Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#06152F] [data-theme='white']:bg-white border-2 border-[#1677FF] rounded-xl max-w-sm w-full p-5 shadow-2xl text-white [data-theme='white']:text-slate-900 relative">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-3.5 right-3.5 text-[#AFC4E8] [data-theme='white']:text-slate-500 hover:opacity-80 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#132B52] [data-theme='white']:border-slate-200">
              <Package size={17} className="text-[#1677FF]" />
              <div>
                <h3 className="font-bold text-sm theme-title">{selectedItem.title}</h3>
                <span className="text-[10px] theme-sub font-mono">{selectedItem.id}</span>
              </div>
            </div>

            <div className="relative w-full h-40 rounded-lg overflow-hidden border border-[#132B52] [data-theme='white']:border-slate-200 mb-3">
              <Image src={selectedItem.imageUrl} alt={selectedItem.title} fill unoptimized sizes="350px" className="object-cover" />
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2 rounded bg-[#0A1B39] [data-theme='white']:bg-slate-100 border border-[#132B52] [data-theme='white']:border-slate-200">
                <div className="theme-sub font-bold mb-0.5">Description:</div>
                <p className="theme-title">{selectedItem.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded bg-[#0A1B39] [data-theme='white']:bg-slate-100 border border-[#132B52] [data-theme='white']:border-slate-200">
                  <div className="theme-sub font-bold mb-0.5">Found at:</div>
                  <div className="theme-title truncate">{selectedItem.foundLocation}</div>
                </div>
                <div className="p-2 rounded bg-[#0A1B39] [data-theme='white']:bg-slate-100 border border-[#132B52] [data-theme='white']:border-slate-200">
                  <div className="theme-sub font-bold mb-0.5">Custodian:</div>
                  <div className="theme-title truncate">{selectedItem.contactPerson}</div>
                </div>
              </div>

              <div className="p-2 rounded bg-[#0A1B39] [data-theme='white']:bg-slate-100 border border-[#132B52] [data-theme='white']:border-slate-200 flex items-center justify-between">
                <span className="font-bold theme-title text-[11px]">Item Status:</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleStatusUpdate('Unclaimed')}
                    className={`px-2 py-0.5 rounded text-[9px] font-bold cursor-pointer ${
                      selectedItem.status === 'Unclaimed' ? 'bg-[#FFB800] text-black font-extrabold' : 'bg-[#06152F] [data-theme="white"]:bg-white text-[#AFC4E8] [data-theme="white"]:text-slate-700 border [data-theme="white"]:border-slate-300'
                    }`}
                  >
                    Unclaimed
                  </button>
                  <button
                    onClick={() => handleStatusUpdate('Claimed')}
                    className={`px-2 py-0.5 rounded text-[9px] font-bold cursor-pointer ${
                      selectedItem.status === 'Claimed' ? 'bg-[#00D68F] text-black font-extrabold' : 'bg-[#06152F] [data-theme="white"]:bg-white text-[#AFC4E8] [data-theme="white"]:text-slate-700 border [data-theme="white"]:border-slate-300'
                    }`}
                  >
                    Claimed
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#132B52] [data-theme='white']:border-slate-200 flex justify-end">
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

      {/* Register Found Item Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleRegisterSubmit}
            className="bg-[#06152F] [data-theme='white']:bg-white border-2 border-[#1677FF] rounded-xl max-w-sm w-full p-5 shadow-2xl text-white [data-theme='white']:text-slate-900 relative space-y-3"
          >
            <button
              type="button"
              onClick={() => setShowRegisterModal(false)}
              className="absolute top-3.5 right-3.5 text-[#AFC4E8] [data-theme='white']:text-slate-500 hover:opacity-80 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 pb-2 border-b border-[#132B52] [data-theme='white']:border-slate-200">
              <Package size={17} className="text-[#00D68F]" />
              <h3 className="font-bold text-sm theme-title">{t.lostFound.registerItem}</h3>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#AFC4E8] [data-theme='white']:text-slate-600 mb-1">
                {t.lostFound.itemName} *
              </label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Silver Ring, Backpack"
                className="w-full px-3 py-1.5 rounded bg-[#0A1B39] [data-theme='white']:bg-slate-100 border border-[#132B52] [data-theme='white']:border-slate-300 text-xs text-white [data-theme='white']:text-slate-900 focus:outline-none focus:border-[#1677FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#AFC4E8] [data-theme='white']:text-slate-600 mb-1">
                Found at *
              </label>
              <input
                type="text"
                required
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
                placeholder="e.g. Goubert Avenue, Rock Beach"
                className="w-full px-3 py-1.5 rounded bg-[#0A1B39] [data-theme='white']:bg-slate-100 border border-[#132B52] [data-theme='white']:border-slate-300 text-xs text-white [data-theme='white']:text-slate-900 focus:outline-none focus:border-[#1677FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#AFC4E8] [data-theme='white']:text-slate-600 mb-1">
                Description
              </label>
              <textarea
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Details of the found item..."
                rows={2}
                className="w-full px-3 py-1.5 rounded bg-[#0A1B39] [data-theme='white']:bg-slate-100 border border-[#132B52] [data-theme='white']:border-slate-300 text-xs text-white [data-theme='white']:text-slate-900 focus:outline-none focus:border-[#1677FF]"
              />
            </div>

            <div className="pt-2 border-t border-[#132B52] [data-theme='white']:border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowRegisterModal(false)}
                className="px-3 py-1.5 rounded bg-[#0A1B39] [data-theme='white']:bg-slate-100 text-xs font-semibold text-[#AFC4E8] [data-theme='white']:text-slate-600 border [data-theme='white']:border-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-[#1677FF] hover:bg-[#1677FF]/80 text-xs font-bold text-white shadow-xs cursor-pointer"
              >
                Save Record
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
