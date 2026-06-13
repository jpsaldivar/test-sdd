const ALLOWED_ORIGIN = 'https://jpsaldivar.github.io';

const CORS = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const ROUTES = {
  '/device/code':  'https://github.com/login/device/code',
  '/access_token': 'https://github.com/login/oauth/access_token',
};

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }
    const target = ROUTES[url.pathname];
    if (!target) return new Response('Not found', { status: 404 });
    const body = await request.text();
    const ghRes = await fetch(target, {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body,
    });
    const data = await ghRes.text();
    return new Response(data, {
      status: ghRes.status,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  },
};
