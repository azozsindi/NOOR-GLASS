// src/types.ts
export const SHEET_URL = "https://script.google.com/macros/s/AKfycbwMhbtLbSPiWEipTi4fy3w5upZG-W_Ix6DFtR1oKL74uwjfSWglB1tg7qiBT_5NI1B_cA/exec";
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
