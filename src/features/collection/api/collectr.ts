import type { CollectionCard } from '../types/card';

type CollectrProduct = {
  product_id?: string;
  user_owned_product_id?: string;
  product_name?: string;
  catalog_group?: string;
  card_number?: string;
  rarity?: string;
  card_condition?: string;
  quantity?: number;
  image_url?: string;
  market_price?: number;
  price_override?: number;
  market_price_percentage_diff?: number;
};

/**
 * Fetches a page from a server-side Collectr proxy. The proxy is intentional:
 * browser/mobile apps must never contain a Collectr session token.
 */
export async function fetchCollectrCollection(apiBaseUrl: string): Promise<CollectionCard[]> {
  const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/collection`);
  if (!response.ok) throw new Error('No se pudo actualizar la colección.');

  const payload = (await response.json()) as { data?: CollectrProduct[] } | CollectrProduct[];
  const products = Array.isArray(payload) ? payload : payload.data ?? [];
  const now = Date.now();

  return products.map((product, index) => ({
    id: product.user_owned_product_id ?? product.product_id ?? `collectr-${index}`,
    name: product.product_name ?? 'Carta sin nombre',
    setName: product.catalog_group ?? null,
    cardNumber: product.card_number ?? null,
    rarity: product.rarity ?? null,
    condition: product.card_condition ?? null,
    quantity: Number(product.quantity) || 1,
    imageUrl: product.image_url ?? null,
    marketPrice: Number(product.price_override) || Number(product.market_price) || 0,
    priceChangePercent: Number(product.market_price_percentage_diff) || 0,
    currency: 'USD',
    source: 'collectr',
    updatedAt: now,
  }));
}
