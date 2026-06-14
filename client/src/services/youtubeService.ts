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

// Busca canais/artistas no YouTube (usado para encontrar novos artistas)
export const searchYouTubeArtists = async (query: string, pageToken?: string): Promise<YouTubeChannelSearchResult> => {
  let url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&maxResults=25&q=${encodeURIComponent(query)}&key=${YOUTUBE_API_KEY}`;

  if (pageToken) {
    url += `&pageToken=${pageToken}`;
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('YouTube channel search failed');
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
    throw new Error('YouTube search failed');
  }
  
  const data = await response.json();
  
  return {
    items: data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
      channelTitle: item.snippet.channelTitle,
    })),
    nextPageToken: data.nextPageToken,
  };
};
