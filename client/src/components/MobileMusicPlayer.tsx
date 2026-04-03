import { useState, useRef, useEffect } from 'react';
import { Hourglass } from 'lucide-react';
import { useMusicPlayer } from '@/hooks/useMusicPlayer';
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
    audioRef,
    addTracks,
    playTrack,
    playRadio,
    togglePlay,
    nextTrack,
    previousTrack,
    toggleRepeat,
    seek,
  } = useMusicPlayer();

  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
  const [isLocalPlaylistOpen, setIsLocalPlaylistOpen] = useState(false);
  const [isRadioOpen, setIsRadioOpen] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  
  // YouTube state
  const [ytPlayer, setYtPlayer] = useState<any>(null);
  const [ytPlaying, setYtPlaying] = useState(false);
  const [ytTitle, setYtTitle] = useState('');
  const [ytThumbnail, setYtThumbnail] = useState('');
  const [ytCurrentTime, setYtCurrentTime] = useState(0);
  const [ytDuration, setYtDuration] = useState(0);
  const [isYouTubeMode, setIsYouTubeMode] = useState(false);
  const ytContainerRef = useRef<HTMLDivElement>(null);
  const ytIntervalRef = useRef<any>(null);

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
                  setYtPlaying(false);
                  setIsYouTubeMode(false);
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

  const handleNextTrack = () => {
    if (isYouTubeMode && ytPlayer) {
      // For YouTube, just continue playing the current video
      // (YouTube player handles autoplay of next video in playlist if available)
      return;
    }
    nextTrack();
  };

  const handlePreviousTrack = () => {
    if (isYouTubeMode && ytPlayer) {
      // For YouTube, seek to beginning
      ytPlayer.seekTo(0, true);
      return;
    }
    previousTrack();
  };

  const currentTrack = currentTrackIndex >= 0 ? tracks[currentTrackIndex] : undefined;
  const currentRadio = currentRadioIndex >= 0 ? radios[currentRadioIndex] : undefined;
  
  // Determine what's currently showing
  const displayName = isYouTubeMode ? ytTitle : (currentSource === 'tracks' ? currentTrack?.name : currentRadio?.name) || 'Nenhuma música';
  const displayCover = isYouTubeMode ? ytThumbnail : (currentSource === 'tracks' ? currentTrack?.cover : currentRadio?.cover) || defaultCover;
  const displayPlaying = isYouTubeMode ? ytPlaying : isPlaying;
  const displayTime = isYouTubeMode ? ytCurrentTime : currentTime;
  const displayDuration = isYouTubeMode ? ytDuration : duration;
  const currentMedia = currentSource === 'tracks' ? currentTrack : currentRadio;

  const handleAddMusic = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'audio/*';
    input.multiple = true;
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) addTracks(files);
    };
    input.click();
  };

  const handleFavorite = () => {
    if (currentMedia) {
      const newFavorites = new Set(favorites);
      if (newFavorites.has(currentMedia.id)) {
        newFavorites.delete(currentMedia.id);
      } else {
        newFavorites.add(currentMedia.id);
      }
      setFavorites(newFavorites);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-main text-white flex flex-col items-center overflow-hidden">
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

      <div className="text-center px-4 mt-2">
        <div className="text-base font-bold truncate max-w-[280px] mx-auto">
          {displayName}
        </div>
        <div className="text-sm text-muted-foreground mt-1">
          {isYouTubeMode ? '🎵 YouTube' : currentSource === 'radios' ? 'Rádio Online' : 'Artista'}
        </div>
      </div>

      <div className="relative w-[40vw] h-[40vw] max-w-[150px] max-h-[150px] mx-auto my-2">
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
        onTogglePlay={handleTogglePlay}
        onPreviousTrack={handlePreviousTrack}
        onNextTrack={handleNextTrack}
      />

      <MobileBottomIcons
        onSearch={() => setIsLocalPlaylistOpen(true)}
        onFavorite={handleFavorite}
        onShuffle={() => setIsShuffle(!isShuffle)}
        onRepeat={toggleRepeat}
        onAddMusic={handleAddMusic}
        onRadio={() => setIsRadioOpen(true)}
        onPlaylist={() => setIsPlaylistOpen(true)}
        isFavorite={currentMedia ? favorites.has(currentMedia.id) : false}
        isShuffle={isShuffle}
        isRepeat={repeat}
      />

      <HorizontalPlaylist
        tracks={tracks.filter(t => favorites.has(t.id))}
        currentTrackIndex={currentTrackIndex}
        onTrackSelect={(index) => {
          const favTracks = tracks.filter(t => favorites.has(t.id));
          const originalIndex = tracks.findIndex(t => t.id === favTracks[index].id);
          handlePlayTrack(originalIndex);
        }}
      />

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

      {/* Hidden YouTube player */}
      <div ref={ytContainerRef} className="absolute -top-[9999px] -left-[9999px]">
        <div id="yt-player" />
      </div>

      <audio 
        ref={audioRef} 
        preload="metadata"
        className="hidden"
      />
    </div>
  );
};
