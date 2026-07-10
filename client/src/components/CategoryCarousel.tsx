import { X } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  query: string;
}

interface CategoryCarouselProps {
  onCategorySelect: (category: Category) => void;
  /** ID da categoria cujas músicas estão tocando agora — mostra um destaque pulsante nela */
  playingCategoryId?: string | null;
}

const CATEGORIES: Category[] = [
  // Generos Principais
  { id: 'pop', name: 'Pop', icon: '🎤', color: 'from-pink-500 to-red-500', query: 'pop music' },
  { id: 'rock', name: 'Rock', icon: '🎸', color: 'from-red-500 to-orange-500', query: 'rock music' },
  { id: 'sertanejo', name: 'Sertanejo', icon: '🤠', color: 'from-yellow-500 to-orange-500', query: 'sertanejo' },
  { id: 'funk', name: 'Funk', icon: '🎵', color: 'from-purple-500 to-pink-500', query: 'funk music' },
  { id: 'eletronico', name: 'Eletronico', icon: '🎛️', color: 'from-blue-500 to-cyan-500', query: 'electronic music' },
  { id: 'reggae', name: 'Reggae', icon: '🌴', color: 'from-green-500 to-emerald-500', query: 'reggae music' },
  { id: 'hiphop', name: 'Hip-Hop', icon: '🎤', color: 'from-gray-700 to-gray-900', query: 'hip hop music' },
  { id: 'forro', name: 'Forro', icon: '🪗', color: 'from-amber-500 to-yellow-500', query: 'forro music' },
  
  // Generos Adicionais
  { id: 'mpb', name: 'MPB', icon: '🎹', color: 'from-indigo-500 to-purple-500', query: 'MPB musica brasileira' },
  { id: 'samba', name: 'Samba', icon: '🥁', color: 'from-yellow-600 to-red-600', query: 'samba music' },
  { id: 'bossa', name: 'Bossa', icon: '🎸', color: 'from-blue-600 to-cyan-600', query: 'bossa nova' },
  { id: 'pagode', name: 'Pagode', icon: '🎺', color: 'from-orange-500 to-red-500', query: 'pagode music' },
  { id: 'axe', name: 'Axe', icon: '🎉', color: 'from-pink-600 to-orange-600', query: 'axe music' },
  { id: 'forrozao', name: 'Forro Uni', icon: '🎪', color: 'from-purple-600 to-pink-600', query: 'forro universitario' },
  
  // Generos Internacionais
  { id: 'jazz', name: 'Jazz', icon: '🎷', color: 'from-amber-600 to-yellow-600', query: 'jazz music' },
  { id: 'blues', name: 'Blues', icon: '🎸', color: 'from-blue-700 to-indigo-700', query: 'blues music' },
  { id: 'country', name: 'Country', icon: '🤠', color: 'from-amber-700 to-orange-700', query: 'country music' },
  { id: 'metal', name: 'Metal', icon: '🤘', color: 'from-gray-800 to-black', query: 'metal music' },
  { id: 'indie', name: 'Indie', icon: '🎧', color: 'from-purple-500 to-indigo-500', query: 'indie music' },
  { id: 'alternativo', name: 'Alt', icon: '🎸', color: 'from-green-600 to-teal-600', query: 'alternative rock' },
  
  // Generos Dancaveis
  { id: 'dance', name: 'Dance', icon: '💃', color: 'from-pink-500 to-purple-500', query: 'dance music' },
  { id: 'edm', name: 'EDM', icon: '🎚️', color: 'from-cyan-500 to-blue-500', query: 'EDM electronic dance' },
  { id: 'techno', name: 'Techno', icon: '🎛️', color: 'from-gray-600 to-gray-800', query: 'techno music' },
  { id: 'house', name: 'House', icon: '🏠', color: 'from-orange-500 to-red-500', query: 'house music' },
  { id: 'trap', name: 'Trap', icon: '🔊', color: 'from-red-700 to-purple-700', query: 'trap music' },
  
  // Generos Classicos
  { id: 'classica', name: 'Classica', icon: '🎻', color: 'from-purple-700 to-indigo-700', query: 'classical music' },
  { id: 'orquestra', name: 'Orquestra', icon: '🎼', color: 'from-blue-700 to-purple-700', query: 'orchestra music' },
];

export const CategoryCarousel = ({ onCategorySelect, playingCategoryId }: CategoryCarouselProps) => {
  return (
    <div className="flex gap-3 px-2 py-1 mt-1 overflow-x-auto custom-scrollbar w-full">
      {CATEGORIES.map((category) => {
        const isPlaying = category.id === playingCategoryId;
        return (
          <button
            key={category.id}
            onClick={() => onCategorySelect(category)}
            className={`flex-shrink-0 w-[70px] h-[70px] rounded cursor-pointer p-1
              flex flex-col items-center justify-center
              transition-all duration-200 hover:scale-105 active:scale-95
              bg-gradient-to-br ${category.color} shadow-lg hover:shadow-xl
              group relative overflow-hidden
              ${isPlaying ? 'ring-2 ring-white animate-pulse' : ''}`}
          >
            {/* Overlay escuro ao hover */}
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
            
            {/* Conteudo */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full">
              <span className="text-2xl mb-0.5">{category.icon}</span>
              <span className="text-white font-bold text-[7px] text-center leading-tight truncate px-0.5">
                {category.name}
              </span>
            </div>

            {/* Indicador de "tocando agora" */}
            {isPlaying && (
              <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-white shadow-[0_0_6px_2px_rgba(255,255,255,0.8)]" />
            )}

            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
              transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
          </button>
        );
      })}
    </div>
  );
};
