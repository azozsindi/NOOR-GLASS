/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useInventory } from '../useInventory';
import { translations } from '../i18n';
import * as XLSX from 'xlsx';
import { Trash2, Send, FileSpreadsheet, Search as SearchIcon, Printer } from 'lucide-react';

import { soundService } from '../services/soundService';

export function RecordsPage() {
  const { inventory, updateQty, deleteItem, sendToSheet, lang, config } = useInventory();
  const t = translations[lang];

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<'all' | 'lens' | 'frame'>('all');

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleExportExcel = () => {
    soundService.playClick();
    if (inventory.length === 0) return;
    const data = inventory.map(item => ({
      "SKU": item.sku,
      "Quantity": item.qty,
      "Type": item.type === 'lens' ? 'عدسة' : 'فريم',
      "Cost Price": item.cost || 0,
      "Selling Price": item.sell || 0,
      "Date": item.date
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventory");
    XLSX.writeFile(wb, `NoorGlass_Inventory_${new Date().toLocaleDateString()}.xlsx`);
  };

  const handlePrintLabel = (item: any) => {
    soundService.playClick();
    const printWindow = window.open('', '_blank', 'width=400,height=400');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <style>
            @page { size: 50mm 30mm; margin: 0; }
            body { font-family: sans-serif; text-align: center; padding: 5px; margin: 0; }
            .logo { font-weight: bold; font-size: 10px; margin-bottom: 2px; }
            .sku { font-family: monospace; font-size: 12px; font-weight: bold; margin: 2px 0; }
            .price { font-size: 10px; font-weight: bold; }
            .barcode { font-size: 8px; margin-top: 2px; }
          </style>
        </head>
        <body>
          <div class="logo">NOOR GLASS</div>
          <div class="sku">${item.sku}</div>
          <div class="price">Price: ${item.sell} SAR</div>
          <div class="barcode">||||||||||||||||||||||||||||||</div>
          <script>
            window.onload = () => {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <h2 className="text-lg font-bold text-blue-800 dark:text-blue-400 mb-4 border-s-4 border-blue-800 ps-3">{t.inventory}</h2>
        
        <div className="space-y-4">
          <div className="flex flex-col gap-3">
            <div className="relative">
              <SearchIcon className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder={t.search_placeholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full ps-10 pe-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-800"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'lens', 'frame'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                    filterType === type 
                      ? 'bg-blue-800 border-blue-800 text-white' 
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500'
                  }`}
                >
                  {type === 'all' ? t.filter_all : type === 'lens' ? t.filter_lens : t.filter_frame}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredInventory.length === 0 ? (
              <div className="text-center py-10 text-slate-400">{t.empty}</div>
            ) : (
              filteredInventory.map((item) => (
                <div key={item.id} className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="font-black text-slate-900 dark:text-white truncate text-base tracking-tight">{item.sku}</div>
                        {item.qty <= config.lowStockThreshold && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[8px] font-black rounded-full uppercase">
                            {t.low_stock_warn}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <span>{item.type === 'lens' ? t.filter_lens : t.filter_frame}</span>
                        <span>•</span>
                        <span className="text-emerald-600">Sell: {item.sell}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-1 rounded-xl border border-slate-100 dark:border-slate-800">
                      <button 
                        onClick={() => {
                          soundService.playClick();
                          updateQty(item.id, -1);
                        }} 
                        className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-800 rounded-lg shadow-sm active:scale-90 transition-transform"
                      >
                        -
                      </button>
                      <span className="font-black w-8 text-center text-lg">{item.qty}</span>
                      <button 
                        onClick={() => {
                          soundService.playClick();
                          updateQty(item.id, 1);
                        }} 
                        className="w-10 h-10 flex items-center justify-center bg-blue-900 text-white rounded-lg shadow-md active:scale-90 transition-transform"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        soundService.playClick();
                        deleteItem(item.id);
                      }}
                      className="w-12 h-12 flex items-center justify-center text-red-600 bg-red-50 dark:bg-red-900/20 rounded-xl active:scale-90 transition-transform"
                    >
                      <Trash2 size={20} />
                    </button>
                    <button 
                      onClick={() => handlePrintLabel(item)}
                      className="w-12 h-12 flex items-center justify-center text-slate-600 bg-slate-100 dark:bg-slate-700 rounded-xl active:scale-90 transition-transform"
                      title={t.print_label}
                    >
                      <Printer size={20} />
                    </button>
                    <button 
                      onClick={() => {
                        soundService.playClick();
                        sendToSheet(item.id);
                      }}
                      className="flex-1 h-12 bg-emerald-600 text-white rounded-xl font-black flex items-center justify-center gap-2 text-sm active:scale-95 transition-transform"
                    >
                      <Send size={18} />
                      {t.send_to_sheet}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex gap-3">
          <button 
            onClick={handleExportExcel}
            className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-2"
          >
            <FileSpreadsheet size={20} />
            {t.export}
          </button>
        </div>
      </div>
    </div>
  );
}
