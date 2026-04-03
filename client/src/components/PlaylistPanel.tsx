import { useState } from 'react';
import { X, Search, Loader2, Youtube } from 'lucide-react';
import { Track } from '@/types/music';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { searchYouTube, YouTubeResult } from '@/services/youtubeService';

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
  const [activeTab, setActiveTab] = useState<'local' | 'online'>('local');
  const [youtubeResults, setYoutubeResults] = useState<YouTubeResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const filteredTracks = tracks.filter(track =>
    track.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    if (e.key === 'Enter' && activeTab === 'online') {
      handleOnlineSearch();
    }
  };

  return (
    <div className={cn(
      "fixed left-0 w-full max-h-[60vh] z-10 transition-all duration-300 ease-in-out",
      "bg-background border-t-2 border-border flex flex-col pb-2",
      isOpen ? "bottom-0" : "-bottom-full"
    )}>
      <button
        onClick={onClose}
        className="absolute top-3 right-4 text-white text-2xl font-bold z-20 hover:text-red-500 transition-colors"
      >
        <X size={24} />
      </button>

      {/* Tabs */}
      <div className="flex mt-2 mx-4 gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab('local')}
          className={cn(
            "flex-1 py-2 text-xs font-semibold transition-colors relative",
            activeTab === 'local' 
              ? "text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-white" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Minhas Músicas
        </button>
        <button
          onClick={() => setActiveTab('online')}
          className={cn(
            "flex-1 py-2 text-xs font-semibold transition-colors relative flex items-center justify-center gap-1",
            activeTab === 'online' 
              ? "text-red-500 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-red-500" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Youtube size={14} />
          Online
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 mx-4 mt-2">
        <Input
          type="text"
          placeholder={activeTab === 'local' ? "Buscar música..." : "Buscar no YouTube..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-8 text-xs bg-input border-border text-foreground flex-1 placeholder-muted-foreground"
        />
        {activeTab === 'online' && (
          <button
            onClick={handleOnlineSearch}
            disabled={isSearching}
            className="h-8 px-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 flex-shrink-0"
          >
            {isSearching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          </button>
        )}
      </div>

      <div className="overflow-y-auto flex-1 mt-2">
        {activeTab === 'local' ? (
          <>
            <div className="px-4 py-2 border-b border-border">
              <span className="text-xs text-muted-foreground">
                Músicas: {filteredTracks.length}
              </span>
            </div>
            {filteredTracks.map((track) => (
              <div
                key={track.id}
                className="px-4 py-2.5 border-b border-border cursor-pointer hover:bg-card transition-colors"
                onClick={() => {
                  const originalIndex = tracks.findIndex(t => t.id === track.id);
                  onTrackSelect(originalIndex);
                  onClose();
                }}
              >
                <span className="text-sm text-white truncate block">
                  {track.name}
                </span>
              </div>
            ))}
          </>
        ) : (
          <>
            {isSearching && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-red-400" size={24} />
                <span className="ml-2 text-sm text-muted-foreground">Buscando...</span>
              </div>
            )}
            {!isSearching && youtubeResults.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-xs">
                Pesquise músicas e artistas online
              </div>
            )}
            {youtubeResults.map((result) => (
              <div
                key={result.id}
                className="px-4 py-2 border-b border-border cursor-pointer hover:bg-card transition-colors flex items-center gap-3"
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
                  <span className="text-xs text-white truncate block leading-tight">
                    {result.title}
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate block">
                    {result.channelTitle}
                  </span>
                </div>
                <Youtube size={14} className="text-red-500 flex-shrink-0" />
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};
