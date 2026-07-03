/**
 * favoritesStorage - Gerencia a lista de músicas favoritas/salvas,
 * persistida em localStorage para sobreviver a reloads e fechamentos do app.
 *
 * Suporta faixas locais, rádios, músicas do YouTube e arquivos do Google Drive.
 */

export interface FavoriteSong {
  id: string;
  name: string;
  cover?: string;
  type: 'local' | 'radio' | 'youtube' | 'drive';
  /** Para músicas do YouTube: o videoId usado para reproduzir */
  youtubeId?: string;
  addedAt: number;
}

const STORAGE_KEY = 'maestroplay_favorites';

const readAll = (): FavoriteSong[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
};

const writeAll = (favorites: FavoriteSong[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.error('Erro ao salvar favoritos:', error);
  }
};

export const favoritesStorage = {
  getAll(): FavoriteSong[] {
    return readAll().sort((a, b) => b.addedAt - a.addedAt);
  },

  has(id: string): boolean {
    return readAll().some((f) => f.id === id);
  },

  add(song: Omit<FavoriteSong, 'addedAt'>): FavoriteSong[] {
    const all = readAll();
    if (all.some((f) => f.id === song.id)) return all;
    const updated = [...all, { ...song, addedAt: Date.now() }];
    writeAll(updated);
    return updated;
  },

  remove(id: string): FavoriteSong[] {
    const updated = readAll().filter((f) => f.id !== id);
    writeAll(updated);
    return updated;
  },

  toggle(song: Omit<FavoriteSong, 'addedAt'>): FavoriteSong[] {
    return this.has(song.id) ? this.remove(song.id) : this.add(song);
  },

  clear() {
    writeAll([]);
  },
};
