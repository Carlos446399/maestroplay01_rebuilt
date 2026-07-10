import { useState } from 'react';
import { 
  Search, 
  Heart, 
  Star,
  Plus, 
  Radio,
  Music,
  Users,
  Lock,
  LockOpen,
  HardDrive
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
  onDrive?: () => void;
  isFavorite: boolean;
  isLocked?: boolean;
  onToggleLock?: () => void;
}

export const MobileBottomIcons = ({ 
  onSearch,
  onFavorite,
  onFavoritesList,
  onAddMusic,
  onRadio,
  onPlaylist,
  onArtists,
  onDrive,
  isFavorite,
  isLocked = false,
  onToggleLock
}: MobileBottomIconsProps) => {
  const [favAnim, setFavAnim] = useState(false);

  const handleFavorite = () => {
    if (isLocked) return;
    setFavAnim(true);
    onFavorite();
    setTimeout(() => setFavAnim(false), 300);
  };

  // Com o player travado, só o cadeado permanece ativo — todo o resto
  // fica visualmente apagado e não responde a toques.
  const lockedClass = isLocked ? 'opacity-30 pointer-events-none' : '';

  return (
    <div className="w-[90%] flex justify-between mb-0.5">
      <div className="flex gap-4">
        <Search 
          className={cn("cursor-pointer text-white hover:text-primary transition-colors", lockedClass)}
          size={20} 
          onClick={isLocked ? undefined : onSearch} 
        />
        <Heart 
          className={cn(
            "cursor-pointer transition-all duration-200",
            isFavorite ? 'text-red-600 fill-red-600' : 'text-white hover:text-primary',
            favAnim && 'scale-150',
            lockedClass
          )}
          size={20} 
          onClick={handleFavorite} 
        />
        {isLocked ? (
          <Lock
            className="cursor-pointer text-yellow-500 transition-colors"
            size={20}
            onClick={onToggleLock}
          />
        ) : (
          <LockOpen
            className="cursor-pointer text-white hover:text-primary transition-colors"
            size={20}
            onClick={onToggleLock}
          />
        )}
        <Music 
          className={cn("cursor-pointer text-white hover:text-primary transition-colors", lockedClass)}
          size={20} 
          onClick={isLocked ? undefined : onFavoritesList} 
        />
      </div>
      
      <div className="flex gap-4">
        <HardDrive
          className={cn("cursor-pointer text-green-400 hover:text-green-300 transition-colors", lockedClass)}
          size={20}
          onClick={isLocked ? undefined : onDrive}
        />
        <Users
          className={cn("cursor-pointer text-white hover:text-primary transition-colors", lockedClass)}
          size={20} 
          onClick={isLocked ? undefined : onArtists} 
        />
        <Plus 
          className={cn("cursor-pointer text-white hover:text-primary transition-colors", lockedClass)}
          size={20} 
          onClick={isLocked ? undefined : onAddMusic} 
        />
        <Radio 
          className={cn("cursor-pointer text-white hover:text-primary transition-colors", lockedClass)}
          size={20} 
          onClick={isLocked ? undefined : onRadio} 
        />
        <Star 
          className={cn("cursor-pointer text-white hover:text-primary transition-colors", lockedClass)}
          size={20} 
          onClick={isLocked ? undefined : onPlaylist} 
        />
      </div>
    </div>
  );
};
