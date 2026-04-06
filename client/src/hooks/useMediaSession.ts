import { useEffect, useCallback } from 'react';
import { MusicPlayerState, Track, Radio } from '@/types/music';

interface MediaSessionMetadata {
  title: string;
  artist: string;
  album: string;
  artwork: Array<{
    src: string;
    sizes: string;
    type: string;
  }>;
}

export const useMediaSession = (
  playerState: MusicPlayerState,
  audioRef: React.RefObject<HTMLAudioElement>,
  onPlay: () => void,
  onPause: () => void,
  onNextTrack: () => void,
  onPreviousTrack: () => void,
  onSeek: (time: number) => void,
  currentTrack?: Track | Radio | null
) => {
  // Atualizar metadados da sessão de mídia
  const updateMediaSessionMetadata = useCallback(() => {
    if (!('mediaSession' in navigator)) return;

    let metadata: MediaSessionMetadata = {
      title: 'MaestroPlay',
      artist: 'Sem reprodução',
      album: 'MaestroPlay',
      artwork: [
        {
          src: '/pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    };

    if (currentTrack) {
      metadata = {
        title: currentTrack.name || 'Música sem título',
        artist: (currentTrack as Radio).genre || 'MaestroPlay',
        album: playerState.currentSource === 'radios' ? 'Rádio Online' : 'Biblioteca Local',
        artwork: currentTrack.cover
          ? [
              {
                src: currentTrack.cover,
                sizes: '512x512',
                type: 'image/png',
              },
            ]
          : [
              {
                src: '/pwa-192x192.png',
                sizes: '192x192',
                type: 'image/png',
              },
              {
                src: '/pwa-512x512.png',
                sizes: '512x512',
                type: 'image/png',
              },
            ],
      };
    }

    try {
      navigator.mediaSession.metadata = new MediaMetadata(metadata);
    } catch (error) {
      console.warn('Erro ao atualizar metadados da sessão de mídia:', error);
    }
  }, [currentTrack, playerState.currentSource]);

  // Atualizar estado da sessão de mídia
  const updateMediaSessionPlaybackState = useCallback(() => {
    if (!('mediaSession' in navigator)) return;

    try {
      navigator.mediaSession.playbackState = playerState.isPlaying ? 'playing' : 'paused';
    } catch (error) {
      console.warn('Erro ao atualizar estado de reprodução:', error);
    }
  }, [playerState.isPlaying]);

  // Configurar handlers de ações de mídia
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    const handlers = {
      play: () => {
        if (!playerState.isPlaying) {
          onPlay();
        }
      },
      pause: () => {
        if (playerState.isPlaying) {
          onPause();
        }
      },
      nexttrack: () => {
        onNextTrack();
      },
      previoustrack: () => {
        onPreviousTrack();
      },
      seekto: (event: any) => {
        if (event.seekTime !== undefined) {
          onSeek(event.seekTime);
        }
      },
      seekforward: (event: any) => {
        const skipTime = event.skipTime || 10;
        const newTime = Math.min(
          playerState.currentTime + skipTime,
          playerState.duration
        );
        onSeek(newTime);
      },
      seekbackward: (event: any) => {
        const skipTime = event.skipTime || 10;
        const newTime = Math.max(playerState.currentTime - skipTime, 0);
        onSeek(newTime);
      },
    };

    try {
      navigator.mediaSession.setActionHandler('play', handlers.play);
      navigator.mediaSession.setActionHandler('pause', handlers.pause);
      navigator.mediaSession.setActionHandler('nexttrack', handlers.nexttrack);
      navigator.mediaSession.setActionHandler('previoustrack', handlers.previoustrack);
      navigator.mediaSession.setActionHandler('seekto', handlers.seekto);
      navigator.mediaSession.setActionHandler('seekforward', handlers.seekforward);
      navigator.mediaSession.setActionHandler('seekbackward', handlers.seekbackward);
    } catch (error) {
      console.warn('Erro ao configurar handlers de ações de mídia:', error);
    }

    return () => {
      try {
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
        navigator.mediaSession.setActionHandler('nexttrack', null);
        navigator.mediaSession.setActionHandler('previoustrack', null);
        navigator.mediaSession.setActionHandler('seekto', null);
        navigator.mediaSession.setActionHandler('seekforward', null);
        navigator.mediaSession.setActionHandler('seekbackward', null);
      } catch (error) {
        console.warn('Erro ao limpar handlers:', error);
      }
    };
  }, [playerState, onPlay, onPause, onNextTrack, onPreviousTrack, onSeek]);

  // Atualizar metadados quando a música mudar
  useEffect(() => {
    updateMediaSessionMetadata();
  }, [currentTrack, updateMediaSessionMetadata]);

  // Atualizar estado de reprodução
  useEffect(() => {
    updateMediaSessionPlaybackState();
  }, [playerState.isPlaying, updateMediaSessionPlaybackState]);

  // Atualizar posição de reprodução
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    try {
      if (navigator.mediaSession.setPositionState) {
        navigator.mediaSession.setPositionState({
          duration: playerState.duration || 0,
          playbackRate: 1,
          position: playerState.currentTime || 0,
        });
      }
    } catch (error) {
      console.warn('Erro ao atualizar posição de reprodução:', error);
    }
  }, [playerState.currentTime, playerState.duration]);
};
