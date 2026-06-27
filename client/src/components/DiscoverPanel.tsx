import { useState, useCallback } from 'react';
import { ChevronDown, Play, Loader2, Music2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { searchYouTube } from '@/services/youtubeService';

interface ArtistCard {
  id: string;
  name: string;
  genre: string;
  emoji: string;
  gradient: string;
}

const BRAZILIAN_ARTISTS: ArtistCard[] = [
  { id: 'anitta', name: 'Anitta', genre: 'Pop/Funk', emoji: '🎤', gradient: 'from-pink-600 to-purple-600' },
  { id: 'ludmilla', name: 'Ludmilla', genre: 'Funk/R&B', emoji: '🎵', gradient: 'from-yellow-500 to-orange-600' },
  { id: 'ivete', name: 'Ivete Sangalo', genre: 'Axé', emoji: '🎉', gradient: 'from-orange-500 to-red-600' },
  { id: 'alok', name: 'Alok', genre: 'Eletrônico', emoji: '🎛️', gradient: 'from-blue-600 to-cyan-500' },
  { id: 'gusttavo', name: 'Gusttavo Lima', genre: 'Sertanejo', emoji: '🤠', gradient: 'from-amber-600 to-yellow-500' },
  { id: 'wesley', name: 'Wesley Safadão', genre: 'Forró', emoji: '🪗', gradient: 'from-green-500 to-teal-600' },
  { id: 'simone', name: 'Simone Mendes', genre: 'Sertanejo', emoji: '🎼', gradient: 'from-rose-500 to-pink-600' },
  { id: 'thiaguinho', name: 'Thiaguinho', genre: 'Samba', emoji: '🥁', gradient: 'from-amber-700 to-orange-600' },
  { id: 'matuê', name: 'Matuê', genre: 'Trap', emoji: '🔊', gradient: 'from-gray-700 to-purple-800' },
  { id: 'kevinho', name: 'MC Kevinho', genre: 'Funk', emoji: '🎶', gradient: 'from-red-600 to-pink-600' },
  { id: 'pabllo', name: 'Pabllo Vittar', genre: 'Pop/Drag', emoji: '💜', gradient: 'from-violet-600 to-purple-600' },
  { id: 'jhorge-mateus', name: 'Jorge e Mateus', genre: 'Sertanejo', emoji: '🎸', gradient: 'from-lime-600 to-green-700' },
  { id: 'caetano', name: 'Caetano Veloso', genre: 'MPB', emoji: '🎹', gradient: 'from-indigo-600 to-blue-700' },
  { id: 'emicida', name: 'Emicida', genre: 'Rap/Hip-Hop', emoji: '🎤', gradient: 'from-zinc-700 to-zinc-900' },
  { id: 'luan', name: 'Luan Santana', genre: 'Sertanejo', emoji: '🎙️', gradient: 'from-sky-500 to-blue-600' },
  { id: 'iza', name: 'IZA', genre: 'R&B/Soul', emoji: '✨', gradient: 'from-fuchsia-600 to-pink-500' },
];

const INTERNATIONAL_ARTISTS: ArtistCard[] = [
  { id: 'taylor', name: 'Taylor Swift', genre: 'Pop', emoji: '🌟', gradient: 'from-purple-600 to-blue-600' },
  { id: 'weeknd', name: 'The Weeknd', genre: 'R&B', emoji: '🌙', gradient: 'from-red-900 to-black' },
  { id: 'ariana', name: 'Ariana Grande', genre: 'Pop', emoji: '💕', gradient: 'from-pink-500 to-rose-600' },
  { id: 'drake', name: 'Drake', genre: 'Hip-Hop', emoji: '🦁', gradient: 'from-yellow-600 to-amber-700' },
  { id: 'billie', name: 'Billie Eilish', genre: 'Pop/Alt', emoji: '🖤', gradient: 'from-green-800 to-gray-900' },
  { id: 'beyonce', name: 'Beyoncé', genre: 'R&B/Pop', emoji: '👑', gradient: 'from-yellow-500 to-orange-500' },
  { id: 'bad-bunny', name: 'Bad Bunny', genre: 'Reggaeton', emoji: '🐰', gradient: 'from-yellow-400 to-lime-500' },
  { id: 'dua-lipa', name: 'Dua Lipa', genre: 'Pop/Dance', emoji: '💫', gradient: 'from-fuchsia-500 to-purple-600' },
  { id: 'ed-sheeran', name: 'Ed Sheeran', genre: 'Pop', emoji: '🎸', gradient: 'from-orange-500 to-red-500' },
  { id: 'coldplay', name: 'Coldplay', genre: 'Rock Alt', emoji: '🌈', gradient: 'from-blue-500 to-purple-600' },
  { id: 'bruno-mars', name: 'Bruno Mars', genre: 'Pop/R&B', emoji: '🎺', gradient: 'from-yellow-600 to-red-600' },
  { id: 'post-malone', name: 'Post Malone', genre: 'Hip-Hop', emoji: '🌹', gradient: 'from-gray-600 to-purple-700' },
  { id: 'olivia', name: 'Olivia Rodrigo', genre: 'Pop/Rock', emoji: '💔', gradient: 'from-violet-700 to-indigo-700' },
  { id: 'harry', name: 'Harry Styles', genre: 'Pop', emoji: '🌸', gradient: 'from-pink-400 to-red-500' },
  { id: 'sza', name: 'SZA', genre: 'R&B', emoji: '🌊', gradient: 'from-teal-600 to-cyan-700' },
  { id: 'kendrick', name: 'Kendrick Lamar', genre: 'Rap', emoji: '🎯', gradient: 'from-red-800 to-gray-900' },
];

interface DiscoverPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayPlaylist: (songs: Array<{id: string; title: string; thumbnail: string}>, startIndex: number) => void;
}

export const DiscoverPanel = ({ isOpen, onClose, onPlayPlaylist }: DiscoverPanelProps) => {
  const [loadingArtist, setLoadingArtist] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'brasil' | 'internacional'>('brasil');

  const handleArtistPlay = useCallback(async (artist: ArtistCard) => {
    if (loadingArtist) return;
    setLoadingArtist(artist.id);
    try {
      const results = await searchYouTube(`${artist.name} músicas`);
      if (results.items.length > 0) {
        const songs = results.items.map(item => ({
          id: item.id,
          title: item.title,
          thumbnail: item.thumbnail,
        }));
        onPlayPlaylist(songs, 0);
        onClose();
      }
    } catch (err) {
      console.error('Error loading artist:', err);
    } finally {
      setLoadingArtist(null);
    }
  }, [loadingArtist, onPlayPlaylist, onClose]);

  const GENRE_PLAYLISTS = [
    { label: 'Top Sertanejo', query: 'top sertanejo 2024', color: 'from-yellow-500 to-orange-500', emoji: '🤠' },
    { label: 'Funk Hits', query: 'funk hits brasil 2024', color: 'from-purple-600 to-pink-600', emoji: '🎵' },
    { label: 'Reggaeton', query: 'reggaeton hits 2024', color: 'from-green-500 to-teal-600', emoji: '💃' },
    { label: 'Pop Mundial', query: 'pop internacional hits 2024', color: 'from-blue-500 to-purple-600', emoji: '🌍' },
    { label: 'Hip-Hop', query: 'hip hop hits 2024', color: 'from-gray-700 to-gray-900', emoji: '🎤' },
    { label: 'MPB Clássicos', query: 'MPB classicos brasileiros', color: 'from-amber-600 to-yellow-600', emoji: '🎹' },
    { label: 'Rock Brasil', query: 'rock brasileiro classicos', color: 'from-red-600 to-orange-700', emoji: '🎸' },
    { label: 'Lo-Fi Relax', query: 'lofi chill relax study', color: 'from-indigo-500 to-purple-700', emoji: '☕' },
  ];

  const handleGenrePlay = useCallback(async (query: string, label: string) => {
    if (loadingArtist) return;
    setLoadingArtist(label);
    try {
      const results = await searchYouTube(query);
      if (results.items.length > 0) {
        onPlayPlaylist(results.items.map(i => ({
          id: i.id, title: i.title, thumbnail: i.thumbnail
        })), 0);
        onClose();
      }
    } catch (err) {
      console.error('Erro ao carregar gênero:', err);
    } finally {
      setLoadingArtist(null);
    }
  }, [loadingArtist, onPlayPlaylist, onClose]);

  const artists = activeTab === 'brasil' ? BRAZILIAN_ARTISTS : INTERNATIONAL_ARTISTS;

  return (
    <div className={cn(
      'fixed left-0 w-full max-h-[82vh] z-30 flex flex-col bg-white border-t-2 border-gray-200 transition-all duration-300 ease-in-out',
      isOpen ? 'bottom-0' : '-bottom-full'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-gray-100">
        <div>
          <h2 className="text-sm font-black text-gray-900">Descobrir</h2>
          <p className="text-[10px] text-gray-400">Toque num artista para ouvir</p>
        </div>
        <button onClick={onClose} className="text-red-500">
          <ChevronDown size={24} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex px-4 pt-3 pb-2 gap-3">
        <button
          onClick={() => setActiveTab('brasil')}
          className={cn(
            'flex-1 py-3 rounded-2xl text-sm font-black transition-all shadow-sm',
            activeTab === 'brasil'
              ? 'bg-gradient-to-r from-green-500 to-yellow-500 text-white shadow-green-200'
              : 'bg-gray-100 text-gray-500'
          )}
        >
          🇧🇷 Brasileiros
        </button>
        <button
          onClick={() => setActiveTab('internacional')}
          className={cn(
            'flex-1 py-3 rounded-2xl text-sm font-black transition-all shadow-sm',
            activeTab === 'internacional'
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-blue-200'
              : 'bg-gray-100 text-gray-500'
          )}
        >
          🌍 Internacionais
        </button>
      </div>

      {/* Grid de artistas */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 pt-2">
        <div className="grid grid-cols-2 gap-3">
          {artists.map((artist) => (
            <button
              key={artist.id}
              onClick={() => handleArtistPlay(artist)}
              disabled={loadingArtist === artist.id}
              className="relative rounded-2xl overflow-hidden text-left"
              style={{ height: '110px' }}
            >
              {/* Gradiente de fundo */}
              <div className={cn('absolute inset-0 bg-gradient-to-br', artist.gradient)} />

              {/* Padrão de fundo decorativo */}
              <div
                className="absolute right-2 bottom-2 text-4xl opacity-30 select-none"
                style={{ transform: 'rotate(-15deg)' }}
              >
                {artist.emoji}
              </div>

              {/* Conteúdo */}
              <div className="absolute inset-0 p-3 flex flex-col justify-between">
                <div>
                  <p className="text-white font-black text-sm leading-tight">
                    {artist.name}
                  </p>
                  <p className="text-white/70 text-[10px] font-medium mt-0.5">
                    {artist.genre}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  {loadingArtist === artist.id ? (
                    <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                      <Loader2 size={14} className="text-white animate-spin" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center">
                      <Play size={12} className="text-white ml-0.5" />
                    </div>
                  )}
                  <span className="text-white/80 text-[9px] font-medium">
                    {loadingArtist === artist.id ? 'Carregando...' : 'Tocar músicas'}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Seção de playlists rápidas */}
        <div className="mt-4">
          <p className="text-xs font-bold text-gray-700 mb-3 px-1">🔥 Playlists por gênero</p>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {GENRE_PLAYLISTS.map((playlist) => (
              <button
                key={playlist.label}
                onClick={() => handleGenrePlay(playlist.query, playlist.label)}
                disabled={!!loadingArtist}
                className={cn(
                  'flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-xs font-bold transition-all',
                  `bg-gradient-to-r ${playlist.color}`,
                  loadingArtist === playlist.label ? 'opacity-80' : 'opacity-100'
                )}
              >
                {loadingArtist === playlist.label
                  ? <Loader2 size={14} className="animate-spin" />
                  : <span className="text-base">{playlist.emoji}</span>
                }
                {playlist.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
