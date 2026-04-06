/**
 * EqualizerPanel - Equalizador manual com controles Bass, Mid, Treble
 */

import { useState, useEffect, useRef } from 'react';
import { Volume2, X, Users, Headphones } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ArtistsPanel } from './ArtistsPanel';
import { use8DAudio } from '@/hooks/use8DAudio';

interface EqualizerPanelProps {
  audioRef?: React.RefObject<HTMLAudioElement>;
  isPlaying?: boolean;
  onPlaySong?: (videoId: string, title: string, thumbnail: string) => void;
  onPlayPlaylist?: (songs: Array<{id: string; title: string; thumbnail: string}>, startIndex: number) => void;
}

export const EqualizerPanel = ({ audioRef, isPlaying = false, onPlaySong, onPlayPlaylist }: EqualizerPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isArtistsPanelOpen, setIsArtistsPanelOpen] = useState(false);
  const [bass, setBass] = useState(0);
  const [mid, setMid] = useState(0);
  const [treble, setTreble] = useState(0);
  const [frequencies, setFrequencies] = useState<number[]>(Array(8).fill(0));
  const [is8DEnabled, setIs8DEnabled] = useState(false);
  const [audio8DSpeed, setAudio8DSpeed] = useState(1);
  const [audio8DIntensity, setAudio8DIntensity] = useState(0.8);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSource | null>(null);
  const bassFilterRef = useRef<BiquadFilterNode | null>(null);
  const midFilterRef = useRef<BiquadFilterNode | null>(null);
  const trebleFilterRef = useRef<BiquadFilterNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const initializationAttemptRef = useRef(0);
  const { enable8D, disable8D, setSpeed: set8DSpeed, setIntensity: set8DIntensity } = use8DAudio(audioRef);

  // Inicializar Web Audio API com retry logic
  useEffect(() => {
    if (!audioRef?.current || initializationAttemptRef.current > 0) return;

    const initAudio = () => {
      try {
        // Verificar se já foi inicializado
        if (audioContextRef.current && sourceRef.current) {
          return;
        }

        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Resume context se estiver suspended
        if (audioContext.state === 'suspended') {
          audioContext.resume();
        }

        audioContextRef.current = audioContext;

        // Criar source apenas uma vez
        if (!sourceRef.current) {
          sourceRef.current = audioContext.createMediaElementAudioSource(audioRef.current!);
        }

        // Criar filtros EQ
        const bassFilter = audioContext.createBiquadFilter();
        bassFilter.type = 'lowshelf';
        bassFilter.frequency.value = 200;
        bassFilter.gain.value = 0;
        bassFilterRef.current = bassFilter;

        const midFilter = audioContext.createBiquadFilter();
        midFilter.type = 'peaking';
        midFilter.frequency.value = 1000;
        midFilter.Q.value = 1;
        midFilter.gain.value = 0;
        midFilterRef.current = midFilter;

        const trebleFilter = audioContext.createBiquadFilter();
        trebleFilter.type = 'highshelf';
        trebleFilter.frequency.value = 3000;
        trebleFilter.gain.value = 0;
        trebleFilterRef.current = trebleFilter;

        // Criar analisador
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;

        // Conectar: source -> bass -> mid -> treble -> analyser -> destination
        sourceRef.current.connect(bassFilter);
        bassFilter.connect(midFilter);
        midFilter.connect(trebleFilter);
        trebleFilter.connect(analyser);
        analyser.connect(audioContext.destination);

        initializationAttemptRef.current = 1;
      } catch (error) {
        console.error('Equalizer initialization error:', error);
      }
    };

    // Tentar inicializar ao clicar ou após um delay
    const timer = setTimeout(initAudio, 100);
    return () => clearTimeout(timer);
  }, [audioRef]);

  // Atualizar valores dos filtros
  useEffect(() => {
    if (bassFilterRef.current) {
      bassFilterRef.current.gain.value = bass;
    }
    if (midFilterRef.current) {
      midFilterRef.current.gain.value = mid;
    }
    if (trebleFilterRef.current) {
      trebleFilterRef.current.gain.value = treble;
    }
  }, [bass, mid, treble]);

  // Animar visualizador
  useEffect(() => {
    if (!isPlaying || !analyserRef.current) {
      setFrequencies(Array(8).fill(0));
      return;
    }

    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const animate = () => {
      analyser.getByteFrequencyData(dataArray);

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
  }, [isPlaying]);

  // Gerenciar estado do 8D Audio
  useEffect(() => {
    if (is8DEnabled) {
      enable8D(audio8DSpeed, audio8DIntensity);
    } else {
      disable8D();
    }
  }, [is8DEnabled, enable8D, disable8D]);

  // Atualizar velocidade do 8D em tempo real
  useEffect(() => {
    if (is8DEnabled) {
      set8DSpeed(audio8DSpeed);
    }
  }, [audio8DSpeed, is8DEnabled, set8DSpeed]);

  // Atualizar intensidade do 8D em tempo real
  useEffect(() => {
    if (is8DEnabled) {
      set8DIntensity(audio8DIntensity);
    }
  }, [audio8DIntensity, is8DEnabled, set8DIntensity]);

  const handleExpandClick = () => {
    // Tentar inicializar o áudio ao expandir
    if (!audioContextRef.current && audioRef?.current) {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (audioContext.state === 'suspended') {
          audioContext.resume();
        }
      } catch (e) {
        console.error('Error resuming audio context:', e);
      }
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="fixed top-20 right-4 z-40">
      {/* Botão do equalizador */}
      <button
        onClick={handleExpandClick}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300',
          'bg-black/80 backdrop-blur-sm border border-gray-700 hover:border-gray-500',
          isExpanded ? 'w-auto' : 'w-12 h-12 justify-center'
        )}
      >
        <Volume2 size={20} className={cn('transition-all', isPlaying ? 'text-red-500 animate-pulse' : 'text-gray-400')} />
        {isExpanded && (
          <span className="text-xs font-semibold text-white ml-2">Equalizador</span>
        )}
      </button>

      {/* Painel expandido */}
      {isExpanded && (
        <div className="absolute top-0 right-0 w-80 bg-black/95 backdrop-blur-sm border border-gray-700 rounded-lg p-4 shadow-lg mt-14">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">Equalizador</h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-white text-lg"
            >
              <X size={20} />
            </button>
          </div>

          {/* Visualizador de barras com animação */}
          <div className="flex items-end justify-center gap-1.5 h-24 bg-black/50 rounded p-3 mb-6">
            {frequencies.map((freq, index) => (
              <div
                key={index}
                className="flex-1 bg-gradient-to-t from-red-600 to-red-400 rounded-sm transition-all duration-75"
                style={{
                  height: `${Math.max(freq * 100, 2)}%`,
                  minHeight: '2px',
                  opacity: 0.7 + freq * 0.3,
                  boxShadow: freq > 0.5 ? '0 0 8px rgba(239, 68, 68, 0.6)' : 'none',
                }}
              />
            ))}
          </div>

          {/* Controles de EQ */}
          <div className="space-y-4">
            {/* Bass */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-white">Bass</label>
                <span className="text-xs text-red-500 font-bold">{bass > 0 ? '+' : ''}{bass.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="-12"
                max="12"
                step="0.1"
                value={bass}
                onChange={(e) => setBass(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-600"
              />
            </div>

            {/* Mid */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-white">Mid</label>
                <span className="text-xs text-red-500 font-bold">{mid > 0 ? '+' : ''}{mid.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="-12"
                max="12"
                step="0.1"
                value={mid}
                onChange={(e) => setMid(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-600"
              />
            </div>

            {/* Treble */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-white">Treble</label>
                <span className="text-xs text-red-500 font-bold">{treble > 0 ? '+' : ''}{treble.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="-12"
                max="12"
                step="0.1"
                value={treble}
                onChange={(e) => setTreble(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-600"
              />
            </div>

            {/* 8D Audio Toggle */}
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Headphones size={14} className="text-purple-500" />
                  <label className="text-xs font-semibold text-white">Audio 8D</label>
                </div>
                <button
                  onClick={() => setIs8DEnabled(!is8DEnabled)}
                  className={cn(
                    'px-2 py-1 rounded text-xs font-semibold transition-all',
                    is8DEnabled
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  )}
                >
                  {is8DEnabled ? 'Ativo' : 'Inativo'}
                </button>
              </div>

              {is8DEnabled && (
                <div className="space-y-3 bg-black/50 p-3 rounded">
                  {/* Speed */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-semibold text-purple-300">Velocidade</label>
                      <span className="text-[10px] text-purple-400">{audio8DSpeed.toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={audio8DSpeed}
                      onChange={(e) => setAudio8DSpeed(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                  </div>

                  {/* Intensity */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-semibold text-purple-300">Intensidade</label>
                      <span className="text-[10px] text-purple-400">{(audio8DIntensity * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={audio8DIntensity}
                      onChange={(e) => setAudio8DIntensity(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Reset Button */}
            <button
              onClick={() => {
                setBass(0);
                setMid(0);
                setTreble(0);
                setIs8DEnabled(false);
              }}
              className="w-full mt-4 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded transition-colors"
            >
              Resetar Tudo
            </button>
          </div>

          {/* Artists Button */}
          <button
            onClick={() => setIsArtistsPanelOpen(true)}
            className="w-full mt-4 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded transition-colors flex items-center justify-center gap-2"
          >
            <Users size={14} />
            Ver Artistas Mundiais
          </button>

          {/* Info */}
          <div className="text-[10px] text-gray-400 space-y-1 mt-4 pt-4 border-t border-gray-700">
            <p>🎵 <strong>Controle manual de tons</strong></p>
            <p>Ajuste Bass, Mid e Treble para personalizar o som</p>
            {!isPlaying && (
              <p className="text-gray-500 mt-2">Reproduza uma música para usar o equalizador</p>
            )}
          </div>
        </div>
      )}

      {/* Artists Panel */}
      <ArtistsPanel
        isOpen={isArtistsPanelOpen}
        onClose={() => setIsArtistsPanelOpen(false)}
        onPlaySong={onPlaySong}
        onPlayPlaylist={onPlayPlaylist}
      />
    </div>
  );
};
