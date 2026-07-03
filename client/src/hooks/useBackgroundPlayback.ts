/**
 * Hook para gerenciar reprodução em segundo plano e manter a tela ligada
 * Usa Screen Wake Lock API e Media Session API
 */

import { useEffect, useRef, useCallback } from 'react';

export const useBackgroundPlayback = (isPlaying: boolean) => {
  const wakeLockRef = useRef<any>(null);
  // Guarda a função de limpeza do listener visibilitychange para evitar
  // acúmulo de listeners a cada ciclo de play/pause.
  const visibilityCleanupRef = useRef<(() => void) | null>(null);

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
          wakeLockRef.current = null;
        }

        // Remover listener anterior antes de adicionar um novo
        if (visibilityCleanupRef.current) {
          visibilityCleanupRef.current();
          visibilityCleanupRef.current = null;
        }

        // Solicitar novo lock
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        console.log('Screen Wake Lock ativado');

        // Reativar lock se a página voltar a estar visível
        const handleVisibilityChange = async () => {
          if (document.visibilityState === 'visible' && wakeLockRef.current === null) {
            try {
              wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
              console.log('Screen Wake Lock reativado');
            } catch (err) {
              console.error('Erro ao reativar Wake Lock:', err);
            }
          }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Armazena a função de limpeza para uso posterior
        visibilityCleanupRef.current = () => {
          document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
      }
    } catch (err) {
      console.error('Erro ao solicitar Screen Wake Lock:', err);
    }
  }, []);

  /**
   * Libera o Screen Wake Lock
   */
  const releaseWakeLock = useCallback(async () => {
    try {
      // Remove o listener de visibilidade ao liberar o lock
      if (visibilityCleanupRef.current) {
        visibilityCleanupRef.current();
        visibilityCleanupRef.current = null;
      }
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
