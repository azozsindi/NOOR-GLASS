/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useInventory } from '../useInventory';
import { translations } from '../i18n';

import { soundService } from '../services/soundService';

export function AdminPage() {
  const { config, setConfig, lang, setLang, theme, setTheme, clearInventory, clearAuditLog } = useInventory();
  const t = translations[lang];

  const updateLensRange = (max: number, min: number) => {
    setConfig(prev => ({ ...prev, lensMax: max, lensMin: min }));
  };

  const updateCylRange = (max: number, min: number) => {
    setConfig(prev => ({ ...prev, cylMax: max, cylMin: min }));
  };

  const updateLowStockThreshold = (val: number) => {
    setConfig(prev => ({ ...prev, lowStockThreshold: val }));
  };

  const addItem = (key: 'brands' | 'colors', value: string) => {
    soundService.playClick();
    if (!value) return;
    const upper = value.toUpperCase().trim();
    if (!config[key].includes(upper)) {
      setConfig(prev => ({ ...prev, [key]: [...prev[key], upper] }));
    }
  };

  const removeItem = (key: 'brands' | 'colors', index: number) => {
    soundService.playClick();
    setConfig(prev => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== index)
    }));
  };

  const addLensType = (code: string, ar: string, en: string) => {
    soundService.playClick();
    if (!code || !ar) return;
    const upperCode = code.toUpperCase().trim();
    if (!config.lensTypes.find(l => l.value === upperCode)) {
      setConfig(prev => ({
        ...prev,
        lensTypes: [...prev.lensTypes, { value: upperCode, labelAr: ar, labelEn: en || ar }]
      }));
    }
  };

  const removeLensType = (index: number) => {
    soundService.playClick();
    setConfig(prev => ({
      ...prev,
      lensTypes: prev.lensTypes.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-4 pb-10">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <h2 className="text-lg font-bold text-blue-800 dark:text-blue-400 mb-4 border-s-4 border-blue-800 ps-3">{t.admin_general}</h2>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-slate-800">
            <span className="font-bold text-slate-900 dark:text-white">{t.mode_label}</span>
            <button 
              onClick={() => {
                soundService.playClick();
                setTheme(theme === 'light' ? 'dark' : 'light');
              }}
              className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-900 dark:text-white"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="font-bold text-slate-900 dark:text-white">{t.lang_label}</span>
            <button 
              onClick={() => {
                soundService.playClick();
                setLang(lang === 'ar' ? 'en' : 'ar');
              }}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold text-slate-900 dark:text-white"
            >
              {lang === 'ar' ? 'English' : 'العربية'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <h2 className="text-lg font-bold text-blue-800 dark:text-blue-400 mb-4 border-s-4 border-blue-800 ps-3">{t.admin_shop_info}</h2>
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500">{t.lbl_shop_name}</label>
            <input 
              type="text"
              value={config.shopName}
              onChange={(e) => setConfig(prev => ({ ...prev, shopName: e.target.value }))}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 text-slate-900 dark:text-white"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500">{t.lbl_shop_phone}</label>
            <input 
              type="text"
              value={config.shopPhone}
              onChange={(e) => setConfig(prev => ({ ...prev, shopPhone: e.target.value }))}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 text-slate-900 dark:text-white"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500">{t.lbl_currency}</label>
            <input 
              type="text"
              value={config.currency}
              onChange={(e) => setConfig(prev => ({ ...prev, currency: e.target.value }))}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <h2 className="text-lg font-bold text-blue-800 dark:text-blue-400 mb-4 border-s-4 border-blue-800 ps-3">{t.admin_system_settings}</h2>
        <div className="flex justify-between items-center">
          <span className="font-bold text-slate-900 dark:text-white">{t.lbl_enable_sound}</span>
          <button 
            onClick={() => setConfig(prev => ({ ...prev, enableSound: !prev.enableSound }))}
            className={`w-12 h-6 rounded-full transition-colors relative ${config.enableSound ? 'bg-blue-800' : 'bg-slate-300'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${config.enableSound ? 'right-1' : 'right-7'}`} />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <h2 className="text-lg font-bold text-blue-800 dark:text-blue-400 mb-4 border-s-4 border-blue-800 ps-3">{t.admin_barcode_settings}</h2>
        <div className="flex justify-between items-center">
          <span className="font-bold text-slate-900 dark:text-white">{t.lbl_barcode_text}</span>
          <button 
            onClick={() => setConfig(prev => ({ ...prev, barcodeDisplayValue: !prev.barcodeDisplayValue }))}
            className={`w-12 h-6 rounded-full transition-colors relative ${config.barcodeDisplayValue ? 'bg-blue-800' : 'bg-slate-300'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${config.barcodeDisplayValue ? 'right-1' : 'right-7'}`} />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <h2 className="text-lg font-bold text-blue-800 dark:text-blue-400 mb-4 border-s-4 border-blue-800 ps-3">{t.admin_lens_config}</h2>
        <p className="text-xs text-slate-500 mb-4">{t.lens_hint}</p>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-bold text-slate-900 dark:text-white">{t.lbl_max_pos}</label>
            <input 
              type="number" 
              defaultValue={config.lensMax}
              onBlur={(e) => updateLensRange(parseFloat(e.target.value), config.lensMin)}
              step="0.25"
              className="w-20 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 text-center text-slate-900 dark:text-white"
            />
          </div>
          <div className="flex justify-between items-center">
            <label className="text-sm font-bold text-slate-900 dark:text-white">{t.lbl_max_neg}</label>
            <input 
              type="number" 
              defaultValue={config.lensMin}
              onBlur={(e) => updateLensRange(config.lensMax, parseFloat(e.target.value))}
              step="0.25"
              className="w-20 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 text-center text-slate-900 dark:text-white"
            />
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800"></div>
          <div className="flex justify-between items-center">
            <label className="text-sm font-bold text-slate-900 dark:text-white">{t.lbl_cyl_max}</label>
            <input 
              type="number" 
              defaultValue={config.cylMax}
              onBlur={(e) => updateCylRange(parseFloat(e.target.value), config.cylMin)}
              step="0.25"
              className="w-20 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 text-center text-slate-900 dark:text-white"
            />
          </div>
          <div className="flex justify-between items-center">
            <label className="text-sm font-bold text-slate-900 dark:text-white">{t.lbl_cyl_min}</label>
            <input 
              type="number" 
              defaultValue={config.cylMin}
              onBlur={(e) => updateCylRange(config.cylMax, parseFloat(e.target.value))}
              step="0.25"
              className="w-20 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 text-center text-slate-900 dark:text-white"
            />
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800"></div>
          <div className="flex justify-between items-center">
            <label className="text-sm font-bold text-slate-900 dark:text-white">{t.lbl_low_stock}</label>
            <input 
              type="number" 
              defaultValue={config.lowStockThreshold}
              onBlur={(e) => updateLowStockThreshold(parseInt(e.target.value) || 0)}
              className="w-20 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 text-center text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <h2 className="text-lg font-bold text-blue-800 dark:text-blue-400 mb-4 border-s-4 border-blue-800 ps-3">{t.admin_lens_types}</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500">{t.lbl_lens_code}</label>
              <input id="lt-code" type="text" placeholder="BCG" className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500">{t.lbl_lens_ar}</label>
              <input id="lt-ar" type="text" placeholder="بلو كت" className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500">{t.lbl_lens_en}</label>
            <input id="lt-en" type="text" placeholder="Blue Cut" className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200" />
          </div>
          <button 
            onClick={() => {
              const code = document.getElementById('lt-code') as HTMLInputElement;
              const ar = document.getElementById('lt-ar') as HTMLInputElement;
              const en = document.getElementById('lt-en') as HTMLInputElement;
              addLensType(code.value, ar.value, en.value);
              code.value = ''; ar.value = ''; en.value = '';
            }}
            className="w-full py-3 bg-blue-800 text-white rounded-xl font-bold"
          >
            +
          </button>
          <div className="flex flex-wrap gap-2">
            {config.lensTypes.map((lt, i) => (
              <span key={i} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs flex items-center gap-2">
                <b>{lt.value}</b>: {lang === 'ar' ? lt.labelAr : lt.labelEn}
                <button onClick={() => removeLensType(i)} className="text-red-500 font-bold">×</button>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <h2 className="text-lg font-bold text-blue-800 dark:text-blue-400 mb-4 border-s-4 border-blue-800 ps-3">{t.audit_title}</h2>
        <div className="max-h-60 overflow-y-auto space-y-2 pe-2 custom-scrollbar">
          {(!config.auditLog || config.auditLog.length === 0) ? (
            <p className="text-center text-slate-400 py-4 text-xs">{t.audit_empty}</p>
          ) : (
            config.auditLog.map(log => (
              <div key={log.id} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-800 text-[10px]">
                <div className="flex justify-between font-bold text-blue-800 dark:text-blue-400">
                  <span>{log.userName}</span>
                  <span>{log.date}</span>
                </div>
                <div className="mt-1 text-slate-600 dark:text-slate-400">
                  <span className="font-bold mr-1">{log.action}:</span>
                  {log.details}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <h2 className="text-lg font-bold text-blue-800 dark:text-blue-400 mb-4 border-s-4 border-blue-800 ps-3">{t.admin_inv}</h2>
        
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-bold block">{t.m_brands}</label>
            <div className="flex gap-2">
              <input 
                id="brand-input"
                type="text" 
                placeholder="RAYBAN"
                className="flex-1 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 text-slate-900 dark:text-white"
              />
              <button 
                onClick={() => {
                  const input = document.getElementById('brand-input') as HTMLInputElement;
                  addItem('brands', input.value);
                  input.value = '';
                }}
                className="px-4 bg-blue-800 text-white rounded-lg font-bold"
              >
                +
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {config.brands.map((b, i) => (
                <span key={i} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs flex items-center gap-2">
                  {b}
                  <button onClick={() => removeItem('brands', i)} className="text-red-500 font-bold">×</button>
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold block">{t.m_colors}</label>
            <div className="flex gap-2">
              <input 
                id="color-input"
                type="text" 
                placeholder="GOLD"
                className="flex-1 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 text-slate-900 dark:text-white"
              />
              <button 
                onClick={() => {
                  const input = document.getElementById('color-input') as HTMLInputElement;
                  addItem('colors', input.value);
                  input.value = '';
                }}
                className="px-4 bg-blue-800 text-white rounded-lg font-bold"
              >
                +
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {config.colors.map((c, i) => (
                <span key={i} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs flex items-center gap-2">
                  {c}
                  <button onClick={() => removeItem('colors', i)} className="text-red-500 font-bold">×</button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-2xl shadow-sm border border-red-100 dark:border-red-900/30">
        <h2 className="text-lg font-bold text-red-800 dark:text-red-400 mb-4 border-s-4 border-red-800 ps-3">{t.admin_danger}</h2>
        <div className="space-y-3">
          <button 
            onClick={clearInventory}
            className="w-full py-4 bg-white dark:bg-slate-900 text-red-600 rounded-xl font-black border border-red-200 dark:border-red-900/50 shadow-sm active:scale-95 transition-transform"
          >
            {t.btn_clear_inv}
          </button>
          <button 
            onClick={clearAuditLog}
            className="w-full py-4 bg-white dark:bg-slate-900 text-red-600 rounded-xl font-black border border-red-200 dark:border-red-900/50 shadow-sm active:scale-95 transition-transform"
          >
            {t.btn_clear_logs}
          </button>
        </div>
      </div>
    </div>
  );
}
