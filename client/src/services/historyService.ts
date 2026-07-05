/**
 * historyService - Registra o que foi tocado (contagem por música) e o
 * tempo total de escuta, tudo em localStorage. Usado pela tela de
 * estatísticas ("mais tocadas", tempo total ouvido).
 */

export interface HistoryEntry {
  id: string;
  name: string;
  cover?: string;
  source: 'local' | 'radio' | 'drive' | 'youtube';
  count: number;
  lastPlayedAt: number;
}

const HISTORY_KEY = 'maestroplay_play_history';
const LISTEN_TIME_KEY = 'maestroplay_total_listen_seconds';

const readHistory = (): Record<string, HistoryEntry> => {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const writeHistory = (data: Record<string, HistoryEntry>) => {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(data));
  } catch {
    // localStorage indisponível/cheio — ignora silenciosamente
  }
};

/** Registra que uma música começou a tocar (incrementa a contagem) */
export const recordPlay = (entry: { id: string; name: string; cover?: string; source: HistoryEntry['source'] }) => {
  const data = readHistory();
  const existing = data[entry.id];
  data[entry.id] = {
    id: entry.id,
    name: entry.name,
    cover: entry.cover,
    source: entry.source,
    count: (existing?.count || 0) + 1,
    lastPlayedAt: Date.now(),
  };
  writeHistory(data);
};

/** Retorna as músicas mais tocadas, ordenadas por contagem */
export const getTopPlayed = (limit = 10): HistoryEntry[] => {
  const data = readHistory();
  return Object.values(data)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
};

/** Retorna as músicas tocadas mais recentemente */
export const getRecentHistory = (limit = 10): HistoryEntry[] => {
  const data = readHistory();
  return Object.values(data)
    .sort((a, b) => b.lastPlayedAt - a.lastPlayedAt)
    .slice(0, limit);
};

/** Soma segundos ao tempo total de escuta acumulado */
export const addListenSeconds = (seconds: number) => {
  try {
    const current = Number(localStorage.getItem(LISTEN_TIME_KEY) || '0');
    localStorage.setItem(LISTEN_TIME_KEY, String(current + seconds));
  } catch {
    // ignora
  }
};

/** Retorna o tempo total de escuta formatado (ex: "3h 42min") */
export const getTotalListenTimeFormatted = (): string => {
  const totalSeconds = Number(localStorage.getItem(LISTEN_TIME_KEY) || '0');
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours === 0) return `${minutes} min`;
  return `${hours}h ${minutes}min`;
};

/** Número total de reproduções registradas (soma de todas as contagens) */
export const getTotalPlaysCount = (): number => {
  const data = readHistory();
  return Object.values(data).reduce((sum, e) => sum + e.count, 0);
};
