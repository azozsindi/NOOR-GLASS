/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useInventory } from '../useInventory';
import { translations } from '../i18n';

import { soundService } from '../services/soundService';
import { Staff, UserRole } from '../types';

interface AdminPageProps {
  onLogout: () => void;
}

export function AdminPage({ onLogout }: AdminPageProps) {
  const { config, setConfig, lang, setLang, theme, setTheme } = useInventory();
  const t = translations[lang];

  const updateLensRange = (max: number, min: number) => {
    setConfig(prev => ({ ...prev, lensMax: max, lensMin: min }));
  };

  const updateCylRange = (max: number, min: number) => {
    setConfig(prev => ({ ...prev, cylMax: max, cylMin: min }));
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

  const addStaff = () => {
    soundService.playClick();
    const nameInput = document.getElementById('staff-name') as HTMLInputElement;
    const passInput = document.getElementById('staff-pass') as HTMLInputElement;
    const roleInput = document.getElementById('staff-role') as HTMLSelectElement;

    if (!nameInput.value || !passInput.value) return;

    const newStaff: Staff = {
      id: Date.now().toString(),
      name: nameInput.value,
      password: passInput.value,
      role: roleInput.value as UserRole,
      permissions: roleInput.value === 'admin' ? ['all'] : ['add_lens', 'add_frame', 'view_records']
    };

    setConfig(prev => ({
      ...prev,
      staff: [...prev.staff, newStaff]
    }));

    nameInput.value = '';
    passInput.value = '';
  };

  const removeStaff = (id: string) => {
    soundService.playClick();
    if (config.staff.length <= 1) return; // Prevent deleting last user
    setConfig(prev => ({
      ...prev,
      staff: prev.staff.filter(s => s.id !== id)
    }));
  };

  const togglePermission = (staffId: string, perm: string) => {
    soundService.playClick();
    setConfig(prev => ({
      ...prev,
      staff: prev.staff.map(s => {
        if (s.id !== staffId) return s;
        const hasPerm = s.permissions.includes(perm);
        return {
          ...s,
          permissions: hasPerm 
            ? s.permissions.filter(p => p !== perm)
            : [...s.permissions, perm]
        };
      })
    }));
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <h2 className="text-lg font-bold text-blue-800 dark:text-blue-400 mb-4 border-r-4 border-blue-800 pr-3">{t.admin_general}</h2>
        
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
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <button 
              onClick={onLogout}
              className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-bold border border-red-100"
            >
              تسجيل الخروج
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <h2 className="text-lg font-bold text-blue-800 dark:text-blue-400 mb-4 border-r-4 border-blue-800 pr-3">{t.admin_staff}</h2>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <input id="staff-name" type="text" placeholder={t.staff_name} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 text-sm" />
            <input id="staff-pass" type="text" placeholder={t.staff_pass} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 text-sm" />
          </div>
          <select id="staff-role" className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 text-sm">
            <option value="staff">{t.role_staff}</option>
            <option value="admin">{t.role_admin}</option>
          </select>
          <button onClick={addStaff} className="w-full py-2 bg-blue-800 text-white rounded-lg font-bold text-sm">
            {t.add_staff}
          </button>

          <div className="space-y-3 pt-4">
            {config.staff.map(s => (
              <div key={s.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold">{s.name} ({s.role})</span>
                  <button onClick={() => removeStaff(s.id)} className="text-red-500 text-xs font-bold">حذف</button>
                </div>
                {s.role === 'staff' && (
                  <div className="flex flex-wrap gap-2">
                    {['add_lens', 'add_frame', 'view_records', 'admin_access'].map(p => (
                      <button
                        key={p}
                        onClick={() => togglePermission(s.id, p)}
                        className={`px-2 py-1 rounded-md text-[10px] font-bold border ${
                          s.permissions.includes(p) 
                            ? 'bg-emerald-100 border-emerald-200 text-emerald-700' 
                            : 'bg-slate-100 border-slate-200 text-slate-400'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <h2 className="text-lg font-bold text-blue-800 dark:text-blue-400 mb-4 border-r-4 border-blue-800 pr-3">{t.admin_lens_config}</h2>
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
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <h2 className="text-lg font-bold text-blue-800 dark:text-blue-400 mb-4 border-r-4 border-blue-800 pr-3">{t.admin_inv}</h2>
        
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
    </div>
  );
}
