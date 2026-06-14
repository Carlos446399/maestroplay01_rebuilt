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

/**
 * Carrega e inicia a reprodução de uma URL no elemento de áudio fornecido.
 * Lida automaticamente com streams HLS (.m3u8) e com áudio comum.
 */
export const loadAudioSource = (audio: HTMLAudioElement, url: string) => {
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
    });

    hls.loadSource(url);
    hls.attachMedia(audio);
    hls.on(Hls.Events.ERROR, (_event, data) => {
      if (data.fatal) {
        console.error('Erro fatal no stream HLS:', data);
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            hls.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            hls.recoverMediaError();
            break;
          default:
            hls.destroy();
            activeHls = null;
            break;
        }
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
