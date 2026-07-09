import { useEffect, useState } from 'react';
import { ChevronDown, Music2, HardDrive, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { audioStorage } from '@/services/audioStorage';

interface DriveOfflineSong {
  id: string; // ex: 'drive-FILEID'
  fileId: string; // FILEID puro, sem o prefixo 'drive-'
  name: string;
  cover?: string;
}

interface DriveOfflinePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onTrackSelect: (fileId: string, title: string, cover?: string) => void;
}

/**
 * Mostra as músicas do Google Drive já salvas para tocar offline
 * (baixadas pelo painel do Drive), sem precisar de internet.
 */
export const DriveOfflinePanel = ({ isOpen, onClose, onTrackSelect }: DriveOfflinePanelProps) => {
  const [songs, setSongs] = useState<DriveOfflineSong[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadSongs = async () => {
    setIsLoading(true);
    try {
      await audioStorage.init();
      const all = await audioStorage.getAllAudioFiles();
      const driveSongs = all
        .filter(f => f.id.startsWith('drive-'))
        .map(f => ({
          id: f.id,
          fileId: f.id.replace('drive-', ''),
          name: f.name,
          cover: f.cover,
        }));
      setSongs(driveSongs);
    } catch (err) {
      console.error('Erro ao carregar músicas offline do Drive:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) loadSongs();
  }, [isOpen]);

  const handleRemove = async (song: DriveOfflineSong, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await audioStorage.deleteAudioFile(song.id);
      setSongs(prev => prev.filter(s => s.id !== song.id));
    } catch (err) {
      console.error('Erro ao remover música offline:', err);
    }
  };

  return (
    <div className={cn(
      "fixed left-0 w-full max-h-[60vh] z-30 transition-all duration-300 ease-in-out",
      "bg-white border-t-2 border-gray-200 flex flex-col pb-2",
      isOpen ? "bottom-0" : "-bottom-full"
    )}>
      <div className="flex items-center gap-2 px-4 pt-3 pb-2 border-b border-gray-100">
        <HardDrive size={15} className="text-green-600 flex-shrink-0" />
        <span className="text-sm font-black text-gray-800 flex-1">Músicas do Drive offline</span>
        <button onClick={onClose} className="text-red-500 hover:text-red-600 transition-colors p-1">
          <ChevronDown size={26} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2">
        {isLoading ? (
          <p className="text-xs text-gray-400 text-center py-8">Carregando...</p>
        ) : songs.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-8">
            Nenhuma música do Drive salva offline ainda. Baixe músicas no painel do Drive (ícone verde) para elas aparecerem aqui.
          </p>
        ) : (
          songs.map(song => (
            <button
              key={song.id}
              onClick={() => { onTrackSelect(song.fileId, song.name, song.cover); onClose(); }}
              className="w-full flex items-center gap-2 py-2 border-b border-gray-50 last:border-0 text-left"
            >
              <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {song.cover ? (
                  <img src={song.cover} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Music2 size={16} className="text-green-600" />
                )}
              </div>
              <p className="flex-1 min-w-0 text-sm font-semibold text-gray-800 truncate">{song.name}</p>
              <button onClick={(e) => handleRemove(song, e)} className="p-1.5 text-gray-300 hover:text-red-500 flex-shrink-0">
                <Trash2 size={15} />
              </button>
            </button>
          ))
        )}
      </div>
    </div>
  );
};
