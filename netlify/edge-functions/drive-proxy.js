// Edge Function para proxy de áudio do Google Drive
// Suporta streaming sem limite de tamanho (diferente das Netlify Functions)
// Caminho: /api/drive-proxy?id=FILE_ID

export default async (request, context) => {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
    return new Response(JSON.stringify({ error: 'ID inválido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const GOOGLE_API_KEY = Deno.env.get('GOOGLE_DRIVE_API_KEY');

  // Tenta múltiplas URLs (a primeira só é usada se a API key estiver configurada)
  const urls = [
    ...(GOOGLE_API_KEY ? [`https://www.googleapis.com/drive/v3/files/${id}?alt=media&key=${GOOGLE_API_KEY}`] : []),
    `https://drive.google.com/uc?export=download&id=${id}&confirm=t`,
  ];

  for (const driveUrl of urls) {
    try {
      const response = await fetch(driveUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36',
        }
      });

      if (!response.ok) continue;

      const contentType = response.headers.get('Content-Type') || 'audio/mpeg';
      if (contentType.includes('text/html')) continue;

      // Streaming direto — sem carregar em memória
      return new Response(response.body, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=3600',
        }
      });
    } catch (err) {
      console.error('Edge function error:', err.message);
    }
  }

  return new Response(JSON.stringify({ error: 'Não foi possível acessar o arquivo' }), {
    status: 502,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
};

export const config = { path: '/api/drive-proxy' };
