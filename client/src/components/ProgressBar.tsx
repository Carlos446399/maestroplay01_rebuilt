import { Slider } from '@/components/ui/slider';

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
};

export const ProgressBar = ({ currentTime, duration, onSeek }: ProgressBarProps) => {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleValueChange = (values: number[]) => {
    const newTime = (values[0] / 100) * duration;
    onSeek(newTime);
  };

  return (
    <div className="w-[90%] flex items-center justify-between my-1">
      <div className="text-xs text-muted-foreground min-w-[35px]">
        {formatTime(currentTime)}
      </div>
      <div className="flex-1 mx-3">
        <Slider
          value={[progress]}
          onValueChange={handleValueChange}
          max={100}
          step={0.1}
          className="w-full"
        />
      </div>
      <div className="text-xs text-muted-foreground min-w-[35px]">
        {formatTime(duration)}
      </div>
    </div>
  );
};
