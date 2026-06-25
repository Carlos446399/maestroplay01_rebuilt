// Proxy para arquivos do Google Drive
// GET /.netlify/functions/drive-proxy?id=FILE_ID

const https = require('https');

function fetchUrl(url, depth = 0) {
  return new Promise((resolve, reject) => {
    if (depth > 10) return reject(new Error('Too many redirects'));
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36',
        'Accept': '*/*',
      }
    };
    const req = https.get(url, options, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const next = res.headers.location.startsWith('http')
          ? res.headers.location
          : new URL(res.headers.location, url).toString();
        res.resume();
        fetchUrl(next, depth + 1).then(resolve).catch(reject);
        return;
      }
      resolve(res);
    });
    req.on('error', reject);
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

  // Tenta múltiplas URLs em ordem
  const urls = [
    `https://drive.google.com/uc?export=download&id=${id}&confirm=t`,
    `https://drive.google.com/uc?export=download&id=${id}`,
    `https://docs.google.com/uc?export=download&id=${id}&confirm=t`,
  ];

  const errors = [];

  for (const url of urls) {
    try {
      console.log(`Tentando: ${url}`);
      const res = await fetchUrl(url);
      console.log(`Status: ${res.statusCode}, Content-Type: ${res.headers['content-type']}`);

      if (res.statusCode === 200) {
        const contentType = res.headers['content-type'] || 'audio/mpeg';
        
        // Verifica se é realmente áudio (não HTML de erro)
        if (contentType.includes('text/html')) {
          const body = await readStream(res);
          errors.push(`URL retornou HTML: ${url}`);
          console.log('Resposta HTML (primeiros 200 chars):', body.toString().substring(0, 200));
          continue;
        }

        const body = await readStream(res);
        return {
          statusCode: 200,
          headers: {
            'Content-Type': contentType,
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=3600',
            'Content-Length': body.length.toString(),
          },
          body: body.toString('base64'),
          isBase64Encoded: true,
        };
      } else {
        const body = await readStream(res);
        errors.push(`Status ${res.statusCode} para ${url}: ${body.toString().substring(0, 100)}`);
      }
    } catch (err) {
      errors.push(`Erro em ${url}: ${err.message}`);
      console.error(err);
    }
  }

  return {
    statusCode: 502,
    body: JSON.stringify({ error: 'Todas as tentativas falharam', details: errors }),
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  };
};
