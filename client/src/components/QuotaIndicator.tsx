/**
 * Quota Indicator - Mostra o uso de quota de buscas do YouTube
 */

import { CacheService } from '@/services/cacheService';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, TrendingDown } from 'lucide-react';

export const QuotaIndicator = () => {
  const [quota, setQuota] = useState(CacheService.getQuotaUsage());
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Atualizar quota a cada 5 segundos
    const interval = setInterval(() => {
      setQuota(CacheService.getQuotaUsage());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    if (quota.percentage > 80) return 'text-red-500';
    if (quota.percentage > 50) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getProgressColor = () => {
    if (quota.percentage > 80) return 'bg-red-600';
    if (quota.percentage > 50) return 'bg-yellow-600';
    return 'bg-green-600';
  };

  return (
    <div className="fixed bottom-24 right-4 z-40">
      {/* Botão de quota */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300',
          'bg-black/80 backdrop-blur-sm border border-gray-700 hover:border-gray-500',
          isExpanded ? 'w-auto' : 'w-12 h-12 justify-center'
        )}
      >
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-gray-700"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray={`${(quota.percentage / 100) * 282.7} 282.7`}
                className={cn('transition-all duration-300', getStatusColor())}
                style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
              />
              <text
                x="50"
                y="55"
                textAnchor="middle"
                className="text-xs font-bold fill-white"
              >
                {Math.round(quota.percentage)}%
              </text>
            </svg>
          </div>

          {isExpanded && (
            <div className="flex flex-col gap-1 ml-2">
              <span className="text-xs font-semibold text-white">
                {quota.used}/{quota.limit} buscas
              </span>
              <span className={cn('text-[10px] font-medium', getStatusColor())}>
                {quota.remaining} restantes
              </span>
            </div>
          )}
        </div>
      </button>

      {/* Painel expandido */}
      {isExpanded && (
        <div className="absolute bottom-16 right-0 w-64 bg-black/90 backdrop-blur-sm border border-gray-700 rounded-lg p-4 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">Quota Diária</h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-white text-lg"
            >
              ×
            </button>
          </div>

          {/* Status */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">Buscas usadas</span>
              <span className={cn('text-sm font-bold', getStatusColor())}>
                {quota.used}/{quota.limit}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={cn('h-full transition-all duration-300', getProgressColor())}
                style={{ width: `${quota.percentage}%` }}
              />
            </div>

            {/* Remaining */}
            <div className="mt-2 text-xs text-gray-400">
              <span>{quota.remaining} buscas restantes hoje</span>
            </div>
          </div>

          {/* Aviso */}
          {quota.percentage > 80 && (
            <div className="flex items-start gap-2 p-2 bg-red-900/30 border border-red-600/50 rounded">
              <AlertCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
              <span className="text-[10px] text-red-300">
                Você está próximo do limite diário. Considere usar buscas em cache.
              </span>
            </div>
          )}

          {/* Info */}
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="text-[10px] text-gray-500 space-y-1">
              <p>💡 <strong>Dica:</strong> Use as categorias pré-carregadas para economizar quota.</p>
              <p>🔄 A quota é resetada diariamente à meia-noite.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
