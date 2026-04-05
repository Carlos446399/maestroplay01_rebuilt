import { useState } from 'react';

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  query: string;
}

interface CategoryCarouselProps {
  categories: Category[];
  onCategorySelect: (category: Category) => void;
}

const CATEGORIES: Category[] = [
  { id: 'pop', name: 'Pop', icon: '🎤', color: 'from-pink-500 to-red-500', query: 'pop music' },
  { id: 'rock', name: 'Rock', icon: '🎸', color: 'from-red-500 to-orange-500', query: 'rock music' },
  { id: 'sertanejo', name: 'Sertanejo', icon: '🤠', color: 'from-yellow-500 to-orange-500', query: 'sertanejo' },
  { id: 'funk', name: 'Funk', icon: '🎵', color: 'from-purple-500 to-pink-500', query: 'funk music' },
  { id: 'eletronico', name: 'Eletrônico', icon: '🎛️', color: 'from-blue-500 to-cyan-500', query: 'electronic music' },
  { id: 'reggae', name: 'Reggae', icon: '🌴', color: 'from-green-500 to-emerald-500', query: 'reggae music' },
  { id: 'hiphop', name: 'Hip-Hop', icon: '🎤', color: 'from-gray-700 to-gray-900', query: 'hip hop music' },
  { id: 'forro', name: 'Forró', icon: '🪗', color: 'from-amber-500 to-yellow-500', query: 'forró music' },
];

export const CategoryCarousel = ({ onCategorySelect }: CategoryCarouselProps) => {
  return (
    <div className="flex gap-3 px-2 py-1 mt-1 overflow-x-auto custom-scrollbar w-full">
      {CATEGORIES.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategorySelect(category)}
          className={`flex-shrink-0 w-[70px] h-[70px] rounded cursor-pointer p-1
            flex flex-col items-center justify-center
            transition-all duration-200 hover:scale-105 active:scale-95
            bg-gradient-to-br ${category.color} shadow-lg hover:shadow-xl
            group relative overflow-hidden`}
        >
          {/* Overlay escuro ao hover */}
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
          
          {/* Conteúdo */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full">
            <span className="text-2xl mb-0.5">{category.icon}</span>
            <span className="text-white font-bold text-[7px] text-center leading-tight truncate px-0.5">
              {category.name}
            </span>
          </div>

          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
            transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
        </button>
      ))}
    </div>
  );
};
