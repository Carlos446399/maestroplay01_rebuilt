import { Star } from 'lucide-react';
import { Track } from '@/types/music';
import { cn } from '@/lib/utils';

interface HorizontalPlaylistProps {
  tracks: Track[];
  currentTrackIndex: number;
  onTrackSelect: (index: number) => void;
}

const defaultCover = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Crect fill="%23333" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="24" fill="%23999"%3E🎵%3C/text%3E%3C/svg%3E';

export const HorizontalPlaylist = ({ 
  tracks, 
  currentTrackIndex, 
  onTrackSelect 
}: HorizontalPlaylistProps) => {
  if (tracks.length === 0) return null;

  return (
    <div className="flex gap-3 px-2 py-1 mt-1 overflow-x-auto custom-scrollbar w-full">
      {tracks.map((track, index) => (
        <div
          key={track.id}
          className={cn(
            "flex-shrink-0 w-[70px] bg-card rounded cursor-pointer p-1",
            "flex flex-col items-center",
            "transition-all duration-200",
            index === currentTrackIndex && "border-2 border-red-accent"
          )}
          onClick={() => onTrackSelect(index)}
        >
          <div className="relative w-full h-[60px]">
            <img
              src={track.cover || defaultCover}
              alt={track.name}
              className="w-full h-full object-cover rounded"
            />
            <Star className="absolute top-0.5 right-0.5 text-red-accent fill-red-accent" size={10} />
          </div>
          <span className="text-[8px] text-muted-foreground text-center leading-tight mt-0.5 w-full truncate px-0.5">
            {track.name}
          </span>
        </div>
      ))}
    </div>
  );
};
