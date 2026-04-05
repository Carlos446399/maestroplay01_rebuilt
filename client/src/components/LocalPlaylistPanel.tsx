import { X, Search } from 'lucide-react';
import { Track } from '@/types/music';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useState } from 'react';

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
      "fixed left-0 w-full max-h-[60vh] z-10 transition-all duration-300 ease-in-out",
      "bg-white border-t-2 border-gray-300 flex flex-col pb-2",
      isOpen ? "bottom-0" : "-bottom-full"
    )}>
      <div className="flex justify-center pt-2 pb-2">
        <button
          onClick={onClose}
          className="text-white text-2xl font-bold hover:text-red-500 transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 mx-4 mt-4 bg-white">
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
          return (
            <div
              key={track.id}
              className="px-4 py-2 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors bg-white"
              onClick={() => {
                onTrackSelect(originalIndex);
                onClose();
              }}
            >
              <span className="text-xs text-black truncate block leading-tight">
                {track.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
