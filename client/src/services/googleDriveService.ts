const GOOGLE_API_KEY = 'AIzaSyD_7sAIrifwx9sWahzM6ZjD74gYqjcWrXI';

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

const driveGet = async (params: Record<string, string>) => {
  const qs = new URLSearchParams({ ...params, key: GOOGLE_API_KEY }).toString();
  const res = await fetch(`https://www.googleapis.com/drive/v3/files?${qs}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Erro Drive API (${res.status})`);
  }
  return res.json();
};

/** Lista itens diretos de uma pasta (sem recursão) */
export const listFolderContents = async (folderId: string): Promise<DriveItem[]> => {
  const results: DriveItem[] = [];
  let pageToken: string | undefined;

  do {
    const params: Record<string, string> = {
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'nextPageToken,files(id,name,mimeType,thumbnailLink,size)',
      pageSize: '100',
      orderBy: 'name',
    };
    if (pageToken) params.pageToken = pageToken;
    const data = await driveGet(params);
    results.push(...(data.files || []));
    pageToken = data.nextPageToken;
  } while (pageToken);

  return results;
};

export const getDriveStreamUrl = (fileId: string): string =>
  `https://drive.google.com/uc?export=download&id=${fileId}`;

/** URL da página de preview do Drive (para iframe embutido) */
export const getDrivePreviewUrl = (fileId: string): string =>
  `https://drive.google.com/file/d/${fileId}/preview`;

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
