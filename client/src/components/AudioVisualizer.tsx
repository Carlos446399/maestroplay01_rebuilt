import { useEffect, useRef } from 'react';
import { getSharedAudioGraph } from '@/lib/audioGraph';

interface AudioVisualizerProps {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  isPlaying: boolean;
  isRadio: boolean;
}

export const AudioVisualizer = ({ audioRef, isPlaying, isRadio }: AudioVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const initializationDoneRef = useRef(false);
  // Flag para interromper o loop de animação de dentro do próprio callback
  const isPlayingRef = useRef(isPlaying);

  // Mantém a ref sincronizada com a prop para que o loop de animação
  // sempre leia o valor mais recente sem precisar ser recriado.
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Initialize Web Audio API only once
    const initAudioContext = () => {
      // Prevent multiple initializations
      if (initializationDoneRef.current || audioContextRef.current) return;

      try {
        const { audioContext, source } = getSharedAudioGraph(audio);
        audioContextRef.current = audioContext;

        // Create analyser node
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;

        // Create data array for frequency data
        const bufferLength = analyser.frequencyBinCount;
        dataArrayRef.current = new Uint8Array(bufferLength);

        // Connect: source -> analyser (in parallel; doesn't touch
        // the source's existing connections to the equalizer chain)
        source.connect(analyser);
        sourceRef.current = source;
        initializationDoneRef.current = true;
      } catch (e) {
        console.warn('AudioVisualizer: Could not initialize AudioContext', e);
      }
    };

    // Draw circular visualizer
    const draw = () => {
      // Para o loop imediatamente se a reprodução foi interrompida
      if (!isPlayingRef.current) {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        animationIdRef.current = null;
        return;
      }

      const canvas = canvasRef.current;
      if (!canvas || !analyserRef.current || !dataArrayRef.current) {
        animationIdRef.current = requestAnimationFrame(draw);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Get frequency data
      try {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      } catch (e) {
        console.warn('AudioVisualizer: Could not get frequency data', e);
      }

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      // Raio base começa numa distância segura FORA da capa do álbum
      // (que ocupa ~71% do raio total da caixa) e as barras crescem só o
      // suficiente para nunca tocar a borda externa da caixa nem os
      // controles abaixo.
      const radius = Math.min(centerX, centerY) * 0.78;
      const maxBarLength = Math.min(centerX, centerY) * 0.22;

      // Draw circular visualizer bars
      const barCount = dataArrayRef.current.length;
      const angleSlice = (Math.PI * 2) / barCount;

      for (let i = 0; i < barCount; i++) {
        const dataPoint = dataArrayRef.current[i];
        const intensity = dataPoint / 255;
        const barHeight = intensity * maxBarLength;

        const angle = angleSlice * i - Math.PI / 2;
        const x1 = centerX + Math.cos(angle) * radius;
        const y1 = centerY + Math.sin(angle) * radius;
        const x2 = centerX + Math.cos(angle) * (radius + barHeight);
        const y2 = centerY + Math.sin(angle) * (radius + barHeight);

        // Branco sólido, com leve variação de opacidade conforme a
        // intensidade do som (mais som = mais opaco/brilhante)
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.35 + intensity * 0.65})`;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        ctx.shadowColor = 'rgba(255, 255, 255, 0.6)';
        ctx.shadowBlur = 6;
      }

      ctx.shadowColor = 'transparent';

      animationIdRef.current = requestAnimationFrame(draw);
    };

    // Inicializa/retoma o AudioContext direto no evento real de "play" do
    // elemento — evita depender só da prop isPlaying (que pode chegar um
    // instante antes/depois do áudio de fato começar a tocar, causando a
    // inconsistência de "às vezes aparece, às vezes não").
    const handleAudioPlay = () => {
      initAudioContext();
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume().catch(e => console.warn('Could not resume AudioContext', e));
      }
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      animationIdRef.current = requestAnimationFrame(draw);
    };
    audio.addEventListener('play', handleAudioPlay);
    audio.addEventListener('playing', handleAudioPlay);

    // Only initialize and draw when actually playing
    if (isPlaying && audio && !audio.paused) {
      initAudioContext();

      // Resume audio context if suspended
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume().catch(e => console.warn('Could not resume AudioContext', e));
      }

      // Cancela qualquer frame pendente antes de iniciar um novo loop
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      animationIdRef.current = requestAnimationFrame(draw);
    } else if (!isPlaying && animationIdRef.current) {
      // Cancela o loop imediatamente ao pausar
      cancelAnimationFrame(animationIdRef.current);
      animationIdRef.current = null;
      // Limpa o canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    return () => {
      audio.removeEventListener('play', handleAudioPlay);
      audio.removeEventListener('playing', handleAudioPlay);
      // Clean up animation frame
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }
    };
  }, [isPlaying, audioRef]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, []);

  // Prevent rendering for radio streams
  if (isRadio) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={300}
      className="w-full h-full absolute inset-0 rounded-full"
      style={{
        pointerEvents: 'none',
      }}
    />
  );
};
