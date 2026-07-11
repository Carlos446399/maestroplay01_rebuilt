// Edge Function que faz proxy das buscas no YouTube (vídeos e canais),
// com CACHE COMPARTILHADO entre todos os usuários via Netlify Blobs.
//
// Por quê: a cota gratuita da API do YouTube é de 10.000 unidades/dia
// POR PROJETO (não por usuário) — cada busca custa 100 unidades, ou seja,
// só ~100 buscas por dia no total, para todo mundo que usa o app.
//
// Como o cache ajuda: se a Pessoa A busca "sertanejo" e a cota é gasta,
// quando a Pessoa B busca "sertanejo" horas depois, ela recebe o mesmo
// resultado do cache — SEM gastar cota de novo. Buscas repetidas (a
// maioria, na prática) passam a ser de graça, esticando bastante a
// mesma cota fixa.
//
// Caminho: /api/youtube-search?query=TERMO&type=video|channel

import { getStore } from '@netlify/blobs';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 horas

export default async (request, context) => {
  const url = new URL(request.url);
  const query = url.searchParams.get('query');
  const type = url.searchParams.get('type') === 'channel' ? 'channel' : 'video';
  const pageToken = url.searchParams.get('pageToken') || '';

  if (!query || !query.trim()) {
    return new Response(JSON.stringify({ error: 'query é obrigatório' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = Netlify.env.get('GOOGLE_DRIVE_API_KEY'); // mesma chave já usada pro Drive/YouTube
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Serviço não configurado (API key ausente)' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const normalizedQuery = query.trim().toLowerCase();
  const cacheKey = `${type}:${normalizedQuery}:${pageToken}`;

  const store = getStore('youtube-search-cache');

  // 1) Tenta responder do cache compartilhado primeiro (sem gastar cota)
  try {
    const cached = await store.get(cacheKey, { type: 'json' });
    if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
      return new Response(JSON.stringify(cached.data), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'X-Cache': 'HIT' },
      });
    }
  } catch {
    // Se o cache falhar por algum motivo, seguimos e buscamos na API normalmente
  }

  // 2) Cache miss (ou expirado): busca de verdade na API do YouTube
  const params = new URLSearchParams({
    part: 'snippet',
    type,
    maxResults: type === 'channel' ? '25' : '50',
    q: type === 'channel' ? query : `${query} music`,
    key: apiKey,
  });
  if (type === 'video') params.set('videoCategoryId', '10');
  if (pageToken) params.set('pageToken', pageToken);

  try {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params.toString()}`);
    const data = await res.json();

    if (!res.ok) {
      return new Response(JSON.stringify({ error: data?.error?.message || `Erro YouTube API (${res.status})`, reason: data?.error?.errors?.[0]?.reason }), {
        status: res.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 3) Guarda no cache compartilhado para a próxima pessoa que buscar o mesmo termo
    try {
      await store.setJSON(cacheKey, { cachedAt: Date.now(), data });
    } catch {
      // Falha ao gravar no cache não deve quebrar a resposta pro usuário
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'X-Cache': 'MISS' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Erro ao consultar o YouTube' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const config = { path: '/api/youtube-search' };
