import { searchYouTube } from './youtubeService';

export interface CategoryPlaylist {
  categoryId: string;
  categoryName: string;
  tracks: Array<{
    id: string;
    title: string;
    thumbnail: string;
  }>;
  lastUpdated: number;
  nextPageToken?: string; // Para scroll infinito
}

const STORAGE_KEY = 'maestroplay_category_playlists';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 dias

export const categoryService = {
  async loadCategoryPlaylist(categoryId: string, categoryName: string, query: string, pageToken?: string): Promise<CategoryPlaylist> {
    // Se é primeira página, verificar cache
    if (!pageToken) {
      const cached = this.getCachedPlaylist(categoryId);
      if (cached) {
        return cached;
      }
    }

    // Buscar do YouTube - Carregar todas as músicas disponíveis
    try {
      const result = await searchYouTube(query, pageToken);
      
      // Se é primeira página, retornar novo
      if (!pageToken) {
        const playlist: CategoryPlaylist = {
          categoryId,
          categoryName,
          tracks: result.items.filter((track: any) => track.id),
          lastUpdated: Date.now(),
          nextPageToken: result.nextPageToken,
        };

        // Salvar no localStorage
        this.saveCategoryPlaylist(playlist);
        return playlist;
      }

      // Se é página subsequente, retornar apenas os novos itens e nextPageToken
      return {
        categoryId,
        categoryName,
        tracks: result.items.filter((track: any) => track.id),
        lastUpdated: Date.now(),
        nextPageToken: result.nextPageToken,
      };
    } catch (error) {
      console.error(`Erro ao carregar playlist da categoria ${categoryName}:`, error);
      throw error;
    }
  },

  getCachedPlaylist(categoryId: string): CategoryPlaylist | null {
    try {
      const playlists = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      const playlist = playlists[categoryId];

      if (playlist && Date.now() - playlist.lastUpdated < CACHE_DURATION) {
        return playlist;
      }

      // Se expirou, remover do cache
      if (playlist) {
        delete playlists[categoryId];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(playlists));
      }

      return null;
    } catch (error) {
      console.error('Erro ao recuperar playlist em cache:', error);
      return null;
    }
  },

  saveCategoryPlaylist(playlist: CategoryPlaylist): void {
    try {
      const playlists = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      playlists[playlist.categoryId] = playlist;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(playlists));
    } catch (error) {
      console.error('Erro ao salvar playlist em cache:', error);
    }
  },

  getAllCachedPlaylists(): CategoryPlaylist[] {
    try {
      const playlists = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return (Object.values(playlists) as CategoryPlaylist[]).filter(p => {
        return Date.now() - p.lastUpdated < CACHE_DURATION;
      });
    } catch (error) {
      console.error('Erro ao recuperar todas as playlists:', error);
      return [];
    }
  },

  clearCache(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
    }
  },

  clearExpiredPlaylists(): void {
    try {
      const playlists = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      const now = Date.now();
      
      Object.keys(playlists).forEach(key => {
        if (now - playlists[key].lastUpdated > CACHE_DURATION) {
          delete playlists[key];
        }
      });

      localStorage.setItem(STORAGE_KEY, JSON.stringify(playlists));
    } catch (error) {
      console.error('Erro ao limpar playlists expiradas:', error);
    }
  },
};
