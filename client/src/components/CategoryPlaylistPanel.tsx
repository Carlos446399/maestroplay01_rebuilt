import { X, Play, Loader2, Download, CheckCircle2 } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { categoryService, CategoryPlaylist } from '@/services/categoryService';
import { youtubeDownloader, DownloadProgress } from '@/services/youtubeDownloader';
import { toast } from 'sonner';

interface CategoryPlaylistPanelProps {
  isOpen: boolean;
  category: {
    id: string;
    name: string;
    query: string;
  } | null;
  onClose: () => void;
  onTrackSelect: (trackId: string, trackTitle: string, trackThumbnail: string) => void;
}

export const CategoryPlaylistPanel = ({
  isOpen,
  category,
  onClose,
  onTrackSelect,
}: CategoryPlaylistPanelProps) => {
  const [playlist, setPlaylist] = useState<CategoryPlaylist | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadingIds, setDownloadingIds] = useState<Record<string, DownloadProgress>>({});
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Verificar quais vídeos já estão salvos
  useEffect(() => {
    const checkSaved = async () => {
      if (!playlist?.tracks) return;
      const newSavedIds = new Set<string>();
      for (const track of playlist.tracks) {
        const isSaved = await youtubeDownloader.isSaved(track.id);
        if (isSaved) newSavedIds.add(track.id);
      }
      setSavedIds(newSavedIds);
    };
    checkSaved();
  }, [playlist?.tracks]);

  useEffect(() => {
    if (isOpen && category) {
      loadPlaylist();
    }
  }, [isOpen, category]);

  const loadPlaylist = async () => {
    if (!category) return;

    setLoading(true);
    setError(null);

    try {
      const result = await categoryService.loadCategoryPlaylist(
        category.id,
        category.name,
        category.query
      );
      setPlaylist(result);
    } catch (err) {
      setError('Erro ao carregar playlist da categoria');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreTracks = async () => {
    if (!category || !playlist?.nextPageToken || loadingMore) return;

    setLoadingMore(true);
    try {
      const result = await categoryService.loadCategoryPlaylist(
        category.id,
        category.name,
        category.query,
        playlist.nextPageToken
      );

      // Combinar tracks anteriores com novos
      setPlaylist(prev => {
        if (!prev) return result;
        return {
          ...prev,
          tracks: [...prev.tracks, ...result.tracks],
          nextPageToken: result.nextPageToken,
        };
      });
    } catch (err) {
      console.error('Erro ao carregar mais músicas:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Detectar scroll infinito
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      // Carregar mais quando chegar a 80% do scroll
      if (scrollHeight - scrollTop - clientHeight < 200 && !loadingMore && playlist?.nextPageToken) {
        loadMoreTracks();
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [playlist, loadingMore]);

  if (!isOpen || !category) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end">
      <div className="w-full bg-gradient-to-t from-black via-black to-gray-900 rounded-t-3xl p-6 max-h-[60vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="text-4xl">
              {category.id === 'pop' && '🎤'}
              {category.id === 'rock' && '🎸'}
              {category.id === 'sertanejo' && '🤠'}
              {category.id === 'funk' && '🎵'}
              {category.id === 'eletronico' && '🎛️'}
              {category.id === 'reggae' && '🌴'}
              {category.id === 'hiphop' && '🎤'}
              {category.id === 'forro' && '🪗'}
              {category.id === 'mpb' && '🎶'}
              {category.id === 'samba' && '🥁'}
              {category.id === 'bossanova' && '🎹'}
              {category.id === 'pagode' && '🎸'}
              {category.id === 'axe' && '🎉'}
              {category.id === 'forrouni' && '🎺'}
              {category.id === 'jazz' && '🎷'}
              {category.id === 'blues' && '🎸'}
              {category.id === 'country' && '🤠'}
              {category.id === 'metal' && '🎸'}
              {category.id === 'indie' && '🎸'}
              {category.id === 'alternativo' && '🎸'}
              {category.id === 'dance' && '💃'}
              {category.id === 'edm' && '🎧'}
              {category.id === 'techno' && '🎛️'}
              {category.id === 'house' && '🏠'}
              {category.id === 'trap' && '🎤'}
              {category.id === 'classica' && '🎻'}
              {category.id === 'orquestra' && '🎻'}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{category.name}</h2>
              <p className="text-gray-400 text-sm">
                {playlist?.tracks.length || 0} músicas
                {playlist?.nextPageToken && ' (+ disponíveis)'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/10"
          >
            <X size={24} />
          </Button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="animate-spin text-red-600 mb-4" size={40} />
            <p className="text-gray-400">Carregando músicas...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/30 border border-red-600 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
            <Button
              onClick={loadPlaylist}
              className="mt-3 bg-red-600 hover:bg-red-700 text-white"
            >
              Tentar Novamente
            </Button>
          </div>
        )}

        {/* Playlist with Infinite Scroll */}
        {playlist && !loading && (
          <div
            ref={scrollContainerRef}
            className="overflow-y-auto flex-1 space-y-2 pr-2"
          >
            {playlist.tracks.map((track, index) => (
              <button
                key={track.id}
                onClick={() => {
                  onTrackSelect(track.id, track.title, track.thumbnail);
                  onClose();
                }}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-gray-900/50 hover:bg-gray-800 
                  transition-all duration-200 group"
              >
                {/* Número */}
                <span className="text-gray-500 font-semibold w-6 text-center">
                  {index + 1}
                </span>

                {/* Thumbnail */}
                <img
                  src={track.thumbnail}
                  alt={track.title}
                  className="w-12 h-12 rounded object-cover"
                />

                {/* Info */}
                <div className="flex-1 text-left min-w-0">
                  <p className="text-white font-medium truncate text-sm">
                    {track.title}
                  </p>
                </div>

                {/* Download Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (savedIds.has(track.id)) {
                      toast.info('Esta música já está salva offline');
                      return;
                    }
                    if (downloadingIds[track.id]) return;

                    toast.promise(
                      youtubeDownloader.saveForOffline(
                        track.id,
                        track.title,
                        track.thumbnail,
                        (p) => setDownloadingIds(prev => ({ ...prev, [track.id]: p }))
                      ),
                      {
                        loading: 'Preparando download...',
                        success: () => {
                          setSavedIds(prev => new Set(prev).add(track.id));
                          setDownloadingIds(prev => {
                            const next = { ...prev };
                            delete next[track.id];
                            return next;
                          });
                          return 'Música salva offline!';
                        },
                        error: 'Erro ao salvar música'
                      }
                    );
                  }}
                  className="p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
                >
                  {downloadingIds[track.id] ? (
                    <Loader2 className="animate-spin text-red-600" size={18} />
                  ) : savedIds.has(track.id) ? (
                    <CheckCircle2 className="text-green-600" size={18} />
                  ) : (
                    <Download className="text-red-600" size={18} />
                  )}
                </button>

                {/* Play Button */}
                <Play
                  size={20}
                  className="text-red-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  fill="currentColor"
                />
              </button>
            ))}

            {/* Loading More Indicator */}
            {loadingMore && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="animate-spin text-red-600" size={24} />
                <span className="ml-2 text-gray-400 text-sm">Carregando mais...</span>
              </div>
            )}

            {/* End of List */}
            {playlist && !playlist.nextPageToken && playlist.tracks.length > 0 && (
              <div className="text-center py-4">
                <p className="text-gray-500 text-sm">Fim da lista</p>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {playlist && playlist.tracks.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-400 text-center">
              Nenhuma música encontrada para esta categoria
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
