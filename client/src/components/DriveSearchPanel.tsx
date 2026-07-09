import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search, X, HardDrive, Loader2, Music2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { searchDriveFiles, getDriveThumbnail, AUDIO_MIME_TYPES, DriveItem } from '@/services/googleDriveService';

interface DriveSearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayDrive: (fileId: string, title: string, cover?: string) => void;
}

/**
 * Busca dedicada apenas ao Google Drive. Usa o mesmo padrão estrutural do
 * DrivePanel — painel SEMPRE montado no DOM, deslizando de baixo pra cima
 * via posição CSS (bottom-0 / -bottom-full), em vez de ser
 * montado/desmontado inteiro a cada abertura/fechamento. Esse padrão já
 * é usado em vários outros painéis do app sem problemas; a versão
 * anterior (fixed inset-0 + unmount total) causava crashes de DOM ao
 * digitar/apagar texto em alguns celulares.
 */
export const DriveSearchPanel = ({ isOpen, onClose, onPlayDrive }: DriveSearchPanelProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<DriveItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      setError(null);
      try {
        const files = await searchDriveFiles(query);
        setResults(files.filter(f => AUDIO_MIME_TYPES.has(f.mimeType)));
      } catch (err: any) {
        setError(err?.message || 'Erro ao buscar no Drive');
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Limpa a busca ao fechar o painel, com um pequeno atraso para não
  // trocar o conteúdo da lista durante a animação de fechamento.
  useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(() => {
        setQuery('');
        setResults([]);
        setError(null);
      }, 350);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  return (
    <div className={cn(
      "fixed left-0 w-full max-h-[75vh] z-30 transition-all duration-300 ease-in-out",
      "bg-white border-t-2 border-gray-200 flex flex-col",
      isOpen ? "bottom-0" : "-bottom-full"
    )}>
      <div className="flex items-center gap-2 px-3 pt-3 pb-2 border-b border-gray-100 flex-shrink-0">
        <HardDrive size={14} className="text-green-600 flex-shrink-0" />
        <input
          type="text"
          placeholder="Buscar músicas no Google Drive..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="flex-1 text-sm focus:outline-none text-gray-800 bg-transparent"
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
          <div className="text-center py-10">
            <Search size={22} className="text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-400">Digite o nome de uma música para buscar no seu Google Drive.</p>
          </div>
        ) : (
          <div>
            <p className="text-[11px] font-semibold text-gray-500 mb-2 flex items-center gap-1">
              {isSearching && <Loader2 size={11} className="animate-spin" />}
              {results.length > 0 && `${results.length} resultado(s)`}
            </p>
            {error && <p className="text-[11px] text-red-500 mb-2">{error}</p>}
            {!isSearching && !error && results.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-6">Nenhuma música encontrada com esse nome.</p>
            )}
            {results.map(file => (
              <button
                key={file.id}
                onClick={() => { onPlayDrive(file.id, file.name.replace(/\.[^/.]+$/, ''), getDriveThumbnail(file)); onClose(); }}
                className="w-full flex items-center gap-2 py-2 border-b border-gray-50 last:border-0 text-left"
              >
                <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {getDriveThumbnail(file) ? (
                    <img src={getDriveThumbnail(file)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Music2 size={16} className="text-green-600" />
                  )}
                </div>
                <p className="flex-1 min-w-0 text-sm font-semibold text-gray-800 truncate">
                  {file.name.replace(/\.[^/.]+$/, '')}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
