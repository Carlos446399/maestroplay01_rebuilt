import { useState, useRef, useEffect } from 'react';
import { Hourglass, Star } from 'lucide-react';
import { useMusicPlayer } from '@/hooks/useMusicPlayer';
import { useMediaSession } from '@/hooks/useMediaSession';
import { useBackgroundPlayback } from '@/hooks/useBackgroundPlayback';
import { MobileHeader } from './MobileHeader';
import { AlbumArt } from './AlbumArt';
import { ProgressBar } from './ProgressBar';
import { MobileControls } from './MobileControls';
import { MobileBottomIcons } from './MobileBottomIcons';
import { HorizontalPlaylist } from './HorizontalPlaylist';
import { PlaylistPanel } from './PlaylistPanel';
import { LocalPlaylistPanel } from './LocalPlaylistPanel';
import { RadioPanel } from './RadioPanel';
import { AudioVisualizer } from './AudioVisualizer';
import { CategoryPanel } from './CategoryPanel';
import { CategoryPlaylistPanel } from './CategoryPlaylistPanel';
import { CategoryCarousel } from './CategoryCarousel';
import { EqualizerPanel } from './EqualizerPanel';
import { SavedArtistsCarousel } from './SavedArtistsCarousel';
import { ArtistsPanel } from './ArtistsPanel';
import { SavedSongsPanel } from './SavedSongsPanel';
import { DrivePanel } from './DrivePanel';
import { favoritesStorage, FavoriteSong } from '@/services/favoritesStorage';
import { getDrivePreviewUrl } from '@/services/googleDriveService';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const defaultCover = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Crect fill="%23333" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="24" fill="%23999"%3E🎵%3C/text%3E%3C/svg%3E';

export const MobileMusicPlayer = () => {
  const {
    tracks,
    radios,
    currentTrackIndex,
    currentRadioIndex,
    currentSource,
    isPlaying,
    repeat,
    currentTime,
    duration,
    importProgress,
    radioError,
    clearRadioError,
    audioRef,
    addTracks,
    playTrack,
    playRadio,
    togglePlay,
    nextTrack,
    previousTrack,
    toggleRepeat,
    seek,
    play,
    pause,
  } = useMusicPlayer();

  // Obter a música/rádio atual
  const currentTrack = currentSource === 'tracks' 
    ? tracks[currentTrackIndex] 
    : radios[currentRadioIndex];

  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
  const [isLocalPlaylistOpen, setIsLocalPlaylistOpen] = useState(false);
  const [isRadioOpen, setIsRadioOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isCategoryPlaylistOpen, setIsCategoryPlaylistOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [isShuffle, setIsShuffle] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isFavoritesListOpen, setIsFavoritesListOpen] = useState(false);
  const [savedSongs, setSavedSongs] = useState<FavoriteSong[]>([]);
  const [isSavedSongsOpen, setIsSavedSongsOpen] = useState(false);
  const [isDriveOpen, setIsDriveOpen] = useState(false);
  const [isDriveMode, setIsDriveMode] = useState(false);
  const [driveFileId, setDriveFileId] = useState('');
  const [driveTitle, setDriveTitle] = useState('');
  const [driveCover, setDriveCover] = useState('');
  const [isArtistsPanelOpen, setIsArtistsPanelOpen] = useState(false);
  const [isPlayerLocked, setIsPlayerLocked] = useState(false);
  const [lockUnlockTimer, setLockUnlockTimer] = useState<NodeJS.Timeout | null>(null);
  
  // YouTube state
  const [ytPlayer, setYtPlayer] = useState<any>(null);
  const [ytPlaying, setYtPlaying] = useState(false);
  const [ytTitle, setYtTitle] = useState('');
  const [ytThumbnail, setYtThumbnail] = useState('');
  const [ytCurrentTime, setYtCurrentTime] = useState(0);
  const [ytDuration, setYtDuration] = useState(0);
  const [isYouTubeMode, setIsYouTubeMode] = useState(false);
  const [ytPlaylist, setYtPlaylist] = useState<Array<{id: string; title: string; thumbnail: string}>>([]);
  const [ytCurrentIndex, setYtCurrentIndex] = useState(-1);
  const ytContainerRef = useRef<HTMLDivElement>(null);
  const ytIntervalRef = useRef<any>(null);
  // Refs para manter valores atualizados dentro do callback onStateChange
  // do YT.Player, que é criado apenas uma vez e teria closures "presas"
  // (stale) nos valores de estado do momento da criação.
  const ytPlaylistRef = useRef(ytPlaylist);
  const ytCurrentIndexRef = useRef(ytCurrentIndex);
  const repeatRef = useRef(repeat);

  useEffect(() => { ytPlaylistRef.current = ytPlaylist; }, [ytPlaylist]);
  useEffect(() => { ytCurrentIndexRef.current = ytCurrentIndex; }, [ytCurrentIndex]);
  useEffect(() => { repeatRef.current = repeat; }, [repeat]);

  // Carregar músicas salvas (favoritos) do localStorage
  useEffect(() => {
    const stored = favoritesStorage.getAll();
    setSavedSongs(stored);
    setFavorites(new Set(stored.map((f) => f.id)));
  }, []);

  // Load YouTube IFrame API
  useEffect(() => {
    if (window.YT) return;
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
  }, []);

  // YouTube time tracking
  useEffect(() => {
    if (ytPlaying && ytPlayer) {
      ytIntervalRef.current = setInterval(() => {
        if (ytPlayer.getCurrentTime) {
          setYtCurrentTime(ytPlayer.getCurrentTime());
          setYtDuration(ytPlayer.getDuration() || 0);
        }
      }, 500);
    }
    return () => {
      if (ytIntervalRef.current) clearInterval(ytIntervalRef.current);
    };
  }, [ytPlaying, ytPlayer]);

  const handleYouTubePlay = (videoId: string, title: string, thumbnail: string) => {
    // Pause local audio
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    const newVideo = { id: videoId, title, thumbnail };
    setYtPlaylist([newVideo]);
    setYtCurrentIndex(0);
    
    setIsYouTubeMode(true);
    setYtTitle(title);
    setYtThumbnail(thumbnail);
    setYtPlaying(true);

    if (ytPlayer) {
      ytPlayer.loadVideoById(videoId);
    } else {
      // Create new player
      const checkYT = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(checkYT);
          const player = new window.YT.Player('yt-player', {
            height: '1',
            width: '1',
            videoId: videoId,
            playerVars: {
              autoplay: 1,
              controls: 0,
              disablekb: 1,
              fs: 0,
              modestbranding: 1,
            },
            events: {
              onStateChange: (event: any) => {
                if (event.data === window.YT.PlayerState.PLAYING) {
                  setYtPlaying(true);
                } else if (event.data === window.YT.PlayerState.PAUSED) {
                  setYtPlaying(false);
                } else if (event.data === window.YT.PlayerState.ENDED) {
                  const playlist = ytPlaylistRef.current;
                  const currentIndex = ytCurrentIndexRef.current;
                  const currentRepeat = repeatRef.current;

                  if (currentRepeat === 'one') {
                    // Repetir a mesma música
                    player.seekTo(0, true);
                    player.playVideo();
                    return;
                  }

                  if (playlist.length > 1) {
                    const isLast = currentIndex >= playlist.length - 1;

                    if (isLast && currentRepeat === 'off') {
                      // Fim da playlist, sem repetição
                      setYtPlaying(false);
                      return;
                    }

                    const nextIndex = (currentIndex + 1) % playlist.length;
                    const nextVideo = playlist[nextIndex];
                    setYtCurrentIndex(nextIndex);
                    setYtTitle(nextVideo.title);
                    setYtThumbnail(nextVideo.thumbnail);
                    player.loadVideoById(nextVideo.id);
                    setYtPlaying(true);
                  } else if (currentRepeat === 'all') {
                    // Playlist de uma música com repetir tudo: repete
                    player.seekTo(0, true);
                    player.playVideo();
                  } else {
                    // Sem playlist e sem repetição: parar
                    setYtPlaying(false);
                    setIsYouTubeMode(false);
                  }
                }
              },
            },
          });
          setYtPlayer(player);
        }
      }, 100);
    }
  };

  const handleTogglePlay = () => {
    if (isYouTubeMode && ytPlayer) {
      if (ytPlaying) {
        ytPlayer.pauseVideo();
      } else {
        ytPlayer.playVideo();
      }
    } else {
      togglePlay();
    }
  };

  const handleSeek = (time: number) => {
    if (isYouTubeMode && ytPlayer) {
      ytPlayer.seekTo(time, true);
      setYtCurrentTime(time);
    } else {
      seek(time);
    }
  };

  const handlePlayTrack = (index: number) => {
    const track = tracks[index];
    if (track && track.id.startsWith('yt-')) {
      // Se for uma música salva do YouTube, usamos o player do YouTube
      const videoId = track.id.replace('yt-', '');
      handleYouTubePlay(videoId, track.name, track.cover || '');
      return;
    }

    // Stop YouTube if playing
    if (isYouTubeMode && ytPlayer) {
      ytPlayer.stopVideo();
      setIsYouTubeMode(false);
      setYtPlaying(false);
    }
    playTrack(index);
  };

  const handlePlayRadio = (index: number) => {
    // Stop YouTube if playing
    if (isYouTubeMode && ytPlayer) {
      ytPlayer.stopVideo();
      setIsYouTubeMode(false);
      setYtPlaying(false);
    }
    playRadio(index);
  };

  const handleYouTubePlayWrapper = (videoId: string, title: string, thumbnail: string) => {
    // Stop radio/track audio if playing
    if (audioRef.current) {
      audioRef.current.pause();
    }
    handleYouTubePlay(videoId, title, thumbnail);
  };

  const handlePlayPlaylist = (songs: Array<{id: string; title: string; thumbnail: string}>, startIndex: number) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setYtPlaylist(songs);
    setYtCurrentIndex(startIndex);
    const startVideo = songs[startIndex];
    setIsYouTubeMode(true);
    setYtTitle(startVideo.title);
    setYtThumbnail(startVideo.thumbnail);
    setYtPlaying(true);
    if (ytPlayer) {
      ytPlayer.loadVideoById(startVideo.id);
    }
  };

  const handleNextTrack = () => {
    if (isYouTubeMode && ytPlayer) {
      if (ytPlaylist.length > 1) {
        const nextIndex = (ytCurrentIndex + 1) % ytPlaylist.length;
        const nextVideo = ytPlaylist[nextIndex];
        setYtCurrentIndex(nextIndex);
        setYtTitle(nextVideo.title);
        setYtThumbnail(nextVideo.thumbnail);
        ytPlayer.loadVideoById(nextVideo.id);
        setYtPlaying(true);
      } else if (ytPlayer.seekTo) {
        // Sem playlist: reinicia a música atual
        ytPlayer.seekTo(0, true);
        ytPlayer.playVideo();
        setYtPlaying(true);
      }
      return;
    }
    nextTrack();
  };

  const handlePreviousTrack = () => {
    if (isYouTubeMode && ytPlayer) {
      if (ytPlaylist.length > 1 && ytCurrentIndex > 0) {
        const prevIndex = ytCurrentIndex - 1;
        const prevVideo = ytPlaylist[prevIndex];
        setYtCurrentIndex(prevIndex);
        setYtTitle(prevVideo.title);
        setYtThumbnail(prevVideo.thumbnail);
        ytPlayer.loadVideoById(prevVideo.id);
        setYtPlaying(true);
      } else if (ytPlayer.seekTo) {
        // Início da playlist ou música única: reinicia a música atual
        ytPlayer.seekTo(0, true);
        ytPlayer.playVideo();
        setYtPlaying(true);
      }
      return;
    }
    previousTrack();
  };

  const currentRadio = currentRadioIndex >= 0 ? radios[currentRadioIndex] : undefined;
  
  // Determine what's currently showing
  const displayName = isDriveMode ? driveTitle : isYouTubeMode ? ytTitle : (currentSource === 'tracks' ? currentTrack?.name : currentRadio?.name) || 'Nenhuma música';
  const displayCover = isDriveMode ? (driveCover || defaultCover) : isYouTubeMode ? ytThumbnail : (currentSource === 'tracks' ? currentTrack?.cover : currentRadio?.cover) || defaultCover;
  const displayPlaying = isDriveMode ? true : isYouTubeMode ? ytPlaying : isPlaying;
  const displayTime = isYouTubeMode ? ytCurrentTime : currentTime;
  const displayDuration = isYouTubeMode ? ytDuration : duration;
  const currentMedia = currentSource === 'tracks' ? currentTrack : currentRadio;

  // Ativar reprodução em segundo plano e manter tela ligada (considera YouTube também)
  useBackgroundPlayback(displayPlaying);

  // Música/rádio "efetiva" para a sessão de mídia (inclui YouTube)
  const mediaSessionTrack = isYouTubeMode
    ? { id: `yt-${ytPlaylist[ytCurrentIndex]?.id || ''}`, name: ytTitle, cover: ytThumbnail, type: 'local' as const, url: '' }
    : currentMedia;

  // Integrar Media Session API para controles na barra de notificações /
  // tela de bloqueio (funciona como "mini player flutuante" do sistema,
  // permitindo play/pause/próxima/anterior mesmo com o app em segundo plano).
  useMediaSession(
    {
      tracks,
      radios,
      currentTrackIndex,
      currentRadioIndex,
      currentSource,
      isPlaying: displayPlaying,
      repeat,
      currentTime: displayTime,
      duration: displayDuration,
      volume: 1,
    },
    audioRef,
    handleTogglePlay,
    handleTogglePlay,
    handleNextTrack,
    handlePreviousTrack,
    handleSeek,
    mediaSessionTrack
  );

  // Toca um arquivo de áudio do Google Drive via proxy Netlify Function.
  // Usa a URL do proxy diretamente no <audio> para streaming progressivo
  // (não precisa baixar o arquivo inteiro antes de tocar).
  const handleDrivePlay = async (fileId: string, title: string, cover?: string) => {
    if (isYouTubeMode) {
      try { ytPlayer?.pauseVideo(); } catch {}
      setIsYouTubeMode(false);
      setYtPlaying(false);
    }
    setIsDriveMode(true);
    setDriveFileId(fileId);
    setDriveTitle(title);
    setDriveCover(cover || '');

    if (audioRef.current) {
      // Revoga blob anterior se existir
      if (audioRef.current.src?.startsWith('blob:')) {
        URL.revokeObjectURL(audioRef.current.src);
      }
      // URL direta de download público do Drive (sem proxy)
      const proxyUrl = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`;
      audioRef.current.src = proxyUrl;
      audioRef.current.play().catch(err => {
        if (err.name !== 'AbortError' && err.name !== 'NotAllowedError') {
          console.error('Drive play error:', err);
          setDriveTitle(`❌ Erro: ${title}`);
        }
      });
    }
  };

  const handleAddMusic = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'audio/*';
    input.multiple = true;
    input.onchange = (e: Event) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) addTracks(files);
    };
    input.click();
  };

  const handleFavorite = () => {
    let favoriteSong: Omit<FavoriteSong, 'addedAt'> | null = null;

    if (isYouTubeMode) {
      const current = ytPlaylist[ytCurrentIndex];
      const videoId = current?.id || (ytPlaylist.length === 1 ? ytPlaylist[0]?.id : undefined);
      if (videoId) {
        favoriteSong = {
          id: `yt-${videoId}`,
          name: current?.title || ytTitle,
          cover: current?.thumbnail || ytThumbnail,
          type: 'youtube',
          youtubeId: videoId,
        };
      }
    } else if (currentMedia) {
      favoriteSong = {
        id: currentMedia.id,
        name: currentMedia.name,
        cover: currentMedia.cover,
        type: currentSource === 'radios' ? 'radio' : 'local',
      };
    }

    if (!favoriteSong) return;

    const updated = favoritesStorage.toggle(favoriteSong);
    setSavedSongs(updated);
    setFavorites(new Set(updated.map((f) => f.id)));
  };

  const handleToggleLock = () => {
    if (isPlayerLocked) {
      // Se já está bloqueado, desbloqueia imediatamente
      setIsPlayerLocked(false);
      if (lockUnlockTimer) clearTimeout(lockUnlockTimer);
    } else {
      // Se não está bloqueado, bloqueia
      setIsPlayerLocked(true);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-main text-white flex flex-col items-center overflow-hidden pb-4">
      <MobileHeader />

      {importProgress && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 animate-fade-in">
          <Hourglass className="text-golden animate-spin" size={40} />
          <p className="text-foreground font-semibold text-lg">
            Importando... {Math.round((importProgress.current / importProgress.total) * 100)}%
          </p>
          <p className="text-muted-foreground text-sm">
            {importProgress.current} de {importProgress.total} músicas
          </p>
        </div>
      )}

      <div className="text-center px-4 mt-1">
        <div className="text-sm font-bold truncate max-w-[280px] mx-auto">
          {displayName}
        </div>
        <div className="text-[10px] text-muted-foreground mt-0.5">
          {isYouTubeMode ? '🎵 YouTube' : currentSource === 'radios' ? 'Rádio Online' : 'Artista'}
        </div>
      </div>

      <div className="relative w-[35vw] h-[35vw] max-w-[130px] max-h-[130px] mx-auto my-1">
        <AlbumArt
          src={displayCover}
          alt={displayName}
          isPlaying={displayPlaying}
        />
        <AudioVisualizer
          audioRef={audioRef}
          isPlaying={isPlaying && !isYouTubeMode}
          isRadio={currentSource === 'radios'}
        />
      </div>

      <ProgressBar
        currentTime={displayTime}
        duration={displayDuration}
        onSeek={handleSeek}
        isRadio={currentSource === 'radios'}
        isYouTube={isYouTubeMode}
      />

      <MobileControls
        isPlaying={displayPlaying}
        onTogglePlay={isPlayerLocked ? undefined : handleTogglePlay}
        onPreviousTrack={isPlayerLocked ? undefined : handlePreviousTrack}
        onNextTrack={isPlayerLocked ? undefined : handleNextTrack}
        repeatMode={repeat as 'off' | 'all' | 'one'}
        onToggleRepeat={isPlayerLocked ? undefined : toggleRepeat}
        isShuffle={isShuffle}
        onToggleShuffle={isPlayerLocked ? undefined : () => setIsShuffle(!isShuffle)}
        isLocked={isPlayerLocked}
      />

      <MobileBottomIcons
        onSearch={() => setIsLocalPlaylistOpen(true)}
        onFavorite={handleFavorite}
        onFavoritesList={() => setIsFavoritesListOpen(true)}
        onAddMusic={handleAddMusic}
        onRadio={() => setIsRadioOpen(true)}
        onPlaylist={() => setIsPlaylistOpen(true)}
        onArtists={() => setIsArtistsPanelOpen(true)}
        onDrive={() => setIsDriveOpen(true)}
        isFavorite={
          isYouTubeMode
            ? (() => {
                const current = ytPlaylist[ytCurrentIndex] || ytPlaylist[0];
                return current ? favorites.has(`yt-${current.id}`) : false;
              })()
            : currentMedia
              ? favorites.has(currentMedia.id)
              : false
        }
        isLocked={isPlayerLocked}
        onToggleLock={handleToggleLock}
      />

      {/* Área de Carrosséis com scroll vertical se necessário, mas contida */}
      <div className="w-full flex-1 overflow-y-auto custom-scrollbar px-2 space-y-2">
        <SavedArtistsCarousel onPlayPlaylist={handlePlayPlaylist} />

        <CategoryCarousel
          onCategorySelect={(category) => {
            setSelectedCategory(category);
            setIsCategoryPlaylistOpen(true);
          }}
        />
      </div>

      <LocalPlaylistPanel
        isOpen={isLocalPlaylistOpen}
        tracks={tracks}
        onClose={() => setIsLocalPlaylistOpen(false)}
        onTrackSelect={handlePlayTrack}
      />

      <PlaylistPanel
        isOpen={isPlaylistOpen}
        tracks={tracks}
        onClose={() => setIsPlaylistOpen(false)}
        onTrackSelect={handlePlayTrack}
        onYouTubePlay={handleYouTubePlayWrapper}
      />

      <RadioPanel
        isOpen={isRadioOpen}
        radios={radios}
        onClose={() => setIsRadioOpen(false)}
        onRadioSelect={handlePlayRadio}
      />

      <CategoryPanel
        isOpen={isCategoryOpen}
        onClose={() => setIsCategoryOpen(false)}
        onCategorySelect={(category) => {
          setSelectedCategory(category);
          setIsCategoryPlaylistOpen(true);
          setIsCategoryOpen(false);
        }}
      />

      <CategoryPlaylistPanel
        isOpen={isCategoryPlaylistOpen}
        category={selectedCategory}
        onClose={() => setIsCategoryPlaylistOpen(false)}
        onTrackSelect={(trackId, trackTitle, trackThumbnail) => {
          // Usar handleYouTubePlay para reproduzir corretamente
          handleYouTubePlay(trackId, trackTitle, trackThumbnail);
        }}
      />

      {/* Hidden YouTube player */}
      <div ref={ytContainerRef} className="absolute -top-[9999px] -left-[9999px]">
        <div id="yt-player" />
      </div>

      <audio 
        ref={audioRef} 
        preload="metadata"
        crossOrigin="anonymous"
        className="hidden"
      />

      {/* Toast de erro de rádio */}
      {radioError && (
        <div className="fixed bottom-24 left-4 right-4 z-50 flex justify-center">
          <div className="bg-red-600 text-white text-xs px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 max-w-sm">
            <span className="flex-1">{radioError}</span>
            <button onClick={clearRadioError} className="font-bold text-white/80 hover:text-white">
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Favorites List Panel */}
      <LocalPlaylistPanel
        isOpen={isFavoritesListOpen}
        tracks={tracks.filter(t => favorites.has(t.id))}
        onClose={() => setIsFavoritesListOpen(false)}
        onTrackSelect={handlePlayTrack}
      />

      {/* Equalizer Panel */}
      <EqualizerPanel
        audioRef={audioRef}
        isPlaying={isPlaying && !isYouTubeMode}
        onPlaySong={handleYouTubePlayWrapper}
        onPlayPlaylist={handlePlayPlaylist}
      />

      {/* Botão flutuante: Músicas Salvas */}
      <button
        onClick={() => setIsSavedSongsOpen(true)}
        className="fixed top-20 right-4 z-40 w-12 h-12 flex items-center justify-center rounded-lg bg-black/80 backdrop-blur-sm border border-gray-700 hover:border-gray-500 transition-all duration-300"
        title="Músicas Salvas"
      >
        <Star size={20} className={savedSongs.length > 0 ? 'text-red-500' : 'text-gray-400'} />
      </button>

      <SavedSongsPanel
        isOpen={isSavedSongsOpen}
        favorites={savedSongs}
        onClose={() => setIsSavedSongsOpen(false)}
        onSelect={(favorite) => {
          if (favorite.type === 'youtube' && favorite.youtubeId) {
            handleYouTubePlayWrapper(favorite.youtubeId, favorite.name, favorite.cover || '');
            return;
          }

          if (favorite.type === 'radio') {
            const radioIndex = radios.findIndex((r) => r.id === favorite.id);
            if (radioIndex >= 0) {
              handlePlayRadio(radioIndex);
            }
            return;
          }

          const trackIndex = tracks.findIndex((t) => t.id === favorite.id);
          if (trackIndex >= 0) {
            handlePlayTrack(trackIndex);
          }
        }}
        onRemove={(id) => {
          const updated = favoritesStorage.remove(id);
          setSavedSongs(updated);
          setFavorites(new Set(updated.map((f) => f.id)));
        }}
      />

      {/* Artists Panel */}
      <ArtistsPanel
        isOpen={isArtistsPanelOpen}
        onClose={() => setIsArtistsPanelOpen(false)}
        onPlaySong={handleYouTubePlayWrapper}
        onPlayPlaylist={handlePlayPlaylist}
      />

      {/* Google Drive Panel */}
      <DrivePanel
        isOpen={isDriveOpen}
        onClose={() => setIsDriveOpen(false)}
        onPlaySong={handleDrivePlay}
      />
    </div>
  );
};
