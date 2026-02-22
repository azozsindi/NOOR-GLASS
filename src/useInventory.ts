/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { InventoryItem, AppConfig, DEFAULT_CONFIG, SHEET_URL, AuditEntry, Staff } from './types';

export function useInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem("noor_glass_v2026_final");
    return saved ? JSON.parse(saved) : [];
  });

  const [config, setConfig] = useState<AppConfig>(() => {
    const saved = localStorage.getItem("noor_config");
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_CONFIG, ...parsed };
    }
    return DEFAULT_CONFIG;
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

  const addAuditEntry = (action: string, details: string) => {
    const userStr = localStorage.getItem('noor_user');
    const user: Staff | null = userStr ? JSON.parse(userStr) : null;
    
    const entry: AuditEntry = {
      id: Date.now().toString(),
      userId: user?.id || 'unknown',
      userName: user?.name || 'Unknown',
      action,
      details,
      date: new Date().toLocaleString()
    };

    setConfig(prev => ({
      ...prev,
      auditLog: [entry, ...(prev.auditLog || [])].slice(0, 100) // Keep last 100 logs
    }));
  };

  const addItem = (item: Omit<InventoryItem, 'id' | 'date'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: Date.now(),
      date: new Date().toLocaleString()
    };
    setInventory(prev => [newItem, ...prev]);
    addAuditEntry('ADD_ITEM', `Added ${item.type}: ${item.sku} (Qty: ${item.qty})`);
  };

  const deleteItem = (id: number) => {
    const item = inventory.find(i => i.id === id);
    if (item) {
      setInventory(prev => prev.filter(i => i.id !== id));
      addAuditEntry('DELETE_ITEM', `Deleted ${item.sku}`);
    }
  };

  const updateQty = (id: number, delta: number) => {
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.qty + delta);
        if (newQty !== item.qty) {
          addAuditEntry('UPDATE_QTY', `Updated ${item.sku} qty from ${item.qty} to ${newQty}`);
        }
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
      addAuditEntry('SEND_TO_SHEET', `Sent ${item.sku} to cloud`);
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
