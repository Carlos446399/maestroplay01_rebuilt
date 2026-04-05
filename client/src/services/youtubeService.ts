const YOUTUBE_API_KEY = 'AIzaSyD_7sAIrifwx9sWahzM6ZjD74gYqjcWrXI';

export interface YouTubeResult {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
}

// Busca músicas no YouTube com suporte a múltiplas páginas
export const searchYouTube = async (query: string, pageToken?: string): Promise<YouTubeResult[] & { nextPageToken?: string }> => {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&maxResults=50&q=${encodeURIComponent(query + ' music')}&key=${YOUTUBE_API_KEY}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('YouTube search failed');
  }
  
  const data = await response.json();
  
  return data.items.map((item: any) => ({
    id: item.id.videoId,
    title: item.snippet.title,
    thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
    channelTitle: item.snippet.channelTitle,
  }));
};
