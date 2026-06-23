// Proxy para arquivos do Google Drive — resolve CORS para o app MaestroPlay.
// Chamada: GET /.netlify/functions/drive-proxy?id=FILE_ID

const https = require('https');

const GOOGLE_API_KEY = 'AIzaSyD_7sAIrifwx9sWahzM6ZjD74gYqjcWrXI';

// Faz fetch seguindo redirects manualmente
function fetchFollowRedirects(url, depth = 0) {
  return new Promise((resolve, reject) => {
    if (depth > 10) return reject(new Error('Muitos redirects'));

    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const next = res.headers.location.startsWith('http')
          ? res.headers.location
          : new URL(res.headers.location, url).toString();
        res.resume(); // descarta body
        fetchFollowRedirects(next, depth + 1).then(resolve).catch(reject);
        return;
      }
      resolve(res);
    }).on('error', reject);
  });
}

function readStream(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', c => chunks.push(c));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

exports.handler = async (event) => {
  const id = event.queryStringParameters && event.queryStringParameters.id;

  if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
    return { statusCode: 400, body: 'ID inválido' };
  }

  const url = `https://www.googleapis.com/drive/v3/files/${id}?alt=media&key=${GOOGLE_API_KEY}`;

  try {
    const res = await fetchFollowRedirects(url);
    const body = await readStream(res);

    const contentType = res.headers['content-type'] || 'audio/mpeg';

    return {
      statusCode: res.statusCode || 200,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600',
        'Accept-Ranges': 'bytes',
      },
      body: body.toString('base64'),
      isBase64Encoded: true,
    };
  } catch (err) {
    console.error('drive-proxy error:', err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
      headers: { 'Content-Type': 'application/json' },
    };
  }
};
# drive proxy function
