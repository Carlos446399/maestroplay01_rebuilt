import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, HardDrive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SleepTimerButton } from './SleepTimerButton';

interface MobileControlsProps {
  isPlaying: boolean;
  onTogglePlay?: () => void;
  onPreviousTrack?: () => void;
  onNextTrack?: () => void;
  repeatMode: 'off' | 'all' | 'one';
  onToggleRepeat?: () => void;
  isShuffle: boolean;
  onToggleShuffle?: () => void;
  isLocked?: boolean;
  onOpenDriveSearch?: () => void;
  onSleepTimerEnd?: () => void;
}

export const MobileControls = ({ 
  isPlaying, 
  onTogglePlay, 
  onPreviousTrack, 
  onNextTrack,
  repeatMode,
  onToggleRepeat,
  isShuffle,
  onToggleShuffle,
  isLocked = false,
  onOpenDriveSearch,
  onSleepTimerEnd,
}: MobileControlsProps) => {
  return (
    <div className="flex items-center justify-center my-1 gap-2">
      {/* Busca no Google Drive */}
      {onOpenDriveSearch && (
        <button
          onClick={onOpenDriveSearch}
          disabled={isLocked}
          title="Buscar no Google Drive"
          className={cn(
            "p-1.5 rounded-full bg-green-500/20 text-green-300 hover:bg-green-500/30 border border-green-400/30 transition-all",
            isLocked && "opacity-50 cursor-not-allowed"
          )}
        >
          <HardDrive size={14} />
        </button>
      )}

      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleRepeat}
        disabled={isLocked}
        className={cn(
          `relative transition-all scale-100`,
          isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110',
          repeatMode !== 'off' ? 'text-red-600' : 'text-white',
          'hover:bg-white/10'
        )}
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
        disabled={isLocked}
        className={cn(
          'text-white transition-all',
          isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10'
        )}
      >
        <SkipBack size={24} />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={onTogglePlay}
        disabled={isLocked}
        className={cn(
          'w-14 h-14 rounded-full border-2 border-white/20 text-white transition-all',
          isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10'
        )}
      >
        {isPlaying ? <Pause size={24} /> : <Play size={24} />}
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={onNextTrack}
        disabled={isLocked}
        className={cn(
          'text-white transition-all',
          isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10'
        )}
      >
        <SkipForward size={24} />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleShuffle}
        disabled={isLocked}
        className={cn(
          `transition-all scale-100`,
          isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110',
          isShuffle ? 'text-red-600' : 'text-white',
          'hover:bg-white/10'
        )}
      >
        <Shuffle size={24} />
      </Button>

      {/* Temporizador de soneca */}
      {onSleepTimerEnd && !isLocked && (
        <SleepTimerButton onTimerEnd={onSleepTimerEnd} />
      )}
    </div>
  );
};
