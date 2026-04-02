import { cn } from '@/lib/utils';

interface AlbumArtProps {
  src: string;
  alt: string;
  isPlaying: boolean;
  className?: string;
}

export const AlbumArt = ({ src, alt, isPlaying, className }: AlbumArtProps) => {
  return (
    <div className={cn(
      "w-[40vw] h-[40vw] max-w-[150px] max-h-[150px]",
      "rounded-full my-2",
      "flex items-center justify-center",
      "border-2 border-white/20",
      isPlaying && "rotating-cover",
      className
    )}>
      <img 
        src={src} 
        alt={alt}
        className="w-[90%] h-[90%] rounded-full object-cover"
      />
    </div>
  );
};
