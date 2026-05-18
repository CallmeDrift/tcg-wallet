import type { Card } from '@/models/card';
import * as SQLite from 'expo-sqlite';

const DB_NAME = 'tcg_wallet.db';

const dbPromise = SQLite.openDatabaseAsync(DB_NAME);

async function getDb() {
  return dbPromise;
}

export async function initDb() {
  const db = await getDb();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS cards (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT,
      expansion TEXT,
      rarity TEXT,
      quantity INTEGER,
      imageUri TEXT,
      boughtPrice REAL,
      soldPrice REAL,
      currency TEXT,
      createdAt INTEGER
    );
  `);
  // Ensure 'expansion' column exists for older DBs
  const cols = await db.getAllAsync<{ name: string }>("PRAGMA table_info('cards');");
  const hasExpansion = cols.some((c) => c.name === 'expansion');
  if (!hasExpansion) {
    try {
      await db.execAsync('ALTER TABLE cards ADD COLUMN expansion TEXT;');
    } catch (e) {
      // ignore if alter fails for any reason
      console.warn('Could not add expansion column:', e);
    }
  }
  const hasQuantity = cols.some((c) => c.name === 'quantity');
  if (!hasQuantity) {
    try {
      await db.execAsync('ALTER TABLE cards ADD COLUMN quantity INTEGER DEFAULT 1;');
    } catch (e) {
      console.warn('Could not add quantity column:', e);
    }
  }
  const hasRarity = cols.some((c) => c.name === 'rarity');
  if (!hasRarity) {
    try {
      await db.execAsync('ALTER TABLE cards ADD COLUMN rarity TEXT;');
    } catch (e) {
      console.warn('Could not add rarity column:', e);
    }
  }
}

export default dbPromise;

export function insertCard(card: Card) {
  return getDb().then(async (db) => {
    await db.runAsync(
      'INSERT INTO cards (id, name, expansion, rarity, quantity, imageUri, boughtPrice, soldPrice, currency, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);',
      card.id,
      card.name,
      card.expansion ?? null,
      // rarity inserted here
      ((card as any).rarity ?? null),
      card.quantity ?? 1,
      card.imageUri ?? null,
      card.boughtPrice ?? null,
      card.soldPrice ?? null,
      card.currency ?? null,
      card.createdAt ?? Date.now()
    );
  });
}

export function getCards() {
  return getDb().then((db) => db.getAllAsync<Card>('SELECT * FROM cards ORDER BY createdAt DESC;'));
}

export function getCard(cardId: string) {
  return getDb().then((db) => db.getFirstAsync<Card>('SELECT * FROM cards WHERE id = ?;', cardId));
}

export function updateCard(card: Card) {
  return getDb().then(async (db) => {
    await db.runAsync(
      'UPDATE cards SET name = ?, expansion = ?, rarity = ?, quantity = ?, imageUri = ?, boughtPrice = ?, soldPrice = ?, currency = ? WHERE id = ?;',
      card.name,
      card.expansion ?? null,
      card.rarity ?? null,
      card.quantity ?? 1,
      card.imageUri ?? null,
      card.boughtPrice ?? null,
      card.soldPrice ?? null,
      card.currency ?? null,
      card.id
    );
  });
}

export function deleteCard(cardId: string) {
  return getDb().then(async (db) => {
    await db.runAsync('DELETE FROM cards WHERE id = ?;', cardId);
  });
}
