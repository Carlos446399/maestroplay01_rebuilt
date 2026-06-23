import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronDown, Music2, Loader2, AlertCircle, RefreshCw, HardDrive } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  listDriveAudioFiles,
  getDriveStreamUrl,
  getDriveThumbnail,
  formatFileSize,
  DriveAudioFile,
} from '@/services/googleDriveService';

const DRIVE_FOLDER_ID = '1zqRZc6TRZkQafTOhCokzyD6HUWpTQusx';

interface DrivePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onPlaySong: (url: string, title: string, cover?: string) => void;
}

export const DrivePanel = ({ isOpen, onClose, onPlaySong }: DrivePanelProps) => {
  const [files, setFiles] = useState<DriveAudioFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [search, setSearch] = useState('');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const loadFiles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await listDriveAudioFiles(DRIVE_FOLDER_ID);
      setFiles(result.files);
      setHasLoaded(true);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar arquivos do Drive.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && !hasLoaded) loadFiles();
  }, [isOpen, hasLoaded, loadFiles]);

  // Nomes únicos de pastas para filtro
  const folders = Array.from(new Set(files.map(f => f.folderName || '').filter(Boolean))).sort();

  // Filtro por busca + pasta selecionada
  const filteredFiles = files.filter(f => {
    const matchSearch = !search || f.name.toLowerCase().includes(search.toLowerCase());
    const matchFolder = !selectedFolder || f.folderName === selectedFolder;
    return matchSearch && matchFolder;
  });

  // Agrupar por pasta para exibir cabeçalhos de categoria
  const grouped: { folder: string; items: DriveAudioFile[] }[] = [];
  for (const file of filteredFiles) {
    const folder = file.folderName || '';
    const last = grouped[grouped.length - 1];
    if (last && last.folder === folder) {
      last.items.push(file);
    } else {
      grouped.push({ folder, items: [file] });
    }
  }

  const handlePlay = (file: DriveAudioFile) => {
    const url = getDriveStreamUrl(file.id);
    const title = file.name.replace(/\.[^/.]+$/, '');
    const cover = getDriveThumbnail(file);
    setPlayingId(file.id);
    onPlaySong(url, title, cover);
  };

  return (
    <div className={cn(
      'fixed left-0 w-full max-h-[78vh] z-30 flex flex-col',
      'bg-white border-t-2 border-gray-200 transition-all duration-300 ease-in-out',
      isOpen ? 'bottom-0' : '-bottom-full'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-2 pb-2 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <HardDrive size={16} className="text-green-600" />
          <span className="text-xs font-bold text-gray-800">Google Drive</span>
          {files.length > 0 && (
            <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {files.length} músicas
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasLoaded && (
            <button onClick={() => { setHasLoaded(false); setFiles([]); }}
              className="text-gray-400 hover:text-gray-600 transition-colors">
              <RefreshCw size={14} />
            </button>
          )}
          <button onClick={onClose} className="text-red-500 hover:text-red-600 transition-colors">
            <ChevronDown size={24} />
          </button>
        </div>
      </div>

      {/* Busca */}
      {hasLoaded && (
        <div className="px-3 py-2 border-b border-gray-100 flex gap-2">
          <input
            type="text"
            placeholder="Buscar músicas..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 text-xs px-3 py-1.5 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-800 bg-gray-50"
          />
        </div>
      )}

      {/* Filtro por pasta (chips) */}
      {folders.length > 1 && !search && (
        <div className="flex gap-2 px-3 py-2 overflow-x-auto border-b border-gray-100 scrollbar-none">
          <button
            onClick={() => setSelectedFolder(null)}
            className={cn(
              'text-[10px] px-3 py-1 rounded-full whitespace-nowrap flex-shrink-0 font-medium transition-colors',
              !selectedFolder ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            Todas
          </button>
          {folders.map(folder => (
            <button
              key={folder}
              onClick={() => setSelectedFolder(selectedFolder === folder ? null : folder)}
              className={cn(
                'text-[10px] px-3 py-1 rounded-full whitespace-nowrap flex-shrink-0 font-medium transition-colors',
                selectedFolder === folder ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {folder.replace(/🎵|♫|🎶/g, '').replace('Proprietário @super_hits.oficial', '').trim()}
            </button>
          ))}
        </div>
      )}

      {/* Lista */}
      <div ref={listRef} className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="animate-spin text-green-500" size={28} />
            <p className="text-xs text-gray-500">Carregando músicas do Drive...</p>
            <p className="text-[10px] text-gray-400">Buscando em todas as pastas...</p>
          </div>
        )}

        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center py-10 gap-3 px-6">
            <AlertCircle size={28} className="text-red-500" />
            <p className="text-xs text-red-600 text-center">{error}</p>
            <button onClick={loadFiles}
              className="text-xs px-4 py-1.5 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors">
              Tentar novamente
            </button>
          </div>
        )}

        {!isLoading && !error && hasLoaded && files.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <Music2 size={28} className="text-gray-300" />
            <p className="text-xs text-gray-400">Nenhum arquivo de áudio encontrado.</p>
          </div>
        )}

        {!isLoading && grouped.map(({ folder, items }) => (
          <div key={folder || 'root'}>
            {/* Cabeçalho de categoria */}
            {folder && (
              <div className="px-4 py-1.5 bg-green-50 border-b border-green-100 sticky top-0 z-10">
                <span className="text-[10px] font-bold text-green-700 uppercase tracking-wide">
                  {folder.replace(/🎵|♫|🎶/g, '').replace('Proprietário @super_hits.oficial', '').trim()}
                </span>
                <span className="text-[9px] text-green-400 ml-2">{items.length} músicas</span>
              </div>
            )}

            {items.map((file, index) => {
              const title = file.name.replace(/\.[^/.]+$/, '');
              const cover = getDriveThumbnail(file);
              const isPlaying = playingId === file.id;

              return (
                <div
                  key={file.id}
                  onClick={() => handlePlay(file)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2 border-b border-gray-100 cursor-pointer transition-colors',
                    isPlaying ? 'bg-green-50' : 'hover:bg-gray-50'
                  )}
                >
                  <div className="relative w-9 h-9 flex-shrink-0">
                    {cover ? (
                      <img src={cover} alt={title} className="w-full h-full rounded object-cover" />
                    ) : (
                      <div className="w-full h-full rounded bg-green-100 flex items-center justify-center">
                        <Music2 size={16} className={isPlaying ? 'text-green-600' : 'text-green-400'} />
                      </div>
                    )}
                    {isPlaying && (
                      <div className="absolute inset-0 rounded bg-green-600/20 flex items-center justify-center">
                        <div className="flex gap-0.5 items-end h-4">
                          {[1,2,3].map(i => (
                            <div key={i} className="w-1 bg-green-600 rounded-full animate-bounce"
                              style={{ animationDelay: `${i * 0.15}s`, height: `${6 + i * 4}px` }} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={cn('text-xs font-medium truncate', isPlaying ? 'text-green-700' : 'text-gray-800')}>
                      {title}
                    </p>
                    {formatFileSize(file.size) && (
                      <p className="text-[10px] text-gray-400">{formatFileSize(file.size)}</p>
                    )}
                  </div>

                  <span className="text-[10px] text-gray-300 flex-shrink-0">{index + 1}</span>
                </div>
              );
            })}
          </div>
        ))}

        {!isLoading && search && filteredFiles.length === 0 && files.length > 0 && (
          <div className="text-center py-8 text-gray-400 text-xs">
            Nenhuma música encontrada para "{search}"
          </div>
        )}

        {hasLoaded && files.length > 0 && !isLoading && (
          <div className="text-center py-4 text-[10px] text-gray-400">
            {files.length} músicas de {folders.length} pastas
          </div>
        )}
      </div>
    </div>
  );
};
