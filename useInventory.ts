/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { InventoryItem, AppConfig, DEFAULT_CONFIG, SHEET_URL } from './types';

export function useInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem("noor_glass_v2026_final");
    return saved ? JSON.parse(saved) : [];
  });

  const [config, setConfig] = useState<AppConfig>(() => {
    const saved = localStorage.getItem("noor_config");
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  });

  const [lang, setLang] = useState<'ar' | 'en'>(() => {
    const saved = localStorage.getItem("noor_lang");
    return (saved as 'ar' | 'en') || 'ar';
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem("noor_theme");
    return (saved as 'light' | 'dark') || 'light';
  });

  const [notes, setNotes] = useState(() => localStorage.getItem('noor_notes') || "");

  useEffect(() => {
    localStorage.setItem("noor_glass_v2026_final", JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem("noor_config", JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem("noor_lang", lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    localStorage.setItem("noor_theme", theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('noor_notes', notes);
  }, [notes]);

  const addItem = (item: Omit<InventoryItem, 'id' | 'date'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: Date.now(),
      date: new Date().toLocaleString()
    };
    setInventory(prev => [newItem, ...prev]);
  };

  const deleteItem = (id: number) => {
    setInventory(prev => prev.filter(item => item.id !== id));
  };

  const updateQty = (id: number, delta: number) => {
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.qty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const sendToSheet = async (id: number) => {
    const item = inventory.find(i => i.id === id);
    if (!item) return false;

    try {
      await fetch(SHEET_URL, {
        method: "POST",
        mode: 'no-cors',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku: item.sku,
          qty: item.qty,
          type: item.type,
          cost: item.cost || 0,
          sell: item.sell || 0,
          date: item.date
        })
      });
      deleteItem(id);
      return true;
    } catch (error) {
      console.error("Error sending to sheet:", error);
      return false;
    }
  };

  return {
    inventory,
    config,
    setConfig,
    lang,
    setLang,
    theme,
    setTheme,
    notes,
    setNotes,
    addItem,
    deleteItem,
    updateQty,
    sendToSheet
  };
}
