import { X, Play, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { categoryService, CategoryPlaylist } from '@/services/categoryService';

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
  const [error, setError] = useState<string | null>(null);

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

  if (!isOpen || !category) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end">
      <div className="w-full bg-gradient-to-t from-black via-black to-gray-900 rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto">
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
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{category.name}</h2>
              <p className="text-gray-400 text-sm">
                {playlist?.tracks.length || 0} músicas
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

        {/* Playlist */}
        {playlist && !loading && (
          <div className="space-y-2">
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

                {/* Play Button */}
                <Play
                  size={20}
                  className="text-red-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  fill="currentColor"
                />
              </button>
            ))}
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

        {/* Espaço para scroll */}
        <div className="h-4" />
      </div>
    </div>
  );
};
