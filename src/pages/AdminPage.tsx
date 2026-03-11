/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useInventory } from '../useInventory';
import { translations } from '../i18n';
import { Send, Upload, Printer, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import { InventoryItem } from '../types';
import JsBarcode from 'jsbarcode';
import * as XLSX from 'xlsx';

import { soundService } from '../services/soundService';

export function AdminPage() {
  const { inventory, config, setConfig, lang, setLang, theme, setTheme, clearInventory, clearAuditLog, sendAllToSheet, bulkAddItems } = useInventory();
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

  const handleBulkImport = () => {
    const textarea = document.getElementById('bulk-import-area') as HTMLTextAreaElement;
    const data = textarea.value.trim();
    if (!data) return;

    try {
      const lines = data.split('\n').filter(l => l.trim().length > 0);
      if (lines.length < 3) throw new Error("Invalid format");

      // Row 3 (index 2) is CYL headers
      const cylHeaders = lines[2].split(';').map(h => h.trim()).filter(h => h !== '');
      // Remove the first element if it's '0' or empty (it's the SPH column header)
      if (cylHeaders[0] === '0' || cylHeaders[0] === '') cylHeaders.shift();

      const newItems: Omit<InventoryItem, 'id' | 'date'>[] = [];

      // Rows from index 3 are SPH and quantities
      for (let i = 3; i < lines.length; i++) {
        const parts = lines[i].split(';').map(p => p.trim());
        const sph = parts[0];
        if (!sph || sph === '') continue;

        for (let j = 1; j < parts.length; j++) {
          const qty = parseInt(parts[j]);
          if (isNaN(qty) || qty <= 0) continue;

          const cyl = cylHeaders[j - 1];
          if (!cyl) continue;

          // Generate SKU using the same logic as LensPage
          const sphClean = sph.replace(/[+\-.]/g, '').padStart(4, '0');
          const cylClean = cyl.replace(/[+\-.]/g, '').padStart(4, '0');
          const sphSign = sph.includes('-') ? "M" : "P";
          
          // Default to BCG (Blue Cut Green) or first available type
          const baseCode = config.lensTypes[0]?.value || "BCG";
          const sku = `${baseCode}${sphSign} ${sphClean} ${cylClean}`;

          newItems.push({
            sku,
            qty,
            type: 'lens',
            cost: 0,
            sell: 0
          });
        }
      }

      if (newItems.length > 0) {
        bulkAddItems(newItems);
        textarea.value = '';
      } else {
        toast.error(t.import_error);
      }
    } catch (e) {
      console.error(e);
      toast.error(t.import_error);
    }
  };

  const printAllBarcodes = () => {
    soundService.playClick();
    if (inventory.length === 0) {
      toast.error(t.audit_empty);
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <html>
        <head>
          <title>Barcodes - ${config.shopName}</title>
          <style>
            @page { size: 30mm 10mm; margin: 0; }
            body { 
              font-family: sans-serif; 
              margin: 0; 
              padding: 0;
              background: white;
            }
            .label {
              width: 30mm;
              height: 10mm;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              page-break-after: always;
              overflow: hidden;
            }
            .sku { 
              font-size: 8px; 
              font-weight: bold; 
              margin-top: 1px;
              font-family: monospace;
            }
            svg {
              width: 28mm;
              height: 7mm;
            }
          </style>
        </head>
        <body>
          <div id="labels-container"></div>
          <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
          <script>
            const items = ${JSON.stringify(inventory)};
            const container = document.getElementById('labels-container');
            
            items.forEach(item => {
              for (let k = 0; k < item.qty; k++) {
                const div = document.createElement('div');
                div.className = 'label';
                
                const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                const uniqueId = 'barcode-' + item.id + '-' + k;
                svg.id = uniqueId;
                
                const skuDiv = document.createElement('div');
                skuDiv.className = 'sku';
                skuDiv.innerText = item.sku;
                
                div.appendChild(svg);
                div.appendChild(skuDiv);
                container.appendChild(div);
                
                JsBarcode(svg, item.sku, {
                  format: "CODE128",
                  width: 1.0,
                  height: 25,
                  displayValue: false,
                  margin: 0
                });
              }
            });
            
            window.onload = () => {
              setTimeout(() => {
                window.print();
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const exportToExcel = () => {
    soundService.playClick();
    if (inventory.length === 0) {
      toast.error(t.audit_empty);
      return;
    }

    const data = inventory.map(item => ({
      SKU: item.sku,
      Quantity: item.qty,
      Type: item.type,
      Cost: item.cost,
      Sell: item.sell,
      Date: item.date
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventory");
    XLSX.writeFile(wb, `Inventory_${new Date().toLocaleDateString()}.xlsx`);
    toast.success("Excel file downloaded");
  };

  const loadSampleData = () => {
    const sample = `;??????? ?????? - -;;;;;;;;;;;;;;;;;;;;;;;;;
;;;;;;;;;;;;;;;;;;;;;;;;;;
0;0.00;-0.25;-0.50;-0.75;-1.00;-1.25;-1.50;-1.75;-2.00;-2.25;-2.50;-2.75;-3.00;-3.25;-3.50;-3.75;-4.00;-4.25;-4.50;-4.75;-5.00;-5.25;-5.50;-5.75;-6.00;
0.00;0;39;0;0;0;8;19;19;0;33;40;41;35;8;35;0;0;0;0;0;0;0;0;0;0;
-0.25;19;16;6;18;0;0;0;5;11;0;39;0;0;8;8;0;0;0;0;0;0;0;0;0;0;
-0.50;1;45;0;12;0;6;4;13;6;20;15;37;45;0;8;0;0;0;0;0;0;0;0;0;0;
-0.75;0;9;0;0;0;0;17;8;5;18;10;49;36;10;4;0;0;0;0;0;0;0;0;0;0;
-1.00;2;28;0;0;0;17;19;15;10;25;37;8;0;6;1;0;30;0;0;0;0;0;0;0;0;
-1.25;20;11;0;0;0;9;9;6;0;40;40;10;0;20;10;0;30;0;0;0;0;0;0;0;0;
-1.50;0;4;3;0;0;17;9;3;9;20;17;0;20;20;9;0;30;0;0;0;0;0;0;0;0;
-1.75;24;8;0;0;13;0;14;0;14;0;38;20;15;20;0;0;30;0;0;0;0;0;0;0;0;
-2.00;25;14;0;0;15;16;14;0;12;0;40;20;20;19;2;0;0;0;0;0;0;0;0;0;0;
-2.25;34;19;6;0;20;20;9;0;0;20;25;9;48;10;10;0;0;0;0;0;0;0;0;0;0;
-2.50;0;8;4;0;0;15;11;0;0;0;25;0;60;0;17;0;0;0;0;0;0;0;0;0;0;
-2.75;14;6;5;0;17;9;18;15;0;18;26;9;27;10;7;0;0;0;0;0;0;0;0;0;0;
-3.00;5;17;4;0;16;22;0;7;7;18;0;40;19;24;39;0;0;0;0;0;0;0;0;0;0;
-3.25;9;17;0;0;0;15;19;4;7;13;0;20;15;0;7;0;28;0;0;0;0;0;0;0;0;
-3.50;17;19;1;0;0;19;16;17;0;11;18;0;30;9;10;0;8;0;0;0;0;0;0;0;0;
-3.75;18;23;0;0;0;19;0;21;0;14;30;0;30;0;10;0;20;0;0;0;0;0;0;0;0;
-4.00;8;27;5;0;5;15;0;5;11;30;30;9;0;9;30;0;10;0;0;0;0;0;0;0;0;
-4.25;19;20;3;0;0;8;1;0;7;13;10;10;0;3;0;0;8;0;0;0;0;0;0;0;0;
-4.50;18;10;8;0;18;11;0;10;10;10;0;20;0;4;0;0;0;0;0;0;0;0;0;0;0;
-4.75;12;10;8;0;19;11;7;10;10;10;0;0;0;7;0;0;10;0;0;0;0;0;0;0;0;
-5.00;7;16;6;0;11;3;6;0;6;20;0;0;0;5;0;0;6;0;0;0;0;0;0;0;0;
-5.25;10;0;10;0;11;0;9;10;4;8;0;0;0;7;0;0;9;0;0;0;0;0;0;0;0;
-5.50;10;10;10;0;7;0;0;12;5;7;0;0;0;7;0;0;20;0;0;0;0;0;0;0;0;
-5.75;0;9;0;0;9;0;0;0;9;12;0;0;0;0;0;0;10;0;0;0;0;0;0;0;0;
-6.00;0;10;0;0;0;0;4;0;10;20;20;0;0;0;0;0;0;0;0;0;0;0;0;0;0;`;
    const textarea = document.getElementById('bulk-import-area') as HTMLTextAreaElement;
    if (textarea) {
      textarea.value = sample;
      toast.info(lang === 'ar' ? "تم تجهيز البيانات، اضغط 'بدء الاستيراد'" : "Data ready, click 'Import Data'");
    }
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

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <h2 className="text-lg font-bold text-blue-800 dark:text-blue-400 mb-4 border-s-4 border-blue-800 ps-3">{t.admin_bulk_import}</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-500">{t.admin_bulk_import}</label>
            <button 
              onClick={loadSampleData}
              className="text-[10px] px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 text-blue-800 font-bold"
            >
              {t.btn_load_sample}
            </button>
          </div>
          <textarea 
            id="bulk-import-area"
            placeholder={t.import_placeholder}
            className="w-full h-32 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 text-xs font-mono"
          />
          <button 
            onClick={handleBulkImport}
            className="w-full py-3 bg-blue-800 text-white rounded-xl font-bold flex items-center justify-center gap-2"
          >
            <Upload size={18} />
            {t.btn_import}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <h2 className="text-lg font-bold text-blue-800 dark:text-blue-400 mb-4 border-s-4 border-blue-800 ps-3">{lang === 'ar' ? "عمليات جماعية" : "Bulk Actions"}</h2>
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={printAllBarcodes}
            className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 active:scale-95 transition-transform"
          >
            <Printer size={24} className="text-blue-800 mb-2" />
            <span className="text-xs font-bold">{t.btn_print_all}</span>
          </button>
          <button 
            onClick={exportToExcel}
            className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 active:scale-95 transition-transform"
          >
            <FileSpreadsheet size={24} className="text-emerald-600 mb-2" />
            <span className="text-xs font-bold">{lang === 'ar' ? "تصدير إكسيل" : "Export Excel"}</span>
          </button>
        </div>
      </div>

      <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-2xl shadow-sm border border-red-100 dark:border-red-900/30">
        <h2 className="text-lg font-bold text-red-800 dark:text-red-400 mb-4 border-s-4 border-red-800 ps-3">{t.admin_danger}</h2>
        <div className="space-y-3">
          <button 
            onClick={sendAllToSheet}
            disabled={inventory.length === 0}
            className={`w-full py-4 text-white rounded-xl font-black shadow-sm active:scale-95 transition-transform flex items-center justify-center gap-2 ${inventory.length === 0 ? 'bg-slate-400 opacity-50 cursor-not-allowed' : 'bg-emerald-600'}`}
          >
            <Send size={20} />
            {t.btn_send_all}
          </button>
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
