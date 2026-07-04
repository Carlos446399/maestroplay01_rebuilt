// Edge Function para proxy da listagem de arquivos do Google Drive.
// Mantém a API key apenas no servidor (variável de ambiente), nunca exposta
// no bundle do navegador.
// Caminho: /api/drive-list?folderId=FOLDER_ID&pageToken=TOKEN

export default async (request, context) => {
  const url = new URL(request.url);
  const folderId = url.searchParams.get('folderId');
  const pageToken = url.searchParams.get('pageToken');

  if (!folderId || !/^[a-zA-Z0-9_-]+$/.test(folderId)) {
    return new Response(JSON.stringify({ error: 'folderId inválido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = Netlify.env.get('GOOGLE_DRIVE_API_KEY');
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Serviço não configurado (API key ausente)' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const params = new URLSearchParams({
    q: `'${folderId}' in parents and trashed=false`,
    fields: 'nextPageToken,files(id,name,mimeType,thumbnailLink,size)',
    pageSize: '100',
    orderBy: 'name',
    key: apiKey,
  });
  if (pageToken) params.set('pageToken', pageToken);

  try {
    const res = await fetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`);
    const data = await res.json();

    if (!res.ok) {
      return new Response(JSON.stringify({ error: data?.error?.message || `Erro Drive API (${res.status})` }), {
        status: res.status,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=60',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Erro ao consultar o Google Drive' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
};

export const config = { path: '/api/drive-list' };
