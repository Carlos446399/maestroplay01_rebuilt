/**
 * hlsPlayer - Reproduz streams HLS (.m3u8) em um elemento <audio>.
 *
 * Navegadores baseados em WebKit (Safari/iOS) suportam HLS nativamente via
 * `canPlayType`. Chrome, Firefox e a maioria dos navegadores Android NÃO
 * suportam, então um `<audio src="...m3u8">` simplesmente falha em silêncio
 * — esse era o motivo das rádios não funcionarem. Para esses navegadores,
 * usamos hls.js para fazer o "demuxing" do stream e alimentar o elemento via
 * Media Source Extensions.
 */

import Hls from 'hls.js';

let activeHls: Hls | null = null;

const isHlsUrl = (url: string) => /\.m3u8(\?.*)?$/i.test(url);

export interface LoadAudioSourceCallbacks {
  /** Chamado quando o stream encontra um erro fatal e não pode ser recuperado */
  onFatalError?: (message: string) => void;
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
  // Limpar instância anterior do hls.js, se houver
  if (activeHls) {
    activeHls.destroy();
    activeHls = null;
  }

  if (!isHlsUrl(url)) {
    audio.removeAttribute('data-hls');
    audio.src = url;
    return;
  }

  // Streams .m3u8: alguns navegadores (Safari/iOS) suportam nativamente
  const canPlayNativeHls = audio.canPlayType('application/vnd.apple.mpegurl') !== '';

  if (canPlayNativeHls) {
    audio.removeAttribute('data-hls');
    audio.src = url;
    return;
  }

  if (Hls.isSupported()) {
    const hls = new Hls({
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

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      console.log('[hlsPlayer] Manifesto HLS carregado com sucesso:', url);
    });

    hls.on(Hls.Events.ERROR, (_event, data) => {
      if (!data.fatal) {
        // Erros não fatais (ex: queda de um fragmento) são tratados
        // internamente pelo hls.js, não precisam de ação aqui.
        return;
      }

      console.error('Erro fatal no stream HLS:', data);
      switch (data.type) {
        case Hls.ErrorTypes.NETWORK_ERROR:
          try {
            hls.startLoad();
          } catch {
            hls.destroy();
            activeHls = null;
            callbacks?.onFatalError?.(
              'Não foi possível conectar a esta rádio. Verifique sua conexão ou tente outra estação.'
            );
          }
          break;
        case Hls.ErrorTypes.MEDIA_ERROR:
          try {
            hls.recoverMediaError();
          } catch {
            hls.destroy();
            activeHls = null;
            callbacks?.onFatalError?.('Erro ao reproduzir esta rádio. Tente outra estação.');
          }
          break;
        default:
          hls.destroy();
          activeHls = null;
          callbacks?.onFatalError?.('Esta rádio está indisponível no momento.');
          break;
      }
    });

    audio.setAttribute('data-hls', 'true');
    activeHls = hls;
    return;
  }

  // Último recurso: tenta tocar direto (pode não funcionar em todos os navegadores)
  audio.removeAttribute('data-hls');
  audio.src = url;
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
