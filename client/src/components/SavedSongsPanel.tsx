import { ChevronDown, Youtube, Music2, Star, HardDrive } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FavoriteSong } from '@/services/favoritesStorage';

interface SavedSongsPanelProps {
  isOpen: boolean;
  favorites: FavoriteSong[];
  onClose: () => void;
  onSelect: (favorite: FavoriteSong) => void;
  onRemove: (id: string) => void;
}

export const SavedSongsPanel = ({
  isOpen,
  favorites,
  onClose,
  onSelect,
  onRemove,
}: SavedSongsPanelProps) => {
  return (
    <div className={cn(
      "fixed left-0 w-full max-h-[60vh] z-30 transition-all duration-300 ease-in-out",
      "bg-white border-t-2 border-gray-300 flex flex-col pb-2",
      isOpen ? "bottom-0" : "-bottom-full"
    )}>
      <div className="flex justify-center pt-2 pb-2">
        <button
          onClick={onClose}
          className="text-red-600 hover:text-red-700 transition-colors"
        >
          <ChevronDown size={28} />
        </button>
      </div>

      <div className="px-4 mb-2">
        <span className="text-xs font-semibold text-red-500">⭐ Músicas Salvas</span>
      </div>

      <div className="overflow-y-auto flex-1">
        {favorites.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-xs bg-white">
            Nenhuma música salva ainda. Toque na estrela ⭐ para salvar uma música aqui.
          </div>
        )}

        {favorites.map((favorite) => (
          <div
            key={favorite.id}
            className="px-4 py-2 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors bg-white flex items-center gap-3"
            onClick={() => {
              onSelect(favorite);
              onClose();
            }}
          >
            <div className="relative w-10 h-10 flex-shrink-0">
              <img
                src={favorite.cover || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Crect fill="%23333" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="24" fill="%23999"%3E🎵%3C/text%3E%3C/svg%3E'}
                alt={favorite.name}
                className="w-full h-full rounded object-cover"
              />
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                {favorite.id.startsWith('drive-') ? (
                  <HardDrive size={10} className="text-green-600" />
                ) : favorite.type === 'youtube' ? (
                  <Youtube size={10} className="text-red-600" />
                ) : favorite.type === 'radio' ? (
                  <Music2 size={10} className="text-green-600" />
                ) : (
                  <Music2 size={10} className="text-blue-600" />
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs text-black truncate block leading-tight font-medium">
                {favorite.name}
              </span>
              <span className="text-[10px] text-gray-500">
                {favorite.id.startsWith('drive-') ? 'Google Drive' : favorite.type === 'youtube' ? 'YouTube' : favorite.type === 'radio' ? 'Rádio' : 'Arquivo Local'}
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(favorite.id);
              }}
              className="p-1 flex-shrink-0"
              title="Remover dos favoritos"
            >
              <Star size={16} className="text-red-600 fill-red-600" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
