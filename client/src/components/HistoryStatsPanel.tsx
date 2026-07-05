import { ChevronDown, BarChart2, Clock, Music } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getTopPlayed, getTotalListenTimeFormatted, getTotalPlaysCount } from '@/services/historyService';

interface HistoryStatsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SOURCE_LABELS: Record<string, string> = {
  local: 'Biblioteca local',
  radio: 'Rádio',
  drive: 'Google Drive',
  youtube: 'YouTube',
};

export const HistoryStatsPanel = ({ isOpen, onClose }: HistoryStatsPanelProps) => {
  if (!isOpen) return null;

  const topPlayed = getTopPlayed(15);

  return (
    <div className={cn(
      'fixed left-0 w-full max-h-[80vh] z-30 flex flex-col bg-white border-t-2 border-gray-200 transition-all duration-300 ease-in-out',
      'bottom-0'
    )}>
      <div className="flex items-center gap-2 px-3 pt-3 pb-2 border-b border-gray-100">
        <BarChart2 size={16} className="text-purple-600 flex-shrink-0" />
        <h2 className="text-sm font-bold text-gray-800 flex-1">Estatísticas de escuta</h2>
        <button onClick={onClose} className="text-red-500 hover:text-red-600 flex-shrink-0">
          <ChevronDown size={22} />
        </button>
      </div>

      <div className="flex gap-2 px-3 py-3 border-b border-gray-100">
        <div className="flex-1 bg-purple-50 rounded-xl p-3 flex flex-col items-center">
          <Clock size={18} className="text-purple-600 mb-1" />
          <p className="text-sm font-bold text-gray-800">{getTotalListenTimeFormatted()}</p>
          <p className="text-[10px] text-gray-500">tempo total ouvido</p>
        </div>
        <div className="flex-1 bg-green-50 rounded-xl p-3 flex flex-col items-center">
          <Music size={18} className="text-green-600 mb-1" />
          <p className="text-sm font-bold text-gray-800">{getTotalPlaysCount()}</p>
          <p className="text-[10px] text-gray-500">músicas tocadas</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2">
        <p className="text-[11px] font-semibold text-gray-500 mb-2">Mais tocadas</p>
        {topPlayed.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-8">
            Ainda não há histórico suficiente. Continue ouvindo!
          </p>
        ) : (
          <div className="space-y-1">
            {topPlayed.map((entry, i) => (
              <div key={entry.id} className="flex items-center gap-2 py-1.5 border-b border-gray-50 last:border-0">
                <span className="text-[11px] text-gray-400 w-4 text-center flex-shrink-0">{i + 1}</span>
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                  {entry.cover && <img src={entry.cover} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 truncate">{entry.name}</p>
                  <p className="text-[10px] text-gray-400">{SOURCE_LABELS[entry.source] || entry.source}</p>
                </div>
                <span className="text-[11px] font-bold text-purple-600 flex-shrink-0">{entry.count}x</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
