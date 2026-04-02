import { useEffect, useRef, useState } from 'react';

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

  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;

    // Initialize Web Audio API
    const initAudioContext = () => {
      if (audioContextRef.current) return;

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      // Create analyser node
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      // Create data array for frequency data
      const bufferLength = analyser.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);

      // Connect audio element to analyser
      if (!sourceRef.current) {
        const source = audioContext.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        sourceRef.current = source;
      }
    };

    // Initialize on first play
    const handlePlay = () => {
      initAudioContext();
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
      draw();
    };

    // Draw visualizer
    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas || !analyserRef.current || !dataArrayRef.current) {
        if (isPlaying) animationIdRef.current = requestAnimationFrame(draw);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Get frequency data
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);

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

      if (isPlaying) {
        animationIdRef.current = requestAnimationFrame(draw);
      }
    };

    audio.addEventListener('play', handlePlay);

    if (isPlaying) {
      initAudioContext();
      draw();
    }

    return () => {
      audio.removeEventListener('play', handlePlay);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [isPlaying, audioRef]);

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
