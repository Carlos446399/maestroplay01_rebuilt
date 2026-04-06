/**
 * Hook para gerenciar o efeito 8D Audio (panorama circular imersivo)
 * Usa Web Audio API para criar uma sensação de som girando ao redor da cabeça
 */

import { useRef, useEffect, useCallback } from 'react';

export interface Audio8DConfig {
  enabled: boolean;
  speed: number; // 0.5 a 2.0 (velocidade de rotação)
  intensity: number; // 0 a 1 (intensidade do efeito)
}

export const use8DAudio = (audioRef: React.RefObject<HTMLAudioElement>) => {
  const pannerRef = useRef<StereoPannerNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSource | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const isInitializedRef = useRef(false);

  /**
   * Inicializa o contexto de áudio e cria os nós necessários para o efeito 8D
   */
  const initialize8DAudio = useCallback(() => {
    if (isInitializedRef.current || !audioRef?.current) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      audioContextRef.current = audioContext;

      // Criar source se não existir
      if (!sourceRef.current) {
        sourceRef.current = audioContext.createMediaElementAudioSource(audioRef.current);
      }

      // Criar StereoPanner para o efeito 8D
      const panner = audioContext.createStereoPanner();
      panner.pan.value = 0; // Começa no centro
      pannerRef.current = panner;

      // Conectar: source -> panner -> destination
      sourceRef.current.connect(panner);
      panner.connect(audioContext.destination);

      isInitializedRef.current = true;
    } catch (error) {
      console.error('Erro ao inicializar 8D Audio:', error);
    }
  }, [audioRef]);

  /**
   * Ativa o efeito 8D com oscilação suave
   */
  const enable8D = useCallback((speed: number = 1, intensity: number = 1) => {
    if (!pannerRef.current || !audioContextRef.current) {
      initialize8DAudio();
      if (!pannerRef.current || !audioContextRef.current) return;
    }

    const audioContext = audioContextRef.current;
    const panner = pannerRef.current;

    // Parar oscilação anterior se existir
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
      } catch (e) {
        // Já parou
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
  }, [initialize8DAudio]);

  /**
   * Desativa o efeito 8D
   */
  const disable8D = useCallback(() => {
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
        oscillatorRef.current = null;
      } catch (e) {
        // Já parou
      }
    }

    if (pannerRef.current) {
      pannerRef.current.pan.value = 0; // Voltar ao centro
    }
  }, []);

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
    initialize8DAudio,
    enable8D,
    disable8D,
    setSpeed,
    setIntensity,
  };
};
