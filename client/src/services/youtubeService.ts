const YOUTUBE_API_KEY = 'AIzaSyD_7sAIrifwx9sWahzM6ZjD74gYqjcWrXI';

export interface YouTubeResult {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
}

export interface YouTubeSearchResult {
  items: YouTubeResult[];
  nextPageToken?: string;
}

export interface YouTubeChannelResult {
  id: string;
  name: string;
  thumbnail: string;
  description: string;
}

export interface YouTubeChannelSearchResult {
  items: YouTubeChannelResult[];
  nextPageToken?: string;
}

/**
 * Extrai uma mensagem de erro legível da resposta da API do YouTube.
 * Traduz o caso mais comum (cota diária excedida) para uma mensagem clara
 * em vez do genérico "YouTube search failed", que escondia a causa real.
 */
const buildYouTubeError = async (response: Response, context: string): Promise<Error> => {
  let reason = '';
  let message = '';
  try {
    const data = await response.json();
    reason = data?.error?.errors?.[0]?.reason || '';
    message = data?.error?.message || '';
  } catch {
    // resposta não era JSON, segue com o status
  }

  if (reason === 'quotaExceeded' || response.status === 403 && /quota/i.test(message)) {
    return new Error(
      'A cota diária gratuita de busca do YouTube acabou. Ela é renovada automaticamente à meia-noite (horário do Pacífico, EUA). Tente novamente mais tarde.'
    );
  }

  if (response.status === 400 && /API key not valid/i.test(message)) {
    return new Error('A chave da API do YouTube é inválida ou foi revogada.');
  }

  return new Error(`${context} (${response.status}${message ? `: ${message}` : ''})`);
};

// Busca canais/artistas no YouTube (usado para encontrar novos artistas)
export const searchYouTubeArtists = async (query: string, pageToken?: string): Promise<YouTubeChannelSearchResult> => {
  let url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&maxResults=25&q=${encodeURIComponent(query)}&key=${YOUTUBE_API_KEY}`;

  if (pageToken) {
    url += `&pageToken=${pageToken}`;
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw await buildYouTubeError(response, 'Busca de artistas no YouTube falhou');
  }

  const data = await response.json();

  return {
    items: (data.items || []).map((item: any) => ({
      id: item.id.channelId,
      name: item.snippet.title,
      thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
      description: item.snippet.description,
    })),
    nextPageToken: data.nextPageToken,
  };
};

// Busca músicas no YouTube com suporte a múltiplas páginas
export const searchYouTube = async (query: string, pageToken?: string): Promise<YouTubeSearchResult> => {
  let url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&maxResults=50&q=${encodeURIComponent(query + ' music')}&key=${YOUTUBE_API_KEY}`;
  
  if (pageToken) {
    url += `&pageToken=${pageToken}`;
  }
  
  const response = await fetch(url);
  if (!response.ok) {
    throw await buildYouTubeError(response, 'Busca de músicas no YouTube falhou');
  }
  
  const data = await response.json();
  
  return {
    items: (data.items || []).map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
      channelTitle: item.snippet.channelTitle,
    })),
    nextPageToken: data.nextPageToken,
  };
};
