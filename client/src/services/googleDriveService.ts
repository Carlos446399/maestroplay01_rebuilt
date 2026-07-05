export interface DriveItem {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  size?: string;
}

export interface DriveAudioFile extends DriveItem {
  folderName?: string;
}

export interface DriveFilesResult {
  files: DriveAudioFile[];
}

export const FOLDER_MIME = 'application/vnd.google-apps.folder';

export const AUDIO_MIME_TYPES = new Set([
  'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg',
  'audio/flac', 'audio/aac', 'audio/x-m4a', 'audio/mp4', 'audio/webm',
]);

/**
 * Lista itens diretos de uma pasta (sem recursão) via proxy Netlify Edge
 * Function. A API key do Google fica só no servidor — nunca é enviada ao
 * navegador, evitando exposição no bundle público.
 */
export const listFolderContents = async (folderId: string): Promise<DriveItem[]> => {
  const results: DriveItem[] = [];
  let pageToken: string | undefined;

  do {
    const qs = new URLSearchParams({ folderId, ...(pageToken ? { pageToken } : {}) });
    const res = await fetch(`/api/drive-list?${qs.toString()}`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.error || `Erro Drive API (${res.status})`);
    }
    results.push(...(data.files || []));
    pageToken = data.nextPageToken;
  } while (pageToken);

  return results;
};

export const ROOT_FOLDER_ID = '1zqRZc6TRZkQafTOhCokzyD6HUWpTQusx';

/**
 * Busca músicas por nome dentro do Drive. Uma busca "em todo o Drive" via
 * API key simples (sem login OAuth) não é suportada pelo Google — só é
 * possível listar pastas cujo ID já conhecemos. Por isso, percorremos a
 * pasta raiz e suas subpastas diretas (a estrutura real do seu Drive) e
 * filtramos os nomes localmente.
 */
export const searchDriveFiles = async (query: string): Promise<DriveItem[]> => {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const rootItems = await listFolderContents(ROOT_FOLDER_ID);
  const matches: DriveItem[] = rootItems.filter(
    i => AUDIO_MIME_TYPES.has(i.mimeType) && i.name.toLowerCase().includes(q)
  );

  const subfolders = rootItems.filter(i => i.mimeType === FOLDER_MIME);
  const subResults = await Promise.all(
    subfolders.map(f => listFolderContents(f.id).catch(() => [] as DriveItem[]))
  );
  for (const items of subResults) {
    matches.push(...items.filter(i => AUDIO_MIME_TYPES.has(i.mimeType) && i.name.toLowerCase().includes(q)));
  }

  return matches.slice(0, 30);
};

export const getDriveStreamUrl = (fileId: string): string =>
  `https://drive.google.com/uc?export=download&id=${fileId}`;

/** URL da página de preview do Drive (para iframe embutido) */
export const getDrivePreviewUrl = (fileId: string): string =>
  `https://drive.google.com/file/d/${fileId}/preview`;

/**
 * Baixa o conteúdo de um arquivo do Drive via proxy Netlify Function
 * (evita CORS — o browser chama o mesmo domínio do app).
 */
export const getDriveAudioBlobUrl = async (fileId: string): Promise<string> => {
  const proxyUrl = `/.netlify/functions/drive-proxy?id=${fileId}`;
  const res = await fetch(proxyUrl);

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || `Erro ao carregar áudio (${res.status})`);
  }

  const blob = await res.blob();
  if (blob.size === 0) throw new Error('Arquivo vazio');
  return URL.createObjectURL(blob);
};

export const getDriveThumbnail = (file: DriveItem): string | undefined =>
  file.thumbnailLink ? file.thumbnailLink.replace('=s220', '=s400') : undefined;

export const formatFileSize = (bytes?: string): string => {
  if (!bytes) return '';
  const n = parseInt(bytes, 10);
  if (isNaN(n)) return '';
  if (n >= 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  if (n >= 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${n} B`;
};

export const cleanFolderName = (name: string): string =>
  name.replace(/[🎵♫🎶🎧]/g, '').replace('Proprietário @super_hits.oficial', '').trim();
