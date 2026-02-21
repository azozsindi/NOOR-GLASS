/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useInventory } from '../useInventory';
import { translations } from '../i18n';
import { SignaturePad } from '../components/SignaturePad';
import * as XLSX from 'xlsx';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { Trash2, Send } from 'lucide-react';

export function RecordsPage() {
  const { inventory, updateQty, deleteItem, sendToSheet, lang } = useInventory();
  const t = translations[lang];

  const handleExportExcel = () => {
    if (inventory.length === 0) return;
    const data = inventory.map(item => ({
      "SKU": item.sku,
      "Quantity": item.qty,
      "Type": item.type,
      "Cost Price": item.cost || 0,
      "Selling Price": item.sell || 0,
      "Date": item.date
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventory");
    XLSX.writeFile(wb, "NoorGlass_Inventory.xlsx");
  };

  const handleDownloadPDF = () => {
    if (inventory.length === 0) return;
    
    const element = document.getElementById('print-area-hidden');
    if (!element) return;

    element.style.display = 'block';
    
    const opt = {
      margin: 0.5,
      filename: 'NoorGlass_Invoice.pdf',
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in' as const, format: 'letter' as const, orientation: 'portrait' as const }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      element.style.display = 'none';
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <h2 className="text-lg font-bold text-blue-800 dark:text-blue-400 mb-4 border-r-4 border-blue-800 pr-3">{t.inventory}</h2>
        
        <div className="space-y-3">
          {inventory.length === 0 ? (
            <div className="text-center py-10 text-slate-400">{t.empty}</div>
          ) : (
            inventory.map((item) => (
              <div key={item.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold">{item.sku}</div>
                    <div className="text-xs text-slate-500">{item.type === 'lens' ? 'عدسة' : 'فريم'}</div>
                    <div className="text-xs text-emerald-600 font-medium">
                      Cost: {item.cost} | Sell: {item.sell}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                    <button onClick={() => updateQty(item.id, -1)} className="w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-md">-</button>
                    <span className="font-bold w-6 text-center">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="w-8 h-8 flex items-center justify-center bg-blue-800 text-white rounded-md">+</button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => deleteItem(item.id)}
                    className="p-2 text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg"
                  >
                    <Trash2 size={18} />
                  </button>
                  <button 
                    onClick={() => sendToSheet(item.id)}
                    className="flex-1 py-2 bg-emerald-600 text-white rounded-lg font-bold flex items-center justify-center gap-2 text-sm"
                  >
                    <Send size={16} />
                    {t.send_to_sheet}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <h2 className="text-lg font-bold text-blue-800 dark:text-blue-400 mb-4 border-r-4 border-blue-800 pr-3">{t.sig_title}</h2>
        <SignaturePad />
        <div className="flex gap-3">
          <button 
            onClick={handleExportExcel}
            className="flex-1 py-3 bg-slate-800 text-white rounded-xl font-bold"
          >
            {t.export}
          </button>
          <button 
            onClick={handleDownloadPDF}
            className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold"
          >
            {t.print_pdf}
          </button>
        </div>
      </div>

      {/* Hidden area for PDF generation */}
      <div id="print-area-hidden" className="hidden p-10 bg-white text-black dir-rtl">
        <div className="text-center mb-10 border-b-2 border-black pb-5">
          <h1 className="text-3xl font-bold text-blue-900">NOOR GLASS INVENTORY</h1>
          <p className="text-sm mt-2">{new Date().toLocaleString()}</p>
        </div>
        <table className="w-full border-collapse border border-black">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-black p-2">SKU</th>
              <th className="border border-black p-2">Qty</th>
              <th className="border border-black p-2">Type</th>
              <th className="border border-black p-2">Cost</th>
              <th className="border border-black p-2">Sell</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map(item => (
              <tr key={item.id} className="text-center">
                <td className="border border-black p-2">{item.sku}</td>
                <td className="border border-black p-2">{item.qty}</td>
                <td className="border border-black p-2">{item.type}</td>
                <td className="border border-black p-2">{item.cost}</td>
                <td className="border border-black p-2">{item.sell}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-20 text-center">
          <div className="w-48 h-24 border-b border-black mx-auto mb-2"></div>
          <p className="font-bold">المعتمد / Authorized Signature</p>
        </div>
      </div>
    </div>
  );
}
