/**
 * Cache Service - Gerencia cache de buscas e vídeos para otimizar quota da API
 * Implementa estratégias para contornar limites da API do YouTube
 */

interface CachedSearch {
  query: string;
  results: any[];
  timestamp: number;
  expiresIn: number; // em ms
}

interface QuotaUsage {
  date: string; // YYYY-MM-DD
  searchCount: number;
  lastReset: number;
}

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas
const SEARCH_LIMIT_PER_DAY = 50; // Limite de buscas por dia por usuário
const CACHE_KEY_SEARCHES = 'maestro_cached_searches';
const CACHE_KEY_QUOTA = 'maestro_quota_usage';

export class CacheService {
  /**
   * Buscar resultado em cache
   */
  static getFromCache(query: string): any[] | null {
    try {
      const cached = localStorage.getItem(CACHE_KEY_SEARCHES);
      if (!cached) return null;

      const searches: CachedSearch[] = JSON.parse(cached);
      const found = searches.find(
        s => s.query.toLowerCase() === query.toLowerCase()
      );

      if (!found) return null;

      // Verificar se expirou
      const now = Date.now();
      if (now - found.timestamp > found.expiresIn) {
        // Remover do cache
        this.removeFromCache(query);
        return null;
      }

      return found.results;
    } catch (error) {
      console.error('Erro ao buscar cache:', error);
      return null;
    }
  }

  /**
   * Salvar resultado em cache
   */
  static saveToCache(query: string, results: any[]): void {
    try {
      let searches: CachedSearch[] = [];
      const cached = localStorage.getItem(CACHE_KEY_SEARCHES);

      if (cached) {
        searches = JSON.parse(cached);
      }

      // Remover busca anterior se existir
      searches = searches.filter(
        s => s.query.toLowerCase() !== query.toLowerCase()
      );

      // Adicionar nova busca
      searches.push({
        query,
        results,
        timestamp: Date.now(),
        expiresIn: CACHE_DURATION,
      });

      // Limitar a 100 buscas em cache
      if (searches.length > 100) {
        searches = searches.slice(-100);
      }

      localStorage.setItem(CACHE_KEY_SEARCHES, JSON.stringify(searches));
    } catch (error) {
      console.error('Erro ao salvar cache:', error);
    }
  }

  /**
   * Remover busca do cache
   */
  static removeFromCache(query: string): void {
    try {
      const cached = localStorage.getItem(CACHE_KEY_SEARCHES);
      if (!cached) return;

      let searches: CachedSearch[] = JSON.parse(cached);
      searches = searches.filter(
        s => s.query.toLowerCase() !== query.toLowerCase()
      );

      localStorage.setItem(CACHE_KEY_SEARCHES, JSON.stringify(searches));
    } catch (error) {
      console.error('Erro ao remover cache:', error);
    }
  }

  /**
   * Limpar todo o cache
   */
  static clearCache(): void {
    try {
      localStorage.removeItem(CACHE_KEY_SEARCHES);
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
    }
  }

  /**
   * Registrar busca na quota diária
   */
  static recordSearch(): boolean {
    try {
      const today = new Date().toISOString().split('T')[0];
      const quotaData = localStorage.getItem(CACHE_KEY_QUOTA);

      let quota: QuotaUsage = {
        date: today,
        searchCount: 0,
        lastReset: Date.now(),
      };

      if (quotaData) {
        quota = JSON.parse(quotaData);

        // Resetar se for um novo dia
        if (quota.date !== today) {
          quota = {
            date: today,
            searchCount: 0,
            lastReset: Date.now(),
          };
        }
      }

      // Verificar se atingiu limite
      if (quota.searchCount >= SEARCH_LIMIT_PER_DAY) {
        return false;
      }

      quota.searchCount++;
      localStorage.setItem(CACHE_KEY_QUOTA, JSON.stringify(quota));
      return true;
    } catch (error) {
      console.error('Erro ao registrar busca:', error);
      return true; // Permitir busca em caso de erro
    }
  }

  /**
   * Obter uso de quota do dia
   */
  static getQuotaUsage(): {
    used: number;
    limit: number;
    remaining: number;
    percentage: number;
  } {
    try {
      const today = new Date().toISOString().split('T')[0];
      const quotaData = localStorage.getItem(CACHE_KEY_QUOTA);

      if (!quotaData) {
        return {
          used: 0,
          limit: SEARCH_LIMIT_PER_DAY,
          remaining: SEARCH_LIMIT_PER_DAY,
          percentage: 0,
        };
      }

      const quota: QuotaUsage = JSON.parse(quotaData);

      // Resetar se for um novo dia
      if (quota.date !== today) {
        return {
          used: 0,
          limit: SEARCH_LIMIT_PER_DAY,
          remaining: SEARCH_LIMIT_PER_DAY,
          percentage: 0,
        };
      }

      const remaining = Math.max(0, SEARCH_LIMIT_PER_DAY - quota.searchCount);
      const percentage = (quota.searchCount / SEARCH_LIMIT_PER_DAY) * 100;

      return {
        used: quota.searchCount,
        limit: SEARCH_LIMIT_PER_DAY,
        remaining,
        percentage,
      };
    } catch (error) {
      console.error('Erro ao obter quota:', error);
      return {
        used: 0,
        limit: SEARCH_LIMIT_PER_DAY,
        remaining: SEARCH_LIMIT_PER_DAY,
        percentage: 0,
      };
    }
  }

  /**
   * Resetar quota (para testes)
   */
  static resetQuota(): void {
    try {
      localStorage.removeItem(CACHE_KEY_QUOTA);
    } catch (error) {
      console.error('Erro ao resetar quota:', error);
    }
  }

  /**
   * Obter lista de buscas em cache
   */
  static getCachedSearches(): string[] {
    try {
      const cached = localStorage.getItem(CACHE_KEY_SEARCHES);
      if (!cached) return [];

      const searches: CachedSearch[] = JSON.parse(cached);
      return searches.map(s => s.query);
    } catch (error) {
      console.error('Erro ao obter buscas em cache:', error);
      return [];
    }
  }
}
