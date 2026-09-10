import type { CollectionCard, CollectionSummary } from '../types/card';

export const HIT_PRICE_THRESHOLD = 3;

export const isHit = (card: CollectionCard) => card.marketPrice > HIT_PRICE_THRESHOLD;

export function getCollectionSummary(cards: CollectionCard[]): CollectionSummary {
  return cards.reduce<CollectionSummary>(
    (summary, card) => ({
      uniqueCards: summary.uniqueCards + 1,
      totalCards: summary.totalCards + card.quantity,
      totalValue: summary.totalValue + card.marketPrice * card.quantity,
      totalInvested: summary.totalInvested + (card.purchasePrice ?? 0) * card.quantity,
    }),
    { uniqueCards: 0, totalCards: 0, totalValue: 0, totalInvested: 0 },
  );
}

export const formatUsd = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
