// netlify/functions/drive-proxy.js
// Proxy serverless para baixar arquivos do Google Drive sem CORS.
// O browser chama /.netlify/functions/drive-proxy?id=FILE_ID
// e esta função baixa o arquivo do Drive e repassa o stream.

const https = require('https');
const http = require('http');

const GOOGLE_API_KEY = 'AIzaSyD_7sAIrifwx9sWahzM6ZjD74gYqjcWrXI';

const fetchUrl = (url) =>
  new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, (res) => {
      // Seguir redirects (o Drive redireciona para o arquivo real)
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchUrl(res.headers.location).then(resolve).catch(reject);
        return;
      }
      resolve(res);
    });
    req.on('error', reject);
  });

exports.handler = async (event) => {
  const fileId = event.queryStringParameters?.id;

  if (!fileId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Parâmetro id obrigatório' }),
    };
  }

  // Validar formato do fileId (alfanumérico + hífens/underscores)
  if (!/^[a-zA-Z0-9_-]+$/.test(fileId)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'ID inválido' }),
    };
  }

  try {
    // Primeiro tenta via Drive API com chave
    const apiUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${GOOGLE_API_KEY}`;

    const response = await fetchUrl(apiUrl);

    // Ler o body inteiro como buffer
    const chunks = [];
    await new Promise((resolve, reject) => {
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', resolve);
      response.on('error', reject);
    });

    const buffer = Buffer.concat(chunks);

    const contentType = response.headers['content-type'] || 'audio/mpeg';

    return {
      statusCode: 200,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600',
        'Content-Length': buffer.length.toString(),
      },
      body: buffer.toString('base64'),
      isBase64Encoded: true,
    };
  } catch (err) {
    console.error('Drive proxy error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || 'Erro interno' }),
    };
  }
};
