import { useState } from 'react';
import { 
  Search, 
  Star, 
  Plus, 
  Radio,
  Music,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileBottomIconsProps {
  onSearch: () => void;
  onFavorite: () => void;
  onFavoritesList: () => void;
  onAddMusic: () => void;
  onRadio: () => void;
  onPlaylist: () => void;
  onArtists?: () => void;
  isFavorite: boolean;
}

export const MobileBottomIcons = ({ 
  onSearch,
  onFavorite,
  onFavoritesList,
  onAddMusic,
  onRadio,
  onPlaylist,
  onArtists,
  isFavorite
}: MobileBottomIconsProps) => {
  const [favAnim, setFavAnim] = useState(false);

  const handleFavorite = () => {
    setFavAnim(true);
    onFavorite();
    setTimeout(() => setFavAnim(false), 300);
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
        <Music 
          className="cursor-pointer text-white hover:text-primary transition-colors" 
          size={20} 
          onClick={onFavoritesList} 
        />
      </div>
      
      <div className="flex gap-4">
        <Users
          className="cursor-pointer text-white hover:text-primary transition-colors" 
          size={20} 
          onClick={onArtists} 
        />
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
