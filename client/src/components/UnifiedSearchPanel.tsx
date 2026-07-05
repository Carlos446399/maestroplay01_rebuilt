import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search, X, Radio as RadioIcon, HardDrive, Youtube, Loader2, Music2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { radioStations } from '@/data/radioStations';
import { searchDriveFiles, getDriveThumbnail, AUDIO_MIME_TYPES, DriveItem } from '@/services/googleDriveService';
import { searchYouTube, YouTubeResult } from '@/services/youtubeService';

interface UnifiedSearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayRadio: (radioIndex: number) => void;
  onPlayDrive: (fileId: string, title: string, cover?: string) => void;
  onPlayYouTube: (videoId: string, title: string, thumbnail: string) => void;
}

/**
 * Busca unificada: procura ao mesmo tempo nas rádios (local, instantâneo),
 * no Google Drive (busca por nome em todo o Drive) e no YouTube — e mostra
 * os resultados agrupados por fonte.
 */
export const UnifiedSearchPanel = ({ isOpen, onClose, onPlayRadio, onPlayDrive, onPlayYouTube }: UnifiedSearchPanelProps) => {
  const [query, setQuery] = useState('');
  const [driveResults, setDriveResults] = useState<DriveItem[]>([]);
  const [youtubeResults, setYoutubeResults] = useState<YouTubeResult[]>([]);
  const [isSearchingDrive, setIsSearchingDrive] = useState(false);
  const [isSearchingYoutube, setIsSearchingYoutube] = useState(false);
  const [youtubeError, setYoutubeError] = useState<string | null>(null);
  const [driveError, setDriveError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const radioResults = query.trim()
    ? radioStations.filter(r =>
        r.name.toLowerCase().includes(query.toLowerCase()) ||
        r.genre.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setDriveResults([]);
      setYoutubeResults([]);
      setYoutubeError(null);
      setDriveError(null);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsSearchingDrive(true);
      setDriveError(null);
      try {
        const files = await searchDriveFiles(query);
        setDriveResults(files.filter(f => AUDIO_MIME_TYPES.has(f.mimeType)));
      } catch (err: any) {
        setDriveError(err?.message || 'Erro ao buscar no Drive');
      } finally {
        setIsSearchingDrive(false);
      }

      setIsSearchingYoutube(true);
      setYoutubeError(null);
      try {
        const result = await searchYouTube(query);
        setYoutubeResults(result.items.slice(0, 10));
      } catch (err: any) {
        setYoutubeError(err?.message || 'Erro ao buscar no YouTube');
      } finally {
        setIsSearchingYoutube(false);
      }
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  if (!isOpen) return null;

  const hasAnyResult = radioResults.length > 0 || driveResults.length > 0 || youtubeResults.length > 0;

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      <div className="flex items-center gap-2 px-3 pt-3 pb-2 border-b border-gray-100 flex-shrink-0">
        <Search size={14} className="text-gray-400 flex-shrink-0" />
        <input
          autoFocus
          type="text"
          placeholder="Buscar em rádios, Drive e YouTube..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="flex-1 text-sm focus:outline-none text-gray-800"
        />
        {query && (
          <button onClick={() => setQuery('')}>
            <X size={16} className="text-gray-400" />
          </button>
        )}
        <button onClick={onClose} className="text-red-500 hover:text-red-600 flex-shrink-0 ml-1">
          <ChevronDown size={22} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2">
        {!query.trim() ? (
          <p className="text-xs text-gray-400 text-center py-10">
            Digite algo para buscar em todas as suas fontes de música de uma vez.
          </p>
        ) : (
          <>
            {/* Rádios */}
            {radioResults.length > 0 && (
              <div className="mb-4">
                <p className="text-[11px] font-semibold text-gray-500 mb-2 flex items-center gap-1">
                  <RadioIcon size={12} /> Rádios
                </p>
                {radioResults.map(radio => {
                  const index = radioStations.findIndex(r => r.id === radio.id);
                  return (
                    <button
                      key={radio.id}
                      onClick={() => { onPlayRadio(index); onClose(); }}
                      className="w-full flex items-center gap-2 py-2 border-b border-gray-50 last:border-0 text-left"
                    >
                      <img src={radio.cover} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800 truncate">{radio.name}</p>
                        <p className="text-[10px] text-gray-400">{radio.genre}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Drive */}
            <div className="mb-4">
              <p className="text-[11px] font-semibold text-gray-500 mb-2 flex items-center gap-1">
                <HardDrive size={12} /> Google Drive
                {isSearchingDrive && <Loader2 size={11} className="animate-spin" />}
              </p>
              {driveError && <p className="text-[11px] text-red-500">{driveError}</p>}
              {!isSearchingDrive && !driveError && driveResults.length === 0 && (
                <p className="text-[11px] text-gray-400">Nenhum resultado no Drive.</p>
              )}
              {driveResults.map(file => (
                <button
                  key={file.id}
                  onClick={() => { onPlayDrive(file.id, file.name.replace(/\.[^/.]+$/, ''), getDriveThumbnail(file)); onClose(); }}
                  className="w-full flex items-center gap-2 py-2 border-b border-gray-50 last:border-0 text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {getDriveThumbnail(file) ? (
                      <img src={getDriveThumbnail(file)} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Music2 size={14} className="text-green-600" />
                    )}
                  </div>
                  <p className="flex-1 min-w-0 text-xs font-semibold text-gray-800 truncate">
                    {file.name.replace(/\.[^/.]+$/, '')}
                  </p>
                </button>
              ))}
            </div>

            {/* YouTube */}
            <div className="mb-4">
              <p className="text-[11px] font-semibold text-gray-500 mb-2 flex items-center gap-1">
                <Youtube size={12} /> YouTube
                {isSearchingYoutube && <Loader2 size={11} className="animate-spin" />}
              </p>
              {youtubeError && <p className="text-[11px] text-red-500">{youtubeError}</p>}
              {!isSearchingYoutube && !youtubeError && youtubeResults.length === 0 && (
                <p className="text-[11px] text-gray-400">Nenhum resultado no YouTube.</p>
              )}
              {youtubeResults.map(video => (
                <button
                  key={video.id}
                  onClick={() => { onPlayYouTube(video.id, video.title, video.thumbnail); onClose(); }}
                  className="w-full flex items-center gap-2 py-2 border-b border-gray-50 last:border-0 text-left"
                >
                  <img src={video.thumbnail} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate">{video.title}</p>
                    <p className="text-[10px] text-gray-400 truncate">{video.channelTitle}</p>
                  </div>
                </button>
              ))}
            </div>

            {!hasAnyResult && !isSearchingDrive && !isSearchingYoutube && (
              <p className="text-xs text-gray-400 text-center py-6">Nenhum resultado encontrado em nenhuma fonte.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};
