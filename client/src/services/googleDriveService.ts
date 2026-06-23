/**
 * googleDriveService - Lista arquivos de áudio de uma pasta pública do
 * Google Drive usando a Drive API v3.
 *
 * A pasta precisa estar compartilhada como "qualquer pessoa com o link
 * pode visualizar". A chave de API do Google Cloud é a mesma usada para
 * o YouTube, mas precisa ter a "Google Drive API" habilitada no console.
 */

const GOOGLE_API_KEY = 'AIzaSyD_7sAIrifwx9sWahzM6ZjD74gYqjcWrXI';

export interface DriveAudioFile {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  size?: string;
}

export interface DriveFilesResult {
  files: DriveAudioFile[];
  nextPageToken?: string;
}

const AUDIO_MIME_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/ogg',
  'audio/flac',
  'audio/aac',
  'audio/x-m4a',
  'audio/mp4',
  'audio/webm',
].join(',');

/**
 * Lista arquivos de áudio em uma pasta do Google Drive.
 * @param folderId ID da pasta no Drive
 * @param pageToken Token para paginar resultados
 */
export const listDriveAudioFiles = async (
  folderId: string,
  pageToken?: string
): Promise<DriveFilesResult> => {
  const mimeQuery = [
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

  const q = `'${folderId}' in parents and (${mimeQuery}) and trashed=false`;

  let url =
    `https://www.googleapis.com/drive/v3/files` +
    `?q=${encodeURIComponent(q)}` +
    `&fields=nextPageToken,files(id,name,mimeType,thumbnailLink,size)` +
    `&pageSize=100` +
    `&orderBy=name` +
    `&key=${GOOGLE_API_KEY}`;

  if (pageToken) {
    url += `&pageToken=${pageToken}`;
  }

  const response = await fetch(url);

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      err?.error?.message || `Erro ao listar arquivos do Drive (${response.status})`
    );
  }

  const data = await response.json();

  return {
    files: data.files || [],
    nextPageToken: data.nextPageToken,
  };
};

/**
 * Retorna a URL de stream direto de um arquivo do Drive.
 * Funciona para arquivos públicos sem autenticação.
 */
export const getDriveStreamUrl = (fileId: string): string =>
  `https://docs.google.com/uc?export=download&id=${fileId}`;

/**
 * Retorna a thumbnail de um arquivo do Drive como URL acessível.
 */
export const getDriveThumbnail = (file: DriveAudioFile): string | undefined => {
  if (file.thumbnailLink) {
    // Aumenta resolução da thumbnail
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
