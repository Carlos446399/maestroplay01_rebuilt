import { Radio } from '@/types/music';

export const radioStations: Radio[] = [
  // === BRASILEIRAS ===
  {
    id: 'jovem-pan',
    name: 'Jovem Pan FM',
    url: 'https://stream.jovempan.com.br/jovempanfm',
    cover: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Jovem_Pan_logo.svg/200px-Jovem_Pan_logo.svg.png',
    genre: 'Pop/Rock'
  },
  {
    id: 'mix-fm',
    name: 'Mix FM São Paulo',
    url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/MIXFM_SPAAC',
    cover: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/MixFM.svg/200px-MixFM.svg.png',
    genre: 'Pop'
  },
  {
    id: 'antenna1',
    name: 'Antena 1',
    url: 'https://antena1.crossradio.com.br/stream/1/',
    cover: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Antena_1_logo.svg/200px-Antena_1_logo.svg.png',
    genre: 'Romântica'
  },
  {
    id: 'radio-globo',
    name: 'Rádio Globo',
    url: 'https://15963.live.streamtheworld.com/RADIO_GLOBO_SP.mp3',
    cover: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/R%C3%A1dio_Globo_logo.png/200px-R%C3%A1dio_Globo_logo.png',
    genre: 'Esporte/Notícias'
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
  {
    id: 'itatiaia',
    name: 'Itatiaia',
    url: 'https://cast2.hoost.com.br:7088/stream',
    cover: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Itatiaia_logo.svg/200px-Itatiaia_logo.svg.png',
    genre: 'Notícias'
  },

  // === INTERNACIONAIS ===
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
    id: 'lofi-hip-hop',
    name: 'Lo-Fi Hip Hop',
    url: 'https://lofi.stream.laut.fm/lofi',
    cover: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=200&h=200&fit=crop',
    genre: 'Lo-Fi'
  },
  {
    id: 'jazz-fm',
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
    id: 'reggae-radio',
    name: 'Reggae Radio',
    url: 'https://reggae.stream.laut.fm/reggae',
    cover: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=200&h=200&fit=crop',
    genre: 'Reggae'
  },
  {
    id: 'rock-radio',
    name: 'Rock Antenne',
    url: 'https://stream.rockantenne.de/rockantenne/stream/mp3',
    cover: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=200&h=200&fit=crop',
    genre: 'Rock'
  },
  {
    id: 'dance-fm',
    name: 'Dance FM',
    url: 'https://dance.stream.laut.fm/dance',
    cover: 'https://images.unsplash.com/photo-1571266028243-d220c6a6dd32?w=200&h=200&fit=crop',
    genre: 'Dance/Eletrônica'
  },
  {
    id: 'hits-radio',
    name: 'Hits Radio',
    url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/HITS_RADIO_AAAC',
    cover: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=200&h=200&fit=crop',
    genre: 'Hits'
  },
];
