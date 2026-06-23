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

const driveGet = async (params: Record<string, string>) => {
  const qs = new URLSearchParams({ ...params, key: GOOGLE_API_KEY }).toString();
  const res = await fetch(`https://www.googleapis.com/drive/v3/files?${qs}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Erro Drive API (${res.status})`);
  }
  return res.json();
};

/** Lista subpastas diretas de uma pasta */
const listFolders = async (parentId: string): Promise<Array<{ id: string; name: string }>> => {
  const data = await driveGet({
    q: `'${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id,name)',
    pageSize: '100',
  });
  return data.files || [];
};

/** Lista arquivos de áudio em uma pasta */
const listAudio = async (
  folderId: string,
  folderName: string,
  pageToken?: string
): Promise<{ files: DriveAudioFile[]; nextPageToken?: string }> => {
  const params: Record<string, string> = {
    q: `'${folderId}' in parents and (${AUDIO_MIME_QUERY}) and trashed=false`,
    fields: 'nextPageToken,files(id,name,mimeType,thumbnailLink,size)',
    pageSize: '200',
    orderBy: 'name',
  };
  if (pageToken) params.pageToken = pageToken;

  const data = await driveGet(params);
  return {
    files: (data.files || []).map((f: DriveAudioFile) => ({ ...f, folderName })),
    nextPageToken: data.nextPageToken,
  };
};

/**
 * Lista TODAS as músicas da pasta e suas subpastas.
 * Estratégia:
 *  1. Busca subpastas da raiz
 *  2. Para cada subpasta, busca os áudios
 *  3. Retorna tudo junto ordenado por nome
 */
export const listDriveAudioFiles = async (
  folderId: string,
  _pageToken?: string
): Promise<DriveFilesResult> => {
  // Busca em paralelo: raiz + todas as subpastas
  const [rootResult, subFolders] = await Promise.all([
    listAudio(folderId, ''),
    listFolders(folderId),
  ]);

  const allFiles: DriveAudioFile[] = [...rootResult.files];

  if (subFolders.length > 0) {
    const subResults = await Promise.allSettled(
      subFolders.map(folder => listAudio(folder.id, folder.name))
    );
    for (const result of subResults) {
      if (result.status === 'fulfilled') {
        allFiles.push(...result.value.files);
      }
    }
  }

  // Ordena: por nome da pasta, depois por nome do arquivo
  allFiles.sort((a, b) => {
    const folderCmp = (a.folderName || '').localeCompare(b.folderName || '');
    if (folderCmp !== 0) return folderCmp;
    return a.name.localeCompare(b.name);
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
