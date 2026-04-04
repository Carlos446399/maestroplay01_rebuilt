import { useState } from 'react';
import { 
  Search, 
  Star, 
  Shuffle, 
  Repeat, 
  Plus, 
  Radio,
  Music 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileBottomIconsProps {
  onSearch: () => void;
  onFavorite: () => void;
  onShuffle: () => void;
  onRepeat: () => void;
  onAddMusic: () => void;
  onRadio: () => void;
  onPlaylist: () => void;
  isFavorite: boolean;
  isShuffle: boolean;
  isRepeat: 'off' | 'all' | 'one';
}

export const MobileBottomIcons = ({ 
  onSearch,
  onFavorite,
  onShuffle,
  onRepeat,
  onAddMusic,
  onRadio,
  onPlaylist,
  isFavorite,
  isShuffle,
  isRepeat
}: MobileBottomIconsProps) => {
  const [favAnim, setFavAnim] = useState(false);
  const [repAnim, setRepAnim] = useState(false);

  const handleFavorite = () => {
    setFavAnim(true);
    onFavorite();
    setTimeout(() => setFavAnim(false), 300);
  };

  const handleRepeat = () => {
    setRepAnim(true);
    onRepeat();
    setTimeout(() => setRepAnim(false), 300);
  };

  return (
    <div className="w-[90%] flex justify-between mb-0.5">
      <div className="flex gap-4">
        <Search 
          className="cursor-pointer text-white hover:text-primary transition-colors" 
          size={20} 
          onClick={onSearch} 
        />
        <Star 
          className={cn(
            "cursor-pointer transition-all duration-200",
            isFavorite ? 'text-red-600 fill-red-600' : 'text-white hover:text-primary',
            favAnim && 'scale-150'
          )}
          size={20} 
          onClick={handleFavorite} 
        />
        <Shuffle 
          className={cn(
            "cursor-pointer transition-colors",
            isShuffle ? 'text-red-600' : 'text-white hover:text-primary'
          )}
          size={20} 
          onClick={onShuffle} 
        />
        <Repeat 
          className={cn(
            "cursor-pointer transition-all duration-200",
            isRepeat !== 'off' ? 'text-red-600' : 'text-white hover:text-primary',
            repAnim && 'scale-150'
          )}
          size={20} 
          onClick={handleRepeat} 
        />
      </div>
      
      <div className="flex gap-4">
        <Plus 
          className="cursor-pointer text-white hover:text-primary transition-colors" 
          size={20} 
          onClick={onAddMusic} 
        />
        <Radio 
          className="cursor-pointer text-white hover:text-primary transition-colors" 
          size={20} 
          onClick={onRadio} 
        />
        <Music 
          className="cursor-pointer text-white hover:text-primary transition-colors" 
          size={20} 
          onClick={onPlaylist} 
        />
      </div>
    </div>
  );
};
