/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useInventory } from '../useInventory';
import { translations } from '../i18n';

export function HomePage() {
  const { lang } = useInventory();
  const t = translations[lang];

  const lastVisit = localStorage.getItem("noor_last_visit_time") || "First Visit";
  const loginTime = new Date().toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 text-center space-y-4">
        <img src="logo.png" alt="Logo" className="w-24 h-24 mx-auto mb-2" />
        <h1 className="text-2xl font-black text-blue-900 dark:text-blue-400 tracking-tight">NOOR GLASS</h1>
        <p className="text-slate-500 font-medium">{new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        
        <div className="grid grid-cols-1 gap-3 mt-6">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <span className="text-slate-500 font-bold text-sm">🟢 {t.current_login}</span>
            <span className="font-mono font-bold text-emerald-600">{loginTime}</span>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <span className="text-slate-500 font-bold text-sm">🔴 {t.last_visit}</span>
            <span className="font-mono font-bold text-red-600">{lastVisit}</span>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-400">Developed with <span className="text-pink-500 animate-pulse">❤️</span> by <b>Abdulaziz Sindi</b></p>
          <p className="text-[10px] text-slate-300 mt-1">© 2026 NOOR GLASS System</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <h2 className="text-lg font-bold text-blue-800 dark:text-blue-400 mb-4 border-r-4 border-blue-800 pr-3">{t.u_title}</h2>
        <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: t.updates_html }} />
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <h2 className="text-lg font-bold text-blue-800 dark:text-blue-400 mb-4 border-r-4 border-blue-800 pr-3">{t.contact_us}</h2>
        <div className="grid grid-cols-2 gap-3">
          <a href="tel:0547002821" className="p-4 bg-blue-900 text-white rounded-xl text-center font-bold">Call</a>
          <a href="https://wa.me/966547002821" className="p-4 bg-emerald-600 text-white rounded-xl text-center font-bold">WhatsApp</a>
          <a href="https://docs.google.com/spreadsheets/d/1EMk7X4k60cguwVm2Jvks8WoIB7J9uEyvkcPdSqZwWlY/edit?usp=sharing" target="_blank" className="col-span-2 p-4 bg-emerald-800 text-white rounded-xl text-center font-bold">Google Sheet</a>
        </div>
      </div>
    </div>
  );
}
