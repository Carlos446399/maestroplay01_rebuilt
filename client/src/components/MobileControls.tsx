import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onPreviousTrack: () => void;
  onNextTrack: () => void;
}

export const MobileControls = ({ 
  isPlaying, 
  onTogglePlay, 
  onPreviousTrack, 
  onNextTrack 
}: MobileControlsProps) => {
  return (
    <div className="flex items-center justify-center my-1 gap-4">
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
    </div>
  );
};
