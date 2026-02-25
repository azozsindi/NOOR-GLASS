/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ItemType = 'lens' | 'frame';

export interface InventoryItem {
  id: number;
  sku: string;
  qty: number;
  type: ItemType;
  cost: string | number;
  sell: string | number;
  date: string;
}

export interface AuditEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  date: string;
}

export interface LensTypeConfig {
  value: string;
  labelAr: string;
  labelEn: string;
}

export interface AppConfig {
  brands: string[];
  colors: string[];
  lensMax: number;
  lensMin: number;
  cylMax: number;
  cylMin: number;
  lowStockThreshold: number;
  auditLog: AuditEntry[];
  shopName: string;
  shopPhone: string;
  currency: string;
  enableSound: boolean;
  barcodeDisplayValue: boolean;
  lensTypes: LensTypeConfig[];
}

export const DEFAULT_CONFIG: AppConfig = {
  brands: ["RAY-BAN", "GUCCI", "PRADA", "TOM FORD"],
  colors: ["BLACK", "GOLD", "SILVER", "BROWN"],
  lensMax: 6.00,
  lensMin: -6.00,
  cylMax: 0.00,
  cylMin: -6.00,
  lowStockThreshold: 2,
  auditLog: [],
  shopName: "NOOR GLASS",
  shopPhone: "",
  currency: "SAR",
  enableSound: true,
  barcodeDisplayValue: false,
  lensTypes: [
    { value: "BCG", labelAr: "بلو كت أخضر", labelEn: "Blue Cut Green" },
    { value: "BCB", labelAr: "بلو كت أزرق", labelEn: "Blue Cut Blue" },
    { value: "PGX", labelAr: "فوتوكروميك", labelEn: "Photochromic" },
    { value: "PLY", labelAr: "بولي كربونايت", labelEn: "Polycarbonate" },
    { value: "MCC", labelAr: "عاكس", labelEn: "Anti-Reflection" },
    { value: "UCC", labelAr: "عدسة بيضاء", labelEn: "White Lens" },
  ],
};

export const SHEET_URL = "https://script.google.com/macros/s/AKfycbwMhbtLbSPiWEipTi4fy3w5upZG-W_Ix6DFtR1oKL74uwjfSWglB1tg7qiBT_5NI1B_cA/exec";
