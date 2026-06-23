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
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>(undefined);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [search, setSearch] = useState('');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const loadFiles = useCallback(async (reset = false) => {
    if (isLoading || isLoadingMore) return;

    if (reset) {
      setIsLoading(true);
      setError(null);
      setFiles([]);
      setNextPageToken(undefined);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const token = reset ? undefined : nextPageToken;
      const result = await listDriveAudioFiles(DRIVE_FOLDER_ID, token);

      setFiles(prev => reset ? result.files : [...prev, ...result.files]);
      setNextPageToken(result.nextPageToken);
      setHasLoaded(true);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar arquivos do Drive.');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [isLoading, isLoadingMore, nextPageToken]);

  // Carregar ao abrir pela primeira vez
  useEffect(() => {
    if (isOpen && !hasLoaded) {
      loadFiles(true);
    }
  }, [isOpen, hasLoaded]);

  // Scroll infinito
  const handleScroll = useCallback(() => {
    const el = listRef.current;
    if (!el || isLoadingMore || !nextPageToken) return;
    if (el.scrollHeight - el.scrollTop <= el.clientHeight + 150) {
      loadFiles(false);
    }
  }, [isLoadingMore, nextPageToken, loadFiles]);

  const filteredFiles = files.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const handlePlay = (file: DriveAudioFile) => {
    const url = getDriveStreamUrl(file.id);
    const title = file.name.replace(/\.[^/.]+$/, ''); // remove extensão
    const cover = getDriveThumbnail(file);
    setPlayingId(file.id);
    onPlaySong(url, title, cover);
  };

  return (
    <div
      className={cn(
        'fixed left-0 w-full max-h-[75vh] z-30 flex flex-col',
        'bg-white border-t-2 border-gray-200 transition-all duration-300 ease-in-out',
        isOpen ? 'bottom-0' : '-bottom-full'
      )}
    >
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
            <button
              onClick={() => { setSearch(''); loadFiles(true); }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Recarregar"
            >
              <RefreshCw size={14} />
            </button>
          )}
          <button onClick={onClose} className="text-red-500 hover:text-red-600 transition-colors">
            <ChevronDown size={24} />
          </button>
        </div>
      </div>

      {/* Busca */}
      {files.length > 0 && (
        <div className="px-4 py-2 border-b border-gray-100">
          <input
            type="text"
            placeholder="Filtrar músicas..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full text-xs px-3 py-1.5 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-800 bg-gray-50"
          />
        </div>
      )}

      {/* Conteúdo */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto"
        onScroll={handleScroll}
      >
        {/* Carregando pela 1ª vez */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="animate-spin text-green-500" size={28} />
            <p className="text-xs text-gray-500">Carregando músicas do Drive...</p>
          </div>
        )}

        {/* Erro */}
        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center py-10 gap-3 px-4">
            <AlertCircle size={28} className="text-red-500" />
            <p className="text-xs text-red-600 text-center">{error}</p>
            <p className="text-[10px] text-gray-400 text-center">
              Verifique se a pasta está pública e se a Drive API está habilitada na chave do Google Cloud.
            </p>
            <button
              onClick={() => loadFiles(true)}
              className="text-xs px-4 py-1.5 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Vazio */}
        {!isLoading && !error && hasLoaded && files.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <Music2 size={28} className="text-gray-300" />
            <p className="text-xs text-gray-400">Nenhum arquivo de áudio encontrado nesta pasta.</p>
          </div>
        )}

        {/* Lista de músicas */}
        {!isLoading && filteredFiles.map((file, index) => {
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
              {/* Capa / ícone */}
              <div className="relative w-10 h-10 flex-shrink-0">
                {cover ? (
                  <img
                    src={cover}
                    alt={title}
                    className="w-full h-full rounded object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded bg-green-100 flex items-center justify-center">
                    <Music2 size={18} className={isPlaying ? 'text-green-600' : 'text-green-400'} />
                  </div>
                )}
                {isPlaying && (
                  <div className="absolute inset-0 rounded bg-green-600/20 flex items-center justify-center">
                    <div className="flex gap-0.5 items-end h-4">
                      {[1, 2, 3].map(i => (
                        <div
                          key={i}
                          className="w-1 bg-green-600 rounded-full animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s`, height: `${8 + i * 4}px` }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className={cn(
                  'text-xs font-medium truncate',
                  isPlaying ? 'text-green-700' : 'text-gray-800'
                )}>
                  {title}
                </p>
                <p className="text-[10px] text-gray-400 flex items-center gap-1">
                  <HardDrive size={8} />
                  Google Drive {formatFileSize(file.size) ? `· ${formatFileSize(file.size)}` : ''}
                </p>
              </div>

              {/* Número */}
              <span className="text-[10px] text-gray-300 flex-shrink-0">
                {index + 1}
              </span>
            </div>
          );
        })}

        {/* Filtro sem resultados */}
        {!isLoading && search && filteredFiles.length === 0 && files.length > 0 && (
          <div className="text-center py-8 text-gray-400 text-xs">
            Nenhuma música encontrada para "{search}"
          </div>
        )}

        {/* Carregando mais */}
        {isLoadingMore && (
          <div className="flex justify-center py-4">
            <Loader2 className="animate-spin text-green-500" size={20} />
          </div>
        )}

        {/* Fim da lista */}
        {!isLoadingMore && !nextPageToken && files.length > 0 && (
          <div className="text-center py-4 text-[10px] text-gray-400">
            {files.length} músicas carregadas
          </div>
        )}
      </div>
    </div>
  );
};
