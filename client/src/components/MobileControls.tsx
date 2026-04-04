import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onPreviousTrack: () => void;
  onNextTrack: () => void;
  repeatMode: 'off' | 'all' | 'one';
  onToggleRepeat: () => void;
  isShuffle: boolean;
  onToggleShuffle: () => void;
}

export const MobileControls = ({ 
  isPlaying, 
  onTogglePlay, 
  onPreviousTrack, 
  onNextTrack,
  repeatMode,
  onToggleRepeat,
  isShuffle,
  onToggleShuffle
}: MobileControlsProps) => {
  return (
    <div className="flex items-center justify-center my-1 gap-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleRepeat}
        className={`relative transition-all scale-100 hover:scale-110 ${
          repeatMode !== 'off' ? 'text-red-600' : 'text-white'
        } hover:bg-white/10`}
      >
        <Repeat size={24} />
        {repeatMode === 'one' && (
          <span className="absolute text-xs font-bold text-red-600 -bottom-1 -right-1">1</span>
        )}
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={onPreviousTrack}
        className="text-white hover:bg-white/10"
      >
        <SkipBack size={24} />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={onTogglePlay}
        className="w-14 h-14 rounded-full border-2 border-white/20 text-white hover:bg-white/10"
      >
        {isPlaying ? <Pause size={24} /> : <Play size={24} />}
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={onNextTrack}
        className="text-white hover:bg-white/10"
      >
        <SkipForward size={24} />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleShuffle}
        className={`transition-all scale-100 hover:scale-110 ${
          isShuffle ? 'text-red-600' : 'text-white'
        } hover:bg-white/10`}
      >
        <Shuffle size={24} />
      </Button>
    </div>
  );
};
