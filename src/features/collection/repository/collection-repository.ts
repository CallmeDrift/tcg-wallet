import * as SQLite from 'expo-sqlite';

import type { CollectionCard } from '../types/card';

const database = SQLite.openDatabaseAsync('tcg_wallet.db');

async function getDatabase() {
  return database;
}

export async function initializeCollectionRepository() {
  const db = await getDatabase();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS collection_cards (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      setName TEXT,
      cardNumber TEXT,
      rarity TEXT,
      condition TEXT,
      quantity INTEGER NOT NULL DEFAULT 1,
      imageUrl TEXT,
      marketPrice REAL NOT NULL DEFAULT 0,
      purchasePrice REAL,
      priceChangePercent REAL,
      currency TEXT NOT NULL DEFAULT 'USD',
      source TEXT NOT NULL,
      updatedAt INTEGER NOT NULL
    );
  `);

  // Preserve the manually registered cards from the first version of TCG Wallet.
  const count = await db.getFirstAsync<{ total: number }>('SELECT COUNT(*) AS total FROM collection_cards');
  if (count?.total) return;
  let legacyCards: {
    id: string; name: string; expansion?: string; rarity?: string; quantity?: number;
    imageUri?: string; boughtPrice?: number; soldPrice?: number; currency?: 'USD' | 'COP'; createdAt?: number;
  }[] = [];
  try {
    legacyCards = await db.getAllAsync('SELECT id, name, expansion, rarity, quantity, imageUri, boughtPrice, soldPrice, currency, createdAt FROM cards');
  } catch {
    // First-time installs have no legacy table, which is expected.
  }
  if (!legacyCards.length) return;
  await saveCollectionCards(legacyCards.map((card) => ({
    id: card.id, name: card.name, setName: card.expansion, rarity: card.rarity,
    quantity: card.quantity ?? 1, imageUrl: card.imageUri, marketPrice: card.soldPrice ?? 0,
    purchasePrice: card.boughtPrice, currency: card.currency ?? 'USD', source: 'manual' as const,
    updatedAt: card.createdAt ?? Date.now(),
  })));
}

export async function listCollectionCards(): Promise<CollectionCard[]> {
  const db = await getDatabase();
  return db.getAllAsync<CollectionCard>('SELECT * FROM collection_cards ORDER BY updatedAt DESC, name ASC');
}

export async function saveCollectionCards(cards: CollectionCard[]) {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    for (const card of cards) {
      await db.runAsync(
        `INSERT INTO collection_cards
          (id, name, setName, cardNumber, rarity, condition, quantity, imageUrl, marketPrice, purchasePrice, priceChangePercent, currency, source, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           name=excluded.name, setName=excluded.setName, cardNumber=excluded.cardNumber, rarity=excluded.rarity,
           condition=excluded.condition, quantity=excluded.quantity, imageUrl=excluded.imageUrl,
           marketPrice=excluded.marketPrice, priceChangePercent=excluded.priceChangePercent,
           currency=excluded.currency, source=excluded.source, updatedAt=excluded.updatedAt;`,
        card.id, card.name, card.setName ?? null, card.cardNumber ?? null, card.rarity ?? null,
        card.condition ?? null, card.quantity, card.imageUrl ?? null, card.marketPrice,
        card.purchasePrice ?? null, card.priceChangePercent ?? null, card.currency, card.source, card.updatedAt,
      );
    }
  });
}
