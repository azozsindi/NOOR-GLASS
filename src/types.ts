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

export interface AppConfig {
  brands: string[];
  colors: string[];
  lensMax: number;
  lensMin: number;
  cylMax: number;
  cylMin: number;
  lowStockThreshold: number;
  auditLog: AuditEntry[];
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
};

export const LENS_TYPES = [
  { value: "BCG", sign: "P", label: "BCG (P) Blue Cut Green" },
  { value: "BCG", sign: "M", label: "BCG (M) Blue Cut Green" },
  { value: "BCB", sign: "P", label: "BCB (P) Blue Cut Blue" },
  { value: "BCB", sign: "M", label: "BCB (M) Blue Cut Blue" },
  { value: "PGX", sign: "P", label: "PGX (P) Photochromic" },
  { value: "PGX", sign: "M", label: "PGX (M) Photochromic" },
  { value: "PLY", sign: "P", label: "PLY (P) Polycarbonate" },
  { value: "PLY", sign: "M", label: "PLY (M) Polycarbonate" },
  { value: "MCC", sign: "P", label: "MCC (P) Anti-Reflection" },
  { value: "MCC", sign: "M", label: "MCC (M) Anti-Reflection" },
  { value: "UCC", sign: "P", label: "UCC (P) White Lens" },
  { value: "UCC", sign: "M", label: "UCC (M) White Lens" },
];

export const SHEET_URL = "https://script.google.com/macros/s/AKfycbwMhbtLbSPiWEipTi4fy3w5upZG-W_Ix6DFtR1oKL74uwjfSWglB1tg7qiBT_5NI1B_cA/exec";
