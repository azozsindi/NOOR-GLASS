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

export interface AppConfig {
  brands: string[];
  colors: string[];
  lensMax: number;
  lensMin: number;
}

export const DEFAULT_CONFIG: AppConfig = {
  brands: ["RAY-BAN", "GUCCI", "PRADA", "TOM FORD"],
  colors: ["BLACK", "GOLD", "SILVER", "BROWN"],
  lensMax: 6.00,
  lensMin: -6.00
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

export const SHEET_URL = "https://script.google.com/macros/s/AKfycbxHv3Cjs3TT8HEAb3o5iu5MtpdJyIh9yboOP-bKM9AP2WIfPwbEO8wGAWtg5Skwe-nEbg/exec";
