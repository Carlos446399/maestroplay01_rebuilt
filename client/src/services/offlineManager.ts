/**
 * Gerenciador de funcionalidades offline para o PWA
 * Sincroniza estado do player e gerencia cache de recursos
 */

interface PlaybackState {
  currentTrackIndex: number;
  currentRadioIndex: number;
  currentSource: 'tracks' | 'radios';
  currentTime: number;
  isPlaying: boolean;
  volume: number;
}

const STORAGE_KEYS = {
  PLAYBACK_STATE: 'maestroplay_playback_state',
  CACHED_TRACKS: 'maestroplay_cached_tracks',
  LAST_SYNC: 'maestroplay_last_sync',
};

const CACHE_NAMES = {
  STATIC: 'maestroplay-static-v1',
  AUDIO: 'maestroplay-audio-v1',
  IMAGES: 'maestroplay-images-v1',
};

export const offlineManager = {
  /**
   * Salvar estado de reprodução para recuperação offline
   */
  savePlaybackState: async (state: PlaybackState): Promise<void> => {
    try {
      localStorage.setItem(STORAGE_KEYS.PLAYBACK_STATE, JSON.stringify(state));
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
    } catch (error) {
      console.warn('Erro ao salvar estado de reprodução:', error);
    }
  },

  /**
   * Recuperar estado de reprodução salvo
   */
  getPlaybackState: (): PlaybackState | null => {
    try {
      const state = localStorage.getItem(STORAGE_KEYS.PLAYBACK_STATE);
      return state ? JSON.parse(state) : null;
    } catch (error) {
      console.warn('Erro ao recuperar estado de reprodução:', error);
      return null;
    }
  },

  /**
   * Limpar estado de reprodução
   */
  clearPlaybackState: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEYS.PLAYBACK_STATE);
    } catch (error) {
      console.warn('Erro ao limpar estado de reprodução:', error);
    }
  },

  /**
   * Verificar se está offline
   */
  isOffline: (): boolean => {
    return !navigator.onLine;
  },

  /**
   * Registrar listener para mudanças de conectividade
   */
  onConnectivityChange: (callback: (isOnline: boolean) => void): (() => void) => {
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  },

  /**
   * Pré-cachear recursos estáticos
   */
  precacheStaticAssets: async (): Promise<void> => {
    if (!('caches' in window)) return;

    try {
      const cache = await caches.open(CACHE_NAMES.STATIC);
      const assetsToCache = [
        '/',
        '/index.html',
        '/manifest.webmanifest',
      ];

      await cache.addAll(assetsToCache);
      console.log('Recursos estáticos pré-cacheados com sucesso');
    } catch (error) {
      console.warn('Erro ao pré-cachear recursos estáticos:', error);
    }
  },

  /**
   * Cachear áudio quando disponível
   */
  cacheAudioFile: async (url: string, filename: string): Promise<void> => {
    if (!('caches' in window)) return;

    try {
      const cache = await caches.open(CACHE_NAMES.AUDIO);
      const response = await fetch(url);

      if (response.ok) {
        cache.put(url, response.clone());
        console.log(`Áudio cacheado: ${filename}`);
      }
    } catch (error) {
      console.warn(`Erro ao cachear áudio ${filename}:`, error);
    }
  },

  /**
   * Cachear imagem de capa
   */
  cacheImage: async (url: string): Promise<void> => {
    if (!('caches' in window)) return;

    try {
      const cache = await caches.open(CACHE_NAMES.IMAGES);
      const response = await fetch(url);

      if (response.ok) {
        cache.put(url, response.clone());
      }
    } catch (error) {
      console.warn('Erro ao cachear imagem:', error);
    }
  },

  /**
   * Obter recurso do cache com fallback para rede
   */
  getCachedOrFetch: async (url: string): Promise<Response | null> => {
    if (!('caches' in window)) {
      return fetch(url);
    }

    try {
      // Tentar obter do cache primeiro
      const cached = await caches.match(url);
      if (cached) {
        return cached;
      }

      // Se não estiver em cache, buscar da rede
      if (navigator.onLine) {
        const response = await fetch(url);
        if (response.ok) {
          // Cachear para uso futuro
          const cache = await caches.open(CACHE_NAMES.STATIC);
          cache.put(url, response.clone());
        }
        return response;
      }

      return null;
    } catch (error) {
      console.warn('Erro ao obter recurso:', error);
      return null;
    }
  },

  /**
   * Limpar cache antigo
   */
  cleanupOldCaches: async (): Promise<void> => {
    if (!('caches' in window)) return;

    try {
      const cacheNames = await caches.keys();
      const validCaches = Object.values(CACHE_NAMES);

      await Promise.all(
        cacheNames.map(name => {
          if (!validCaches.includes(name)) {
            return caches.delete(name);
          }
        })
      );

      console.log('Cache antigo limpo');
    } catch (error) {
      console.warn('Erro ao limpar cache antigo:', error);
    }
  },

  /**
   * Obter tamanho do cache
   */
  getCacheSize: async (): Promise<number> => {
    if (!('storage' in navigator) || !('estimate' in navigator.storage)) {
      return 0;
    }

    try {
      const estimate = await navigator.storage.estimate();
      return estimate.usage || 0;
    } catch (error) {
      console.warn('Erro ao obter tamanho do cache:', error);
      return 0;
    }
  },

  /**
   * Limpar todo o cache
   */
  clearAllCaches: async (): Promise<void> => {
    if (!('caches' in window)) return;

    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      console.log('Todo o cache foi limpo');
    } catch (error) {
      console.warn('Erro ao limpar cache:', error);
    }
  },

  /**
   * Sincronizar dados quando voltar online
   */
  syncOnOnline: (callback: () => Promise<void>): (() => void) => {
    const handleOnline = async () => {
      console.log('Voltou online, sincronizando dados...');
      try {
        await callback();
      } catch (error) {
        console.error('Erro ao sincronizar dados:', error);
      }
    };

    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  },
};
