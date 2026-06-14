/**
 * Equalizer - Visualizador de áudio com equalizador funcional
 */

import { useState, useEffect, useRef } from 'react';
import { Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EqualizerProps {
  audioRef?: React.RefObject<HTMLAudioElement | null>;
  isPlaying?: boolean;
}

export const Equalizer = ({ audioRef, isPlaying = false }: EqualizerProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [frequencies, setFrequencies] = useState<number[]>(Array(8).fill(0));
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!audioRef?.current || !isPlaying) return;

    try {
      // Criar contexto de áudio se não existir
      if (!audioContextRef.current) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioContext;

        // Conectar o elemento de áudio ao analisador
        const source = audioContext.createMediaElementSource(audioRef.current);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;

        source.connect(analyser);
        analyser.connect(audioContext.destination);
      }

      const analyser = analyserRef.current;
      if (!analyser) return;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const animate = () => {
        analyser.getByteFrequencyData(dataArray);

        // Dividir em 8 bandas de frequência
        const bandCount = 8;
        const samplesPerBand = Math.floor(dataArray.length / bandCount);
        const newFrequencies: number[] = [];

        for (let i = 0; i < bandCount; i++) {
          let sum = 0;
          for (let j = 0; j < samplesPerBand; j++) {
            sum += dataArray[i * samplesPerBand + j];
          }
          const average = sum / samplesPerBand / 255;
          newFrequencies.push(Math.min(average, 1));
        }

        setFrequencies(newFrequencies);
        animationRef.current = requestAnimationFrame(animate);
      };

      animate();

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    } catch (error) {
      console.error('Equalizer error:', error);
    }
  }, [audioRef, isPlaying]);

  return (
    <div className="fixed bottom-24 right-4 z-40">
      {/* Botão do equalizador */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300',
          'bg-black/80 backdrop-blur-sm border border-gray-700 hover:border-gray-500',
          isExpanded ? 'w-auto' : 'w-12 h-12 justify-center'
        )}
      >
        <Volume2 size={20} className="text-red-500" />
        {isExpanded && (
          <span className="text-xs font-semibold text-white ml-2">Equalizador</span>
        )}
      </button>

      {/* Painel expandido */}
      {isExpanded && (
        <div className="absolute bottom-16 right-0 w-72 bg-black/90 backdrop-blur-sm border border-gray-700 rounded-lg p-4 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">Equalizador</h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-white text-lg"
            >
              ×
            </button>
          </div>

          {/* Visualizador de barras */}
          <div className="flex items-end justify-center gap-2 h-32 bg-black/50 rounded p-4 mb-4">
            {frequencies.map((freq, index) => (
              <div
                key={index}
                className="flex-1 bg-gradient-to-t from-red-600 to-red-400 rounded-sm transition-all duration-100"
                style={{
                  height: `${freq * 100}%`,
                  minHeight: '4px',
                  opacity: 0.8 + freq * 0.2,
                }}
              />
            ))}
          </div>

          {/* Info */}
          <div className="text-[10px] text-gray-400 space-y-1">
            <p>🎵 <strong>Equalizador em tempo real</strong></p>
            <p>Visualiza as frequências da música em reprodução</p>
            {!isPlaying && (
              <p className="text-gray-500 mt-2">Reproduza uma música para ver o equalizador</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
