import { useState, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronRight, Music2, Loader2, AlertCircle, HardDrive, ArrowLeft, Search, X, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  listFolderContents,
  getDriveThumbnail,
  formatFileSize,
  cleanFolderName,
  FOLDER_MIME,
  AUDIO_MIME_TYPES,
  DriveItem,
} from '@/services/googleDriveService';
import { favoritesStorage } from '@/services/favoritesStorage';

const ROOT_FOLDER_ID = '1zqRZc6TRZkQafTOhCokzyD6HUWpTQusx';

interface BreadcrumbItem { id: string; name: string; }

interface DrivePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onPlaySong: (fileId: string, title: string, cover?: string, playlist?: Array<{id: string; name: string; cover?: string}>, index?: number) => void;
}

export const DrivePanel = ({ isOpen, onClose, onPlaySong }: DrivePanelProps) => {
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbItem[]>([
    { id: ROOT_FOLDER_ID, name: 'Google Drive' }
  ]);
  const [items, setItems] = useState<DriveItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [driveFavorites, setDriveFavorites] = useState<Set<string>>(new Set());

  // Carregar favoritos do Drive ao montar
  useEffect(() => {
    const stored = favoritesStorage.getAll();
    setDriveFavorites(new Set(stored.filter(f => f.id.startsWith('drive-')).map(f => f.id)));
  }, []);

  const toggleDriveFavorite = (file: DriveItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const title = file.name.replace(/\.[^/.]+$/, '');
    const cover = getDriveThumbnail(file);
    const updated = favoritesStorage.toggle({
      id: `drive-${file.id}`,
      name: title,
      cover,
      type: 'youtube',
      youtubeId: file.id,
    });
    setDriveFavorites(new Set(updated.filter(f => f.id.startsWith('drive-')).map(f => f.id)));
  };

  const currentFolder = breadcrumb[breadcrumb.length - 1];

  const loadFolder = useCallback(async (folderId: string) => {
    setIsLoading(true);
    setError(null);
    setSearch('');
    try {
      const contents = await listFolderContents(folderId);
      setItems(contents);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar pasta.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Carrega raiz ao abrir pela primeira vez
  useEffect(() => {
    if (isOpen && breadcrumb.length === 1 && items.length === 0 && !isLoading) {
      loadFolder(ROOT_FOLDER_ID);
    }
  }, [isOpen]);

  const openFolder = (folder: DriveItem) => {
    setBreadcrumb(prev => [...prev, { id: folder.id, name: cleanFolderName(folder.name) }]);
    loadFolder(folder.id);
  };

  const goBack = () => {
    if (breadcrumb.length <= 1) return;
    const newBc = breadcrumb.slice(0, -1);
    setBreadcrumb(newBc);
    loadFolder(newBc[newBc.length - 1].id);
  };

  const goTo = (index: number) => {
    const newBc = breadcrumb.slice(0, index + 1);
    setBreadcrumb(newBc);
    loadFolder(newBc[newBc.length - 1].id);
  };

  const handlePlay = (file: DriveItem) => {
    const title = file.name.replace(/\.[^/.]+$/, '');
    const cover = getDriveThumbnail(file);
    setPlayingId(file.id);
    // Passa a lista completa de músicas para navegação próxima/anterior
    const playlist = filteredAudio.map(f => ({
      id: f.id,
      name: f.name.replace(/\.[^/.]+$/, ''),
      cover: getDriveThumbnail(f),
    }));
    const index = filteredAudio.findIndex(f => f.id === file.id);
    onPlaySong(file.id, title, cover, playlist, index);
  };

  const folders = items.filter(i => i.mimeType === FOLDER_MIME);
  const audioFiles = items.filter(i => AUDIO_MIME_TYPES.has(i.mimeType));
  const otherFiles = items.filter(i => i.mimeType !== FOLDER_MIME && !AUDIO_MIME_TYPES.has(i.mimeType));

  const filteredFolders = search
    ? folders.filter(f => cleanFolderName(f.name).toLowerCase().includes(search.toLowerCase()))
    : folders;

  const filteredAudio = search
    ? audioFiles.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
    : audioFiles;

  const isRoot = breadcrumb.length === 1;

  return (
    <div className={cn(
      'fixed left-0 w-full max-h-[80vh] z-30 flex flex-col bg-white border-t-2 border-gray-200 transition-all duration-300 ease-in-out',
      isOpen ? 'bottom-0' : '-bottom-full'
    )}>
      {/* Header */}
      <div className="flex items-center gap-2 px-3 pt-2 pb-2 border-b border-gray-100">
        {!isRoot && (
          <button onClick={goBack} className="text-gray-500 hover:text-gray-700 p-1 flex-shrink-0">
            <ArrowLeft size={18} />
          </button>
        )}
        <HardDrive size={14} className="text-green-600 flex-shrink-0" />

        {/* Breadcrumb */}
        <div className="flex items-center gap-1 flex-1 min-w-0 overflow-x-auto scrollbar-none">
          {breadcrumb.map((bc, i) => (
            <div key={bc.id} className="flex items-center gap-1 flex-shrink-0">
              {i > 0 && <ChevronRight size={10} className="text-gray-300" />}
              <button
                onClick={() => i < breadcrumb.length - 1 ? goTo(i) : undefined}
                className={cn(
                  'text-xs truncate max-w-[120px]',
                  i === breadcrumb.length - 1
                    ? 'text-gray-800 font-bold'
                    : 'text-gray-400 hover:text-gray-600'
                )}
              >
                {bc.name}
              </button>
            </div>
          ))}
        </div>

        <button onClick={onClose} className="text-red-500 hover:text-red-600 flex-shrink-0">
          <ChevronDown size={22} />
        </button>
      </div>

      {/* Busca */}
      {items.length > 0 && (
        <div className="px-3 py-2 border-b border-gray-100 flex items-center gap-2">
          <Search size={13} className="text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder={audioFiles.length > 0 ? 'Buscar músicas...' : 'Buscar pastas...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 text-xs focus:outline-none text-gray-800 bg-transparent"
          />
          {search && (
            <button onClick={() => setSearch('')}>
              <X size={13} className="text-gray-400" />
            </button>
          )}
        </div>
      )}

      {/* Conteúdo */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <Loader2 className="animate-spin text-green-500" size={24} />
            <p className="text-xs text-gray-500">Carregando...</p>
          </div>
        )}

        {error && !isLoading && (
          <div className="flex flex-col items-center py-8 gap-3 px-6">
            <AlertCircle size={24} className="text-red-500" />
            <p className="text-xs text-red-600 text-center">{error}</p>
            <button
              onClick={() => loadFolder(currentFolder.id)}
              className="text-xs px-4 py-1.5 bg-green-600 text-white rounded-full"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {!isLoading && !error && (
          <>
            {/* Pastas */}
            {filteredFolders.length > 0 && (
              <div>
                {audioFiles.length === 0 && (
                  <div className="px-4 py-1.5 bg-gray-50 border-b border-gray-100">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                      {filteredFolders.length} pastas
                    </span>
                  </div>
                )}
                {filteredFolders.map(folder => (
                  <div
                    key={folder.id}
                    onClick={() => openFolder(folder)}
                    className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-green-50 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg">📁</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">
                        {cleanFolderName(folder.name)}
                      </p>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
                  </div>
                ))}
              </div>
            )}

            {/* Músicas */}
            {filteredAudio.length > 0 && (
              <div>
                <div className="px-4 py-1.5 bg-green-50 border-b border-green-100 sticky top-0 z-10">
                  <span className="text-[10px] font-bold text-green-700 uppercase tracking-wide">
                    {filteredAudio.length} músicas
                  </span>
                </div>
                {filteredAudio.map((file, index) => {
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
                      <button
                        onClick={(e) => toggleDriveFavorite(file, e)}
                        className="p-1 flex-shrink-0"
                      >
                        <Star
                          size={16}
                          className={cn(
                            'transition-colors',
                            driveFavorites.has(`drive-${file.id}`)
                              ? 'text-red-500 fill-red-500'
                              : 'text-gray-300'
                          )}
                        />
                      </button>
                      <span className="text-[10px] text-gray-300 flex-shrink-0">{index + 1}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pasta vazia */}
            {filteredFolders.length === 0 && filteredAudio.length === 0 && otherFiles.length === 0 && items.length > 0 && (
              <div className="text-center py-10 text-gray-400 text-xs">
                {search ? `Nenhum resultado para "${search}"` : 'Pasta vazia'}
              </div>
            )}

            {/* Pasta raiz vazia */}
            {items.length === 0 && (
              <div className="flex flex-col items-center py-10 gap-2">
                <Music2 size={28} className="text-gray-300" />
                <p className="text-xs text-gray-400">Nada encontrado nesta pasta</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
