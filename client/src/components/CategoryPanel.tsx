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
  { id: 'pop', name: 'Pop', icon: '🎤', color: 'from-pink-500 to-red-500', query: 'pop music' },
  { id: 'rock', name: 'Rock', icon: '🎸', color: 'from-red-500 to-orange-500', query: 'rock music' },
  { id: 'sertanejo', name: 'Sertanejo', icon: '🤠', color: 'from-yellow-500 to-orange-500', query: 'sertanejo' },
  { id: 'funk', name: 'Funk', icon: '🎵', color: 'from-purple-500 to-pink-500', query: 'funk music' },
  { id: 'eletronico', name: 'Eletrônico', icon: '🎛️', color: 'from-blue-500 to-cyan-500', query: 'electronic music' },
  { id: 'reggae', name: 'Reggae', icon: '🌴', color: 'from-green-500 to-emerald-500', query: 'reggae music' },
  { id: 'hiphop', name: 'Hip-Hop', icon: '🎤', color: 'from-gray-700 to-gray-900', query: 'hip hop music' },
  { id: 'forro', name: 'Forró', icon: '🪗', color: 'from-amber-500 to-yellow-500', query: 'forró music' },
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
        <div className="grid grid-cols-2 gap-4">
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
