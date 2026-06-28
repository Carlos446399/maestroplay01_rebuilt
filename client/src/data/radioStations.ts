import { Radio } from '@/types/music';

export const radioStations: Radio[] = [
  // === BRASILEIRAS — URLs testadas e confiáveis ===
  {
    id: 'jovem-pan',
    name: 'Jovem Pan FM',
    url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/JOVEM_PAN_FMAAC',
    cover: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Jovem_Pan_logo.svg/200px-Jovem_Pan_logo.svg.png',
    genre: 'Pop/Rock'
  },
  {
    id: 'mix-fm',
    name: 'Mix FM',
    url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/MIXFM_SPAAC',
    cover: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/MixFM.svg/200px-MixFM.svg.png',
    genre: 'Pop'
  },
  {
    id: 'band-fm',
    name: 'Band FM',
    url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/RADIO_BAND_FMAAC',
    cover: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Band_FM_logo.svg/200px-Band_FM_logo.svg.png',
    genre: 'Sertanejo'
  },
  {
    id: 'transamérica',
    name: 'Transamérica',
    url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/TRANSAMERICA_SPAAC',
    cover: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Transamérica_FM_logo.svg/200px-Transamérica_FM_logo.svg.png',
    genre: 'Pop'
  },
  {
    id: 'metropolitana',
    name: 'Metropolitana FM',
    url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/METRO_FMAAC',
    cover: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Metropolitana_FM_logo.svg/200px-Metropolitana_FM_logo.svg.png',
    genre: 'Rock'
  },

  // === INTERNACIONAIS — URLs sem HLS (mp3 direto) ===
  {
    id: 'bbc-radio1',
    name: 'BBC Radio 1',
    url: 'https://stream.live.vc.bbcmedia.co.uk/bbc_radio_one',
    cover: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/BBC_Radio_1_2021.svg/200px-BBC_Radio_1_2021.svg.png',
    genre: 'Pop Internacional'
  },
  {
    id: 'bbc-radio2',
    name: 'BBC Radio 2',
    url: 'https://stream.live.vc.bbcmedia.co.uk/bbc_radio_two',
    cover: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/BBC_Radio_2_2021.svg/200px-BBC_Radio_2_2021.svg.png',
    genre: 'Clássicos'
  },
  {
    id: 'lofi',
    name: 'Lo-Fi Hip Hop',
    url: 'https://lofi.stream.laut.fm/lofi',
    cover: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=200&h=200&fit=crop',
    genre: 'Lo-Fi'
  },
  {
    id: 'jazz',
    name: 'Jazz FM',
    url: 'https://jazz-wr02.ice.infomaniak.ch/jazz-wr02-128.mp3',
    cover: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=200&h=200&fit=crop',
    genre: 'Jazz'
  },
  {
    id: 'classical',
    name: 'Classical Radio',
    url: 'https://live.musopen.org:8085/streamvbr0',
    cover: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=200&h=200&fit=crop',
    genre: 'Clássica'
  },
  {
    id: 'reggae',
    name: 'Reggae Radio',
    url: 'https://reggae.stream.laut.fm/reggae',
    cover: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=200&h=200&fit=crop',
    genre: 'Reggae'
  },
  {
    id: 'rock-antenne',
    name: 'Rock Antenne',
    url: 'https://stream.rockantenne.de/rockantenne/stream/mp3',
    cover: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=200&h=200&fit=crop',
    genre: 'Rock'
  },
  {
    id: 'dance',
    name: 'Dance FM',
    url: 'https://dance.stream.laut.fm/dance',
    cover: 'https://images.unsplash.com/photo-1571266028243-d220c6a6dd32?w=200&h=200&fit=crop',
    genre: 'Dance/Eletrônica'
  },
  {
    id: 'edm',
    name: 'EDM Radio',
    url: 'https://eu9.fastcast4u.com/proxy/jamz?mp=/1',
    cover: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=200&h=200&fit=crop',
    genre: 'EDM'
  },
  {
    id: 'gospel',
    name: 'Rádio Gospel',
    url: 'https://cast1.totemsound.com/stream/10022/stream.mp3',
    cover: 'https://images.unsplash.com/photo-1445375011782-2384686778a0?w=200&h=200&fit=crop',
    genre: 'Gospel'
  },
  {
    id: 'mpb',
    name: 'MPB FM',
    url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/RADIO_MPB_FMAAC',
    cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop',
    genre: 'MPB'
  },
];
