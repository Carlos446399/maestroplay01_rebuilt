import { useEffect, useRef } from 'react';

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

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Initialize Web Audio API only once
    const initAudioContext = () => {
      // Prevent multiple initializations
      if (initializationDoneRef.current || audioContextRef.current) return;

      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioContext;

        // Create analyser node
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;

        // Create data array for frequency data
        const bufferLength = analyser.frequencyBinCount;
        dataArrayRef.current = new Uint8Array(bufferLength);

        // Connect audio element to analyser (only once)
        try {
          const source = audioContext.createMediaElementSource(audio);
          source.connect(analyser);
          analyser.connect(audioContext.destination);
          sourceRef.current = source;
          initializationDoneRef.current = true;
        } catch (e) {
          console.warn('AudioVisualizer: Could not create media source', e);
          analyser.connect(audioContext.destination);
        }
      } catch (e) {
        console.warn('AudioVisualizer: Could not initialize AudioContext', e);
      }
    };

    // Draw circular visualizer
    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas || !analyserRef.current || !dataArrayRef.current) {
        if (isPlaying && audio && !audio.paused) {
          animationIdRef.current = requestAnimationFrame(draw);
        }
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
      const radius = Math.min(centerX, centerY) * 0.7;

      // Draw circular visualizer bars
      const barCount = dataArrayRef.current.length;
      const angleSlice = (Math.PI * 2) / barCount;

      for (let i = 0; i < barCount; i++) {
        const dataPoint = dataArrayRef.current[i];
        const barHeight = (dataPoint / 255) * radius * 0.6;

        const angle = angleSlice * i - Math.PI / 2;
        const x1 = centerX + Math.cos(angle) * radius;
        const y1 = centerY + Math.sin(angle) * radius;
        const x2 = centerX + Math.cos(angle) * (radius + barHeight);
        const y2 = centerY + Math.sin(angle) * (radius + barHeight);

        // Create gradient for each bar
        const hue = (i / barCount) * 360;
        ctx.strokeStyle = `hsl(${hue}, 100%, 50%)`;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // Add glow effect
        ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;
        ctx.shadowBlur = 8;
      }

      ctx.shadowColor = 'transparent';

      if (isPlaying && audio && !audio.paused) {
        animationIdRef.current = requestAnimationFrame(draw);
      }
    };

    // Only initialize and draw when actually playing
    if (isPlaying && audio && !audio.paused) {
      initAudioContext();

      // Resume audio context if suspended
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume().catch(e => console.warn('Could not resume AudioContext', e));
      }

      draw();
    }

    return () => {
      // Clean up animation frame
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
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
