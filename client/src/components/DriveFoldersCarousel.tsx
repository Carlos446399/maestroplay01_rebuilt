import { useEffect, useState } from 'react';
import { FolderOpen } from 'lucide-react';
import { listFolderContents, cleanFolderName, FOLDER_MIME, DriveItem } from '@/services/googleDriveService';

const ROOT_FOLDER_ID = '1zqRZc6TRZkQafTOhCokzyD6HUWpTQusx';

interface DriveFoldersCarouselProps {
  /** Abre o painel do Drive já dentro da pasta escolhida, mostrando as músicas */
  onOpenFolder: (folder: { id: string; name: string }) => void;
}

/**
 * Mostra as subpastas da raiz do Google Drive como cards horizontais,
 * no mesmo estilo das outras fileiras de playlist da tela inicial. Tocar
 * num card abre o painel do Drive já dentro daquela pasta, com a lista de
 * músicas — igual abrir uma playlist.
 */
export const DriveFoldersCarousel = ({ onOpenFolder }: DriveFoldersCarouselProps) => {
  const [folders, setFolders] = useState<DriveItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  // Não mostra nada se ainda não carregou, deu erro, ou não há pastas
  if (isLoading || error || folders.length === 0) return null;

  return (
    <div className="flex gap-3 px-2 py-1 mt-1 overflow-x-auto custom-scrollbar w-full">
      {folders.map((folder) => (
        <button
          key={folder.id}
          onClick={() => onOpenFolder({ id: folder.id, name: folder.name })}
          className="flex-shrink-0 w-[70px] bg-card rounded cursor-pointer p-1
            flex flex-col items-center transition-all duration-200
            hover:scale-105 active:scale-95"
        >
          <div className="relative w-full h-[60px] rounded overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center">
            <FolderOpen className="text-white" size={26} />
          </div>
          <span className="text-[8px] text-muted-foreground text-center leading-tight mt-0.5 w-full truncate px-0.5">
            {cleanFolderName(folder.name)}
          </span>
        </button>
      ))}
    </div>
  );
};
