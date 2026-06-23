/**
 * googleDriveService - Lista arquivos de áudio de uma pasta pública do
 * Google Drive usando a Drive API v3, incluindo subpastas recursivamente.
 */

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
  nextPageToken?: string;
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

/**
 * Lista todas as subpastas diretas de uma pasta do Drive.
 */
const listSubFolders = async (folderId: string): Promise<Array<{id: string; name: string}>> => {
  const q = `'${folderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  const url =
    `https://www.googleapis.com/drive/v3/files` +
    `?q=${encodeURIComponent(q)}` +
    `&fields=files(id,name)` +
    `&pageSize=100` +
    `&key=${GOOGLE_API_KEY}`;

  const response = await fetch(url);
  if (!response.ok) return [];
  const data = await response.json();
  return data.files || [];
};

/**
 * Lista arquivos de áudio em uma pasta específica (sem recursão).
 */
const listAudioInFolder = async (
  folderId: string,
  folderName: string,
  pageToken?: string
): Promise<DriveFilesResult> => {
  const q = `'${folderId}' in parents and (${AUDIO_MIME_QUERY}) and trashed=false`;
  let url =
    `https://www.googleapis.com/drive/v3/files` +
    `?q=${encodeURIComponent(q)}` +
    `&fields=nextPageToken,files(id,name,mimeType,thumbnailLink,size)` +
    `&pageSize=100` +
    `&orderBy=name` +
    `&key=${GOOGLE_API_KEY}`;

  if (pageToken) url += `&pageToken=${pageToken}`;

  const response = await fetch(url);
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Erro ao listar arquivos (${response.status})`);
  }

  const data = await response.json();
  return {
    files: (data.files || []).map((f: DriveAudioFile) => ({ ...f, folderName })),
    nextPageToken: data.nextPageToken,
  };
};

/**
 * Lista arquivos de áudio em uma pasta e em todas as suas subpastas
 * (recursão de 2 níveis para cobrir a estrutura da pasta de músicas).
 */
export const listDriveAudioFiles = async (
  folderId: string,
  pageToken?: string
): Promise<DriveFilesResult> => {
  // Busca arquivos na raiz
  const rootResult = await listAudioInFolder(folderId, '', pageToken);

  // Se já há resultados na raiz (ou pageToken indica continuação), retorna
  if (rootResult.files.length > 0 || pageToken) {
    return rootResult;
  }

  // Se raiz está vazia, busca nas subpastas
  const subFolders = await listSubFolders(folderId);

  if (subFolders.length === 0) {
    return { files: [] };
  }

  // Busca em todas as subpastas em paralelo
  const subResults = await Promise.allSettled(
    subFolders.map(folder => listAudioInFolder(folder.id, folder.name))
  );

  const allFiles: DriveAudioFile[] = [];

  for (const result of subResults) {
    if (result.status === 'fulfilled') {
      allFiles.push(...result.value.files);
    }
  }

  // Ordena por nome
  allFiles.sort((a, b) => a.name.localeCompare(b.name));

  return { files: allFiles };
};

/**
 * Retorna a URL de stream direto de um arquivo do Drive.
 */
export const getDriveStreamUrl = (fileId: string): string =>
  `https://docs.google.com/uc?export=download&id=${fileId}`;

/**
 * Retorna a thumbnail de um arquivo do Drive.
 */
export const getDriveThumbnail = (file: DriveAudioFile): string | undefined => {
  if (file.thumbnailLink) {
    return file.thumbnailLink.replace('=s220', '=s400');
  }
  return undefined;
};

/**
 * Formata o tamanho em bytes para exibição.
 */
export const formatFileSize = (bytes?: string): string => {
  if (!bytes) return '';
  const n = parseInt(bytes, 10);
  if (isNaN(n)) return '';
  if (n >= 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  if (n >= 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${n} B`;
};
