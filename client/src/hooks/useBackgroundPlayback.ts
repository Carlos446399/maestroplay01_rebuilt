/**
 * Hook para gerenciar reprodução em segundo plano e manter a tela ligada
 * Usa Screen Wake Lock API e Media Session API
 */

import { useEffect, useRef, useCallback } from 'react';

export const useBackgroundPlayback = (isPlaying: boolean) => {
  const wakeLockRef = useRef<any>(null);

  /**
   * Solicita Screen Wake Lock para manter a tela ligada durante a reprodução
   */
  const requestWakeLock = useCallback(async () => {
    try {
      // Verificar se a API está disponível
      if ('wakeLock' in navigator) {
        // Liberar lock anterior se existir
        if (wakeLockRef.current) {
          await wakeLockRef.current.release();
        }

        // Solicitar novo lock
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        console.log('Screen Wake Lock ativado');

        // Reativar lock se a página voltar a estar visível
        const handleVisibilityChange = async () => {
          if (document.visibilityState === 'visible' && isPlaying) {
            try {
              wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
              console.log('Screen Wake Lock reativado');
            } catch (err) {
              console.error('Erro ao reativar Wake Lock:', err);
            }
          }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
          document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
      }
    } catch (err) {
      console.error('Erro ao solicitar Screen Wake Lock:', err);
    }
  }, [isPlaying]);

  /**
   * Libera o Screen Wake Lock
   */
  const releaseWakeLock = useCallback(async () => {
    try {
      if (wakeLockRef.current) {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
        console.log('Screen Wake Lock liberado');
      }
    } catch (err) {
      console.error('Erro ao liberar Wake Lock:', err);
    }
  }, []);

  /**
   * Gerenciar Screen Wake Lock baseado no estado de reprodução
   */
  useEffect(() => {
    if (isPlaying) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }

    return () => {
      releaseWakeLock();
    };
  }, [isPlaying, requestWakeLock, releaseWakeLock]);

  return {
    requestWakeLock,
    releaseWakeLock,
  };
};
