/**
 * EqualizerPanel - Inicializa o grafo de áudio compartilhado (Web Audio API)
 * para o elemento <audio> do player.
 *
 * Este componente não renderiza nenhuma UI visível. Ele existe para garantir
 * que o AudioContext / MediaElementAudioSourceNode / AnalyserNode
 * compartilhados (ver lib/audioGraph.ts) sejam inicializados uma única vez,
 * para uso por outros componentes como o AudioVisualizer.
 *
 * O antigo botão flutuante de equalizador (alto-falante) foi removido e
 * substituído pelo botão flutuante de "Músicas Salvas" em MobileMusicPlayer.
 */

import { useEffect, useRef } from 'react';
import { getSharedAudioGraph } from '@/lib/audioGraph';

interface EqualizerPanelProps {
  audioRef?: React.RefObject<HTMLAudioElement | null>;
  isPlaying?: boolean;
  onPlaySong?: (videoId: string, title: string, thumbnail: string) => void;
  onPlayPlaylist?: (songs: Array<{id: string; title: string; thumbnail: string}>, startIndex: number) => void;
}

export const EqualizerPanel = ({ audioRef }: EqualizerPanelProps) => {
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!audioRef?.current || initializedRef.current) return;

    const timer = setTimeout(() => {
      try {
        if (!audioRef.current || initializedRef.current) return;
        getSharedAudioGraph(audioRef.current);
        initializedRef.current = true;
      } catch (error) {
        console.error('Audio graph initialization error:', error);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [audioRef]);

  return null;
};
