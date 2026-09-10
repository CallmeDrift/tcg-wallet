export type Currency = 'USD' | 'COP';

/** A card in the user's collection, regardless of whether it came from Collectr or was added manually. */
export interface CollectionCard {
  id: string;
  name: string;
  setName?: string | null;
  cardNumber?: string | null;
  rarity?: string | null;
  condition?: string | null;
  quantity: number;
  imageUrl?: string | null;
  marketPrice: number;
  purchasePrice?: number | null;
  priceChangePercent?: number | null;
  currency: Currency;
  source: 'collectr' | 'manual';
  updatedAt: number;
}

export interface CollectionSummary {
  uniqueCards: number;
  totalCards: number;
  totalValue: number;
  totalInvested: number;
}

export interface SyncResult {
  imported: number;
  syncedAt: number;
}
