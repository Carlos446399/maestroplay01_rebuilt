import { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  isPlaying: boolean;
}

export const AudioVisualizer = ({ audioRef, isPlaying }: AudioVisualizerProps) => {
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
          // Fallback: just use analyser without source
          analyser.connect(audioContext.destination);
        }
      } catch (e) {
        console.warn('AudioVisualizer: Could not initialize AudioContext', e);
      }
    };

    // Draw visualizer
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

      // Clear canvas with semi-transparent background
      ctx.fillStyle = 'rgba(23, 23, 60, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw bars
      const barWidth = canvas.width / dataArrayRef.current.length;
      const centerY = canvas.height / 2;

      for (let i = 0; i < dataArrayRef.current.length; i++) {
        const dataPoint = dataArrayRef.current[i];
        const barHeight = (dataPoint / 255) * canvas.height * 0.8;

        // Create gradient for each bar
        const hue = (i / dataArrayRef.current.length) * 360;
        ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;

        // Draw bar from center
        ctx.fillRect(
          i * barWidth,
          centerY - barHeight / 2,
          barWidth - 1,
          barHeight
        );

        // Add glow effect
        ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;
        ctx.shadowBlur = 10;
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
      // Don't disconnect/close on unmount to avoid interfering with playback
      // The audio context will be cleaned up by the browser
    };
  }, []);

  return (
    <div className="w-full px-2 mb-2">
      <canvas
        ref={canvasRef}
        width={320}
        height={80}
        className="w-full h-20 rounded-lg border border-white/10"
        style={{
          background: 'linear-gradient(180deg, rgba(23,23,60,0.3), rgba(23,23,60,0.1))',
        }}
      />
    </div>
  );
};
