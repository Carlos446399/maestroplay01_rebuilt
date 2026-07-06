import { BarChart2, HardDrive } from 'lucide-react';
import { SleepTimerButton } from './SleepTimerButton';

interface MobileHeaderProps {
  onSleepTimerEnd: () => void;
  onOpenStats: () => void;
  onOpenDriveSearch: () => void;
}

export const MobileHeader = ({ onSleepTimerEnd, onOpenStats, onOpenDriveSearch }: MobileHeaderProps) => {
  return (
    <div className="w-full px-4 py-1 flex justify-between items-center gap-2">
      <h1 className="text-lg font-bold text-golden tracking-wide">Maestro Play</h1>
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenDriveSearch}
          title="Buscar no Google Drive"
          className="p-1.5 rounded-full bg-green-500/20 text-green-300 hover:bg-green-500/30 border border-green-400/30 transition-all"
        >
          <HardDrive size={14} />
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
