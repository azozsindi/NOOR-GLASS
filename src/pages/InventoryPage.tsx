/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useInventory } from '../useInventory';
import { translations } from '../i18n';
import { SHEET_URL } from '../types';
import { Scanner } from '../components/Scanner';
import { Send, Plus, Minus, Camera, Keyboard } from 'lucide-react';
import { toast } from 'sonner';
import { soundService } from '../services/soundService';

export function InventoryPage() {
  const { lang, config } = useInventory();
  const t = translations[lang];

  const [sku, setSku] = useState("");
  const [qty, setQty] = useState(1);
  const [itemType, setItemType] = useState<'lens' | 'frame'>('lens');
  const [isScanning, setIsScanning] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleScan = (scannedSku: string) => {
    setSku(scannedSku);
    setIsScanning(false);
    soundService.playClick();
    toast.success(scannedSku);
  };

  const handleSend = async () => {
    if (!sku) {
      toast.error(t.inventory_sku_label);
      return;
    }
    if (qty <= 0) {
      toast.error(t.err_qty);
      return;
    }

    setIsSending(true);
    const loadingToast = toast.loading(t.sending);

    try {
      await fetch(SHEET_URL, {
        method: "POST",
        mode: 'no-cors',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku: sku,
          qty: qty,
          type: itemType,
          date: new Date().toLocaleString(),
          cost: 0,
          sell: 0
        })
      });

      toast.success(t.inventory_success);
      setSku("");
      setQty(1);
    } catch (error) {
      console.error("Error sending inventory:", error);
      toast.error(t.inventory_error);
    } finally {
      setIsSending(false);
      toast.dismiss(loadingToast);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
        <h2 className="text-xl font-black text-blue-900 dark:text-blue-400 mb-6 border-s-4 border-blue-800 ps-3 uppercase tracking-tight">
          {t.inventory_title}
        </h2>

        <div className="space-y-6">
          {/* Type Toggle */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            <button
              onClick={() => setItemType('lens')}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${itemType === 'lens' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-800' : 'text-slate-500'}`}
            >
              {t.filter_lens}
            </button>
            <button
              onClick={() => setItemType('frame')}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${itemType === 'frame' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-800' : 'text-slate-500'}`}
            >
              {t.filter_frame}
            </button>
          </div>

          {/* Scanner Section */}
          <div className="space-y-3">
            <button
              onClick={() => setIsScanning(!isScanning)}
              className={`w-full py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all active:scale-95 ${
                isScanning 
                  ? 'bg-red-100 text-red-600 dark:bg-red-900/20' 
                  : 'bg-blue-50 text-blue-900 dark:bg-blue-900/20'
              }`}
            >
              <Camera size={20} />
              {isScanning ? t.close_scanner : t.inventory_scan_btn}
            </button>

            {isScanning && (
              <div className="overflow-hidden rounded-2xl border-2 border-dashed border-blue-200 dark:border-blue-800">
                <Scanner onScan={handleScan} label={t.inventory_scan_btn} />
              </div>
            )}
          </div>

          {/* Manual Entry Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Keyboard size={14} />
                {t.inventory_sku_label}
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="SKU / Barcode"
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 font-mono font-bold text-lg focus:ring-2 focus:ring-blue-800 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                {t.inventory_qty_prompt}
              </label>
              <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 p-2 rounded-2xl border border-slate-100 dark:border-slate-700">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-900 rounded-xl shadow-sm active:scale-90 transition-transform"
                >
                  <Minus size={20} />
                </button>
                <input
                  type="number"
                  value={qty}
                  onChange={(e) => setQty(parseInt(e.target.value) || 1)}
                  className="flex-1 bg-transparent text-center font-black text-2xl outline-none"
                />
                <button
                  onClick={() => setQty(qty + 1)}
                  className="w-12 h-12 flex items-center justify-center bg-blue-900 text-white rounded-xl shadow-md active:scale-90 transition-transform"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>

            <button
              onClick={handleSend}
              disabled={isSending || !sku}
              className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-lg shadow-lg active:scale-95 transition-transform disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3 mt-4"
            >
              <Send size={24} />
              {t.inventory_send_btn}
            </button>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30">
        <p className="text-xs text-blue-800 dark:text-blue-300 font-medium leading-relaxed">
          {lang === 'ar' 
            ? "هذه الصفحة مخصصة للجرد السريع. سيتم إرسال البيانات مباشرة إلى ملف الجوجل شيت دون حفظها محلياً في السجلات."
            : "This page is for quick inventory. Data will be sent directly to Google Sheets without being saved locally in records."}
        </p>
      </div>
    </div>
  );
}
