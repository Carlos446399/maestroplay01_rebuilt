import { useState, useCallback, useRef, useEffect } from 'react';
import { ChevronDown, Play, Loader2, ArrowLeft, Music2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { searchYouTube, YouTubeResult } from '@/services/youtubeService';

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
  { id: 'matue', name: 'Matuê', genre: 'Trap', emoji: '🔊', gradient: 'from-gray-700 to-purple-800' },
  { id: 'kevinho', name: 'MC Kevinho', genre: 'Funk', emoji: '🎶', gradient: 'from-red-600 to-pink-600' },
  { id: 'pabllo', name: 'Pabllo Vittar', genre: 'Pop/Drag', emoji: '💜', gradient: 'from-violet-600 to-purple-600' },
  { id: 'jorge-mateus', name: 'Jorge e Mateus', genre: 'Sertanejo', emoji: '🎸', gradient: 'from-lime-600 to-green-700' },
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

interface DiscoverPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayPlaylist: (songs: Array<{id: string; title: string; thumbnail: string}>, startIndex: number) => void;
}

// Card de artista salvo com imagem do YouTube
const SavedArtistCard = ({
  artist,
  loadingArtist,
  onOpen,
}: {
  artist: {id: string; name: string; genre: string; image?: string};
  loadingArtist: string | null;
  onOpen: (a: {id: string; name: string; genre: string; image?: string}) => void;
}) => {
  const [thumb, setThumb] = useState<string | undefined>(artist.image);
  const isLoading = loadingArtist === artist.id;

  // Buscar thumbnail do canal se não tiver imagem (via proxy com cache
  // compartilhado — evita gastar cota da API sozinho a cada card exibido)
  useEffect(() => {
    if (thumb) return;
    const qs = new URLSearchParams({ query: artist.name, type: 'channel' });
    fetch(`/api/youtube-search?${qs.toString()}`)
      .then(r => r.json())
      .then(d => {
        const img = d.items?.[0]?.snippet?.thumbnails?.medium?.url;
        if (img) setThumb(img);
      })
      .catch(() => {});
  }, [artist.name, thumb]);

  return (
    <button
      onClick={() => onOpen(artist)}
      disabled={isLoading}
      className="relative rounded-2xl overflow-hidden text-left bg-gray-900"
      style={{ height: '120px' }}
    >
      {/* Imagem de fundo */}
      {thumb ? (
        <img src={thumb} alt={artist.name} className="absolute inset-0 w-full h-full object-cover opacity-70" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600" />
      )}
      {/* Overlay escuro */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      <div className="absolute inset-0 p-3 flex flex-col justify-end">
        <p className="text-white font-black text-sm leading-tight truncate">{artist.name}</p>
        <p className="text-white/70 text-[10px] mt-0.5">{artist.genre}</p>
        <div className="flex items-center gap-1.5 mt-1.5">
          {isLoading ? (
            <Loader2 size={12} className="text-white animate-spin" />
          ) : (
            <Music2 size={12} className="text-white/80" />
          )}
          <span className="text-white/70 text-[9px]">
            {isLoading ? 'Carregando...' : 'Ver músicas'}
          </span>
        </div>
      </div>
    </button>
  );
};

interface ArtistSongsView {
  artist: ArtistCard;
  songs: YouTubeResult[];
  nextPageToken?: string;
  isLoadingMore: boolean;
}

export const DiscoverPanel = ({ isOpen, onClose, onPlayPlaylist }: DiscoverPanelProps) => {
  const [loadingArtist, setLoadingArtist] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'salvos' | 'brasil' | 'internacional'>('salvos');
  const [artistView, setArtistView] = useState<ArtistSongsView | null>(null);
  const songsListRef = useRef<HTMLDivElement>(null);

  // Artistas salvos do localStorage (do ArtistsPanel)
  const [savedArtists, setSavedArtists] = useState<Array<{id: string; name: string; genre: string; image?: string; country?: string}>>([]);

  useEffect(() => {
    if (!isOpen) return;
    try {
      const raw = localStorage.getItem('savedArtists');
      if (raw) {
        const ids: string[] = JSON.parse(raw);
        // Buscar dados completos de cada artista salvo
        // Os artistas salvos podem vir do ArtistsPanel (com image) ou do DiscoverPanel
        const allArtistsMap: Record<string, {id: string; name: string; genre: string; image?: string; country?: string}> = {};
        [...BRAZILIAN_ARTISTS, ...INTERNATIONAL_ARTISTS].forEach(a => {
          allArtistsMap[a.id] = { id: a.id, name: a.name, genre: a.genre };
        });
        // Tentar recuperar artistas salvos com dados extras do localStorage
        const savedData = ids.map(id => allArtistsMap[id] || { id, name: id, genre: '' });
        setSavedArtists(savedData);
      } else {
        setSavedArtists([]);
      }
    } catch { setSavedArtists([]); }
  }, [isOpen]);

  const [loadError, setLoadError] = useState<string | null>(null);

  // Abrir artista — carrega primeira página de músicas
  const handleArtistOpen = useCallback(async (artist: ArtistCard) => {
    if (loadingArtist) return;
    setLoadingArtist(artist.id);
    setLoadError(null);
    try {
      const results = await searchYouTube(`${artist.name} músicas`);
      setArtistView({
        artist,
        songs: results.items,
        nextPageToken: results.nextPageToken || undefined,
        isLoadingMore: false,
      });
    } catch (err: any) {
      console.error('Erro ao carregar músicas:', err);
      setLoadError(err?.message || 'Erro ao carregar músicas deste artista.');
    } finally {
      setLoadingArtist(null);
    }
  }, [loadingArtist]);

  // Carregar mais músicas do artista
  const loadMoreSongs = useCallback(async () => {
    if (!artistView || artistView.isLoadingMore || !artistView.nextPageToken) return;
    setArtistView(prev => prev ? { ...prev, isLoadingMore: true } : null);
    try {
      const results = await searchYouTube(
        `${artistView.artist.name} músicas`,
        artistView.nextPageToken
      );
      setArtistView(prev => prev ? {
        ...prev,
        songs: [...prev.songs, ...results.items],
        nextPageToken: results.nextPageToken || undefined,
        isLoadingMore: false,
      } : null);
    } catch (err) {
      console.error('Erro ao carregar mais músicas:', err);
      setArtistView(prev => prev ? { ...prev, isLoadingMore: false } : null);
    }
  }, [artistView]);

  // Scroll infinito na lista de músicas
  const handleSongsScroll = useCallback(() => {
    const el = songsListRef.current;
    if (!el || !artistView) return;
    if (el.scrollHeight - el.scrollTop <= el.clientHeight + 120) {
      loadMoreSongs();
    }
  }, [artistView, loadMoreSongs]);

  // Scroll infinito nos cards de artistas
  const artistsListRef = useRef<HTMLDivElement>(null);
  const [visibleArtists, setVisibleArtists] = useState(8);
  const allArtists = activeTab === 'brasil' ? BRAZILIAN_ARTISTS : activeTab === 'internacional' ? INTERNATIONAL_ARTISTS : [];
  const displayedArtists = allArtists.slice(0, visibleArtists);

  const handleArtistsScroll = useCallback(() => {
    const el = artistsListRef.current;
    if (!el) return;
    if (el.scrollHeight - el.scrollTop <= el.clientHeight + 100) {
      setVisibleArtists(prev => Math.min(prev + 8, allArtists.length));
    }
  }, [allArtists.length]);

  // Reset ao trocar aba
  useEffect(() => {
    setVisibleArtists(8);
    setArtistView(null);
  }, [activeTab]);

  const handleGenrePlay = useCallback(async (query: string, label: string) => {
    if (loadingArtist) return;
    setLoadingArtist(label);
    setLoadError(null);
    try {
      const results = await searchYouTube(query);
      if (results.items.length > 0) {
        onPlayPlaylist(results.items.map(i => ({ id: i.id, title: i.title, thumbnail: i.thumbnail })), 0);
        onClose();
      }
    } catch (err: any) {
      console.error('Erro ao carregar gênero:', err);
      setLoadError(err?.message || 'Erro ao carregar músicas deste gênero.');
    } finally {
      setLoadingArtist(null);
    }
  }, [loadingArtist, onPlayPlaylist, onClose]);

  return (
    <div className={cn(
      'fixed left-0 w-full max-h-[85vh] z-30 flex flex-col bg-white border-t-2 border-gray-200 transition-all duration-300 ease-in-out',
      isOpen ? 'bottom-0' : '-bottom-full'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-2">
          {artistView && (
            <button
              onClick={() => setArtistView(null)}
              className="text-gray-500 hover:text-gray-700 mr-1"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div>
            <h2 className="text-sm font-black text-gray-900">
              {artistView ? artistView.artist.name : 'Descobrir'}
            </h2>
            <p className="text-[10px] text-gray-400">
              {artistView
                ? `${artistView.songs.length} músicas encontradas`
                : 'Toque num artista para explorar'
              }
            </p>
          </div>
        </div>
        <button onClick={onClose} className="text-red-500 p-1">
          <ChevronDown size={26} />
        </button>
      </div>

      {loadError && (
        <div className="mx-4 mt-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg flex-shrink-0">
          <p className="text-[11px] text-red-600">{loadError}</p>
        </div>
      )}

      {/* Visão de músicas do artista */}
      {artistView ? (
        <div
          ref={songsListRef}
          className="flex-1 overflow-y-auto"
          onScroll={handleSongsScroll}
        >
          {/* Mini header do artista */}
          <div className={cn(
            'flex items-center gap-3 px-4 py-3 bg-gradient-to-r text-white sticky top-0 z-10',
            artistView.artist.gradient
          )}>
            <span className="text-3xl">{artistView.artist.emoji}</span>
            <div>
              <p className="font-black text-sm">{artistView.artist.name}</p>
              <p className="text-white/70 text-[10px]">{artistView.artist.genre}</p>
            </div>
            <button
              onClick={() => {
                onPlayPlaylist(artistView.songs.map(s => ({
                  id: s.id, title: s.title, thumbnail: s.thumbnail
                })), 0);
                onClose();
              }}
              className="ml-auto flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full"
            >
              <Play size={12} className="text-white" />
              <span className="text-white text-xs font-bold">Tocar tudo</span>
            </button>
          </div>

          {/* Lista de músicas */}
          {artistView.songs.map((song, index) => (
            <div
              key={`${song.id}-${index}`}
              onClick={() => {
                onPlayPlaylist(artistView.songs.map(s => ({
                  id: s.id, title: s.title, thumbnail: s.thumbnail
                })), index);
                onClose();
              }}
              className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-100 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              <div className="relative flex-shrink-0">
                <img
                  src={song.thumbnail}
                  alt={song.title}
                  className="w-11 h-11 rounded-lg object-cover"
                />
                <div className="absolute inset-0 rounded-lg bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Play size={16} className="text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 truncate">{song.title}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{artistView.artist.name}</p>
              </div>
              <span className="text-[10px] text-gray-300 flex-shrink-0">#{index + 1}</span>
            </div>
          ))}

          {/* Loader de mais músicas */}
          {artistView.isLoadingMore && (
            <div className="flex justify-center py-4">
              <Loader2 size={20} className="animate-spin text-purple-500" />
            </div>
          )}
          {!artistView.nextPageToken && artistView.songs.length > 0 && (
            <div className="text-center py-4 text-[10px] text-gray-400">
              {artistView.songs.length} músicas carregadas
            </div>
          )}
        </div>
      ) : (
        /* Visão de lista de artistas */
        <div
          ref={artistsListRef}
          className="flex-1 overflow-y-auto"
          onScroll={handleArtistsScroll}
        >
          {/* Tabs */}
          <div className="flex px-3 pt-3 pb-2 gap-2 flex-shrink-0">
            <button
              onClick={() => setActiveTab('salvos')}
              className={cn(
                'flex-1 py-2.5 rounded-2xl text-xs font-black transition-all',
                activeTab === 'salvos'
                  ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-500'
              )}
            >
              ⭐ Salvos
            </button>
            <button
              onClick={() => setActiveTab('brasil')}
              className={cn(
                'flex-1 py-2.5 rounded-2xl text-xs font-black transition-all',
                activeTab === 'brasil'
                  ? 'bg-gradient-to-r from-green-500 to-yellow-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-500'
              )}
            >
              🇧🇷 Brasil
            </button>
            <button
              onClick={() => setActiveTab('internacional')}
              className={cn(
                'flex-1 py-2.5 rounded-2xl text-xs font-black transition-all',
                activeTab === 'internacional'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-500'
              )}
            >
              🌍 Mundial
            </button>
          </div>

          {/* Aba Salvos — artistas salvos do ArtistsPanel com card e imagem */}
          {activeTab === 'salvos' && (
            <div className="flex-1 overflow-y-auto px-3 pb-4">
              {savedArtists.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <span className="text-4xl">⭐</span>
                  <p className="text-xs text-gray-500 text-center">
                    Nenhum artista salvo ainda.{'\n'}
                    Vá em Artistas Mundiais e toque + para salvar.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  {savedArtists.map((artist) => (
                    <SavedArtistCard
                      key={artist.id}
                      artist={artist}
                      loadingArtist={loadingArtist}
                      onOpen={(a) => handleArtistOpen({
                        id: a.id,
                        name: a.name,
                        genre: a.genre || '',
                        emoji: '🎵',
                        gradient: 'from-purple-600 to-pink-600',
                      })}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Grid de artistas Brasil/Internacional */}
          {activeTab !== 'salvos' && (<>
          <div className="grid grid-cols-2 gap-3 px-3 pb-2">
            {displayedArtists.map((artist) => (
              <button
                key={artist.id}
                onClick={() => handleArtistOpen(artist)}
                disabled={loadingArtist === artist.id}
                className="relative rounded-2xl overflow-hidden text-left"
                style={{ height: '120px' }}
              >
                <div className={cn('absolute inset-0 bg-gradient-to-br', artist.gradient)} />
                <div className="absolute right-2 bottom-2 text-4xl opacity-25 select-none"
                  style={{ transform: 'rotate(-15deg)' }}>
                  {artist.emoji}
                </div>
                <div className="absolute inset-0 p-3 flex flex-col justify-between">
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <p className="text-white font-black text-sm leading-tight w-full text-center">
                      {artist.name}
                    </p>
                    <p className="text-white/70 text-[10px] font-medium mt-1 text-center">
                      {artist.genre}
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-1.5 mt-2">
                    {loadingArtist === artist.id ? (
                      <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                        <Loader2 size={14} className="text-white animate-spin" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center">
                        <Music2 size={12} className="text-white" />
                      </div>
                    )}
                    <span className="text-white/80 text-[9px] font-medium">
                      {loadingArtist === artist.id ? 'Carregando...' : 'Ver músicas'}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Indicador de mais artistas */}
          {visibleArtists < allArtists.length && (
            <div className="flex justify-center py-3">
              <Loader2 size={18} className="animate-spin text-purple-400" />
            </div>
          )}

          {/* Playlists por gênero */}
          <div className="px-3 pb-4 mt-2">
            <p className="text-xs font-black text-gray-700 mb-3">🔥 Playlists por gênero</p>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {GENRE_PLAYLISTS.map((playlist) => (
                <button
                  key={playlist.label}
                  onClick={() => handleGenrePlay(playlist.query, playlist.label)}
                  disabled={!!loadingArtist}
                  className={cn(
                    'flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-xl text-white font-bold transition-all',
                    `bg-gradient-to-r ${playlist.color}`
                  )}
                >
                  {loadingArtist === playlist.label
                    ? <Loader2 size={14} className="animate-spin" />
                    : <span className="text-base">{playlist.emoji}</span>
                  }
                  <span className="text-xs whitespace-nowrap">{playlist.label}</span>
                </button>
              ))}
            </div>
          </div>
          </>)}
        </div>
      )}
    </div>
  );
};
