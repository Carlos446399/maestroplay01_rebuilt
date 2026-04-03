import { X, Search, Loader2 } from 'lucide-react';
import { Track } from '@/types/music';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { searchYouTube, YouTubeResult } from '@/services/youtubeService';
import { useState } from 'react';

interface PlaylistPanelProps {
  isOpen: boolean;
  tracks: Track[];
  onClose: () => void;
  onTrackSelect: (index: number) => void;
  onYouTubePlay?: (videoId: string, title: string, thumbnail: string) => void;
}

export const PlaylistPanel = ({ 
  isOpen, 
  tracks, 
  onClose, 
  onTrackSelect,
  onYouTubePlay
}: PlaylistPanelProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [youtubeResults, setYoutubeResults] = useState<YouTubeResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleOnlineSearch = async () => {
    if (!searchTerm.trim()) return;
    setIsSearching(true);
    try {
      const results = await searchYouTube(searchTerm);
      setYoutubeResults(results);
    } catch (error) {
      console.error('YouTube search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleOnlineSearch();
    }
  };

  return (
    <div className={cn(
      "fixed left-0 w-full max-h-[60vh] z-10 transition-all duration-300 ease-in-out",
      "bg-black border-t-2 border-border flex flex-col pb-2",
      isOpen ? "bottom-0" : "-bottom-full"
    )}>
      <button
        onClick={onClose}
        className="absolute top-3 right-4 text-white text-2xl font-bold z-20 hover:text-red-500 transition-colors"
      >
        <X size={24} />
      </button>

      {/* Search */}
      <div className="flex items-center gap-2 mx-4 mt-4">
        <Input
          type="text"
          placeholder="Buscar no YouTube..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-9 text-xs bg-red-600 border border-red-700 text-white flex-1 placeholder-red-200 rounded font-semibold"
        />
        <button
          onClick={handleOnlineSearch}
          disabled={isSearching}
          className="h-9 px-4 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50 flex-shrink-0 font-semibold"
        >
          {isSearching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
        </button>
      </div>

      {/* Online Label */}
      <div className="px-4 mt-3 mb-2">
        <span className="text-xs font-semibold text-red-500">🎵 Online</span>
      </div>

      <div className="overflow-y-auto flex-1">
        {isSearching && (
          <div className="flex items-center justify-center py-8 bg-white">
            <Loader2 className="animate-spin text-red-500" size={24} />
            <span className="ml-2 text-sm text-gray-500">Buscando...</span>
          </div>
        )}
        {!isSearching && youtubeResults.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-xs bg-white">
            Pesquise músicas e artistas online
          </div>
        )}
        {youtubeResults.map((result) => (
          <div
            key={result.id}
            className="px-4 py-2 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors flex items-center gap-3 bg-white"
            onClick={() => {
              onYouTubePlay?.(result.id, result.title, result.thumbnail);
              onClose();
            }}
          >
            <img 
              src={result.thumbnail} 
              alt={result.title}
              className="w-10 h-10 rounded object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <span className="text-xs text-black truncate block leading-tight">
                {result.title}
              </span>
              <span className="text-[10px] text-gray-500 truncate block">
                {result.channelTitle}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
