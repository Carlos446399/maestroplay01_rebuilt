import { Search, Youtube, Music2 } from 'lucide-react';
import { Track } from '@/types/music';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface LocalPlaylistPanelProps {
  isOpen: boolean;
  tracks: Track[];
  onClose: () => void;
  onTrackSelect: (index: number) => void;
}

export const LocalPlaylistPanel = ({ 
  isOpen, 
  tracks, 
  onClose, 
  onTrackSelect
}: LocalPlaylistPanelProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTracks = tracks.filter(track =>
    track.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      // Just close on enter
    }
  };

  return (
    <div className={cn(
      "fixed left-0 w-full max-h-[60vh] z-30 transition-all duration-300 ease-in-out",
      "bg-white border-t-2 border-gray-200 flex flex-col pb-2",
      isOpen ? "bottom-0" : "-bottom-full"
    )}>
      <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-gray-100">
        <span className="text-sm font-black text-gray-800">🔍 Pesquisar músicas</span>
        <button
          onClick={onClose}
          className="text-red-500 hover:text-red-600 transition-colors p-1"
        >
          <ChevronDown size={26} />
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 mx-4 mt-3 bg-white">
        <Input
          type="text"
          placeholder="Buscar música local..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-9 text-xs bg-black !bg-black border border-gray-700 text-white !text-white flex-1 placeholder-gray-500 !placeholder-gray-500 rounded font-semibold"
        />
      </div>

      {/* Local Label */}
      <div className="px-4 mt-3 mb-2">
        <span className="text-xs font-semibold text-red-500">🎵 Minhas Músicas</span>
      </div>

      <div className="overflow-y-auto flex-1">
        {filteredTracks.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-xs bg-white">
            Nenhuma música local encontrada
          </div>
        )}
        {filteredTracks.map((track, index) => {
          const originalIndex = tracks.findIndex(t => t.id === track.id);
          const isYouTube = track.id.startsWith('yt-');
          
          return (
            <div
              key={track.id}
              className="px-4 py-2 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors bg-white flex items-center gap-3"
              onClick={() => {
                onTrackSelect(originalIndex);
                onClose();
              }}
            >
              <div className="relative w-10 h-10 flex-shrink-0">
                <img 
                  src={track.cover || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Crect fill="%23333" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="24" fill="%23999"%3E🎵%3C/text%3E%3C/svg%3E'} 
                  alt={track.name}
                  className="w-full h-full rounded object-cover"
                />
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                  {isYouTube ? (
                    <Youtube size={10} className="text-red-600" />
                  ) : (
                    <Music2 size={10} className="text-blue-600" />
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs text-black truncate block leading-tight font-medium">
                  {track.name}
                </span>
                <span className="text-[10px] text-gray-500">
                  {isYouTube ? 'Salvo do YouTube' : 'Arquivo Local'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
