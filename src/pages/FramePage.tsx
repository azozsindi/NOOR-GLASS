/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useInventory } from '../useInventory';
import { translations } from '../i18n';
import { Scanner } from '../components/Scanner';
import { Barcode } from '../components/Barcode';

import { soundService } from '../services/soundService';

export function FramePage() {
  const { addItem, lang, config } = useInventory();
  const t = translations[lang];

  const [type, setType] = useState("MED");
  const [brand, setBrand] = useState(config.brands[0] || "");
  const [color, setColor] = useState(config.colors[0] || "");
  const [factoryCode, setFactoryCode] = useState("");
  const [cost, setCost] = useState("");
  const [sell, setSell] = useState("");
  const [qty, setQty] = useState(1);
  const [sku, setSku] = useState("");

  useEffect(() => {
    const cleanBrand = brand.replace(/\s/g, '').replace(/-/g, '');
    const cleanColor = color.replace(/\s/g, '').replace(/-/g, '');
    const cleanFactory = factoryCode.toUpperCase().replace(/\s/g, '').replace(/-/g, '');
    setSku(`${type}${cleanBrand}${cleanColor}${cleanFactory}`);
  }, [type, brand, color, factoryCode]);

  const handleSave = () => {
    soundService.playClick();
    addItem({
      sku,
      qty,
      type: 'frame',
      cost: cost || 0,
      sell: sell || 0
    });
    setQty(1);
    setCost("");
    setSell("");
    setFactoryCode("");
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <h2 className="text-lg font-bold text-emerald-700 dark:text-emerald-400 mb-4 border-r-4 border-emerald-700 pr-3">{t.glass_title}</h2>
        
        <Scanner onScan={setSku} label={t.open_scanner} />

        <div className="space-y-3">
          <label className="text-xs font-bold block">{t.frame_type_lbl}</label>
          <select 
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
          >
            <option value="MED">{t.type_med}</option>
            <option value="SUN">{t.type_sun}</option>
          </select>

          <label className="text-xs font-bold block">{t.brand}</label>
          <select 
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
          >
            {config.brands.map(b => <option key={b} value={b}>{b}</option>)}
          </select>

          <label className="text-xs font-bold block">{t.color}</label>
          <select 
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
          >
            {config.colors.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <label className="text-xs font-bold block">{t.factory_code_lbl}</label>
          <input 
            type="text" 
            value={factoryCode}
            onChange={(e) => setFactoryCode(e.target.value)}
            className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
          />

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
            className="w-full py-4 bg-emerald-700 text-white rounded-xl font-bold shadow-lg active:scale-95 transition-transform"
          >
            {t.save}
          </button>
        </div>
      </div>
    </div>
  );
}
