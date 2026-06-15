import { useState, useRef, useEffect, useCallback } from 'react';
import { Track, Radio, MusicPlayerState } from '@/types/music';
import { radioStations } from '@/data/radioStations';
import { audioStorage } from '@/services/audioStorage';
import { loadAudioSource, destroyActiveHls } from '@/lib/hlsPlayer';

export const useMusicPlayer = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [importProgress, setImportProgress] = useState<{ current: number; total: number } | null>(null);
  const [radioError, setRadioError] = useState<string | null>(null);
  const [state, setState] = useState<MusicPlayerState>({
    tracks: [],
    radios: radioStations,
    currentTrackIndex: -1,
    currentRadioIndex: -1,
    currentSource: 'tracks',
    isPlaying: false,
    repeat: 'off' as 'off' | 'all' | 'one',
    currentTime: 0,
    duration: 0,
    volume: 1,
  });

  const updateCurrentTime = useCallback(() => {
    if (audioRef.current) {
      setState(prev => ({
        ...prev,
        currentTime: audioRef.current!.currentTime,
        duration: audioRef.current!.duration || 0,
      }));
    }
  }, []);

  // Load stored tracks on mount
  useEffect(() => {
    const loadStoredTracks = async () => {
      try {
        await audioStorage.init();
        const storedFiles = await audioStorage.getAllAudioFiles();
        
        const loadedTracks: Track[] = storedFiles.map(stored => ({
          id: stored.id,
          name: stored.name,
          url: audioStorage.createBlobUrl(stored.file),
          cover: stored.cover,
          file: stored.file,
          type: 'local'
        }));

        setState(prev => {
          // Mescla com faixas já presentes no estado (ex: adicionadas antes
          // deste efeito terminar), evitando duplicatas e não perdendo
          // faixas adicionadas durante o carregamento.
          const merged = [
            ...loadedTracks,
            ...prev.tracks.filter(t => !loadedTracks.some(lt => lt.id === t.id)),
          ];
          // Evita estado idêntico re-disparando renders sem necessidade
          if (merged.length === prev.tracks.length && merged.every((t, i) => t.id === prev.tracks[i]?.id)) {
            return prev;
          }
          return { ...prev, tracks: merged };
        });
      } catch (error) {
        console.error('Error loading stored tracks:', error);
      }
    };

    loadStoredTracks();
  }, []);

  const addTracks = useCallback(async (files: FileList) => {
    console.log('addTracks called with files:', files);
    const audioFiles = Array.from(files).filter(file => 
      file.type.startsWith('audio/')
    );
    console.log('Filtered audio files:', audioFiles);
    
    if (audioFiles.length === 0) return;
    
    setImportProgress({ current: 0, total: audioFiles.length });
    
    try {
      const newTracks: Track[] = [];
      
      for (let i = 0; i < audioFiles.length; i++) {
        const file = audioFiles[i];
        const id = Math.random().toString(36).substring(7);
        const name = file.name.replace(/\.[^.]+$/, '');
        
        await audioStorage.storeAudioFile(id, name, file);
        
        const track: Track = {
          id,
          name,
          url: audioStorage.createBlobUrl(file),
          file,
          type: 'local'
        };
        
        newTracks.push(track);
        setImportProgress({ current: i + 1, total: audioFiles.length });
      }

      setState(prev => ({
        ...prev,
        tracks: [...prev.tracks, ...newTracks],
      }));
      console.log('Tracks added successfully:', newTracks);
    } catch (error) {
      console.error('Error storing tracks:', error);
      const newTracks: Track[] = audioFiles.map(file => ({
        id: Math.random().toString(36).substring(7),
        name: file.name.replace(/\.[^.]+$/, ''),
        url: URL.createObjectURL(file),
        file,
        type: 'local'
      }));

      setState(prev => ({
        ...prev,
        tracks: [...prev.tracks, ...newTracks],
      }));
    } finally {
      setTimeout(() => setImportProgress(null), 500);
    }
  }, []);

  const updateTrackCover = useCallback(async (trackId: string, coverFile: File) => {
    const coverUrl = URL.createObjectURL(coverFile);
    
    try {
      // Update in IndexedDB
      await audioStorage.updateAudioCover(trackId, coverUrl);
    } catch (error) {
      console.error('Error updating cover in storage:', error);
    }
    
    setState(prev => ({
      ...prev,
      tracks: prev.tracks.map(track => 
        track.id === trackId ? { ...track, cover: coverUrl } : track
      ),
    }));
  }, []);

  const playTrack = useCallback((index: number) => {
    if (index < 0 || index >= state.tracks.length) return;
    
    const track = state.tracks[index];
    
    setState(prev => ({ 
      ...prev, 
      currentTrackIndex: index, 
      currentRadioIndex: -1,
      currentSource: 'tracks',
      isPlaying: true
    }));
    
    if (audioRef.current) {
      loadAudioSource(audioRef.current, track.url);
      requestAnimationFrame(() => {
        if (audioRef.current) {
          audioRef.current.play().catch(err => {
            if (err.name !== 'AbortError' && err.name !== 'NotAllowedError') {
              console.error('Play error:', err);
            }
          });
        }
      });
    }
  }, [state.tracks]);

  const playRadio = useCallback((index: number) => {
    if (index < 0 || index >= state.radios.length) return;
    
    const radio = state.radios[index];
    
    setState(prev => ({ 
      ...prev, 
      currentRadioIndex: index, 
      currentTrackIndex: -1,
      currentSource: 'radios',
      isPlaying: true
    }));
    
    if (audioRef.current) {
      setRadioError(null);
      loadAudioSource(audioRef.current, radio.url, {
        onFatalError: (message) => {
          setRadioError(message);
          setState(prev => ({ ...prev, isPlaying: false }));
        },
      });
      requestAnimationFrame(() => {
        if (audioRef.current) {
          audioRef.current.play().catch(err => {
            if (err.name !== 'AbortError' && err.name !== 'NotAllowedError') {
              console.error('Play error:', err);
              setRadioError('Não foi possível tocar esta rádio.');
              setState(prev => ({ ...prev, isPlaying: false }));
            }
          });
        }
      });
    }
  }, [state.radios]);

  const play = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play()
        .then(() => setState(prev => ({ ...prev, isPlaying: true })))
        .catch(console.error);
    }
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setState(prev => ({ ...prev, isPlaying: false }));
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (state.isPlaying) {
      pause();
    } else {
      if (state.currentTrackIndex === -1 && state.currentRadioIndex === -1) {
        if (state.tracks.length > 0) {
          playTrack(0);
        } else if (state.radios.length > 0) {
          playRadio(0);
        }
      } else {
        play();
      }
    }
  }, [state.isPlaying, state.currentTrackIndex, state.currentRadioIndex, state.tracks.length, play, pause, playTrack, playRadio]);

  const nextTrack = useCallback(() => {
    if (state.currentSource === 'tracks' && state.tracks.length > 0) {
      const nextIndex = (state.currentTrackIndex + 1) % state.tracks.length;
      playTrack(nextIndex);
    } else if (state.currentSource === 'radios' && state.radios.length > 0) {
      const nextIndex = (state.currentRadioIndex + 1) % state.radios.length;
      playRadio(nextIndex);
    }
  }, [state.currentSource, state.tracks.length, state.radios.length, state.currentTrackIndex, state.currentRadioIndex, playTrack, playRadio]);

  const previousTrack = useCallback(() => {
    if (state.currentSource === 'tracks' && state.tracks.length > 0) {
      const prevIndex = (state.currentTrackIndex - 1 + state.tracks.length) % state.tracks.length;
      playTrack(prevIndex);
    } else if (state.currentSource === 'radios' && state.radios.length > 0) {
      const prevIndex = (state.currentRadioIndex - 1 + state.radios.length) % state.radios.length;
      playRadio(prevIndex);
    }
  }, [state.currentSource, state.tracks.length, state.radios.length, state.currentTrackIndex, state.currentRadioIndex, playTrack, playRadio]);

  const toggleRepeat = useCallback(() => {
    setState(prev => {
      const nextRepeat = prev.repeat === 'off' ? 'all' : prev.repeat === 'all' ? 'one' : 'off';
      return { ...prev, repeat: nextRepeat };
    });
  }, []);

  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
    setState(prev => ({ ...prev, volume: clampedVolume }));
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current && audioRef.current.duration && !isNaN(time)) {
      audioRef.current.currentTime = Math.max(0, Math.min(time, audioRef.current.duration));
      setState(prev => ({ ...prev, currentTime: audioRef.current!.currentTime }));
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => updateCurrentTime();
    const handleEnded = () => {
      setState(prev => ({ ...prev, isPlaying: false }));
      if (state.repeat === 'one') {
        if (state.currentSource === 'tracks') {
          playTrack(state.currentTrackIndex);
        } else {
          playRadio(state.currentRadioIndex);
        }
      } else if (state.repeat === 'all') {
        nextTrack();
      } else {
        // repeat === 'off': avança, mas para no fim da lista
        const isLastTrack = state.currentSource === 'tracks'
          ? state.currentTrackIndex >= state.tracks.length - 1
          : state.currentRadioIndex >= state.radios.length - 1;

        if (!isLastTrack) {
          nextTrack();
        }
      }
    };
    const handlePlay = () => setState(prev => ({ ...prev, isPlaying: true }));
    const handlePause = () => setState(prev => ({ ...prev, isPlaying: false }));

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [state.repeat, state.currentTrackIndex, state.currentRadioIndex, state.currentSource, nextTrack, playTrack, playRadio, updateCurrentTime]);

  // Limpar instância do hls.js ao desmontar o player
  useEffect(() => {
    return () => {
      destroyActiveHls();
    };
  }, []);

  return {
    ...state,
    importProgress,
    radioError,
    clearRadioError: () => setRadioError(null),
    audioRef,
    addTracks,
    updateTrackCover,
    playTrack,
    playRadio,
    play,
    pause,
    togglePlay,
    nextTrack,
    previousTrack,
    toggleRepeat,
    seek,
    setVolume,
  };
};
