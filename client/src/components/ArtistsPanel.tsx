/**
 * ArtistsPanel - Painel de artistas mundiais com busca de músicas no YouTube
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Play, Plus, ChevronDown, Loader2, Download, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { searchYouTube, searchYouTubeArtists } from '@/services/youtubeService';
import { CacheService } from '@/services/cacheService';
import { youtubeDownloader, DownloadProgress } from '@/services/youtubeDownloader';
import { toast } from 'sonner';

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
  onPlayPlaylist?: (songs: Array<{id: string; title: string; thumbnail: string}>, startIndex: number) => void;
}

// Lista expandida de artistas mundiais por país
const ARTISTS_BY_COUNTRY: Record<string, Artist[]> = {
  'Brasil': [
    { id: 'br1', name: 'Anitta', country: 'Brasil', genre: 'Pop/Funk' },
    { id: 'br2', name: 'Ludmilla', country: 'Brasil', genre: 'Funk/Reggaeton' },
    { id: 'br3', name: 'Pabllo Vittar', country: 'Brasil', genre: 'Eletrônico/Pop' },
    { id: 'br4', name: 'Ivete Sangalo', country: 'Brasil', genre: 'Axé' },
    { id: 'br5', name: 'Caetano Veloso', country: 'Brasil', genre: 'MPB' },
    { id: 'br6', name: 'Iza', country: 'Brasil', genre: 'R&B/Soul' },
    { id: 'br7', name: 'Thiaguinho', country: 'Brasil', genre: 'Samba/Pagode' },
    { id: 'br8', name: 'Simone Mendes', country: 'Brasil', genre: 'Sertanejo' },
    { id: 'br9', name: 'Marília Mendes', country: 'Brasil', genre: 'Sertanejo' },
    { id: 'br10', name: 'Ferrugem', country: 'Brasil', genre: 'Samba/Pagode' },
    { id: 'br11', name: 'Projota', country: 'Brasil', genre: 'Rap/Hip-Hop' },
    { id: 'br12', name: 'Emicida', country: 'Brasil', genre: 'Rap/Hip-Hop' },
    { id: 'br13', name: 'Racionais MC\'s', country: 'Brasil', genre: 'Rap/Hip-Hop' },
    { id: 'br14', name: 'Criolo', country: 'Brasil', genre: 'Rap/Hip-Hop' },
    { id: 'br15', name: 'Mc Kevinho', country: 'Brasil', genre: 'Funk' },
    { id: 'br16', name: 'Alok', country: 'Brasil', genre: 'Eletrônico' },
    { id: 'br17', name: 'Vintage Culture', country: 'Brasil', genre: 'House/Eletrônico' },
    { id: 'br18', name: 'Dennis DJ', country: 'Brasil', genre: 'Funk' },
    { id: 'br19', name: 'Gusttavo Lima', country: 'Brasil', genre: 'Sertanejo' },
    { id: 'br20', name: 'Jorge e Mateus', country: 'Brasil', genre: 'Sertanejo' },
    { id: 'br21', name: 'Henrique e Juliano', country: 'Brasil', genre: 'Sertanejo' },
    { id: 'br22', name: 'Zé Neto e Cristiano', country: 'Brasil', genre: 'Sertanejo' },
    { id: 'br23', name: 'Maiara e Maraisa', country: 'Brasil', genre: 'Sertanejo' },
    { id: 'br24', name: 'Luan Santana', country: 'Brasil', genre: 'Sertanejo' },
    { id: 'br25', name: 'Wesley Safadão', country: 'Brasil', genre: 'Forró' },
    { id: 'br26', name: 'Gabriel Diniz', country: 'Brasil', genre: 'Forró' },
    { id: 'br27', name: 'Kevin O Chris', country: 'Brasil', genre: 'Funk' },
    { id: 'br28', name: 'PK Delas', country: 'Brasil', genre: 'Funk' },
    { id: 'br29', name: 'Matuê', country: 'Brasil', genre: 'Trap' },
    { id: 'br30', name: 'Filipe Ret', country: 'Brasil', genre: 'Rap' }
  ],
  'EUA': [
    { id: 'us1', name: 'Taylor Swift', country: 'EUA', genre: 'Pop' },
    { id: 'us2', name: 'The Weeknd', country: 'EUA', genre: 'R&B/Pop' },
    { id: 'us3', name: 'Ariana Grande', country: 'EUA', genre: 'Pop' },
    { id: 'us4', name: 'Drake', country: 'EUA', genre: 'Hip-Hop/Rap' },
    { id: 'us5', name: 'Billie Eilish', country: 'EUA', genre: 'Pop/Alternativo' },
    { id: 'us6', name: 'Beyoncé', country: 'EUA', genre: 'R&B/Pop' },
    { id: 'us7', name: 'Eminem', country: 'EUA', genre: 'Rap/Hip-Hop' },
    { id: 'us8', name: 'Kanye West', country: 'EUA', genre: 'Rap/Hip-Hop' },
    { id: 'us9', name: 'Rihanna', country: 'EUA', genre: 'R&B/Pop' },
    { id: 'us10', name: 'Justin Bieber', country: 'EUA', genre: 'Pop' },
    { id: 'us11', name: 'Post Malone', country: 'EUA', genre: 'Hip-Hop/Pop' },
    { id: 'us12', name: 'Olivia Rodrigo', country: 'EUA', genre: 'Pop' },
    { id: 'us13', name: 'Doja Cat', country: 'EUA', genre: 'Rap/Pop' },
    { id: 'us14', name: 'Lil Nas X', country: 'EUA', genre: 'Rap/Pop' },
    { id: 'us15', name: 'Weeknd', country: 'EUA', genre: 'R&B' },
    { id: 'us16', name: 'Bruno Mars', country: 'EUA', genre: 'Pop/R&B' },
    { id: 'us17', name: 'Lady Gaga', country: 'EUA', genre: 'Pop' },
    { id: 'us18', name: 'Ed Sheeran', country: 'EUA', genre: 'Pop' },
    { id: 'us19', name: 'Adele', country: 'EUA', genre: 'Pop/Soul' },
    { id: 'us20', name: 'Coldplay', country: 'EUA', genre: 'Rock Alternativo' },
    { id: 'us21', name: 'Maroon 5', country: 'EUA', genre: 'Pop/Rock' },
    { id: 'us22', name: 'Imagine Dragons', country: 'EUA', genre: 'Rock Alternativo' },
    { id: 'us23', name: 'Halsey', country: 'EUA', genre: 'Pop' },
    { id: 'us24', name: 'Dua Lipa', country: 'EUA', genre: 'Pop' },
    { id: 'us25', name: 'Harry Styles', country: 'EUA', genre: 'Pop' },
    { id: 'us26', name: 'Shawn Mendes', country: 'EUA', genre: 'Pop' },
    { id: 'us27', name: 'Camila Cabello', country: 'EUA', genre: 'Pop' },
    { id: 'us28', name: 'Cardi B', country: 'EUA', genre: 'Hip-Hop/Rap' },
    { id: 'us29', name: 'Travis Scott', country: 'EUA', genre: 'Hip-Hop/Rap' },
    { id: 'us30', name: 'SZA', country: 'EUA', genre: 'R&B/Soul' }
  ],
  'Reino Unido': [
    { id: 'uk1', name: 'Ed Sheeran', country: 'Reino Unido', genre: 'Pop' },
    { id: 'uk2', name: 'Adele', country: 'Reino Unido', genre: 'Pop/Soul' },
    { id: 'uk3', name: 'Harry Styles', country: 'Reino Unido', genre: 'Pop' },
    { id: 'uk4', name: 'Coldplay', country: 'Reino Unido', genre: 'Rock Alternativo' },
    { id: 'uk5', name: 'Amy Winehouse', country: 'Reino Unido', genre: 'Jazz/Soul' },
    { id: 'uk6', name: 'Dua Lipa', country: 'Reino Unido', genre: 'Pop' },
    { id: 'uk7', name: 'One Direction', country: 'Reino Unido', genre: 'Pop' },
    { id: 'uk8', name: 'The Beatles', country: 'Reino Unido', genre: 'Rock' },
    { id: 'uk9', name: 'Queen', country: 'Reino Unido', genre: 'Rock' },
    { id: 'uk10', name: 'Elton John', country: 'Reino Unido', genre: 'Pop/Rock' },
    { id: 'uk11', name: 'David Bowie', country: 'Reino Unido', genre: 'Rock' },
    { id: 'uk12', name: 'Pink Floyd', country: 'Reino Unido', genre: 'Rock Progressivo' },
    { id: 'uk13', name: 'The Rolling Stones', country: 'Reino Unido', genre: 'Rock' },
    { id: 'uk14', name: 'Amy Macdonald', country: 'Reino Unido', genre: 'Pop/Rock' },
    { id: 'uk15', name: 'Gorillaz', country: 'Reino Unido', genre: 'Eletrônico/Rock' },
  ],
  'Espanha': [
    { id: 'es1', name: 'Rosalía', country: 'Espanha', genre: 'Flamenco/Trap' },
    { id: 'es2', name: 'Bad Bunny', country: 'Espanha', genre: 'Reggaeton' },
    { id: 'es3', name: 'Enrique Iglesias', country: 'Espanha', genre: 'Pop Latino' },
    { id: 'es4', name: 'Alejandro Sanz', country: 'Espanha', genre: 'Pop' },
    { id: 'es5', name: 'Maluma', country: 'Espanha', genre: 'Reggaeton/Pop' },
    { id: 'es6', name: 'Bunbury', country: 'Espanha', genre: 'Rock' },
    { id: 'es7', name: 'Paco de Lucía', country: 'Espanha', genre: 'Flamenco' },
    { id: 'es8', name: 'Camarón de la Isla', country: 'Espanha', genre: 'Flamenco' },
    { id: 'es9', name: 'Joan Manuel Serrat', country: 'Espanha', genre: 'Pop/Folk' },
    { id: 'es10', name: 'Joaquín Sabina', country: 'Espanha', genre: 'Pop/Rock' },
    { id: 'es11', name: 'Fito Páez', country: 'Espanha', genre: 'Rock' },
    { id: 'es12', name: 'Andrés Calamaro', country: 'Espanha', genre: 'Rock' },
    { id: 'es13', name: 'Mecano', country: 'Espanha', genre: 'Eletrônico/Pop' },
    { id: 'es14', name: 'Héroes del Silencio', country: 'Espanha', genre: 'Rock' },
    { id: 'es15', name: 'Vetusta Morla', country: 'Espanha', genre: 'Rock Indie' },
  ],
  'Colômbia': [
    { id: 'co1', name: 'Shakira', country: 'Colômbia', genre: 'Pop Latino' },
    { id: 'co2', name: 'Juanes', country: 'Colômbia', genre: 'Rock Latino' },
    { id: 'co3', name: 'Karol G', country: 'Colômbia', genre: 'Reggaeton' },
    { id: 'co4', name: 'J Balvin', country: 'Colômbia', genre: 'Reggaeton' },
    { id: 'co5', name: 'Feid', country: 'Colômbia', genre: 'Reggaeton/Trap' },
    { id: 'co6', name: 'Maluma', country: 'Colômbia', genre: 'Reggaeton' },
    { id: 'co7', name: 'Silvestre Dangond', country: 'Colômbia', genre: 'Vallenato' },
    { id: 'co8', name: 'Carlos Vives', country: 'Colômbia', genre: 'Pop Latino' },
    { id: 'co9', name: 'Bomba Estéreo', country: 'Colômbia', genre: 'Eletrônico/Pop' },
    { id: 'co10', name: 'Aterciopelados', country: 'Colômbia', genre: 'Rock Alternativo' },
    { id: 'co11', name: 'Ekhymosis', country: 'Colômbia', genre: 'Rock' },
    { id: 'co12', name: 'Momojet', country: 'Colômbia', genre: 'Reggaeton' },
    { id: 'co13', name: 'Arcángel', country: 'Colômbia', genre: 'Reggaeton' },
    { id: 'co14', name: 'Nio Cash', country: 'Colômbia', genre: 'Reggaeton' },
    { id: 'co15', name: 'Ivy Queen', country: 'Colômbia', genre: 'Reggaeton' },
  ],
  'México': [
    { id: 'mx1', name: 'Peso Pluma', country: 'México', genre: 'Trap Latino' },
    { id: 'mx2', name: 'Eslabón Armado', country: 'México', genre: 'Regional Mexicano' },
    { id: 'mx3', name: 'Natalia Lafourcade', country: 'México', genre: 'Pop/Indie' },
    { id: 'mx4', name: 'Reik', country: 'México', genre: 'Pop' },
    { id: 'mx5', name: 'Grupo Frontera', country: 'México', genre: 'Regional Mexicano' },
    { id: 'mx6', name: 'Juanes', country: 'México', genre: 'Rock Latino' },
    { id: 'mx7', name: 'Café Tacvba', country: 'México', genre: 'Rock Alternativo' },
    { id: 'mx8', name: 'Molotov', country: 'México', genre: 'Rap/Rock' },
    { id: 'mx9', name: 'Caifanes', country: 'México', genre: 'Rock' },
    { id: 'mx10', name: 'Jaguares', country: 'México', genre: 'Rock Alternativo' },
    { id: 'mx11', name: 'Timbiriche', country: 'México', genre: 'Pop' },
    { id: 'mx12', name: 'Belanova', country: 'México', genre: 'Eletrônico/Pop' },
    { id: 'mx13', name: 'Moderatto', country: 'México', genre: 'Rock Eletrônico' },
    { id: 'mx14', name: 'Zoé', country: 'México', genre: 'Rock Alternativo' },
    { id: 'mx15', name: 'Resorte', country: 'México', genre: 'Rock' },
  ],
  'Itália': [
    { id: 'it1', name: 'Laura Pausini', country: 'Itália', genre: 'Pop' },
    { id: 'it2', name: 'Andrea Bocelli', country: 'Itália', genre: 'Clássico/Tenor' },
    { id: 'it3', name: 'Eros Ramazzotti', country: 'Itália', genre: 'Pop' },
    { id: 'it4', name: 'Måneskin', country: 'Itália', genre: 'Rock' },
    { id: 'it5', name: 'Tiziano Ferro', country: 'Itália', genre: 'Pop' },
    { id: 'it6', name: 'Luciano Pavarotti', country: 'Itália', genre: 'Ópera' },
    { id: 'it7', name: 'Domenico Modugno', country: 'Itália', genre: 'Pop/Clássico' },
    { id: 'it8', name: 'Adriano Celentano', country: 'Itália', genre: 'Pop' },
    { id: 'it9', name: 'Renato Zero', country: 'Itália', genre: 'Pop/Rock' },
    { id: 'it10', name: 'Vasco Rossi', country: 'Itália', genre: 'Rock' },
    { id: 'it11', name: 'Gianna Nannini', country: 'Itália', genre: 'Rock' },
    { id: 'it12', name: 'Zucchero', country: 'Itália', genre: 'Blues/Rock' },
    { id: 'it13', name: 'Sting', country: 'Itália', genre: 'Pop/Rock' },
    { id: 'it14', name: 'Pino Daniele', country: 'Itália', genre: 'Fusão' },
    { id: 'it15', name: 'Ligabue', country: 'Itália', genre: 'Rock' },
  ],
  'Alemanha': [
    { id: 'de1', name: 'Kraftwerk', country: 'Alemanha', genre: 'Eletrônico' },
    { id: 'de2', name: 'Rammstein', country: 'Alemanha', genre: 'Metal Industrial' },
    { id: 'de3', name: 'Nena', country: 'Alemanha', genre: 'Pop/New Wave' },
    { id: 'de4', name: 'Scorpions', country: 'Alemanha', genre: 'Rock' },
    { id: 'de5', name: 'Enya', country: 'Alemanha', genre: 'New Age' },
    { id: 'de6', name: 'Tangerine Dream', country: 'Alemanha', genre: 'Eletrônico' },
    { id: 'de7', name: 'Neu!', country: 'Alemanha', genre: 'Rock Krautrock' },
    { id: 'de8', name: 'Can', country: 'Alemanha', genre: 'Rock Krautrock' },
    { id: 'de9', name: 'Einsturzende Neubauten', country: 'Alemanha', genre: 'Industrial' },
    { id: 'de10', name: 'DAF', country: 'Alemanha', genre: 'Eletrônico/Industrial' },
    { id: 'de11', name: 'Deutsch Amerikanische Freundschaft', country: 'Alemanha', genre: 'Eletrônico' },
    { id: 'de12', name: 'Falco', country: 'Alemanha', genre: 'Pop/Rock' },
    { id: 'de13', name: 'Deine Lakaien', country: 'Alemanha', genre: 'Eletrônico/Gótico' },
    { id: 'de14', name: 'Covenant', country: 'Alemanha', genre: 'Eletrônico/Gótico' },
    { id: 'de15', name: 'VNV Nation', country: 'Alemanha', genre: 'Eletrônico/Industrial' },
  ],
  'Japão': [
    { id: 'jp1', name: 'Utada Hikaru', country: 'Japão', genre: 'J-Pop' },
    { id: 'jp2', name: 'Arashi', country: 'Japão', genre: 'J-Pop' },
    { id: 'jp3', name: 'Hatsune Miku', country: 'Japão', genre: 'Vocaloid/Eletrônico' },
    { id: 'jp4', name: 'Sekai no Nabeatsu', country: 'Japão', genre: 'J-Pop' },
    { id: 'jp5', name: 'Yuki Kajiura', country: 'Japão', genre: 'Eletrônico/Anime' },
    { id: 'jp6', name: 'Perfume', country: 'Japão', genre: 'Eletrônico/J-Pop' },
    { id: 'jp7', name: 'Babymetal', country: 'Japão', genre: 'Metal/J-Pop' },
    { id: 'jp8', name: 'Capsule', country: 'Japão', genre: 'Eletrônico' },
    { id: 'jp9', name: 'Coda', country: 'Japão', genre: 'J-Pop' },
    { id: 'jp10', name: 'Shiina Ringo', country: 'Japão', genre: 'J-Pop/Rock' },
    { id: 'jp11', name: 'Nujabes', country: 'Japão', genre: 'Hip-Hop/Jazz' },
    { id: 'jp12', name: 'Ryoji Ikeda', country: 'Japão', genre: 'Eletrônico Experimental' },
    { id: 'jp13', name: 'Susumu Yokota', country: 'Japão', genre: 'Eletrônico' },
    { id: 'jp14', name: 'Cornelius', country: 'Japão', genre: 'Eletrônico/Pop' },
    { id: 'jp15', name: 'Yellow Magic Orchestra', country: 'Japão', genre: 'Eletrônico' },
  ],
  'Coreia do Sul': [
    { id: 'kr1', name: 'BTS', country: 'Coreia do Sul', genre: 'K-Pop' },
    { id: 'kr2', name: 'BLACKPINK', country: 'Coreia do Sul', genre: 'K-Pop' },
    { id: 'kr3', name: 'IU', country: 'Coreia do Sul', genre: 'K-Pop' },
    { id: 'kr4', name: 'Stray Kids', country: 'Coreia do Sul', genre: 'K-Pop' },
    { id: 'kr5', name: 'NewJeans', country: 'Coreia do Sul', genre: 'K-Pop' },
    { id: 'kr6', name: 'Twice', country: 'Coreia do Sul', genre: 'K-Pop' },
    { id: 'kr7', name: 'Seventeen', country: 'Coreia do Sul', genre: 'K-Pop' },
    { id: 'kr8', name: 'EXO', country: 'Coreia do Sul', genre: 'K-Pop' },
    { id: 'kr9', name: 'Red Velvet', country: 'Coreia do Sul', genre: 'K-Pop' },
    { id: 'kr10', name: 'Aespa', country: 'Coreia do Sul', genre: 'K-Pop' },
    { id: 'kr11', name: 'Enhypen', country: 'Coreia do Sul', genre: 'K-Pop' },
    { id: 'kr12', name: 'Le Sserafim', country: 'Coreia do Sul', genre: 'K-Pop' },
    { id: 'kr13', name: 'Itzy', country: 'Coreia do Sul', genre: 'K-Pop' },
    { id: 'kr14', name: 'Loona', country: 'Coreia do Sul', genre: 'K-Pop' },
    { id: 'kr15', name: 'Ive', country: 'Coreia do Sul', genre: 'K-Pop' },
  ],
};

const ARTISTS_PER_PAGE = 12;

export const ArtistsPanel = ({ isOpen, onClose, onPlaySong, onPlayPlaylist }: ArtistsPanelProps) => {
  const [selectedCountry, setSelectedCountry] = useState<string>('Brasil');
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [artistSongs, setArtistSongs] = useState<ArtistSong[]>([]);
  const [isLoadingSongs, setIsLoadingSongs] = useState(false);
  const [isLoadingMoreSongs, setIsLoadingMoreSongs] = useState(false);
  const [savedArtists, setSavedArtists] = useState<Set<string>>(new Set());
  const [displayedArtistsCount, setDisplayedArtistsCount] = useState(ARTISTS_PER_PAGE);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const artistsListRef = useRef<HTMLDivElement>(null);
  const songsListRef = useRef<HTMLDivElement>(null);
  const [downloadingIds, setDownloadingIds] = useState<Record<string, DownloadProgress>>({});
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  // Artistas extras carregados dinamicamente do YouTube (scroll infinito real)
  const [extraArtists, setExtraArtists] = useState<Artist[]>([]);
  const [isLoadingMoreArtists, setIsLoadingMoreArtists] = useState(false);
  const [extraArtistsPageToken, setExtraArtistsPageToken] = useState<string | null | undefined>(undefined);
  const seenExtraArtistIdsRef = useRef<Set<string>>(new Set());

  // Popup de busca de artistas
  const [isArtistSearchOpen, setIsArtistSearchOpen] = useState(false);
  const [artistSearchQuery, setArtistSearchQuery] = useState('');
  const [artistSearchResults, setArtistSearchResults] = useState<Artist[]>([]);
  const [isSearchingArtists, setIsSearchingArtists] = useState(false);
  const [artistSearchPageToken, setArtistSearchPageToken] = useState<string | null | undefined>(undefined);

  // Verificar quais músicas de artistas já estão salvas
  useEffect(() => {
    const checkSaved = async () => {
      const newSavedIds = new Set<string>();
      for (const song of artistSongs) {
        const isSaved = await youtubeDownloader.isSaved(song.id);
        if (isSaved) newSavedIds.add(song.id);
      }
      setSavedIds(newSavedIds);
    };
    if (artistSongs.length > 0) checkSaved();
  }, [artistSongs]);

  const countries = Object.keys(ARTISTS_BY_COUNTRY).sort();
  const baseArtists = ARTISTS_BY_COUNTRY[selectedCountry] || [];
  // Lista combinada: artistas fixos do país + artistas carregados dinamicamente
  const allArtists = [...baseArtists, ...extraArtists];
  const displayedArtists = allArtists.slice(0, displayedArtistsCount);

  // Carregar artistas salvos do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedArtists');
    if (saved) {
      setSavedArtists(new Set(JSON.parse(saved)));
    }
  }, []);

  // Buscar artistas com debounce ao digitar no popup de busca
  useEffect(() => {
    if (!isArtistSearchOpen) return;

    const timer = setTimeout(() => {
      runArtistSearch(artistSearchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [artistSearchQuery, isArtistSearchOpen]);

  // Buscar músicas do artista selecionado
  const handleArtistSelect = async (artist: Artist) => {
    setSelectedArtist(artist);
    setArtistSongs([]);
    setNextPageToken(null);
    setIsLoadingSongs(true);

    try {
      const cacheKey = `artist_${artist.id}`;
      const cachedSongs = CacheService.getFromCache(cacheKey);

      if (cachedSongs) {
        setArtistSongs(cachedSongs);
        setIsLoadingSongs(false);
        return;
      }

      const results = await searchYouTube(`${artist.name} música`);
      const songs: ArtistSong[] = results.items.map((result) => ({
        id: result.id,
        title: result.title,
        artist: artist.name,
        thumbnail: result.thumbnail,
      }));

      CacheService.saveToCache(cacheKey, songs);
      setArtistSongs(songs);
      setNextPageToken(results.nextPageToken || null);
    } catch (error) {
      console.error('Error fetching artist songs:', error);
      setArtistSongs([]);
    } finally {
      setIsLoadingSongs(false);
    }
  };

  // Carregar mais músicas do artista
  const loadMoreSongs = async () => {
    if (!selectedArtist || !nextPageToken || isLoadingMoreSongs) return;

    setIsLoadingMoreSongs(true);
    try {
      const results = await searchYouTube(`${selectedArtist.name} música`, nextPageToken);
      const newSongs: ArtistSong[] = results.items.map((result) => ({
        id: result.id,
        title: result.title,
        artist: selectedArtist.name,
        thumbnail: result.thumbnail,
      }));

      setArtistSongs(prev => [...prev, ...newSongs]);
      setNextPageToken(results.nextPageToken || null);
    } catch (error) {
      console.error('Error loading more songs:', error);
    } finally {
      setIsLoadingMoreSongs(false);
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

  // Busca artistas pelo nome (primeira página)
  const runArtistSearch = async (query: string) => {
    if (!query.trim()) {
      setArtistSearchResults([]);
      setArtistSearchPageToken(undefined);
      return;
    }

    setIsSearchingArtists(true);
    try {
      const results = await searchYouTubeArtists(query);
      const artists: Artist[] = results.items.map((item) => ({
        id: item.id,
        name: item.name,
        country: 'Busca',
        genre: 'Resultado da busca',
        image: item.thumbnail,
      }));
      setArtistSearchResults(artists);
      setArtistSearchPageToken(results.nextPageToken || null);
    } catch (error) {
      console.error('Error searching artists:', error);
      setArtistSearchResults([]);
      setArtistSearchPageToken(null);
    } finally {
      setIsSearchingArtists(false);
    }
  };

  // Busca mais resultados (próxima página) dentro do popup
  const loadMoreArtistSearchResults = async () => {
    if (!artistSearchQuery.trim() || !artistSearchPageToken || isSearchingArtists) return;

    setIsSearchingArtists(true);
    try {
      const results = await searchYouTubeArtists(artistSearchQuery, artistSearchPageToken);
      const newArtists: Artist[] = results.items.map((item) => ({
        id: item.id,
        name: item.name,
        country: 'Busca',
        genre: 'Resultado da busca',
        image: item.thumbnail,
      }));
      setArtistSearchResults(prev => [...prev, ...newArtists]);
      setArtistSearchPageToken(results.nextPageToken || null);
    } catch (error) {
      console.error('Error loading more search results:', error);
    } finally {
      setIsSearchingArtists(false);
    }
  };

  // Selecionar um artista a partir do popup de busca
  const handleSelectSearchedArtist = (artist: Artist) => {
    setIsArtistSearchOpen(false);
    handleArtistSelect(artist);
  };

  // Busca mais artistas dinamicamente no YouTube quando a lista fixa do
  // país acaba, tornando o scroll verdadeiramente infinito.
  const loadMoreArtists = useCallback(async () => {
    if (isLoadingMoreArtists || extraArtistsPageToken === null) return;

    setIsLoadingMoreArtists(true);
    try {
      const query = `artistas de ${selectedCountry}`;
      const results = await searchYouTubeArtists(query, extraArtistsPageToken || undefined);

      const newArtists: Artist[] = results.items
        .filter((item) => !seenExtraArtistIdsRef.current.has(item.id))
        .map((item) => {
          seenExtraArtistIdsRef.current.add(item.id);
          return {
            id: item.id,
            name: item.name,
            country: selectedCountry,
            genre: 'Mais artistas',
            image: item.thumbnail,
          };
        });

      setExtraArtists(prev => [...prev, ...newArtists]);
      setExtraArtistsPageToken(results.nextPageToken || null);
    } catch (error) {
      console.error('Error loading more artists:', error);
      setExtraArtistsPageToken(null);
    } finally {
      setIsLoadingMoreArtists(false);
    }
  }, [selectedCountry, extraArtistsPageToken, isLoadingMoreArtists]);

  // Scroll infinito para artistas
  const handleArtistsScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    if (element.scrollHeight - element.scrollTop <= element.clientHeight + 100) {
      if (displayedArtistsCount < allArtists.length) {
        setDisplayedArtistsCount(prev => Math.min(prev + ARTISTS_PER_PAGE, allArtists.length));
      } else if (!isLoadingMoreArtists && extraArtistsPageToken !== null) {
        // Lista atual esgotada: buscar mais artistas no YouTube
        loadMoreArtists().then(() => {
          setDisplayedArtistsCount(prev => prev + ARTISTS_PER_PAGE);
        });
      }
    }
  }, [displayedArtistsCount, allArtists.length, isLoadingMoreArtists, extraArtistsPageToken, loadMoreArtists]);

  // Scroll infinito para músicas
  useEffect(() => {
    const container = songsListRef.current;
    if (!container) return;

    const handleSongsScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      if (scrollHeight - scrollTop - clientHeight < 200 && !isLoadingMoreSongs && nextPageToken) {
        loadMoreSongs();
      }
    };

    container.addEventListener('scroll', handleSongsScroll);
    return () => container.removeEventListener('scroll', handleSongsScroll);
  }, [nextPageToken, isLoadingMoreSongs]);

  return (
    <div className={cn(
      'fixed left-0 w-full max-h-[80vh] z-10 transition-all duration-300 ease-in-out',
      'bg-white border-t-2 border-gray-300 flex flex-col pb-2',
      isOpen ? 'bottom-0' : '-bottom-full'
    )}>
      <div className="flex justify-center pt-2 pb-2">
        <button
          onClick={onClose}
          className="text-red-600 hover:text-red-700 transition-colors"
        >
          <ChevronDown size={28} />
        </button>
      </div>

      <div className="flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="px-4 pt-2 pb-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-black">🎤 Artistas Mundiais</h2>
            <button
              onClick={() => {
                setIsArtistSearchOpen(true);
                setArtistSearchQuery('');
                setArtistSearchResults([]);
                setArtistSearchPageToken(undefined);
              }}
              className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              <Search size={12} />
              Buscar artista
            </button>
          </div>

          {/* Country Selector */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {countries.map((country) => (
              <button
                key={country}
                onClick={() => {
                  setSelectedCountry(country);
                  setSelectedArtist(null);
                  setArtistSongs([]);
                  setDisplayedArtistsCount(ARTISTS_PER_PAGE);
                  setNextPageToken(null);
                  setExtraArtists([]);
                  setExtraArtistsPageToken(undefined);
                  seenExtraArtistIdsRef.current = new Set();
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
          {/* Artists List com Scroll Infinito */}
          <div
            className="flex-1 overflow-y-auto border-r border-gray-300 pr-4"
            ref={artistsListRef}
            onScroll={handleArtistsScroll}
          >
            <div className="space-y-2">
              {displayedArtists.map((artist) => (
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
              {displayedArtistsCount < allArtists.length && (
                <div className="flex justify-center py-4">
                  <Loader2 className="animate-spin text-red-500" size={20} />
                </div>
              )}
              {displayedArtistsCount >= allArtists.length && isLoadingMoreArtists && (
                <div className="flex items-center justify-center gap-2 py-4">
                  <Loader2 className="animate-spin text-red-500" size={20} />
                  <span className="text-[10px] text-gray-500">Buscando mais artistas...</span>
                </div>
              )}
              {displayedArtistsCount >= allArtists.length && !isLoadingMoreArtists && extraArtistsPageToken === null && (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-xs">Fim da lista</p>
                </div>
              )}
            </div>
          </div>

          {/* Songs List com Scroll Infinito */}
          <div 
            className="flex-1 overflow-y-auto"
            ref={songsListRef}
          >
            {selectedArtist ? (
              <div>
                <h3 className="text-xs font-bold text-black mb-3">
                  {selectedArtist.name} - {artistSongs.length} músicas
                </h3>
                {isLoadingSongs ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-red-500" size={24} />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {artistSongs.map((song, index) => (
                      <div
                        key={song.id}
                        className="p-2 bg-gray-100 rounded hover:bg-gray-200 transition-colors flex items-center gap-2 cursor-pointer"
                        onClick={() => onPlayPlaylist?.(artistSongs, index) || onPlaySong?.(song.id, song.title, song.thumbnail)}
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

                        {/* Download Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (savedIds.has(song.id)) {
                              toast.info('Esta música já está salva offline');
                              return;
                            }
                            if (downloadingIds[song.id]) return;

                            toast.promise(
                              youtubeDownloader.saveForOffline(
                                song.id,
                                song.title,
                                song.thumbnail,
                                (p) => setDownloadingIds(prev => ({ ...prev, [song.id]: p }))
                              ),
                              {
                                loading: 'Preparando download...',
                                success: () => {
                                  setSavedIds(prev => new Set(prev).add(song.id));
                                  setDownloadingIds(prev => {
                                    const next = { ...prev };
                                    delete next[song.id];
                                    return next;
                                  });
                                  return 'Música salva offline!';
                                },
                                error: 'Erro ao salvar música'
                              }
                            );
                          }}
                          className="p-1 rounded transition-all duration-200"
                        >
                          {downloadingIds[song.id] ? (
                            <Loader2 className="animate-spin text-red-600" size={14} />
                          ) : savedIds.has(song.id) ? (
                            <CheckCircle2 className="text-green-600" size={14} />
                          ) : (
                            <Download className="text-red-600" size={14} />
                          )}
                        </button>

                        <Play size={14} className="text-red-600 flex-shrink-0" />
                      </div>
                    ))}

                    {/* Loading More Indicator */}
                    {isLoadingMoreSongs && (
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
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 text-xs">
                Selecione um artista para ver as músicas
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Popup de busca de artistas */}
      {isArtistSearchOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setIsArtistSearchOpen(false)}
        >
          <div
            className="bg-white rounded-lg w-full max-w-md max-h-[70vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-sm font-bold text-black mb-2">Buscar artista</h3>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  autoFocus
                  value={artistSearchQuery}
                  onChange={(e) => setArtistSearchQuery(e.target.value)}
                  placeholder="Digite o nome do artista..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              {isSearchingArtists && artistSearchResults.length === 0 && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="animate-spin text-red-500" size={24} />
                </div>
              )}

              {!isSearchingArtists && artistSearchQuery.trim() && artistSearchResults.length === 0 && (
                <div className="text-center py-8 text-gray-500 text-xs">
                  Nenhum artista encontrado
                </div>
              )}

              {!artistSearchQuery.trim() && (
                <div className="text-center py-8 text-gray-500 text-xs">
                  Digite o nome de um artista para buscar
                </div>
              )}

              <div className="space-y-2">
                {artistSearchResults.map((artist) => (
                  <div
                    key={artist.id}
                    onClick={() => handleSelectSearchedArtist(artist)}
                    className="p-3 rounded cursor-pointer transition-colors flex items-center gap-3 bg-gray-100 hover:bg-gray-200"
                  >
                    {artist.image && (
                      <img
                        src={artist.image}
                        alt={artist.name}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-black truncate">{artist.name}</p>
                      <p className="text-[10px] text-gray-600">Canal do YouTube</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveArtist(artist);
                      }}
                      className={cn(
                        'p-1 rounded transition-colors flex-shrink-0',
                        savedArtists.has(artist.id)
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-300 text-black hover:bg-gray-400'
                      )}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                ))}

                {artistSearchResults.length > 0 && artistSearchPageToken && (
                  <div className="flex justify-center py-2">
                    {isSearchingArtists ? (
                      <Loader2 className="animate-spin text-red-500" size={18} />
                    ) : (
                      <button
                        onClick={loadMoreArtistSearchResults}
                        className="text-xs text-red-600 font-semibold hover:underline"
                      >
                        Carregar mais
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 border-t border-gray-200">
              <button
                onClick={() => setIsArtistSearchOpen(false)}
                className="w-full py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
