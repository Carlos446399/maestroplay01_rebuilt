import { X, Music } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  query: string;
}

interface CategoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onCategorySelect: (category: Category) => void;
}

const CATEGORIES: Category[] = [
  // Gêneros Principais
  { id: 'pop', name: 'Pop', icon: '🎤', color: 'from-pink-500 to-red-500', query: 'pop music' },
  { id: 'rock', name: 'Rock', icon: '🎸', color: 'from-red-500 to-orange-500', query: 'rock music' },
  { id: 'sertanejo', name: 'Sertanejo', icon: '🤠', color: 'from-yellow-500 to-orange-500', query: 'sertanejo' },
  { id: 'funk', name: 'Funk', icon: '🎵', color: 'from-purple-500 to-pink-500', query: 'funk music' },
  { id: 'eletronico', name: 'Eletrônico', icon: '🎛️', color: 'from-blue-500 to-cyan-500', query: 'electronic music' },
  { id: 'reggae', name: 'Reggae', icon: '🌴', color: 'from-green-500 to-emerald-500', query: 'reggae music' },
  { id: 'hiphop', name: 'Hip-Hop', icon: '🎤', color: 'from-gray-700 to-gray-900', query: 'hip hop music' },
  { id: 'forro', name: 'Forró', icon: '🪗', color: 'from-amber-500 to-yellow-500', query: 'forró music' },
  
  // Gêneros Adicionais
  { id: 'mpb', name: 'MPB', icon: '🎹', color: 'from-indigo-500 to-purple-500', query: 'MPB música brasileira' },
  { id: 'samba', name: 'Samba', icon: '🥁', color: 'from-yellow-600 to-red-600', query: 'samba music' },
  { id: 'bossa', name: 'Bossa Nova', icon: '🎸', color: 'from-blue-600 to-cyan-600', query: 'bossa nova' },
  { id: 'pagode', name: 'Pagode', icon: '🎺', color: 'from-orange-500 to-red-500', query: 'pagode music' },
  { id: 'axe', name: 'Axé', icon: '🎉', color: 'from-pink-600 to-orange-600', query: 'axé music' },
  { id: 'forrozao', name: 'Forró Universitário', icon: '🎪', color: 'from-purple-600 to-pink-600', query: 'forró universitário' },
  
  // Gêneros Internacionais
  { id: 'jazz', name: 'Jazz', icon: '🎷', color: 'from-amber-600 to-yellow-600', query: 'jazz music' },
  { id: 'blues', name: 'Blues', icon: '🎸', color: 'from-blue-700 to-indigo-700', query: 'blues music' },
  { id: 'country', name: 'Country', icon: '🤠', color: 'from-amber-700 to-orange-700', query: 'country music' },
  { id: 'metal', name: 'Metal', icon: '🤘', color: 'from-gray-800 to-black', query: 'metal music' },
  { id: 'indie', name: 'Indie', icon: '🎧', color: 'from-purple-500 to-indigo-500', query: 'indie music' },
  { id: 'alternativo', name: 'Alternativo', icon: '🎸', color: 'from-green-600 to-teal-600', query: 'alternative rock' },
  
  // Gêneros Dançáveis
  { id: 'dance', name: 'Dance', icon: '💃', color: 'from-pink-500 to-purple-500', query: 'dance music' },
  { id: 'edm', name: 'EDM', icon: '🎚️', color: 'from-cyan-500 to-blue-500', query: 'EDM electronic dance' },
  { id: 'techno', name: 'Techno', icon: '🎛️', color: 'from-gray-600 to-gray-800', query: 'techno music' },
  { id: 'house', name: 'House', icon: '🏠', color: 'from-orange-500 to-red-500', query: 'house music' },
  { id: 'trap', name: 'Trap', icon: '🔊', color: 'from-red-700 to-purple-700', query: 'trap music' },
  
  // Gêneros Clássicos
  { id: 'classica', name: 'Clássica', icon: '🎻', color: 'from-purple-700 to-indigo-700', query: 'classical music' },
  { id: 'orquestra', name: 'Orquestra', icon: '🎼', color: 'from-blue-700 to-purple-700', query: 'orchestra music' },
];

export const CategoryPanel = ({ isOpen, onClose, onCategorySelect }: CategoryPanelProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end">
      <div className="w-full bg-gradient-to-t from-black via-black to-gray-900 rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Music size={28} className="text-red-600" />
            Categorias
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/10"
          >
            <X size={24} />
          </Button>
        </div>

        {/* Grid de Categorias */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                onCategorySelect(category);
                onClose();
              }}
              className={`group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br ${category.color} 
                transform transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-2xl`}
            >
              {/* Overlay escuro ao hover */}
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-all" />
              
              {/* Conteúdo */}
              <div className="relative z-10 flex flex-col items-center justify-center h-32">
                <span className="text-5xl mb-2">{category.icon}</span>
                <span className="text-white font-bold text-lg text-center">{category.name}</span>
              </div>

              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
            </button>
          ))}
        </div>

        {/* Espaço para scroll */}
        <div className="h-4" />
      </div>
    </div>
  );
};
