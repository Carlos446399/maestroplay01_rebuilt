/**
 * hlsPlayer - Reproduz streams HLS (.m3u8) em um elemento <audio>.
 *
 * Navegadores baseados em WebKit (Safari/iOS) suportam HLS nativamente via
 * `canPlayType`. Chrome, Firefox e a maioria dos navegadores Android NÃO
 * suportam, então um `<audio src="...m3u8">` simplesmente falha em silêncio
 * — esse era o motivo das rádios não funcionarem. Para esses navegadores,
 * usamos hls.js para fazer o "demuxing" do stream e alimentar o elemento via
 * Media Source Extensions.
 *
 * hls.js é carregado dinamicamente (code-splitting) para não pesar no bundle
 * inicial de quem nunca usa rádios — só é baixado quando alguém toca uma
 * estação HLS pela primeira vez.
 */

import type Hls from 'hls.js';

let activeHls: Hls | null = null;
// Token que identifica a chamada de loadAudioSource mais recente. Usado para
// evitar que uma importação assíncrona "atrasada" de hls.js configure o
// player depois que o usuário já trocou de estação (condição de corrida).
let loadToken = 0;

const isHlsUrl = (url: string) => /\.m3u8(\?.*)?$/i.test(url);

export interface LoadAudioSourceCallbacks {
  /** Chamado quando o stream encontra um erro fatal e não pode ser recuperado */
  onFatalError?: (message: string) => void;
  /**
   * Chamado assim que a fonte de áudio está pronta para receber play().
   * Para fontes síncronas (arquivo comum, HLS nativo do Safari) dispara
   * imediatamente. Para HLS via hls.js (carregado sob demanda) dispara
   * depois que o hls.js termina de carregar e anexar a mídia — evita
   * chamar play() num <audio> ainda sem fonte nenhuma, o que antes causava
   * falhas intermitentes (parecia que a rádio "às vezes não funcionava").
   */
  onSourceReady?: () => void;
}

/**
 * Carrega e inicia a reprodução de uma URL no elemento de áudio fornecido.
 * Lida automaticamente com streams HLS (.m3u8) e com áudio comum.
 */
export const loadAudioSource = (
  audio: HTMLAudioElement,
  url: string,
  callbacks?: LoadAudioSourceCallbacks
) => {
  const currentToken = ++loadToken;

  // Limpar instância anterior do hls.js, se houver
  if (activeHls) {
    activeHls.destroy();
    activeHls = null;
  }

  if (!isHlsUrl(url)) {
    audio.removeAttribute('data-hls');
    audio.src = url;
    callbacks?.onSourceReady?.();
    return;
  }

  // Streams .m3u8: alguns navegadores (Safari/iOS) suportam nativamente
  const canPlayNativeHls = audio.canPlayType('application/vnd.apple.mpegurl') !== '';

  if (canPlayNativeHls) {
    audio.removeAttribute('data-hls');
    audio.src = url;
    callbacks?.onSourceReady?.();
    return;
  }

  // A partir daqui a fonte NÃO está pronta de forma síncrona: o hls.js
  // ainda precisa ser baixado e anexado. Limpa qualquer fonte anterior
  // imediatamente para não deixar a estação antiga tocando por engano
  // enquanto a nova carrega.
  audio.removeAttribute('src');
  audio.load();

  import('hls.js').then(({ default: HlsLib }) => {
    // Se o usuário já trocou de faixa/rádio enquanto o hls.js carregava,
    // não faz nada — a chamada mais recente já assumiu o controle.
    if (currentToken !== loadToken) return;

    if (!HlsLib.isSupported()) {
      // Último recurso: tenta tocar direto (pode não funcionar em todos os navegadores)
      audio.removeAttribute('data-hls');
      audio.src = url;
      callbacks?.onSourceReady?.();
      return;
    }

    const hls = new HlsLib({
      // Configuração mais tolerante para rádios ao vivo
      enableWorker: true,
      lowLatencyMode: true,
      // Tentar novamente várias vezes antes de desistir
      manifestLoadingMaxRetry: 4,
      levelLoadingMaxRetry: 4,
      fragLoadingMaxRetry: 6,
      xhrSetup: (xhr) => {
        // Garante modo CORS explícito sem enviar credenciais
        // (necessário para servidores de streaming que não enviam
        // Access-Control-Allow-Credentials, mas permitem CORS simples)
        xhr.withCredentials = false;
      },
    });

    hls.loadSource(url);
    hls.attachMedia(audio);

    audio.setAttribute('data-hls', 'true');
    activeHls = hls;
    // A mídia já está anexada; agora é seguro que o chamador tente play().
    callbacks?.onSourceReady?.();

    hls.on(HlsLib.Events.MANIFEST_PARSED, () => {
      console.log('[hlsPlayer] Manifesto HLS carregado com sucesso:', url);
      // Garante que a reprodução comece assim que o manifesto estiver pronto,
      // já que o play() inicial pode ter ocorrido antes do manifesto carregar.
      audio.play().catch(() => {});
    });

    hls.on(HlsLib.Events.ERROR, (_event, data) => {
      if (!data.fatal) {
        // Erros não fatais (ex: queda de um fragmento) são tratados
        // internamente pelo hls.js, não precisam de ação aqui.
        return;
      }

      console.error('Erro fatal no stream HLS:', data);
      switch (data.type) {
        case HlsLib.ErrorTypes.NETWORK_ERROR:
          try {
            hls.startLoad();
          } catch {
            hls.destroy();
            if (activeHls === hls) activeHls = null;
            callbacks?.onFatalError?.(
              'Não foi possível conectar a esta rádio. Verifique sua conexão ou tente outra estação.'
            );
          }
          break;
        case HlsLib.ErrorTypes.MEDIA_ERROR:
          try {
            hls.recoverMediaError();
          } catch {
            hls.destroy();
            if (activeHls === hls) activeHls = null;
            callbacks?.onFatalError?.('Erro ao reproduzir esta rádio. Tente outra estação.');
          }
          break;
        default:
          hls.destroy();
          if (activeHls === hls) activeHls = null;
          callbacks?.onFatalError?.('Esta rádio está indisponível no momento.');
          break;
      }
    });
  }).catch((err) => {
    console.error('[hlsPlayer] Falha ao carregar hls.js:', err);
    if (currentToken === loadToken) {
      callbacks?.onFatalError?.('Não foi possível carregar o player de rádio. Verifique sua conexão.');
    }
  });
};

/**
 * Libera a instância ativa do hls.js (chamar ao desmontar o player).
 */
export const destroyActiveHls = () => {
  if (activeHls) {
    activeHls.destroy();
    activeHls = null;
  }
};
