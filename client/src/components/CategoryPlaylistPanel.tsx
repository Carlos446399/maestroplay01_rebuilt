import { X, Play, Loader2, Download, CheckCircle2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
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
  onPlayPlaylist?: (songs: Array<{id: string; title: string; thumbnail: string}>, startIndex: number) => void;
}

export const CategoryPlaylistPanel = ({
  isOpen,
  category,
  onClose,
  onTrackSelect,
  onPlayPlaylist,
}: CategoryPlaylistPanelProps) => {
  const [playlist, setPlaylist] = useState<CategoryPlaylist | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadingIds, setDownloadingIds] = useState<Record<string, DownloadProgress>>({});
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="text-4xl">🎵</div>
            <div>
              <h2 className="text-2xl font-bold text-white">{category.name}</h2>
              <p className="text-gray-400 text-sm">{playlist?.tracks.length || 0} músicas</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/10">
            <X size={24} />
          </Button>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="animate-spin text-red-600 mb-4" size={40} />
            <p className="text-gray-400">Carregando músicas...</p>
          </div>
        )}

        {playlist && !loading && (
          <div ref={scrollContainerRef} className="overflow-y-auto flex-1 space-y-2 pr-2">
            {playlist.tracks.map((track, index) => (
              <button
                key={track.id}
                onClick={() => {
                  if (onPlayPlaylist) {
                    onPlayPlaylist(playlist.tracks, index);
                  } else {
                    onTrackSelect(track.id, track.title, track.thumbnail);
                  }
                  onClose();
                }}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-gray-900/50 hover:bg-gray-800 transition-all duration-200 group"
              >
                <span className="text-gray-500 font-semibold w-6 text-center">{index + 1}</span>
                <img src={track.thumbnail} alt={track.title} className="w-12 h-12 rounded object-cover" />
                <div className="flex-1 text-left min-w-0">
                  <p className="text-white font-medium truncate text-sm">{track.title}</p>
                </div>
                <Play size={20} className="text-red-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" fill="currentColor" />
              </button>
            ))}
            {loadingMore && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="animate-spin text-red-600" size={24} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
