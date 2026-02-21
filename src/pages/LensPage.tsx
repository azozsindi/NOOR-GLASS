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
  for (let i = 0; i >= -6.00; i -= 0.25) {
    cylOptions.push(i.toFixed(2));
  }

  useEffect(() => {
    const sphClean = sph.replace(/[+\-.]/g, '').padStart(4, '0');
    const cylClean = cyl.replace(/[+\-.]/g, '').padStart(4, '0');
    setSku(`${type}${sign}${sphClean}${cylClean}`);
  }, [type, sign, sph, cyl]);

  const handleSave = () => {
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
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <h2 className="text-lg font-bold text-blue-800 dark:text-blue-400 mb-4 border-r-4 border-blue-800 pr-3">{t.add_item}</h2>
        
        <Scanner onScan={setSku} label={t.open_scanner} />

        <div className="space-y-3">
          <select 
            value={`${type}|${sign}`}
            onChange={(e) => {
              const [v, s] = e.target.value.split('|');
              setType(v);
              setSign(s);
            }}
            className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
          >
            {LENS_TYPES.map((lt, i) => (
              <option key={i} value={`${lt.value}|${lt.sign}`}>{lt.label}</option>
            ))}
          </select>

          <div className="flex gap-3">
            <select 
              value={sph}
              onChange={(e) => setSph(e.target.value)}
              className="flex-1 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
            >
              {sphOptions.map(opt => <option key={opt} value={opt}>SPH {opt}</option>)}
            </select>
            <select 
              value={cyl}
              onChange={(e) => setCyl(e.target.value)}
              className="flex-1 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
            >
              {cylOptions.map(opt => <option key={opt} value={opt}>CYL {opt}</option>)}
            </select>
          </div>

          <div className="bg-white p-4 rounded-xl border border-dashed border-slate-300 text-center space-y-2">
            <div className="font-mono font-bold text-red-600 text-xl break-all">{sku}</div>
            <Barcode value={sku} />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-bold block mb-1">{t.lbl_cost}</label>
              <input 
                type="number" 
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="0.00"
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-bold block mb-1">{t.lbl_sell}</label>
              <input 
                type="number" 
                value={sell}
                onChange={(e) => setSell(e.target.value)}
                placeholder="0.00"
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          <input 
            type="number" 
            value={qty}
            onChange={(e) => setQty(parseInt(e.target.value) || 1)}
            min="1"
            className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
          />

          <button 
            onClick={handleSave}
            className="w-full py-4 bg-blue-800 text-white rounded-xl font-bold shadow-lg active:scale-95 transition-transform"
          >
            {t.save}
          </button>
        </div>
      </div>
    </div>
  );
}
