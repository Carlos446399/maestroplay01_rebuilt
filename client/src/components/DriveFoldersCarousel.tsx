import { useEffect, useState } from 'react';
import { FolderOpen } from 'lucide-react';
import { listFolderContents, cleanFolderName, FOLDER_MIME, DriveItem } from '@/services/googleDriveService';

const ROOT_FOLDER_ID = '1zqRZc6TRZkQafTOhCokzyD6HUWpTQusx';
const CACHE_KEY = 'maestroplay_drive_folders_cache';

interface DriveFoldersCarouselProps {
  /** Abre o painel do Drive já dentro da pasta escolhida, mostrando as músicas */
  onOpenFolder: (folder: { id: string; name: string }) => void;
}

/**
 * Mostra as subpastas da raiz do Google Drive como cards horizontais, no
 * mesmo formato/estrutura do carrossel de categorias (quadrado fixo com
 * ícone + nome dentro dele). Tocar num card abre o painel do Drive já
 * dentro daquela pasta, com a lista de músicas — igual abrir uma playlist.
 *
 * Usa um cache rápido em localStorage (persiste entre aberturas do
 * app, não só na mesma sessão): mostra a última lista conhecida na hora
 * (sem esperar a rede) e atualiza silenciosamente por trás — evita a
 * demora perceptível de esperar a API do Drive responder toda vez que a
 * tela inicial abre, mesmo depois de fechar e reabrir o app.
 */
export const DriveFoldersCarousel = ({ onOpenFolder }: DriveFoldersCarouselProps) => {
  const [folders, setFolders] = useState<DriveItem[]>(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [isLoading, setIsLoading] = useState(folders.length === 0);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    listFolderContents(ROOT_FOLDER_ID)
      .then(items => {
        if (cancelled) return;
        const onlyFolders = items.filter(i => i.mimeType === FOLDER_MIME);
        setFolders(onlyFolders);
        setError(false);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(onlyFolders));
        } catch {
          // localStorage indisponível/cheio — sem problema, só não cacheia
        }
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  // Não mostra nada se ainda não carregou (e não há cache), deu erro sem
  // ter cache, ou não há pastas
  if ((isLoading && folders.length === 0) || (error && folders.length === 0) || folders.length === 0) return null;

  return (
    <div className="flex gap-2 px-2 py-1 mt-1 overflow-x-auto custom-scrollbar w-full">
      {folders.map((folder) => (
        <button
          key={folder.id}
          onClick={() => onOpenFolder({ id: folder.id, name: folder.name })}
          className="flex-shrink-0 w-[58px] h-[58px] rounded cursor-pointer p-1
            flex flex-col items-center justify-center
            transition-all duration-200 hover:scale-105 active:scale-95
            bg-gradient-to-br from-emerald-600 to-teal-700 shadow-lg hover:shadow-xl
            group relative overflow-hidden"
        >
          {/* Overlay escuro ao hover */}
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />

          {/* Conteúdo */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full">
            <FolderOpen className="text-white mb-0.5" size={18} />
            <span className="text-white font-bold text-[7px] text-center leading-tight truncate px-0.5 w-full">
              {cleanFolderName(folder.name)}
            </span>
          </div>

          {/* Efeito de brilho */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent
            transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
        </button>
      ))}
      {/* Espaçador no final para o último card não ficar colado na borda */}
      <div className="flex-shrink-0 w-1" />
    </div>
  );
};
