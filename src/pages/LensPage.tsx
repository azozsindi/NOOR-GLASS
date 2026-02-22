/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useInventory } from '../useInventory';
import { translations } from '../i18n';
import { LENS_TYPES } from '../types';
import { Scanner } from '../components/Scanner';
import { Barcode } from '../components/Barcode';
import { Printer, Save } from 'lucide-react';

import { soundService } from '../services/soundService';

export function LensPage() {
  const { addItem, lang, config } = useInventory();
  const t = translations[lang];

  const [type, setType] = useState(LENS_TYPES[0].value);
  const [sign, setSign] = useState(LENS_TYPES[0].sign);
  const [sph, setSph] = useState("0.00");
  const [cyl, setCyl] = useState("0.00");
  const [cost, setCost] = useState("");
  const [sell, setSell] = useState("");
  const [qty, setQty] = useState(1);
  const [sku, setSku] = useState("");

  const sphOptions = [];
  for (let i = config.lensMax; i >= config.lensMin; i -= 0.25) {
    sphOptions.push((i > 0 ? "+" : "") + i.toFixed(2));
  }

  const cylOptions = [];
  for (let i = config.cylMax; i >= config.cylMin; i -= 0.25) {
    cylOptions.push((i > 0 ? "+" : "") + i.toFixed(2));
  }

  useEffect(() => {
    const sphClean = sph.replace(/[+\-.]/g, '').padStart(4, '0');
    const cylClean = cyl.replace(/[+\-.]/g, '').padStart(4, '0');
    setSku(`${type}${sign}${sphClean}${cylClean}`);
  }, [type, sign, sph, cyl]);

  const handleSave = () => {
    soundService.playClick();
    addItem({
      sku,
      qty,
      type: 'lens',
      cost: cost || 0,
      sell: sell || 0
    });
    setQty(1);
    setCost("");
    setSell("");
  };

  const handlePrint = () => {
    soundService.playClick();
    const printWindow = window.open('', '_blank', 'width=400,height=400');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Label - ${sku}</title>
          <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
          <style>
            @page { size: 50mm 30mm; margin: 0; }
            body { 
              font-family: 'Inter', sans-serif; 
              text-align: center; 
              padding: 0; 
              margin: 0; 
              display: flex; 
              flex-direction: column; 
              align-items: center; 
              justify-content: center;
              height: 30mm;
              width: 50mm;
              overflow: hidden;
            }
            .logo { font-weight: 900; font-size: 8px; margin-bottom: 1px; color: #1e3a8a; }
            .sku { font-family: monospace; font-size: 10px; font-weight: 900; margin: 1px 0; }
            .price { font-size: 9px; font-weight: 900; }
            #barcode { width: 40mm; height: 12mm; }
          </style>
        </head>
        <body>
          <div class="logo">NOOR GLASS</div>
          <div class="sku">${sku}</div>
          <svg id="barcode"></svg>
          <div class="price">Price: ${sell || '0'} SAR</div>
          <script>
            window.onload = () => {
              JsBarcode("#barcode", "${sku}", {
                format: "CODE128",
                width: 2,
                height: 40,
                displayValue: false,
                margin: 0
              });
              setTimeout(() => {
                window.print();
                window.close();
              }, 300);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
        <h2 className="text-base font-black text-blue-900 dark:text-blue-400 mb-4 border-s-4 border-blue-800 ps-3 uppercase tracking-tight">{t.add_item}</h2>
        
        <Scanner onScan={setSku} label={t.open_scanner} />

        <div className="space-y-4 mt-4">
          <select 
            value={`${type}|${sign}`}
            onChange={(e) => {
              const [v, s] = e.target.value.split('|');
              setType(v);
              setSign(s);
            }}
            className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 font-black text-center appearance-none focus:ring-2 focus:ring-blue-800 outline-none"
          >
            {LENS_TYPES.map((lt, i) => (
              <option key={i} value={`${lt.value}|${lt.sign}`}>{lt.label}</option>
            ))}
          </select>

          <div className="flex gap-2">
            <select 
              value={sph}
              onChange={(e) => setSph(e.target.value)}
              className="flex-1 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 font-black text-center appearance-none focus:ring-2 focus:ring-blue-800 outline-none"
            >
              {sphOptions.map(opt => <option key={opt} value={opt}>SPH {opt}</option>)}
            </select>
            <select 
              value={cyl}
              onChange={(e) => setCyl(e.target.value)}
              className="flex-1 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 font-black text-center appearance-none focus:ring-2 focus:ring-blue-800 outline-none"
            >
              {cylOptions.map(opt => <option key={opt} value={opt}>CYL {opt}</option>)}
            </select>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-2">
            <div className="font-mono font-black text-red-600 dark:text-red-400 text-xl break-all tracking-widest">{sku}</div>
            <div className="flex justify-center opacity-80 dark:invert">
              <Barcode value={sku} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ps-1">{t.lbl_cost}</label>
              <input 
                type="number" 
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="0.00"
                inputMode="decimal"
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 font-black text-center focus:ring-2 focus:ring-blue-800 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ps-1">{t.lbl_sell}</label>
              <input 
                type="number" 
                value={sell}
                onChange={(e) => setSell(e.target.value)}
                placeholder="0.00"
                inputMode="decimal"
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 font-black text-center focus:ring-2 focus:ring-blue-800 outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ps-1">{t.quantity}</label>
            <input 
              type="number" 
              value={qty}
              onChange={(e) => setQty(parseInt(e.target.value) || 1)}
              min="1"
              inputMode="numeric"
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 font-black text-center focus:ring-2 focus:ring-blue-800 outline-none"
            />
          </div>

          <div className="flex gap-2">
            <button 
              onClick={handlePrint}
              className="flex-1 py-5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl font-black text-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              <Printer size={20} />
              {t.print_label}
            </button>
            <button 
              onClick={handleSave}
              className="flex-[2] py-5 bg-blue-900 text-white rounded-2xl font-black text-lg shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              <Save size={20} />
              {t.save}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
