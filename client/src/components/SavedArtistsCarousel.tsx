/**
 * SavedArtistsCarousel - Exibe artistas salvos como cards abaixo das categorias
 */

import { useState, useEffect } from 'react';
import { Play, Music } from 'lucide-react';
import { searchYouTube } from '@/services/youtubeService';
import { CacheService } from '@/services/cacheService';

interface SavedArtist {
  id: string;
  name: string;
  country: string;
  genre: string;
}

interface SavedArtistsCarouselProps {
  onPlayPlaylist?: (songs: Array<{id: string; title: string; thumbnail: string}>, startIndex: number) => void;
}

// Lista de todos os artistas para recuperar informações
const ALL_ARTISTS: Record<string, SavedArtist> = {
  'br1': { id: 'br1', name: 'Anitta', country: 'Brasil', genre: 'Pop/Funk' },
  'br2': { id: 'br2', name: 'Ludmilla', country: 'Brasil', genre: 'Funk/Reggaeton' },
  'br3': { id: 'br3', name: 'Pabllo Vittar', country: 'Brasil', genre: 'Eletrônico/Pop' },
  'br4': { id: 'br4', name: 'Ivete Sangalo', country: 'Brasil', genre: 'Axé' },
  'br5': { id: 'br5', name: 'Caetano Veloso', country: 'Brasil', genre: 'MPB' },
  'br6': { id: 'br6', name: 'Iza', country: 'Brasil', genre: 'R&B/Soul' },
  'br7': { id: 'br7', name: 'Thiaguinho', country: 'Brasil', genre: 'Samba/Pagode' },
  'br8': { id: 'br8', name: 'Simone Mendes', country: 'Brasil', genre: 'Sertanejo' },
  'br9': { id: 'br9', name: 'Marília Mendes', country: 'Brasil', genre: 'Sertanejo' },
  'br10': { id: 'br10', name: 'Ferrugem', country: 'Brasil', genre: 'Samba/Pagode' },
  'br11': { id: 'br11', name: 'Projota', country: 'Brasil', genre: 'Rap/Hip-Hop' },
  'br12': { id: 'br12', name: 'Emicida', country: 'Brasil', genre: 'Rap/Hip-Hop' },
  'br13': { id: 'br13', name: 'Racionais MC\'s', country: 'Brasil', genre: 'Rap/Hip-Hop' },
  'br14': { id: 'br14', name: 'Criolo', country: 'Brasil', genre: 'Rap/Hip-Hop' },
  'br15': { id: 'br15', name: 'Mc Kevinho', country: 'Brasil', genre: 'Funk' },
  'us1': { id: 'us1', name: 'Taylor Swift', country: 'EUA', genre: 'Pop' },
  'us2': { id: 'us2', name: 'The Weeknd', country: 'EUA', genre: 'R&B/Pop' },
  'us3': { id: 'us3', name: 'Ariana Grande', country: 'EUA', genre: 'Pop' },
  'us4': { id: 'us4', name: 'Drake', country: 'EUA', genre: 'Hip-Hop/Rap' },
  'us5': { id: 'us5', name: 'Billie Eilish', country: 'EUA', genre: 'Pop/Alternativo' },
  'us6': { id: 'us6', name: 'Beyoncé', country: 'EUA', genre: 'R&B/Pop' },
  'us7': { id: 'us7', name: 'Eminem', country: 'EUA', genre: 'Rap/Hip-Hop' },
  'us8': { id: 'us8', name: 'Kanye West', country: 'EUA', genre: 'Rap/Hip-Hop' },
  'us9': { id: 'us9', name: 'Rihanna', country: 'EUA', genre: 'R&B/Pop' },
  'us10': { id: 'us10', name: 'Justin Bieber', country: 'EUA', genre: 'Pop' },
  'us11': { id: 'us11', name: 'Post Malone', country: 'EUA', genre: 'Hip-Hop/Pop' },
  'us12': { id: 'us12', name: 'Olivia Rodrigo', country: 'EUA', genre: 'Pop' },
  'us13': { id: 'us13', name: 'Doja Cat', country: 'EUA', genre: 'Rap/Pop' },
  'us14': { id: 'us14', name: 'Lil Nas X', country: 'EUA', genre: 'Rap/Pop' },
  'us15': { id: 'us15', name: 'Weeknd', country: 'EUA', genre: 'R&B' },
};

export const SavedArtistsCarousel = ({ onPlayPlaylist }: SavedArtistsCarouselProps) => {
  const [savedArtistIds, setSavedArtistIds] = useState<string[]>([]);
  const [loadingArtist, setLoadingArtist] = useState<string | null>(null);

  // Carregar artistas salvos do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedArtists');
    if (saved) {
      setSavedArtistIds(JSON.parse(saved));
    }

    // Atualizar a cada segundo para refletir mudanças
    const interval = setInterval(() => {
      const updated = localStorage.getItem('savedArtists');
      if (updated) {
        setSavedArtistIds(JSON.parse(updated));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const savedArtists = savedArtistIds
    .map(id => ALL_ARTISTS[id])
    .filter(artist => artist !== undefined);

  const handlePlayArtist = async (artist: SavedArtist) => {
    setLoadingArtist(artist.id);
    try {
      const cacheKey = `artist_${artist.id}`;
      let songs = CacheService.getFromCache(cacheKey);

      if (!songs) {
        const results = await searchYouTube(`${artist.name} música`);
        songs = results.slice(0, 10).map((result: any) => ({
          id: result.id,
          title: result.title,
          thumbnail: result.thumbnail,
        }));
        CacheService.saveToCache(cacheKey, songs);
      }

      if (songs && songs.length > 0) {
        onPlayPlaylist?.(songs, 0);
      }
    } catch (error) {
      console.error('Error playing artist:', error);
    } finally {
      setLoadingArtist(null);
    }
  };

  if (savedArtists.length === 0) {
    return null;
  }

  return (
    <div className="px-4 py-4">
      <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
        <Music size={16} /> Meus Artistas Favoritos
      </h3>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {savedArtists.map((artist) => (
          <div
            key={artist.id}
            className="flex-shrink-0 w-24 bg-gradient-to-br from-red-600 to-red-700 rounded-lg p-3 cursor-pointer hover:from-red-700 hover:to-red-800 transition-all transform hover:scale-105 relative group"
            onClick={() => handlePlayArtist(artist)}
          >
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-xs font-bold text-white truncate">{artist.name}</p>
              <p className="text-[10px] text-red-100 truncate">{artist.country}</p>
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-lg">
              {loadingArtist === artist.id ? (
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <Play size={20} className="text-white fill-white" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
