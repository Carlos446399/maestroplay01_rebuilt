/**
 * audioGraph - Gerencia um único AudioContext e MediaElementAudioSourceNode
 * compartilhados para um elemento <audio>.
 *
 * A Web Audio API só permite criar UM MediaElementAudioSourceNode por elemento
 * <audio>. Como vários componentes (AudioVisualizer, EqualizerPanel, use8DAudio)
 * precisam se conectar ao mesmo elemento, chamar `createMediaElementSource`
 * mais de uma vez gera `InvalidStateError` e quebra o efeito silenciosamente.
 *
 * Este módulo garante que o AudioContext e o source node sejam criados uma
 * única vez por elemento de áudio e reaproveitados por todos os consumidores.
 */

interface AudioGraphEntry {
  audioContext: AudioContext;
  source: MediaElementAudioSourceNode;
}

const graphMap = new WeakMap<HTMLAudioElement, AudioGraphEntry>();

/**
 * Retorna (criando se necessário) o AudioContext e o MediaElementAudioSourceNode
 * compartilhados para o elemento de áudio informado.
 */
export const getSharedAudioGraph = (audioElement: HTMLAudioElement): AudioGraphEntry => {
  const existing = graphMap.get(audioElement);
  if (existing) {
    if (existing.audioContext.state === 'suspended') {
      existing.audioContext.resume().catch(() => {});
    }
    return existing;
  }

  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

  if (audioContext.state === 'suspended') {
    audioContext.resume().catch(() => {});
  }

  const source = audioContext.createMediaElementSource(audioElement);

  // CRÍTICO: conectar o source ao destination (alto-falantes).
  // Sem essa conexão, o áudio nunca sai do elemento, mesmo tocando
  // normalmente (currentTime avança, mas nenhum som é produzido).
  // Isso afeta TUDO que usa este elemento de áudio: faixas locais e rádios.
  source.connect(audioContext.destination);

  const entry: AudioGraphEntry = { audioContext, source };
  graphMap.set(audioElement, entry);
  return entry;
};
