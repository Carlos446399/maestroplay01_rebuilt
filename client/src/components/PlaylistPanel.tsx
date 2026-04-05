import { X } from 'lucide-react';
import { Track } from '@/types/music';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { searchYouTube, YouTubeResult, YouTubeSearchResult } from '@/services/youtubeService';
import { CacheService } from '@/services/cacheService';
import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

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
  const [quotaUsage, setQuotaUsage] = useState(CacheService.getQuotaUsage());
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm.trim()) {
        handleOnlineSearch();
      } else {
        setYoutubeResults([]);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleOnlineSearch = async () => {
    if (!searchTerm.trim()) return;

    // Verificar cache primeiro
    const cachedResults = CacheService.getFromCache(searchTerm);
    if (cachedResults) {
      setYoutubeResults(cachedResults);
      return;
    }

    // Verificar quota
    const quota = CacheService.getQuotaUsage();
    if (quota.remaining <= 0) {
      setQuotaExceeded(true);
      setTimeout(() => setQuotaExceeded(false), 5000);
      return;
    }

    setIsSearching(true);
    try {
      // Registrar busca
      CacheService.recordSearch();
      setQuotaUsage(CacheService.getQuotaUsage());

      const results = await searchYouTube(searchTerm);
      
      // Salvar em cache
      CacheService.saveToCache(searchTerm, results.items);
      
      setYoutubeResults(results.items);
    } catch (error) {
      console.error('YouTube search error:', error);
    } finally {
      setIsSearching(false);
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

      {/* Quota Alert */}
      {quotaExceeded && (
        <div className="mx-4 mt-4 p-3 bg-red-900/50 border border-red-600 rounded flex items-center gap-2">
          <AlertCircle size={16} className="text-red-400" />
          <span className="text-xs text-red-300">Limite de buscas diárias atingido. Tente novamente amanhã!</span>
        </div>
      )}

      {/* Quota Usage Bar */}
      <div className="mx-4 mt-3 px-3 py-2 bg-black/50 rounded">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-gray-400">Buscas usadas hoje</span>
          <span className="text-[10px] text-gray-400">{quotaUsage.used}/{quotaUsage.limit}</span>
        </div>
        <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-300",
              quotaUsage.percentage > 80 ? "bg-red-600" :
              quotaUsage.percentage > 50 ? "bg-yellow-600" :
              "bg-green-600"
            )}
            style={{ width: `${quotaUsage.percentage}%` }}
          />
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 mx-4 mt-4">
        <Input
          type="text"
          placeholder="Buscar no YouTube..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={quotaUsage.remaining <= 0}
          className="h-9 text-xs bg-red-600 border border-red-700 text-white flex-1 placeholder-red-200 rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* Online Label */}
      <div className="px-4 mt-2 mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-red-500">🎵 Online</span>
        {quotaUsage.remaining <= 0 && (
          <span className="text-[10px] text-red-400 font-semibold">Limite atingido</span>
        )}
      </div>

      <div className="overflow-y-auto flex-1">
        {isSearching && (
          <div className="flex items-center justify-center py-8 bg-white">
            <div className="animate-spin h-6 w-6 border-2 border-red-500 border-t-transparent rounded-full"></div>
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
