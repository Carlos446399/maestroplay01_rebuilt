export interface Track {
  id: string;
  name: string;
  url: string;
  cover?: string;
  file?: File;
  type?: 'local' | 'radio';
}

export interface Radio {
  id: string;
  name: string;
  url: string;
  cover: string;
  genre: string;
}

export interface MusicPlayerState {
  tracks: Track[];
  radios: Radio[];
  currentTrackIndex: number;
  currentRadioIndex: number;
  currentSource: 'tracks' | 'radios';
  isPlaying: boolean;
  repeat: boolean;
  currentTime: number;
  duration: number;
  volume: number;
}
