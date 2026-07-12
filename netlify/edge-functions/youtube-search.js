// Edge Function que faz proxy das buscas no YouTube (vídeos e canais),
// com CACHE COMPARTILHADO entre todos os usuários via cache de CDN do
// próprio Netlify (Cache-Control), sem precisar de bibliotecas extras.
//
// Por quê: a cota gratuita da API do YouTube é de 10.000 unidades/dia
// POR PROJETO (não por usuário) — cada busca custa 100 unidades, ou seja,
// só ~100 buscas por dia no total, para todo mundo que usa o app.
//
// Como o cache ajuda: se a Pessoa A busca "sertanejo", a resposta fica
// guardada no CDN do Netlify por 24h. Quando a Pessoa B busca "sertanejo"
// horas depois, o CDN devolve a mesma resposta direto — SEM que essa
// requisição sequer chegue até esta função, e SEM gastar cota de novo.
// Buscas repetidas (a maioria, na prática) passam a ser de graça.
//
// Caminho: /api/youtube-search?query=TERMO&type=video|channel

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

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        // Cache compartilhado no CDN do Netlify: mesma busca (mesma URL
        // exata, com a mesma query string) responde do cache por 24h
        // para qualquer pessoa, sem gastar cota de novo.
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        'Netlify-CDN-Cache-Control': 'public, max-age=86400, durable',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Erro ao consultar o YouTube' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const config = { path: '/api/youtube-search', cache: 'manual' };
