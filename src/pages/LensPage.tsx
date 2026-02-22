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

          <button 
            onClick={handleSave}
            className="w-full py-5 bg-blue-900 text-white rounded-2xl font-black text-lg shadow-lg active:scale-95 transition-transform"
          >
            {t.save}
          </button>
        </div>
      </div>
    </div>
  );
}
