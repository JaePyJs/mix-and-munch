interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  channelTitle: string;
  thumbnails: {
    default: { url: string };
    medium: { url: string };
    high: { url: string };
    maxres?: { url: string };
  };
  publishedAt: string;
}

interface YouTubeTranscriptItem {
  text: string;
  start: number;
  duration: number;
}

interface YouTubeSearchResult {
  videos: YouTubeVideo[];
  nextPageToken?: string;
}

class YouTubeService {
  private apiKey: string;
  private baseUrl = 'https://www.googleapis.com/youtube/v3';

  constructor() {
    this.apiKey = process.env.YOUTUBE_API_KEY || '';
    if (!this.apiKey) {
      console.warn('YouTube API key not found. YouTube functionality will be limited.');
    }
  }

  /**
   * Search for cooking/recipe videos
   */
  async searchRecipeVideos(query: string = 'filipino recipe cooking', maxResults: number = 10): Promise<YouTubeSearchResult> {
    if (!this.apiKey) {
      throw new Error('YouTube API key not configured');
    }

    try {
      const searchUrl = `${this.baseUrl}/search`;
      const params = new URLSearchParams({
        part: 'snippet',
        q: `${query} cooking recipe`,
        type: 'video',
        maxResults: maxResults.toString(),
        key: this.apiKey,
        order: 'relevance',
        videoDuration: 'medium', // 4-20 minutes
        videoDefinition: 'high'
      });

      const response = await fetch(`${searchUrl}?${params}`);
      
      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      const videos: YouTubeVideo[] = data.items?.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        channelTitle: item.snippet.channelTitle,
        thumbnails: item.snippet.thumbnails,
        publishedAt: item.snippet.publishedAt
      })) || [];

      return {
        videos,
        nextPageToken: data.nextPageToken
      };
    } catch (error) {
      console.error('Error searching YouTube videos:', error);
      throw error;
    }
  }

  /**
   * Get video details by ID
   */
  async getVideoDetails(videoId: string): Promise<YouTubeVideo | null> {
    if (!this.apiKey) {
      throw new Error('YouTube API key not configured');
    }

    try {
      const url = `${this.baseUrl}/videos`;
      const params = new URLSearchParams({
        part: 'snippet',
        id: videoId,
        key: this.apiKey
      });

      const response = await fetch(`${url}?${params}`);
      
      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        return null;
      }

      const item = data.items[0];
      return {
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        channelTitle: item.snippet.channelTitle,
        thumbnails: item.snippet.thumbnails,
        publishedAt: item.snippet.publishedAt
      };
    } catch (error) {
      console.error('Error getting video details:', error);
      throw error;
    }
  }

  /**
   * Get video transcript (Note: YouTube API doesn't provide transcripts directly)
   * This is a placeholder for transcript functionality
   */
  async getVideoTranscript(videoId: string): Promise<YouTubeTranscriptItem[]> {
    // Note: YouTube Data API v3 doesn't provide transcript access
    // For real transcript functionality, you would need:
    // 1. YouTube Transcript API (unofficial)
    // 2. Speech-to-text service
    // 3. Manual transcript upload
    
    console.warn('Transcript functionality not available with YouTube Data API v3');
    
    // Return mock transcript for demo purposes
    return [
      {
        text: "Welcome to today's cooking video! We're making a delicious Filipino recipe.",
        start: 0,
        duration: 5
      },
      {
        text: "First, let's gather our ingredients. You'll need chicken, soy sauce, and vinegar.",
        start: 5,
        duration: 6
      },
      {
        text: "Start by marinating the chicken in soy sauce for about 30 minutes.",
        start: 11,
        duration: 5
      }
    ];
  }

  /**
   * Format video URL for embedding
   */
  getEmbedUrl(videoId: string): string {
    return `https://www.youtube.com/embed/${videoId}`;
  }

  /**
   * Get video watch URL
   */
  getWatchUrl(videoId: string): string {
    return `https://www.youtube.com/watch?v=${videoId}`;
  }

  /**
   * Extract video ID from YouTube URL
   */
  extractVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  }
}

export const youtubeService = new YouTubeService();
export type { YouTubeVideo, YouTubeTranscriptItem, YouTubeSearchResult };