// Edge Function para proxy da listagem/busca de arquivos do Google Drive.
// Mantém a API key apenas no servidor (variável de ambiente), nunca exposta
// no bundle do navegador.
// Caminho: /api/drive-list?folderId=FOLDER_ID&pageToken=TOKEN  (lista uma pasta)
//      ou: /api/drive-list?query=TERMO                          (busca em todo o Drive)

export default async (request, context) => {
  const url = new URL(request.url);
  const folderId = url.searchParams.get('folderId');
  const query = url.searchParams.get('query');
  const pageToken = url.searchParams.get('pageToken');

  if (!query && (!folderId || !/^[a-zA-Z0-9_-]+$/.test(folderId))) {
    return new Response(JSON.stringify({ error: 'folderId ou query são obrigatórios' }), {
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

  // Busca por nome em todo o Drive, ou lista o conteúdo direto de uma pasta
  const escapedQuery = query ? query.replace(/'/g, "\\'") : '';
  const q = query
    ? `name contains '${escapedQuery}' and trashed=false`
    : `'${folderId}' in parents and trashed=false`;

  const params = new URLSearchParams({
    q,
    fields: 'nextPageToken,files(id,name,mimeType,thumbnailLink,size)',
    pageSize: query ? '30' : '100',
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
