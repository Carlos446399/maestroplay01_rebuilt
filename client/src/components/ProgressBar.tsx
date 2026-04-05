import { useEffect, useRef } from 'react';

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  isRadio?: boolean;
  isYouTube?: boolean;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
};

export const ProgressBar = ({ currentTime, duration, onSeek, isRadio = false, isYouTube = false }: ProgressBarProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const isLiveStream = (isRadio && !isYouTube) || (duration === 0 && !isYouTube) || (!isFinite(duration) && !isYouTube);

  // Draw heartbeat waveform on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    canvas.width = width;
    canvas.height = height;

    // Clear canvas (transparent)
    ctx.clearRect(0, 0, width, height);

    if (isLiveStream) {
      // Para rádios ao vivo, não desenhar nada (apenas centralizar "AO VIVO")
      return;
    } else {
      // For regular tracks with duration, draw heartbeat waveform
      const centerY = height / 2;
      const amplitude = height * 0.35;
      const beatWidth = width / 4;

      // Draw white line (completed portion)
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.beginPath();

      const progressPixels = (progress / 100) * width;

      for (let x = 0; x <= progressPixels; x += 1) {
        const localX = (x % beatWidth) / beatWidth;
        let y = centerY;

        if (localX < 0.1) {
          y = centerY - amplitude * Math.sin(localX * Math.PI * 10);
        } else if (localX < 0.2) {
          y = centerY + amplitude * Math.sin((localX - 0.1) * Math.PI * 10);
        } else if (localX < 0.3) {
          y = centerY - amplitude * 1.2 * Math.sin((localX - 0.2) * Math.PI * 10);
        } else if (localX < 0.4) {
          y = centerY + amplitude * Math.sin((localX - 0.3) * Math.PI * 10);
        } else if (localX < 0.5) {
          y = centerY - amplitude * 0.6 * Math.sin((localX - 0.4) * Math.PI * 10);
        } else if (localX < 0.6) {
          y = centerY + amplitude * 0.4 * Math.sin((localX - 0.5) * Math.PI * 10);
        } else {
          y = centerY;
        }

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Draw gray line (remaining portion)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 2;
      ctx.beginPath();

      for (let x = Math.max(0, progressPixels); x <= width; x += 1) {
        const localX = (x % beatWidth) / beatWidth;
        let y = centerY;

        if (localX < 0.1) {
          y = centerY - amplitude * Math.sin(localX * Math.PI * 10);
        } else if (localX < 0.2) {
          y = centerY + amplitude * Math.sin((localX - 0.1) * Math.PI * 10);
        } else if (localX < 0.3) {
          y = centerY - amplitude * 1.2 * Math.sin((localX - 0.2) * Math.PI * 10);
        } else if (localX < 0.4) {
          y = centerY + amplitude * Math.sin((localX - 0.3) * Math.PI * 10);
        } else if (localX < 0.5) {
          y = centerY - amplitude * 0.6 * Math.sin((localX - 0.4) * Math.PI * 10);
        } else if (localX < 0.6) {
          y = centerY + amplitude * 0.4 * Math.sin((localX - 0.5) * Math.PI * 10);
        } else {
          y = centerY;
        }

        if (x === Math.max(0, progressPixels)) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Draw red circle (progress indicator) on the waveform
      let circleY = centerY;
      const localProgress = (progress % 100) / 100;
      const beatWidthPercent = 25;
      const localX = (localProgress * 100) % beatWidthPercent / beatWidthPercent;

      if (localX < 0.1) {
        circleY = centerY - amplitude * Math.sin(localX * Math.PI * 10);
      } else if (localX < 0.2) {
        circleY = centerY + amplitude * Math.sin((localX - 0.1) * Math.PI * 10);
      } else if (localX < 0.3) {
        circleY = centerY - amplitude * 1.2 * Math.sin((localX - 0.2) * Math.PI * 10);
      } else if (localX < 0.4) {
        circleY = centerY + amplitude * Math.sin((localX - 0.3) * Math.PI * 10);
      } else if (localX < 0.5) {
        circleY = centerY - amplitude * 0.6 * Math.sin((localX - 0.4) * Math.PI * 10);
      } else if (localX < 0.6) {
        circleY = centerY + amplitude * 0.4 * Math.sin((localX - 0.5) * Math.PI * 10);
      }

      ctx.fillStyle = '#ff0000';
      ctx.beginPath();
      ctx.arc(progressPixels, circleY, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ff3333';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }, [progress, isLiveStream, isYouTube]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || (isLiveStream && !isYouTube)) return; // Don't seek on live streams (but allow on YouTube)

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    const newTime = (percentage / 100) * duration;
    onSeek(newTime);
  };

  return (
    <div className="w-[90%] flex items-center justify-center my-2 gap-2">
      {isLiveStream && !isYouTube ? (
        // Para rádios ao vivo: centralizar "AO VIVO" sem linha
        <div className="flex-1 flex items-center justify-center py-6">
          <div className="text-sm text-red-600 font-bold">🔴 AO VIVO</div>
        </div>
      ) : (
        // Para músicas com duração: mostrar barra de progresso
        <>
          <div className="text-xs text-muted-foreground min-w-[35px]">
            {formatTime(currentTime)}
          </div>
          <div className="flex-1">
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              className="w-full h-12 cursor-pointer hover:opacity-80 transition-opacity"
              style={{ display: 'block' }}
            />
          </div>
          <div className="text-xs text-muted-foreground min-w-[35px]">
            {formatTime(duration)}
          </div>
        </>
      )}
    </div>
  );
};
