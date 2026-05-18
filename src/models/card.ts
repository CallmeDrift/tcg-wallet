export type Currency = 'USD' | 'COP';

export interface Card {
  id: string;
  name: string;
  expansion?: string;
  rarity?: string;
  quantity?: number;
  imageUri?: string;
  boughtPrice?: number;
  soldPrice?: number | null;
  currency?: Currency;
  createdAt?: number;
}
