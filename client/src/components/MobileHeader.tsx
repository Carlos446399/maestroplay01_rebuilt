import { BarChart2, Search } from 'lucide-react';
import { SleepTimerButton } from './SleepTimerButton';

interface MobileHeaderProps {
  onSleepTimerEnd: () => void;
  onOpenStats: () => void;
  onOpenUnifiedSearch: () => void;
}

export const MobileHeader = ({ onSleepTimerEnd, onOpenStats, onOpenUnifiedSearch }: MobileHeaderProps) => {
  return (
    <div className="w-full px-4 py-1 flex justify-between items-center gap-2">
      <h1 className="text-lg font-bold text-golden tracking-wide">Maestro Play</h1>
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenUnifiedSearch}
          className="p-1.5 rounded-full bg-white/10 text-white hover:bg-white/20 border border-white/20 transition-all"
        >
          <Search size={14} />
        </button>
        <button
          onClick={onOpenStats}
          className="p-1.5 rounded-full bg-white/10 text-white hover:bg-white/20 border border-white/20 transition-all"
        >
          <BarChart2 size={14} />
        </button>
        <SleepTimerButton onTimerEnd={onSleepTimerEnd} />
      </div>
    </div>
  );
};
