const GOOGLE_API_KEY = 'AIzaSyD_7sAIrifwx9sWahzM6ZjD74gYqjcWrXI';

export interface DriveAudioFile {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  size?: string;
  folderName?: string;
}

export interface DriveFilesResult {
  files: DriveAudioFile[];
}

const AUDIO_MIME_QUERY = [
  "mimeType='audio/mpeg'",
  "mimeType='audio/mp3'",
  "mimeType='audio/wav'",
  "mimeType='audio/ogg'",
  "mimeType='audio/flac'",
  "mimeType='audio/aac'",
  "mimeType='audio/x-m4a'",
  "mimeType='audio/mp4'",
  "mimeType='audio/webm'",
].join(' or ');

const driveGet = async (params: Record<string, string>) => {
  const qs = new URLSearchParams({ ...params, key: GOOGLE_API_KEY }).toString();
  const res = await fetch(`https://www.googleapis.com/drive/v3/files?${qs}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Erro Drive API (${res.status})`);
  }
  return res.json();
};

/** Lista tudo (subpastas e áudios) dentro de uma pasta */
const listChildren = async (folderId: string): Promise<Array<{ id: string; name: string; mimeType: string }>> => {
  const results: Array<{ id: string; name: string; mimeType: string }> = [];
  let pageToken: string | undefined;

  do {
    const params: Record<string, string> = {
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'nextPageToken,files(id,name,mimeType)',
      pageSize: '100',
    };
    if (pageToken) params.pageToken = pageToken;

    const data = await driveGet(params);
    results.push(...(data.files || []));
    pageToken = data.nextPageToken;
  } while (pageToken);

  return results;
};

const AUDIO_MIME_TYPES = new Set([
  'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg',
  'audio/flac', 'audio/aac', 'audio/x-m4a', 'audio/mp4', 'audio/webm',
]);

const FOLDER_MIME = 'application/vnd.google-apps.folder';

/**
 * Busca RECURSIVA: percorre todas as subpastas (qualquer nível de profundidade)
 * e coleta todos os arquivos de áudio encontrados.
 * 
 * Limite de profundidade = 5 para evitar loops infinitos.
 */
const collectAudioFiles = async (
  folderId: string,
  folderName: string,
  depth = 0,
  allFiles: DriveAudioFile[] = []
): Promise<DriveAudioFile[]> => {
  if (depth > 5) return allFiles;

  const children = await listChildren(folderId);

  const audioFiles = children.filter(c => AUDIO_MIME_TYPES.has(c.mimeType));
  const subFolders = children.filter(c => c.mimeType === FOLDER_MIME);

  // Adiciona os áudios encontrados neste nível
  for (const f of audioFiles) {
    allFiles.push({ ...f, folderName });
  }

  // Entra recursivamente nas subpastas em paralelo (lote de 5 por vez)
  const BATCH = 5;
  for (let i = 0; i < subFolders.length; i += BATCH) {
    const batch = subFolders.slice(i, i + BATCH);
    await Promise.all(
      batch.map(folder =>
        collectAudioFiles(folder.id, folder.name, depth + 1, allFiles)
      )
    );
  }

  return allFiles;
};

/**
 * Ponto de entrada: lista todos os arquivos de áudio da pasta e subpastas.
 */
export const listDriveAudioFiles = async (folderId: string): Promise<DriveFilesResult> => {
  const allFiles = await collectAudioFiles(folderId, '');

  // Ordena por nome da pasta, depois por nome do arquivo
  allFiles.sort((a, b) => {
    const fc = (a.folderName || '').localeCompare(b.folderName || '');
    return fc !== 0 ? fc : a.name.localeCompare(b.name);
  });

  return { files: allFiles };
};

export const getDriveStreamUrl = (fileId: string): string =>
  `https://docs.google.com/uc?export=download&id=${fileId}`;

export const getDriveThumbnail = (file: DriveAudioFile): string | undefined =>
  file.thumbnailLink ? file.thumbnailLink.replace('=s220', '=s400') : undefined;

export const formatFileSize = (bytes?: string): string => {
  if (!bytes) return '';
  const n = parseInt(bytes, 10);
  if (isNaN(n)) return '';
  if (n >= 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  if (n >= 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${n} B`;
};
