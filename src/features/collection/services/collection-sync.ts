import { collectionApiUrl } from '../api/config';
import { fetchCollectrCollection } from '../api/collectr';
import { saveCollectionCards } from '../repository/collection-repository';
import type { SyncResult } from '../types/card';

export async function syncCollection(): Promise<SyncResult> {
  if (!collectionApiUrl) throw new Error('Configura EXPO_PUBLIC_COLLECTION_API_URL para actualizar desde Collectr.');
  const cards = await fetchCollectrCollection(collectionApiUrl);
  await saveCollectionCards(cards);
  return { imported: cards.length, syncedAt: Date.now() };
}
