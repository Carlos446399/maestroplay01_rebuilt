import { Radio } from '@/types/music';
import { cn } from '@/lib/utils';
import { ChevronDown, Radio as RadioIcon } from 'lucide-react';

interface RadioPanelProps {
  isOpen: boolean;
  radios: Radio[];
  currentRadioIndex: number;
  isPlaying: boolean;
  onClose: () => void;
  onRadioSelect: (index: number) => void;
}

export const RadioPanel = ({ 
  isOpen, 
  radios, 
  currentRadioIndex,
  isPlaying,
  onClose, 
  onRadioSelect 
}: RadioPanelProps) => {
  return (
    <div className={cn(
      "fixed left-0 w-full max-h-[65vh] z-30 transition-all duration-300 ease-in-out",
      "bg-white border-t-2 border-gray-200 flex flex-col",
      isOpen ? "bottom-0" : "-bottom-full"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-2">
          <RadioIcon size={16} className="text-blue-500" />
          <span className="text-sm font-black text-gray-800">Rádios Online</span>
          <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {radios.length} estações
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-red-500 hover:text-red-600 transition-colors p-1"
        >
          <ChevronDown size={26} />
        </button>
      </div>

      <div className="overflow-y-auto flex-1">
        {radios.map((radio, index) => {
          const isActive = index === currentRadioIndex && isPlaying;
          return (
            <div
              key={radio.id}
              className={cn(
                "px-4 py-3 border-b border-gray-100 cursor-pointer transition-colors flex items-center gap-3",
                isActive ? "bg-blue-50" : "hover:bg-gray-50"
              )}
              onClick={() => {
                onRadioSelect(index);
                onClose();
              }}
            >
              {/* Capa */}
              <div className="relative w-11 h-11 flex-shrink-0">
                {radio.cover ? (
                  <img
                    src={radio.cover}
                    alt={radio.name}
                    className="w-full h-full rounded-lg object-contain bg-gray-100 p-1"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full rounded-lg bg-blue-100 flex items-center justify-center">
                    <RadioIcon size={18} className="text-blue-500" />
                  </div>
                )}
                {isActive && (
                  <div className="absolute inset-0 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <div className="flex gap-0.5 items-end h-4">
                      {[1,2,3].map(i => (
                        <div key={i} className="w-1 bg-blue-600 rounded-full animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s`, height: `${6 + i * 4}px` }} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-xs font-semibold truncate",
                  isActive ? "text-blue-700" : "text-gray-800"
                )}>
                  {radio.name}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">{radio.genre}</p>
              </div>

              {/* Indicador ao vivo */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  isActive ? "bg-red-500 animate-pulse" : "bg-gray-300"
                )} />
                <span className="text-[9px] text-gray-400 font-medium">AO VIVO</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
