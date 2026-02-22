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

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <h2 className="text-lg font-bold text-blue-800 dark:text-blue-400 mb-4 border-s-4 border-blue-800 ps-3">{t.admin_general}</h2>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-slate-800">
            <span className="font-bold">{t.mode_label}</span>
            <button 
              onClick={() => {
                soundService.playClick();
                setTheme(theme === 'light' ? 'dark' : 'light');
              }}
              className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="font-bold">{t.lang_label}</span>
            <button 
              onClick={() => {
                soundService.playClick();
                setLang(lang === 'ar' ? 'en' : 'ar');
              }}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold"
            >
              {lang === 'ar' ? 'English' : 'العربية'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <h2 className="text-lg font-bold text-blue-800 dark:text-blue-400 mb-4 border-s-4 border-blue-800 ps-3">{t.admin_lens_config}</h2>
        <p className="text-xs text-slate-500 mb-4">{t.lens_hint}</p>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-bold">{t.lbl_max_pos}</label>
            <input 
              type="number" 
              defaultValue={config.lensMax}
              onBlur={(e) => updateLensRange(parseFloat(e.target.value), config.lensMin)}
              step="0.25"
              className="w-20 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 text-center"
            />
          </div>
          <div className="flex justify-between items-center">
            <label className="text-sm font-bold">{t.lbl_max_neg}</label>
            <input 
              type="number" 
              defaultValue={config.lensMin}
              onBlur={(e) => updateLensRange(config.lensMax, parseFloat(e.target.value))}
              step="0.25"
              className="w-20 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 text-center"
            />
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800"></div>
          <div className="flex justify-between items-center">
            <label className="text-sm font-bold">{t.lbl_cyl_max}</label>
            <input 
              type="number" 
              defaultValue={config.cylMax}
              onBlur={(e) => updateCylRange(parseFloat(e.target.value), config.cylMin)}
              step="0.25"
              className="w-20 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 text-center"
            />
          </div>
          <div className="flex justify-between items-center">
            <label className="text-sm font-bold">{t.lbl_cyl_min}</label>
            <input 
              type="number" 
              defaultValue={config.cylMin}
              onBlur={(e) => updateCylRange(config.cylMax, parseFloat(e.target.value))}
              step="0.25"
              className="w-20 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 text-center"
            />
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800"></div>
          <div className="flex justify-between items-center">
            <label className="text-sm font-bold">{t.lbl_low_stock}</label>
            <input 
              type="number" 
              defaultValue={config.lowStockThreshold}
              onBlur={(e) => updateLowStockThreshold(parseInt(e.target.value) || 0)}
              className="w-20 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 text-center"
            />
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
                className="flex-1 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200"
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
                className="flex-1 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200"
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
