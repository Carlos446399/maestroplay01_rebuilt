import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import https from "https";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Segue redirecionamentos HTTP manualmente (até 10 saltos).
 * Necessário porque o Google Drive retorna 302 antes do conteúdo de áudio.
 */
function fetchWithRedirects(url: string, depth = 0): Promise<any> {
  return new Promise((resolve, reject) => {
    if (depth > 10) return reject(new Error("Too many redirects"));
    const options = {
      headers: {
        "User-Agent": "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36",
        Accept: "*/*",
      },
    };
    const req = https.get(url, options, (res) => {
      if (
        res.statusCode &&
        res.statusCode >= 300 &&
        res.statusCode < 400 &&
        res.headers.location
      ) {
        const next = res.headers.location.startsWith("http")
          ? res.headers.location
          : new URL(res.headers.location, url).toString();
        res.resume();
        fetchWithRedirects(next, depth + 1).then(resolve).catch(reject);
        return;
      }
      resolve(res);
    });
    req.on("error", reject);
  });
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // ── Proxy para Google Drive (desenvolvimento local) ─────────────────────────
  // Em produção (Netlify) esta rota é tratada pela Edge Function em
  // netlify/edge-functions/drive-proxy.js. Aqui replicamos o mesmo
  // comportamento para que o ambiente de dev funcione sem Netlify CLI.
  app.get("/api/drive-proxy", async (req, res) => {
    const id = req.query.id as string | undefined;

    if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
      res.status(400).json({ error: "ID inválido" });
      return;
    }

    const urls = [
      `https://drive.google.com/uc?export=download&id=${id}&confirm=t`,
      `https://drive.google.com/uc?export=download&id=${id}`,
      `https://docs.google.com/uc?export=download&id=${id}&confirm=t`,
    ];

    for (const driveUrl of urls) {
      try {
        const upstream = await fetchWithRedirects(driveUrl);
        const contentType: string =
          (upstream.headers["content-type"] as string) || "audio/mpeg";

        if (upstream.statusCode !== 200 || contentType.includes("text/html")) {
          upstream.resume(); // descarta o body
          continue;
        }

        res.setHeader("Content-Type", contentType);
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Cache-Control", "public, max-age=3600");
        upstream.pipe(res);
        return;
      } catch (err) {
        console.error(`Drive proxy error for ${driveUrl}:`, err);
      }
    }

    res
      .status(502)
      .json({ error: "Não foi possível acessar o arquivo no Google Drive" });
  });

  // ── Arquivos estáticos ───────────────────────────────────────────────────────
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
