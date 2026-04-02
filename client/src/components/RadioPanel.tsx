import { X } from 'lucide-react';
import { Radio } from '@/types/music';
import { cn } from '@/lib/utils';

interface RadioPanelProps {
  isOpen: boolean;
  radios: Radio[];
  onClose: () => void;
  onRadioSelect: (index: number) => void;
}

export const RadioPanel = ({ 
  isOpen, 
  radios, 
  onClose, 
  onRadioSelect 
}: RadioPanelProps) => {
  return (
    <div className={cn(
      "fixed left-0 w-full max-h-[50vh] z-10 transition-all duration-300 ease-in-out",
      "bg-background/95 backdrop-blur border-t-2 border-border flex flex-col pb-2",
      isOpen ? "bottom-0" : "-bottom-full"
    )}>
      <button
        onClick={onClose}
        className="absolute top-2 right-3 text-white text-2xl font-bold z-20 hover:text-primary transition-colors"
      >
        <X size={24} />
      </button>

      <div className="overflow-y-auto flex-1 mt-8">
        {radios.map((radio, index) => (
          <div
            key={radio.id}
            className="px-4 py-3 border-b border-border cursor-pointer hover:bg-white/10 transition-colors flex items-center"
            onClick={() => {
              onRadioSelect(index);
              onClose();
            }}
          >
            <span className="text-sm text-foreground">
              {index + 1}. {radio.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
