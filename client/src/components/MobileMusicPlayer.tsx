import { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, 
  Repeat, Music2, ListMusic, Heart, Lock, Unlock,
  Search, HardDrive, Radio as RadioIcon, Download,
  CheckCircle2, Loader2, Hourglass, Star
} from 'lucide-react';
import { useMusicPlayer } from '@/hooks/useMusicPlayer';
import { AudioVisualizer } from './AudioVisualizer';
import { ProgressBar } from './ProgressBar';
import { SavedSongsPanel } from './SavedSongsPanel';
import { DrivePanel } from './DrivePanel';
import { RadioPanel as RadiosPanel } from './RadioPanel';
import { MobileControls } from './MobileControls';
import { MobileHeader } from './MobileHeader';
import { cn } from '@/lib/utils';
import { useBackgroundPlayback } from '@/hooks/useBackgroundPlayback';
import { useMediaSession } from '@/hooks/useMediaSession';
import { favoritesStorage, FavoriteSong } from '@/services/favoritesStorage';
import { audioStorage } from '@/services/audioStorage';
import { loadAudioSource } from '@/lib/hlsPlayer';
import ReactPlayer from 'react-player';
import { toast } from 'sonner';
import { youtubeDownloader, DownloadProgress } from '@/services/youtubeDownloader';

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
    volume,
    importProgress,
    radioError,
    audioRef,
    addTracks,
    playTrack,
    playRadio,
    togglePlay,
    nextTrack,
    previousTrack,
    toggleRepeat,
    seek,
    setVolume,
  } = useMusicPlayer();

  // Estados locais para controle de UI e modos especiais
  const [isYouTubeMode, setIsYouTubeMode] = useState(false);
  const [ytPlaying, setYtPlaying] = useState(false);
  const [ytUrl, setYtUrl] = useState('');
  const [ytTitle, setYtTitle] = useState('');
  const [ytThumbnail, setYtThumbnail] = useState('');
  const [ytDuration, setYtDuration] = useState(0);
  const [ytCurrentTime, setYtCurrentTime] = useState(0);
  const [ytPlayer, setYtPlayer] = useState<any>(null);
  const [ytPlaylist, setYtPlaylist] = useState<Array<{id: string; title: string; thumbnail: string}>>([]);
  const [ytCurrentIndex, setYtCurrentIndex] = useState(-1);

  const [isDriveMode, setIsDriveMode] = useState(false);
  const [driveTitle, setDriveTitle] = useState('');
  const [driveCover, setDriveCover] = useState('');
  const [driveFileId, setDriveFileId] = useState('');
  const [drivePlaylist, setDrivePlaylist] = useState<Array<{id: string; name: string; cover?: string}>>([]);
  const [driveCurrentIndex, setDriveCurrentIndex] = useState(-1);

  const [isSavedSongsOpen, setIsSavedSongsOpen] = useState(false);
  const [isDriveOpen, setIsDriveOpen] = useState(false);
  const [isRadiosOpen, setIsRadiosOpen] = useState(false);
  const [isPlayerLocked, setIsPlayerLocked] = useState(false);
  const [lockUnlockTimer, setLockUnlockTimer] = useState<NodeJS.Timeout | null>(null);
  
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [savedSongs, setSavedSongs] = useState<FavoriteSong[]>([]);
  const [downloadingIds, setDownloadingIds] = useState<Record<string, DownloadProgress>>({});
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const defaultCover = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=60';

  // Carregar favoritos ao montar
  useEffect(() => {
    const stored = favoritesStorage.getAll();
    setSavedSongs(stored);
    setFavorites(new Set(stored.map((f) => f.id)));
    
    // Verificar músicas salvas offline
    const checkOffline = async () => {
      await audioStorage.init();
      const offline = await audioStorage.getAllAudioFiles();
      setSavedIds(new Set(offline.map(f => f.id)));
    };
    checkOffline();
  }, []);

  const handleTogglePlay = () => {
    if (isYouTubeMode) {
      setYtPlaying(!ytPlaying);
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
      const videoId = track.id.replace('yt-', '');
      handleYouTubePlay(videoId, track.name, track.cover || '');
      return;
    }
    
    // Resetar outros modos
    setIsYouTubeMode(false);
    setYtPlaying(false);
    setIsDriveMode(false);
    
    playTrack(index);
  };

  const handlePlayRadio = (index: number) => {
    setIsYouTubeMode(false);
    setYtPlaying(false);
    setIsDriveMode(false);
    playRadio(index);
  };

  const handleYouTubePlay = (videoId: string, title: string, thumbnail: string) => {
    if (audioRef.current) audioRef.current.pause();
    setIsDriveMode(false);
    setIsYouTubeMode(true);
    setYtUrl(`https://www.youtube.com/watch?v=${videoId}`);
    setYtTitle(title);
    setYtThumbnail(thumbnail);
    setYtPlaying(true);
    setYtPlaylist([{ id: videoId, title, thumbnail }]);
    setYtCurrentIndex(0);
  };

  const handlePlayPlaylist = (songs: Array<{id: string; title: string; thumbnail: string}>, startIndex: number) => {
    if (audioRef.current) audioRef.current.pause();
    setIsDriveMode(false);
    setIsYouTubeMode(true);
    const startVideo = songs[startIndex];
    setYtUrl(`https://www.youtube.com/watch?v=${startVideo.id}`);
    setYtTitle(startVideo.title);
    setYtThumbnail(startVideo.thumbnail);
    setYtPlaying(true);
    setYtPlaylist(songs);
    setYtCurrentIndex(startIndex);
  };

  const handleDrivePlay = (
    fileId: string,
    title: string,
    cover?: string,
    playlist?: Array<{id: string; name: string; cover?: string}>,
    index?: number
  ) => {
    setIsYouTubeMode(false);
    setYtPlaying(false);
    
    setIsDriveMode(true);
    setDriveFileId(fileId);
    setDriveTitle(title);
    setDriveCover(cover || '');
    setIsDriveOpen(false);

    if (playlist) {
      setDrivePlaylist(playlist);
      setDriveCurrentIndex(index ?? 0);
    }

    if (audioRef.current) {
      const proxyUrl = `/api/drive-proxy?id=${fileId}`;
      loadAudioSource(audioRef.current, proxyUrl);
      audioRef.current.play().catch(console.error);
    }
  };

  const handleNextTrack = () => {
    if (isDriveMode) {
      if (drivePlaylist.length > 1) {
        const nextIdx = (driveCurrentIndex + 1) % drivePlaylist.length;
        const next = drivePlaylist[nextIdx];
        handleDrivePlay(next.id, next.name, next.cover, drivePlaylist, nextIdx);
      }
      return;
    }
    
    if (isYouTubeMode) {
      if (ytPlaylist.length > 1) {
        const nextIdx = (ytCurrentIndex + 1) % ytPlaylist.length;
        const next = ytPlaylist[nextIdx];
        setYtCurrentIndex(nextIdx);
        setYtTitle(next.title);
        setYtThumbnail(next.thumbnail);
        setYtUrl(`https://www.youtube.com/watch?v=${next.id}`);
        setYtPlaying(true);
      }
      return;
    }
    
    nextTrack();
  };

  const handlePreviousTrack = () => {
    if (isDriveMode) {
      if (drivePlaylist.length > 1) {
        const prevIdx = (driveCurrentIndex - 1 + drivePlaylist.length) % drivePlaylist.length;
        const prev = drivePlaylist[prevIdx];
        handleDrivePlay(prev.id, prev.name, prev.cover, drivePlaylist, prevIdx);
      }
      return;
    }

    if (isYouTubeMode) {
      if (ytPlaylist.length > 1) {
        const prevIdx = (ytCurrentIndex - 1 + ytPlaylist.length) % ytPlaylist.length;
        const prev = ytPlaylist[prevIdx];
        setYtCurrentIndex(prevIdx);
        setYtTitle(prev.title);
        setYtThumbnail(prev.thumbnail);
        setYtUrl(`https://www.youtube.com/watch?v=${prev.id}`);
        setYtPlaying(true);
      }
      return;
    }

    previousTrack();
  };

  const currentRadio = currentRadioIndex >= 0 ? radios[currentRadioIndex] : undefined;
  
  const displayName = isDriveMode ? driveTitle : isYouTubeMode ? ytTitle : (currentSource === 'tracks' ? tracks[currentTrackIndex]?.name : currentRadio?.name) || 'Nenhuma música';
  const displayCover = isDriveMode ? (driveCover || defaultCover) : isYouTubeMode ? ytThumbnail : (currentSource === 'tracks' ? tracks[currentTrackIndex]?.cover : currentRadio?.cover) || defaultCover;
  const displayPlaying = isYouTubeMode ? ytPlaying : isPlaying;
  const displayTime = isYouTubeMode ? ytCurrentTime : currentTime;
  const displayDuration = isYouTubeMode ? ytDuration : duration;

  useBackgroundPlayback(displayPlaying);

  const mediaSessionTrack = useMemo(() => {
    if (isYouTubeMode) return { id: `yt-${ytPlaylist[ytCurrentIndex]?.id}`, name: ytTitle, cover: ytThumbnail, type: 'local' as const, url: '' };
    if (isDriveMode) return { id: `drive-${driveFileId}`, name: driveTitle, cover: driveCover, type: 'local' as const, url: '' };
    return currentSource === 'tracks' ? tracks[currentTrackIndex] : currentRadio;
  }, [isYouTubeMode, isDriveMode, ytTitle, driveTitle, currentSource, currentTrackIndex, currentRadioIndex, ytPlaylist, ytCurrentIndex, tracks, currentRadio]);

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
    mediaSessionTrack as any
  );

  const handleFavorite = () => {
    let favoriteSong: Omit<FavoriteSong, 'addedAt'> | null = null;

    if (isYouTubeMode) {
      const current = ytPlaylist[ytCurrentIndex];
      if (current) {
        favoriteSong = {
          id: `yt-${current.id}`,
          name: current.title,
          cover: current.thumbnail,
          type: 'youtube',
          youtubeId: current.id,
        };
      }
    } else if (isDriveMode) {
      favoriteSong = {
        id: `drive-${driveFileId}`,
        name: driveTitle,
        cover: driveCover,
        type: 'drive',
        youtubeId: driveFileId,
      };
    } else if (currentSource === 'tracks' && tracks[currentTrackIndex]) {
      const t = tracks[currentTrackIndex];
      favoriteSong = { id: t.id, name: t.name, cover: t.cover, type: 'local' };
    } else if (currentSource === 'radios' && currentRadio) {
      favoriteSong = { id: currentRadio.id, name: currentRadio.name, cover: currentRadio.cover, type: 'radio' };
    }

    if (favoriteSong) {
      const updated = favoritesStorage.toggle(favoriteSong);
      setSavedSongs(updated);
      setFavorites(new Set(updated.map((f) => f.id)));
    }
  };

  const handleRemoveFavorite = (id: string) => {
    const updated = favoritesStorage.remove(id);
    setSavedSongs(updated);
    setFavorites(new Set(updated.map((f) => f.id)));
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
        </div>
      )}

      <div className="text-center px-4 mt-1">
        <div className="text-sm font-bold truncate max-w-[280px] mx-auto">
          {displayName}
        </div>
        <div className="text-[10px] text-gray-400 mt-0.5">
          {isDriveMode ? '💾 Google Drive' : isYouTubeMode ? '📺 YouTube Music' : currentSource === 'radios' ? '📻 Rádio Ao Vivo' : '🎵 Música Local'}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md px-8 py-4 gap-6">
        <div className="relative w-full aspect-square max-w-[280px]">
          <div className={cn(
            "w-full h-full rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 transition-transform duration-500",
            displayPlaying ? "scale-100" : "scale-95 opacity-80"
          )}>
            <img 
              src={displayCover} 
              alt={displayName}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10">
            <AudioVisualizer isPlaying={displayPlaying} audioRef={audioRef} />
          </div>
        </div>

        <div className="w-full space-y-4">
          <ProgressBar 
            currentTime={displayTime}
            duration={displayDuration}
            onSeek={handleSeek}
          />

          <div className="flex items-center justify-between gap-2">
            <button 
              onClick={toggleRepeat}
              className={cn("p-2 transition-colors", repeat !== 'off' ? "text-red-500" : "text-gray-400")}
            >
              <Repeat size={20} />
              {repeat === 'one' && <span className="absolute text-[8px] font-bold">1</span>}
            </button>

            <div className="flex items-center gap-6">
              <button onClick={handlePreviousTrack} className="text-white hover:text-red-500 transition-colors">
                <SkipBack size={32} fill="currentColor" />
              </button>
              
              <button 
                onClick={handleTogglePlay}
                className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-transform active:scale-95 shadow-lg shadow-red-600/20"
              >
                {displayPlaying ? (
                  <Pause size={32} fill="currentColor" />
                ) : (
                  <Play size={32} className="ml-1" fill="currentColor" />
                )}
              </button>

              <button onClick={handleNextTrack} className="text-white hover:text-red-500 transition-colors">
                <SkipForward size={32} fill="currentColor" />
              </button>
            </div>

            <button 
              onClick={handleFavorite}
              className={cn("p-2 transition-colors", favorites.has(mediaSessionTrack?.id || '') ? "text-red-500" : "text-gray-400")}
            >
              <Heart size={22} fill={favorites.has(mediaSessionTrack?.id || '') ? "currentColor" : "none"} />
            </button>
          </div>
        </div>
      </div>

      <div className="w-full px-6 mt-auto">
        <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md p-3 rounded-2xl border border-white/10">
          <Volume2 size={18} className="text-gray-400" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="flex-1 h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-red-600"
          />
        </div>
        
        <div className="flex items-center justify-between mt-6 pb-2">
          <button onClick={() => setIsSavedSongsOpen(true)} className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-colors">
            <div className="p-2 bg-white/5 rounded-xl"><ListMusic size={20} /></div>
            <span className="text-[10px] font-medium">Favoritos</span>
          </button>
          <button onClick={() => setIsDriveOpen(true)} className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-colors">
            <div className="p-2 bg-white/5 rounded-xl"><HardDrive size={20} /></div>
            <span className="text-[10px] font-medium">Drive</span>
          </button>
          <button onClick={() => setIsRadiosOpen(true)} className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-colors">
            <div className="p-2 bg-white/5 rounded-xl"><RadioIcon size={20} /></div>
            <span className="text-[10px] font-medium">Rádios</span>
          </button>
          <button onClick={() => setIsPlayerLocked(!isPlayerLocked)} className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-colors">
            <div className="p-2 bg-white/5 rounded-xl">{isPlayerLocked ? <Lock size={20} /> : <Unlock size={20} />}</div>
            <span className="text-[10px] font-medium">{isPlayerLocked ? 'Preso' : 'Solto'}</span>
          </button>
        </div>
      </div>

      {isYouTubeMode && (
        <div className="hidden">
          <ReactPlayer
            ref={setYtPlayer}
            url={ytUrl}
            playing={ytPlaying}
            volume={volume}
            onProgress={(p) => setYtCurrentTime(p.playedSeconds)}
            onDuration={setYtDuration}
            onEnded={handleNextTrack}
            config={{ youtube: { playerVars: { autoplay: 1 } } }}
          />
        </div>
      )}

      <SavedSongsPanel 
        isOpen={isSavedSongsOpen} 
        favorites={savedSongs}
        onClose={() => setIsSavedSongsOpen(false)}
        onSelect={(song) => {
          if (song.id.startsWith('yt-')) handleYouTubePlay(song.youtubeId!, song.name, song.cover || '');
          else if (song.id.startsWith('drive-')) handleDrivePlay(song.youtubeId!, song.name, song.cover || '');
          else {
            const idx = tracks.findIndex(t => t.id === song.id);
            if (idx !== -1) handlePlayTrack(idx);
          }
          setIsSavedSongsOpen(false);
        }}
        onRemove={handleRemoveFavorite}
      />

      <DrivePanel 
        isOpen={isDriveOpen} 
        onClose={() => setIsDriveOpen(false)}
        onPlaySong={handleDrivePlay}
      />

      <RadiosPanel 
        isOpen={isRadiosOpen} 
        radios={radios}
        currentRadioIndex={currentRadioIndex}
        isPlaying={isPlaying && currentSource === 'radios'}
        onClose={() => setIsRadiosOpen(false)}
        onRadioSelect={(idx) => {
          handlePlayRadio(idx);
          setIsRadiosOpen(false);
        }}
      />

      {radioError && (
        <div className="fixed bottom-24 left-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg text-xs flex items-center justify-between animate-bounce">
          <span>{radioError}</span>
          <button onClick={() => {}} className="font-bold">X</button>
        </div>
      )}
    </div>
  );
};
