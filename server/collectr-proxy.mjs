import http from 'node:http';

const port = Number(process.env.PORT ?? 8787);
const collectionId = process.env.COLLECTR_COLLECTION_ID;
const token = process.env.COLLECTR_TOKEN;

if (!collectionId || !token) {
  throw new Error('COLLECTR_COLLECTION_ID y COLLECTR_TOKEN son obligatorios.');
}

async function loadCollection() {
  const products = [];
  const limit = 100;
  for (let offset = 0; ; offset += limit) {
    const url = new URL(`https://api-v2.getcollectr.com/collections/${collectionId}/products`);
    url.searchParams.set('offset', String(offset));
    url.searchParams.set('limit', String(limit));
    url.searchParams.set('filters', '');
    url.searchParams.set('unstackedView', 'true');
    url.searchParams.set('currency', 'USD');
    const response = await fetch(url, {
      headers: {
        Authorization: token,
        Accept: 'application/json',
        Origin: 'https://app.getcollectr.com',
        Referer: 'https://app.getcollectr.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131 Safari/537.36',
      },
    });
    if (!response.ok) throw new Error(`Collectr respondió ${response.status}.`);
    const page = (await response.json()).data ?? [];
    products.push(...page);
    if (page.length < limit) return products;
  }
}

const server = http.createServer(async (request, response) => {
  response.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_ORIGIN ?? '*');
  if (request.method === 'OPTIONS') return response.writeHead(204).end();
  if (request.method !== 'GET' || request.url !== '/collection') return response.writeHead(404).end();
  try {
    const data = await loadCollection();
    response.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'private, max-age=300' });
    response.end(JSON.stringify({ data }));
  } catch (error) {
    console.error(error);
    response.writeHead(502, { 'content-type': 'application/json' });
    response.end(JSON.stringify({ error: 'No fue posible consultar Collectr.' }));
  }
});

server.listen(port, '0.0.0.0', () => console.log(`Collectr proxy listening on http://0.0.0.0:${port}`));
