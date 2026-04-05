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
      "bg-white border-t-2 border-gray-300 flex flex-col pb-2",
      isOpen ? "bottom-0" : "-bottom-full"
    )}>
      <div className="flex justify-center pt-2 pb-2">
        <button
          onClick={onClose}
          className="text-red-600 text-2xl font-bold hover:text-red-700 transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      <div className="overflow-y-auto flex-1 mt-8">
        {radios.map((radio, index) => (
          <div
            key={radio.id}
            className="px-4 py-3 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors flex items-center"
            onClick={() => {
              onRadioSelect(index);
              onClose();
            }}
          >
            <span className="text-sm text-black">
              {index + 1}. {radio.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
