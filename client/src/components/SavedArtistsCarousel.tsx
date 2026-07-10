/**
 * SavedArtistsCarousel - Exibe artistas salvos como cards abaixo das categorias
 */

import { useState, useEffect, useRef } from 'react';
import { Play, Music, ChevronDown, Loader2 } from 'lucide-react';
import { searchYouTube } from '@/services/youtubeService';
import { CacheService } from '@/services/cacheService';
import { cn } from '@/lib/utils';

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
  'br16': { id: 'br16', name: 'Alok', country: 'Brasil', genre: 'Eletrônico' },
  'br17': { id: 'br17', name: 'Vintage Culture', country: 'Brasil', genre: 'House/Eletrônico' },
  'br18': { id: 'br18', name: 'Dennis DJ', country: 'Brasil', genre: 'Funk' },
  'br19': { id: 'br19', name: 'Gusttavo Lima', country: 'Brasil', genre: 'Sertanejo' },
  'br20': { id: 'br20', name: 'Jorge e Mateus', country: 'Brasil', genre: 'Sertanejo' },
  'br21': { id: 'br21', name: 'Henrique e Juliano', country: 'Brasil', genre: 'Sertanejo' },
  'br22': { id: 'br22', name: 'Zé Neto e Cristiano', country: 'Brasil', genre: 'Sertanejo' },
  'br23': { id: 'br23', name: 'Maiara e Maraisa', country: 'Brasil', genre: 'Sertanejo' },
  'br24': { id: 'br24', name: 'Luan Santana', country: 'Brasil', genre: 'Sertanejo' },
  'br25': { id: 'br25', name: 'Wesley Safadão', country: 'Brasil', genre: 'Forró' },
  'br26': { id: 'br26', name: 'Gabriel Diniz', country: 'Brasil', genre: 'Forró' },
  'br27': { id: 'br27', name: 'Kevin O Chris', country: 'Brasil', genre: 'Funk' },
  'br28': { id: 'br28', name: 'PK Delas', country: 'Brasil', genre: 'Funk' },
  'br29': { id: 'br29', name: 'Matuê', country: 'Brasil', genre: 'Trap' },
  'br30': { id: 'br30', name: 'Filipe Ret', country: 'Brasil', genre: 'Rap' },
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
  'us16': { id: 'us16', name: 'Bruno Mars', country: 'EUA', genre: 'Pop/R&B' },
  'us17': { id: 'us17', name: 'Lady Gaga', country: 'EUA', genre: 'Pop' },
  'us18': { id: 'us18', name: 'Ed Sheeran', country: 'EUA', genre: 'Pop' },
  'us19': { id: 'us19', name: 'Adele', country: 'EUA', genre: 'Pop/Soul' },
  'us20': { id: 'us20', name: 'Coldplay', country: 'EUA', genre: 'Rock Alternativo' },
  'us21': { id: 'us21', name: 'Maroon 5', country: 'EUA', genre: 'Pop/Rock' },
  'us22': { id: 'us22', name: 'Imagine Dragons', country: 'EUA', genre: 'Rock Alternativo' },
  'us23': { id: 'us23', name: 'Halsey', country: 'EUA', genre: 'Pop' },
  'us24': { id: 'us24', name: 'Dua Lipa', country: 'EUA', genre: 'Pop' },
  'us25': { id: 'us25', name: 'Harry Styles', country: 'EUA', genre: 'Pop' },
  'us26': { id: 'us26', name: 'Shawn Mendes', country: 'EUA', genre: 'Pop' },
  'us27': { id: 'us27', name: 'Camila Cabello', country: 'EUA', genre: 'Pop' },
  'us28': { id: 'us28', name: 'Cardi B', country: 'EUA', genre: 'Hip-Hop/Rap' },
  'us29': { id: 'us29', name: 'Travis Scott', country: 'EUA', genre: 'Hip-Hop/Rap' },
  'us30': { id: 'us30', name: 'SZA', country: 'EUA', genre: 'R&B/Soul' },
  'uk1': { id: 'uk1', name: 'Ed Sheeran', country: 'Reino Unido', genre: 'Pop' },
  'uk2': { id: 'uk2', name: 'Adele', country: 'Reino Unido', genre: 'Pop/Soul' },
  'uk3': { id: 'uk3', name: 'Harry Styles', country: 'Reino Unido', genre: 'Pop' },
  'uk4': { id: 'uk4', name: 'Coldplay', country: 'Reino Unido', genre: 'Rock Alternativo' },
  'uk5': { id: 'uk5', name: 'Amy Winehouse', country: 'Reino Unido', genre: 'Jazz/Soul' },
  'uk6': { id: 'uk6', name: 'Dua Lipa', country: 'Reino Unido', genre: 'Pop' },
  'uk7': { id: 'uk7', name: 'One Direction', country: 'Reino Unido', genre: 'Pop' },
  'uk8': { id: 'uk8', name: 'The Beatles', country: 'Reino Unido', genre: 'Rock' },
  'uk9': { id: 'uk9', name: 'Queen', country: 'Reino Unido', genre: 'Rock' },
  'uk10': { id: 'uk10', name: 'Elton John', country: 'Reino Unido', genre: 'Pop/Rock' },
  'uk11': { id: 'uk11', name: 'David Bowie', country: 'Reino Unido', genre: 'Rock' },
  'uk12': { id: 'uk12', name: 'Pink Floyd', country: 'Reino Unido', genre: 'Rock Progressivo' },
  'uk13': { id: 'uk13', name: 'The Rolling Stones', country: 'Reino Unido', genre: 'Rock' },
  'uk14': { id: 'uk14', name: 'Amy Macdonald', country: 'Reino Unido', genre: 'Pop/Rock' },
  'uk15': { id: 'uk15', name: 'Gorillaz', country: 'Reino Unido', genre: 'Eletrônico/Rock' },
  'es1': { id: 'es1', name: 'Rosalía', country: 'Espanha', genre: 'Flamenco/Trap' },
  'es2': { id: 'es2', name: 'Bad Bunny', country: 'Espanha', genre: 'Reggaeton' },
  'es3': { id: 'es3', name: 'Enrique Iglesias', country: 'Espanha', genre: 'Pop Latino' },
  'es4': { id: 'es4', name: 'Alejandro Sanz', country: 'Espanha', genre: 'Pop' },
  'es5': { id: 'es5', name: 'Maluma', country: 'Espanha', genre: 'Reggaeton/Pop' },
  'es6': { id: 'es6', name: 'Bunbury', country: 'Espanha', genre: 'Rock' },
  'es7': { id: 'es7', name: 'Paco de Lucía', country: 'Espanha', genre: 'Flamenco' },
  'es8': { id: 'es8', name: 'Camarón de la Isla', country: 'Espanha', genre: 'Flamenco' },
  'es9': { id: 'es9', name: 'Joan Manuel Serrat', country: 'Espanha', genre: 'Pop/Folk' },
  'es10': { id: 'es10', name: 'Joaquín Sabina', country: 'Espanha', genre: 'Pop/Rock' },
  'es11': { id: 'es11', name: 'Fito Páez', country: 'Espanha', genre: 'Rock' },
  'es12': { id: 'es12', name: 'Andrés Calamaro', country: 'Espanha', genre: 'Rock' },
  'es13': { id: 'es13', name: 'Mecano', country: 'Espanha', genre: 'Eletrônico/Pop' },
  'es14': { id: 'es14', name: 'Héroes del Silencio', country: 'Espanha', genre: 'Rock' },
  'es15': { id: 'es15', name: 'Vetusta Morla', country: 'Espanha', genre: 'Rock Indie' },
  'co1': { id: 'co1', name: 'Shakira', country: 'Colômbia', genre: 'Pop Latino' },
  'co2': { id: 'co2', name: 'Juanes', country: 'Colômbia', genre: 'Rock Latino' },
  'co3': { id: 'co3', name: 'Karol G', country: 'Colômbia', genre: 'Reggaeton' },
  'co4': { id: 'co4', name: 'J Balvin', country: 'Colômbia', genre: 'Reggaeton' },
  'co5': { id: 'co5', name: 'Feid', country: 'Colômbia', genre: 'Reggaeton/Trap' },
  'co6': { id: 'co6', name: 'Maluma', country: 'Colômbia', genre: 'Reggaeton' },
  'co7': { id: 'co7', name: 'Silvestre Dangond', country: 'Colômbia', genre: 'Vallenato' },
  'co8': { id: 'co8', name: 'Carlos Vives', country: 'Colômbia', genre: 'Pop Latino' },
  'co9': { id: 'co9', name: 'Bomba Estéreo', country: 'Colômbia', genre: 'Eletrônico/Pop' },
  'co10': { id: 'co10', name: 'Aterciopelados', country: 'Colômbia', genre: 'Rock Alternativo' },
  'co11': { id: 'co11', name: 'Ekhymosis', country: 'Colômbia', genre: 'Rock' },
  'co12': { id: 'co12', name: 'Momojet', country: 'Colômbia', genre: 'Reggaeton' },
  'co13': { id: 'co13', name: 'Arcángel', country: 'Colômbia', genre: 'Reggaeton' },
  'co14': { id: 'co14', name: 'Nio Cash', country: 'Colômbia', genre: 'Reggaeton' },
  'co15': { id: 'co15', name: 'Ivy Queen', country: 'Colômbia', genre: 'Reggaeton' },
  'mx1': { id: 'mx1', name: 'Peso Pluma', country: 'México', genre: 'Trap Latino' },
  'mx2': { id: 'mx2', name: 'Eslabón Armado', country: 'México', genre: 'Regional Mexicano' },
  'mx3': { id: 'mx3', name: 'Natalia Lafourcade', country: 'México', genre: 'Pop/Indie' },
  'mx4': { id: 'mx4', name: 'Reik', country: 'México', genre: 'Pop' },
  'mx5': { id: 'mx5', name: 'Grupo Frontera', country: 'México', genre: 'Regional Mexicano' },
  'mx6': { id: 'mx6', name: 'Juanes', country: 'México', genre: 'Rock Latino' },
  'mx7': { id: 'mx7', name: 'Café Tacvba', country: 'México', genre: 'Rock Alternativo' },
  'mx8': { id: 'mx8', name: 'Molotov', country: 'México', genre: 'Rap/Rock' },
  'mx9': { id: 'mx9', name: 'Caifanes', country: 'México', genre: 'Rock' },
  'mx10': { id: 'mx10', name: 'Jaguares', country: 'México', genre: 'Rock Alternativo' },
  'mx11': { id: 'mx11', name: 'Timbiriche', country: 'México', genre: 'Pop' },
  'mx12': { id: 'mx12', name: 'Belanova', country: 'México', genre: 'Eletrônico/Pop' },
  'mx13': { id: 'mx13', name: 'Moderatto', country: 'México', genre: 'Rock Eletrônico' },
  'mx14': { id: 'mx14', name: 'Zoé', country: 'México', genre: 'Rock Alternativo' },
  'mx15': { id: 'mx15', name: 'Resorte', country: 'México', genre: 'Rock' },
  'it1': { id: 'it1', name: 'Laura Pausini', country: 'Itália', genre: 'Pop' },
  'it2': { id: 'it2', name: 'Andrea Bocelli', country: 'Itália', genre: 'Clássico/Tenor' },
  'it3': { id: 'it3', name: 'Eros Ramazzotti', country: 'Itália', genre: 'Pop' },
  'it4': { id: 'it4', name: 'Måneskin', country: 'Itália', genre: 'Rock' },
  'it5': { id: 'it5', name: 'Tiziano Ferro', country: 'Itália', genre: 'Pop' },
  'it6': { id: 'it6', name: 'Luciano Pavarotti', country: 'Itália', genre: 'Ópera' },
  'it7': { id: 'it7', name: 'Domenico Modugno', country: 'Itália', genre: 'Pop/Clássico' },
  'it8': { id: 'it8', name: 'Adriano Celentano', country: 'Itália', genre: 'Pop' },
  'it9': { id: 'it9', name: 'Renato Zero', country: 'Itália', genre: 'Pop/Rock' },
  'it10': { id: 'it10', name: 'Vasco Rossi', country: 'Itália', genre: 'Rock' },
};

export const SavedArtistsCarousel = ({ onPlayPlaylist }: SavedArtistsCarouselProps) => {
  const [savedArtistIds, setSavedArtistIds] = useState<string[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<SavedArtist | null>(null);
  const [artistSongs, setArtistSongs] = useState<Array<{id: string; title: string; thumbnail: string}>>([]);
  const [isLoadingSongs, setIsLoadingSongs] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showSongsPanel, setShowSongsPanel] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Carregar artistas salvos do localStorage
  useEffect(() => {
    const loadSaved = () => {
      const saved = localStorage.getItem('savedArtists');
      if (saved) {
        try {
          setSavedArtistIds(JSON.parse(saved));
        } catch (e) {
          console.error('Error parsing savedArtists', e);
        }
      }
    };

    loadSaved();

    // Atualizar a cada segundo para refletir mudanças
    const interval = setInterval(loadSaved, 1000);
    return () => clearInterval(interval);
  }, []);

  const savedArtists = savedArtistIds
    .map(id => ALL_ARTISTS[id])
    .filter(artist => artist !== undefined);

  const handlePlayArtist = async (artist: SavedArtist) => {
    setSelectedArtist(artist);
    setArtistSongs([]);
    setNextPageToken(null);
    setIsLoadingSongs(true);
    setShowSongsPanel(true);
    
    try {
      const cacheKey = `artist_${artist.id}`;
      let cachedSongs = CacheService.getFromCache(cacheKey);

      if (cachedSongs) {
        setArtistSongs(cachedSongs);
      } else {
        const results = await searchYouTube(`${artist.name} música`);
        const songs = results.items.map((result: any) => ({
          id: result.id,
          title: result.title,
          thumbnail: result.thumbnail,
        }));
        
        setArtistSongs(songs);
        setNextPageToken(results.nextPageToken || null);
        CacheService.saveToCache(cacheKey, songs);
      }
    } catch (error) {
      console.error('Error loading artist songs:', error);
      setArtistSongs([]);
    } finally {
      setIsLoadingSongs(false);
    }
  };

  // Detectar scroll infinito
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      // Carregar mais quando chegar a 80% do scroll
      if (scrollHeight - scrollTop - clientHeight < 200 && !isLoadingMore && nextPageToken) {
        loadMoreSongs();
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [nextPageToken, isLoadingMore]);

  const loadMoreSongs = async () => {
    if (!selectedArtist || !nextPageToken || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const results = await searchYouTube(`${selectedArtist.name} música`, nextPageToken);
      const newSongs = results.items.map((result: any) => ({
        id: result.id,
        title: result.title,
        thumbnail: result.thumbnail,
      }));

      setArtistSongs(prev => [...prev, ...newSongs]);
      setNextPageToken(results.nextPageToken || null);
    } catch (error) {
      console.error('Error loading more songs:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handlePlaySong = (index: number) => {
    if (artistSongs.length > 0) {
      onPlayPlaylist?.(artistSongs, index);
      setShowSongsPanel(false);
    }
  };

  if (savedArtists.length === 0) {
    return null;
  }

  return (
    <>
      <div className="w-full px-2 py-2">
        <h3 className="text-xs font-bold text-white mb-2 flex items-center justify-center gap-2">
          <Music size={14} /> Meus Artistas Favoritos
        </h3>
        
        {/* Strip horizontal seguindo o padrão do CategoryCarousel */}
        <div className="flex gap-2 px-2 py-0.5 overflow-x-auto custom-scrollbar w-full">
          {savedArtists.map((artist) => (
            <button
              key={artist.id}
              onClick={() => handlePlayArtist(artist)}
              className="flex-shrink-0 w-[58px] h-[58px] bg-gradient-to-br from-red-600 to-red-800 rounded cursor-pointer p-1 flex flex-col items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg relative group overflow-hidden"
            >
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
              
              <div className="relative z-10 flex flex-col items-center justify-center h-full w-full">
                <p className="text-white font-bold text-[8px] text-center leading-tight truncate w-full px-0.5">
                  {artist.name}
                </p>
                <p className="text-red-100 text-[6px] text-center truncate w-full">
                  {artist.country}
                </p>
              </div>

              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                <Play size={16} className="text-white fill-white" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Painel de Músicas do Artista com Scroll Infinito */}
      <div className={cn(
        'fixed left-0 w-full max-h-[80vh] z-50 transition-all duration-300 ease-in-out',
        'bg-white border-t-2 border-gray-300 flex flex-col pb-2',
        showSongsPanel ? 'bottom-0' : '-bottom-full'
      )}>
        <div className="flex justify-center pt-2 pb-2">
          <button
            onClick={() => setShowSongsPanel(false)}
            className="text-red-600 hover:text-red-700 transition-colors"
          >
            <ChevronDown size={28} />
          </button>
        </div>

        {selectedArtist && (
          <div className="flex flex-col h-full overflow-hidden px-4">
            <h2 className="text-sm font-bold text-black mb-3">
              {selectedArtist.name} - {artistSongs.length} músicas
            </h2>
            
            {isLoadingSongs ? (
              <div className="flex items-center justify-center flex-1 py-10">
                <div className="animate-spin h-8 w-8 border-2 border-red-500 border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <div 
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto space-y-2 pb-6"
              >
                {artistSongs.map((song, index) => (
                  <div
                    key={song.id}
                    className="p-2 bg-gray-100 rounded hover:bg-gray-200 transition-colors flex items-center gap-2 cursor-pointer"
                    onClick={() => handlePlaySong(index)}
                  >
                    <img
                      src={song.thumbnail}
                      alt={song.title}
                      className="w-12 h-12 rounded object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-black truncate">{song.title}</p>
                      <p className="text-[10px] text-gray-600">{selectedArtist.name}</p>
                    </div>
                    <Play size={16} className="text-red-600 flex-shrink-0" />
                  </div>
                ))}

                {/* Loading More Indicator */}
                {isLoadingMore && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="animate-spin text-red-600" size={20} />
                    <span className="ml-2 text-gray-600 text-xs">Carregando mais...</span>
                  </div>
                )}

                {/* End of List */}
                {!nextPageToken && artistSongs.length > 0 && (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-xs">Fim da lista</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};
