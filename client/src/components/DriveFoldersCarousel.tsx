import { useEffect, useState } from 'react';
import { FolderOpen, Loader2 } from 'lucide-react';
import {
  listFolderContents,
  getDriveThumbnail,
  cleanFolderName,
  FOLDER_MIME,
  AUDIO_MIME_TYPES,
  DriveItem,
} from '@/services/googleDriveService';

const ROOT_FOLDER_ID = '1zqRZc6TRZkQafTOhCokzyD6HUWpTQusx';

interface DriveFoldersCarouselProps {
  /** Toca a pasta inteira como uma playlist, começando pela primeira música */
  onPlayFolder: (fileId: string, title: string, cover: string | undefined, playlist: Array<{id: string; name: string; cover?: string}>, index: number) => void;
}

/**
 * Mostra as subpastas da raiz do Google Drive como cards horizontais,
 * no mesmo estilo das outras fileiras de playlist da tela inicial. Tocar
 * num card reproduz todas as músicas daquela pasta em sequência.
 */
export const DriveFoldersCarousel = ({ onPlayFolder }: DriveFoldersCarouselProps) => {
  const [folders, setFolders] = useState<DriveItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingFolderId, setLoadingFolderId] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    listFolderContents(ROOT_FOLDER_ID)
      .then(items => {
        if (cancelled) return;
        setFolders(items.filter(i => i.mimeType === FOLDER_MIME));
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const handleOpenFolder = async (folder: DriveItem) => {
    if (loadingFolderId) return;
    setLoadingFolderId(folder.id);
    try {
      const items = await listFolderContents(folder.id);
      const audioFiles = items.filter(i => AUDIO_MIME_TYPES.has(i.mimeType));
      if (audioFiles.length === 0) return;
      const playlist = audioFiles.map(f => ({
        id: f.id,
        name: f.name,
        cover: getDriveThumbnail(f),
      }));
      const first = audioFiles[0];
      onPlayFolder(first.id, first.name, getDriveThumbnail(first), playlist, 0);
    } catch (err) {
      console.error('Erro ao abrir pasta do Drive:', err);
    } finally {
      setLoadingFolderId(null);
    }
  };

  // Não mostra nada se ainda não carregou, deu erro, ou não há pastas
  if (isLoading || error || folders.length === 0) return null;

  return (
    <div className="flex gap-3 px-2 py-1 mt-1 overflow-x-auto custom-scrollbar w-full">
      {folders.map((folder) => (
        <button
          key={folder.id}
          onClick={() => handleOpenFolder(folder)}
          disabled={loadingFolderId !== null}
          className="flex-shrink-0 w-[70px] bg-card rounded cursor-pointer p-1
            flex flex-col items-center transition-all duration-200
            hover:scale-105 active:scale-95 disabled:opacity-60"
        >
          <div className="relative w-full h-[60px] rounded overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center">
            {loadingFolderId === folder.id ? (
              <Loader2 className="animate-spin text-white" size={20} />
            ) : (
              <FolderOpen className="text-white" size={26} />
            )}
          </div>
          <span className="text-[8px] text-muted-foreground text-center leading-tight mt-0.5 w-full truncate px-0.5">
            {cleanFolderName(folder.name)}
          </span>
        </button>
      ))}
    </div>
  );
};
