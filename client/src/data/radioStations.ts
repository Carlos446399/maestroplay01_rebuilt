import { Radio } from '@/types/music';

/**
 * Lista de rádios atualizada com links funcionais.
 * Usamos streams HLS (.m3u8) e MP3 diretos.
 */
export const radioStations: Radio[] = [
  {
    id: 'antena-1',
    name: 'Antena 1 (Hits)',
    url: 'https://stream.antena1.com.br/stream',
    cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop',
    genre: 'Pop Internacional'
  },
  {
    id: 'jovem-pan-fm',
    name: 'Jovem Pan FM',
    url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/JP_SP_FMAAC.aac',
    cover: 'https://images.unsplash.com/photo-1598387181032-a3103a2db5b3?w=400&h=400&fit=crop',
    genre: 'Pop/Hits'
  },
  {
    id: 'alpha-fm',
    name: 'Alpha FM',
    url: 'https://26433.live.streamtheworld.com/ALPHAFM_SC',
    cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop',
    genre: 'Adult Contemporary'
  },
  {
    id: 'mix-fm',
    name: 'Mix FM',
    url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/MIXSP_AAC.aac',
    cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    genre: 'Pop/Rock'
  },
  {
    id: 'metropolitana-fm',
    name: 'Metropolitana FM',
    url: 'https://ice.fabricahost.com.br/metropolitanafm',
    cover: 'https://images.unsplash.com/photo-1459749411177-042180ce673c?w=400&h=400&fit=crop',
    genre: 'Pop/Hits'
  },
  {
    id: 'itapema-fm',
    name: 'Itapema FM',
    url: 'https://ice.fabricahost.com.br/itapemafm',
    cover: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&h=400&fit=crop',
    genre: 'Adult/Jazz/Lounge'
  },
  {
    id: '89-rock',
    name: '89 FM A Rádio Rock',
    url: 'https://ice.fabricahost.com.br/89radiorock',
    cover: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&h=400&fit=crop',
    genre: 'Rock'
  },
  {
    id: 'nova-brasil-fm',
    name: 'Nova Brasil FM',
    url: 'https://ice.fabricahost.com.br/novabrasilfm',
    cover: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&h=400&fit=crop',
    genre: 'MPB'
  },
  {
    id: 'kiss-fm',
    name: 'Kiss FM',
    url: 'https://ice.fabricahost.com.br/kissfm',
    cover: 'https://images.unsplash.com/photo-1526218626217-dc65a29bb444?w=400&h=400&fit=crop',
    genre: 'Classic Rock'
  },
  {
    id: 'band-news-fm',
    name: 'Band News FM',
    url: 'https://ice.fabricahost.com.br/bandnewsfm_sp',
    cover: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=400&fit=crop',
    genre: 'Notícias'
  },
  {
    id: 'cbn-sp',
    name: 'CBN São Paulo',
    url: 'https://ice.fabricahost.com.br/cbnsp',
    cover: 'https://images.unsplash.com/photo-1557833161-0b41f755a2d6?w=400&h=400&fit=crop',
    genre: 'Notícias/Esportes'
  },
  {
    id: 'gazeta-fm',
    name: 'Gazeta FM',
    url: 'https://ice.fabricahost.com.br/gazetafm',
    cover: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=400&fit=crop',
    genre: 'Popular/Hits'
  },
  {
    id: 'transcontinental-fm',
    name: 'Transcontinental FM',
    url: 'https://ice.fabricahost.com.br/transcontinentalfm',
    cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop',
    genre: 'Pagode/Samba'
  },
  {
    id: 'nativa-fm',
    name: 'Nativa FM',
    url: 'https://ice.fabricahost.com.br/nativafm_sp',
    cover: 'https://images.unsplash.com/photo-1605648916319-cf082f7926cc?w=400&h=400&fit=crop',
    genre: 'Sertanejo/Romântico'
  },
  {
    id: 'band-fm',
    name: 'Band FM',
    url: 'https://ice.fabricahost.com.br/bandfm_sp',
    cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&h=400&fit=crop',
    genre: 'Popular/Hits'
  }
];
