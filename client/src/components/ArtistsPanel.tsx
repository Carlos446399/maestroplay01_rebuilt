/**
 * ArtistsPanel - Painel de artistas mundiais com busca de músicas no YouTube
 */

import { useState, useEffect } from 'react';
import { Search, Play, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { searchYouTube } from '@/services/youtubeService';
import { CacheService } from '@/services/cacheService';

interface Artist {
  id: string;
  name: string;
  country: string;
  genre: string;
  image?: string;
}

interface ArtistSong {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
}

interface ArtistsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onPlaySong?: (videoId: string, title: string, thumbnail: string) => void;
}

// Lista de artistas mundiais por país
const ARTISTS_BY_COUNTRY: Record<string, Artist[]> = {
  'Brasil': [
    { id: 'br1', name: 'Anitta', country: 'Brasil', genre: 'Pop/Funk' },
    { id: 'br2', name: 'Ludmilla', country: 'Brasil', genre: 'Funk/Reggaeton' },
    { id: 'br3', name: 'Pabllo Vittar', country: 'Brasil', genre: 'Eletrônico/Pop' },
    { id: 'br4', name: 'Ivete Sangalo', country: 'Brasil', genre: 'Axé' },
    { id: 'br5', name: 'Caetano Veloso', country: 'Brasil', genre: 'MPB' },
  ],
  'EUA': [
    { id: 'us1', name: 'Taylor Swift', country: 'EUA', genre: 'Pop' },
    { id: 'us2', name: 'The Weeknd', country: 'EUA', genre: 'R&B/Pop' },
    { id: 'us3', name: 'Ariana Grande', country: 'EUA', genre: 'Pop' },
    { id: 'us4', name: 'Drake', country: 'EUA', genre: 'Hip-Hop/Rap' },
    { id: 'us5', name: 'Billie Eilish', country: 'EUA', genre: 'Pop/Alternativo' },
  ],
  'Reino Unido': [
    { id: 'uk1', name: 'Ed Sheeran', country: 'Reino Unido', genre: 'Pop' },
    { id: 'uk2', name: 'Adele', country: 'Reino Unido', genre: 'Pop/Soul' },
    { id: 'uk3', name: 'Harry Styles', country: 'Reino Unido', genre: 'Pop' },
    { id: 'uk4', name: 'Coldplay', country: 'Reino Unido', genre: 'Rock Alternativo' },
    { id: 'uk5', name: 'Amy Winehouse', country: 'Reino Unido', genre: 'Jazz/Soul' },
  ],
  'Espanha': [
    { id: 'es1', name: 'Rosalía', country: 'Espanha', genre: 'Flamenco/Trap' },
    { id: 'es2', name: 'Bad Bunny', country: 'Espanha', genre: 'Reggaeton' },
    { id: 'es3', name: 'Enrique Iglesias', country: 'Espanha', genre: 'Pop Latino' },
    { id: 'es4', name: 'Alejandro Sanz', country: 'Espanha', genre: 'Pop' },
    { id: 'es5', name: 'Maluma', country: 'Espanha', genre: 'Reggaeton/Pop' },
  ],
  'Colômbia': [
    { id: 'co1', name: 'Shakira', country: 'Colômbia', genre: 'Pop Latino' },
    { id: 'co2', name: 'Juanes', country: 'Colômbia', genre: 'Rock Latino' },
    { id: 'co3', name: 'Karol G', country: 'Colômbia', genre: 'Reggaeton' },
    { id: 'co4', name: 'J Balvin', country: 'Colômbia', genre: 'Reggaeton' },
    { id: 'co5', name: 'Feid', country: 'Colômbia', genre: 'Reggaeton/Trap' },
  ],
  'México': [
    { id: 'mx1', name: 'Peso Pluma', country: 'México', genre: 'Trap Latino' },
    { id: 'mx2', name: 'Eslabón Armado', country: 'México', genre: 'Regional Mexicano' },
    { id: 'mx3', name: 'Natalia Lafourcade', country: 'México', genre: 'Pop/Indie' },
    { id: 'mx4', name: 'Reik', country: 'México', genre: 'Pop' },
    { id: 'mx5', name: 'Grupo Frontera', country: 'México', genre: 'Regional Mexicano' },
  ],
  'Itália': [
    { id: 'it1', name: 'Laura Pausini', country: 'Itália', genre: 'Pop' },
    { id: 'it2', name: 'Andrea Bocelli', country: 'Itália', genre: 'Clássico/Tenor' },
    { id: 'it3', name: 'Eros Ramazzotti', country: 'Itália', genre: 'Pop' },
    { id: 'it4', name: 'Måneskin', country: 'Itália', genre: 'Rock' },
    { id: 'it5', name: 'Tiziano Ferro', country: 'Itália', genre: 'Pop' },
  ],
  'França': [
    { id: 'fr1', name: 'Dua Lipa', country: 'França', genre: 'Pop' },
    { id: 'fr2', name: 'Stromae', country: 'França', genre: 'Pop Eletrônico' },
    { id: 'fr3', name: 'Zaz', country: 'França', genre: 'Chanson' },
    { id: 'fr4', name: 'Christine and the Queens', country: 'França', genre: 'Pop Experimental' },
    { id: 'fr5', name: 'Carla Bruni', country: 'França', genre: 'Pop/Chanson' },
  ],
  'Alemanha': [
    { id: 'de1', name: 'Kraftwerk', country: 'Alemanha', genre: 'Eletrônico' },
    { id: 'de2', name: 'Rammstein', country: 'Alemanha', genre: 'Metal Industrial' },
    { id: 'de3', name: 'Nena', country: 'Alemanha', genre: 'Pop/New Wave' },
    { id: 'de4', name: 'Scorpions', country: 'Alemanha', genre: 'Rock' },
    { id: 'de5', name: 'Enya', country: 'Alemanha', genre: 'New Age' },
  ],
  'Japão': [
    { id: 'jp1', name: 'Utada Hikaru', country: 'Japão', genre: 'J-Pop' },
    { id: 'jp2', name: 'Arashi', country: 'Japão', genre: 'J-Pop' },
    { id: 'jp3', name: 'Hatsune Miku', country: 'Japão', genre: 'Vocaloid/Eletrônico' },
    { id: 'jp4', name: 'Sekai no Nabeatsu', country: 'Japão', genre: 'J-Pop' },
    { id: 'jp5', name: 'Yuki Kajiura', country: 'Japão', genre: 'Eletrônico/Anime' },
  ],
  'Coreia do Sul': [
    { id: 'kr1', name: 'BTS', country: 'Coreia do Sul', genre: 'K-Pop' },
    { id: 'kr2', name: 'BLACKPINK', country: 'Coreia do Sul', genre: 'K-Pop' },
    { id: 'kr3', name: 'IU', country: 'Coreia do Sul', genre: 'K-Pop' },
    { id: 'kr4', name: 'Stray Kids', country: 'Coreia do Sul', genre: 'K-Pop' },
    { id: 'kr5', name: 'NewJeans', country: 'Coreia do Sul', genre: 'K-Pop' },
  ],
};

export const ArtistsPanel = ({ isOpen, onClose, onPlaySong }: ArtistsPanelProps) => {
  const [selectedCountry, setSelectedCountry] = useState<string>('Brasil');
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [artistSongs, setArtistSongs] = useState<ArtistSong[]>([]);
  const [isLoadingSongs, setIsLoadingSongs] = useState(false);
  const [savedArtists, setSavedArtists] = useState<Set<string>>(new Set());

  const countries = Object.keys(ARTISTS_BY_COUNTRY).sort();
  const artists = ARTISTS_BY_COUNTRY[selectedCountry] || [];

  // Carregar artistas salvos do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedArtists');
    if (saved) {
      setSavedArtists(new Set(JSON.parse(saved)));
    }
  }, []);

  // Buscar músicas do artista selecionado
  const handleArtistSelect = async (artist: Artist) => {
    setSelectedArtist(artist);
    setIsLoadingSongs(true);

    try {
      // Verificar cache primeiro
      const cacheKey = `artist_${artist.id}`;
      const cachedSongs = CacheService.getFromCache(cacheKey);

      if (cachedSongs) {
        setArtistSongs(cachedSongs);
        setIsLoadingSongs(false);
        return;
      }

      // Buscar no YouTube
      const results = await searchYouTube(`${artist.name} música`);
      const songs: ArtistSong[] = results.slice(0, 10).map((result, index) => ({
        id: result.id,
        title: result.title,
        artist: artist.name,
        thumbnail: result.thumbnail,
      }));

      // Salvar no cache
      CacheService.saveToCache(cacheKey, songs);
      setArtistSongs(songs);
    } catch (error) {
      console.error('Error fetching artist songs:', error);
      setArtistSongs([]);
    } finally {
      setIsLoadingSongs(false);
    }
  };

  const handleSaveArtist = (artist: Artist) => {
    const newSaved = new Set(savedArtists);
    if (newSaved.has(artist.id)) {
      newSaved.delete(artist.id);
    } else {
      newSaved.add(artist.id);
    }
    setSavedArtists(newSaved);
    localStorage.setItem('savedArtists', JSON.stringify(Array.from(newSaved)));
  };

  return (
    <div className={cn(
      'fixed left-0 w-full max-h-[80vh] z-10 transition-all duration-300 ease-in-out',
      'bg-white border-t-2 border-gray-300 flex flex-col pb-2',
      isOpen ? 'bottom-0' : '-bottom-full'
    )}>
      <button
        onClick={onClose}
        className="absolute top-3 right-4 text-black text-2xl font-bold z-20 hover:text-red-500 transition-colors"
      >
        <X size={24} />
      </button>

      <div className="flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="px-4 pt-4 pb-2">
          <h2 className="text-sm font-bold text-black mb-3">🎤 Artistas Mundiais</h2>

          {/* Country Selector */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {countries.map((country) => (
              <button
                key={country}
                onClick={() => {
                  setSelectedCountry(country);
                  setSelectedArtist(null);
                  setArtistSongs([]);
                }}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors',
                  selectedCountry === country
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-200 text-black hover:bg-gray-300'
                )}
              >
                {country}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden gap-4 px-4 pb-4">
          {/* Artists List */}
          <div className="flex-1 overflow-y-auto border-r border-gray-300 pr-4">
            <div className="space-y-2">
              {artists.map((artist) => (
                <div
                  key={artist.id}
                  onClick={() => handleArtistSelect(artist)}
                  className={cn(
                    'p-3 rounded cursor-pointer transition-colors flex items-center justify-between',
                    selectedArtist?.id === artist.id
                      ? 'bg-red-100 border-l-4 border-red-600'
                      : 'bg-gray-100 hover:bg-gray-200'
                  )}
                >
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-black">{artist.name}</p>
                    <p className="text-[10px] text-gray-600">{artist.genre}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSaveArtist(artist);
                    }}
                    className={cn(
                      'p-1 rounded transition-colors',
                      savedArtists.has(artist.id)
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-300 text-black hover:bg-gray-400'
                    )}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Songs List */}
          <div className="flex-1 overflow-y-auto">
            {selectedArtist ? (
              <div>
                <h3 className="text-xs font-bold text-black mb-3">
                  {selectedArtist.name} - Músicas
                </h3>
                {isLoadingSongs ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin h-6 w-6 border-2 border-red-500 border-t-transparent rounded-full"></div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {artistSongs.map((song) => (
                      <div
                        key={song.id}
                        className="p-2 bg-gray-100 rounded hover:bg-gray-200 transition-colors flex items-center gap-2 cursor-pointer"
                        onClick={() => onPlaySong?.(song.id, song.title, song.thumbnail)}
                      >
                        <img
                          src={song.thumbnail}
                          alt={song.title}
                          className="w-10 h-10 rounded object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-black truncate">{song.title}</p>
                          <p className="text-[10px] text-gray-600">{song.artist}</p>
                        </div>
                        <Play size={14} className="text-red-600 flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 text-xs">
                Selecione um artista para ver as músicas
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
