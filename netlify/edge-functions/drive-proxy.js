export default async (request, context) => {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
    return new Response(JSON.stringify({ error: 'ID inválido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const GOOGLE_API_KEY = 'AIzaSyD_7sAIrifwx9sWahzM6ZjD74gYqjcWrXI';
  const driveUrl = `https://www.googleapis.com/drive/v3/files/${id}?alt=media&key=${GOOGLE_API_KEY}`;

  try {
    const response = await fetch(driveUrl);

    if (!response.ok) {
      return new Response(JSON.stringify({ error: `Drive error: ${response.status}` }), {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    const headers = new Headers({
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600',
      'Content-Type': response.headers.get('Content-Type') || 'audio/mpeg',
    });

    // Streaming direto — sem baixar tudo em memória
    return new Response(response.body, { status: 200, headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};

export const config = { path: '/api/drive-proxy' };
