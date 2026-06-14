/**
 * Hook para gerenciar o efeito 8D Audio (panorama circular imersivo)
 * Usa Web Audio API para criar uma sensação de som girando ao redor da cabeça
 *
 * Importante: este hook NÃO cria seu próprio AudioContext/source. Ele opera
 * sobre um StereoPannerNode que já faz parte da cadeia de áudio compartilhada
 * (ver lib/audioGraph.ts e EqualizerPanel). Isso evita o erro
 * "InvalidStateError: HTMLMediaElement already connected" causado por criar
 * múltiplos MediaElementAudioSourceNode para o mesmo <audio>, e evita que o
 * áudio seja reproduzido em paralelo por dois caminhos diferentes.
 */

import { useRef, useEffect, useCallback } from 'react';

export interface Audio8DConfig {
  enabled: boolean;
  speed: number; // 0.5 a 2.0 (velocidade de rotação)
  intensity: number; // 0 a 1 (intensidade do efeito)
}

export const use8DAudio = (
  audioContext: AudioContext | null,
  panner: StereoPannerNode | null
) => {
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  /**
   * Ativa o efeito 8D com oscilação suave
   */
  const enable8D = useCallback((speed: number = 1, intensity: number = 1) => {
    if (!audioContext || !panner) return;

    // Parar oscilação anterior se existir
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      } catch (e) {
        // Já parou
      }
    }
    if (gainRef.current) {
      try {
        gainRef.current.disconnect();
      } catch (e) {
        // Já desconectado
      }
    }

    // Criar oscilador para controlar o panorama
    const oscillator = audioContext.createOscillator();
    oscillator.type = 'sine'; // Onda senoidal para movimento suave
    oscillator.frequency.value = 0.5 * speed; // Frequência de rotação (0.5 Hz base * speed)

    // Criar gain para controlar a intensidade
    const gain = audioContext.createGain();
    gain.gain.value = intensity; // Intensidade do efeito (0 a 1)

    // Conectar: oscillator -> gain -> panner.pan
    oscillator.connect(gain);
    gain.connect(panner.pan);

    // Iniciar oscilador
    oscillator.start();

    oscillatorRef.current = oscillator;
    gainRef.current = gain;
  }, [audioContext, panner]);

  /**
   * Desativa o efeito 8D
   */
  const disable8D = useCallback(() => {
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      } catch (e) {
        // Já parou
      }
      oscillatorRef.current = null;
    }

    if (gainRef.current) {
      try {
        gainRef.current.disconnect();
      } catch (e) {
        // Já desconectado
      }
      gainRef.current = null;
    }

    if (panner) {
      panner.pan.value = 0; // Voltar ao centro
    }
  }, [panner]);

  /**
   * Atualiza a velocidade do efeito 8D em tempo real
   */
  const setSpeed = useCallback((speed: number) => {
    if (oscillatorRef.current) {
      oscillatorRef.current.frequency.value = 0.5 * speed;
    }
  }, []);

  /**
   * Atualiza a intensidade do efeito 8D em tempo real
   */
  const setIntensity = useCallback((intensity: number) => {
    if (gainRef.current) {
      gainRef.current.gain.value = intensity;
    }
  }, []);

  /**
   * Cleanup ao desmontar
   */
  useEffect(() => {
    return () => {
      disable8D();
    };
  }, [disable8D]);

  return {
    enable8D,
    disable8D,
    setSpeed,
    setIntensity,
  };
};
