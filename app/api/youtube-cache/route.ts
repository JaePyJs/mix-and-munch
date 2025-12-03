import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const YOUTUBE_CACHE_PATH = path.join(process.cwd(), 'data', 'youtube-recipe-cache.json');
const COMMUNITY_PATH = path.join(process.cwd(), 'data', 'community-recipes.json');

interface CachedVideo {
  id: string;
  videoId: string;
  url: string;
  title: string;
  channelTitle: string;
  thumbnailUrl?: string;
  recipe?: any;
  extractedIngredients: any[];
  createdAt: string;
  viewCount: number;
  lastViewed?: string;
  extractedBy: string;
}

interface YouTubeCache {
  videos: CachedVideo[];
  metadata: {
    lastUpdated?: string;
  };
}

// Extract video ID from various YouTube URL formats
function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// GET - Check if YouTube video was already processed
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        {
          success: false,
          message: 'URL parameter required',
        },
        { status: 400 }
      );
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid YouTube URL',
        },
        { status: 400 }
      );
    }

    // Read cache
    const data = await fs.readFile(YOUTUBE_CACHE_PATH, 'utf-8');
    const cache = JSON.parse(data);

    // Find matching video
    const cachedVideo = cache.videos.find((v: any) => v.videoId === videoId);

    if (cachedVideo) {
      // Update view count
      cachedVideo.viewCount = (cachedVideo.viewCount || 0) + 1;
      cachedVideo.lastViewed = new Date().toISOString();
      await fs.writeFile(YOUTUBE_CACHE_PATH, JSON.stringify(cache, null, 2));

      return NextResponse.json({
        success: true,
        cached: true,
        video: cachedVideo,
        message: `✅ This video was already processed! Showing saved recipe from ${new Date(cachedVideo.createdAt).toLocaleDateString()}.`,
        cachedAt: cachedVideo.createdAt,
        viewCount: cachedVideo.viewCount,
      });
    }

    return NextResponse.json({
      success: true,
      cached: false,
      videoId,
      message: 'Video not in cache - ready to process',
    });
  } catch (error) {
    console.error('YouTube cache GET error:', error);
    return NextResponse.json(
      {
        success: false,
        cached: false,
        message: 'Cache not available',
      },
      { status: 200 }
    );
  }
}

// POST - Save YouTube extracted recipe
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, videoData, recipe, addToCommunity = true, extractedBy } = body;

    if (!url || !videoData) {
      return NextResponse.json(
        {
          success: false,
          message: 'URL and videoData required',
        },
        { status: 400 }
      );
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid YouTube URL',
        },
        { status: 400 }
      );
    }

    // Read current cache
    let cache: YouTubeCache = { videos: [], metadata: {} };
    try {
      const data = await fs.readFile(YOUTUBE_CACHE_PATH, 'utf-8');
      cache = JSON.parse(data) as YouTubeCache;
    } catch {
      // File doesn't exist yet
    }

    // Check if this video already exists
    const existingIndex = cache.videos.findIndex((v: any) => v.videoId === videoId);

    const cacheEntry = {
      id: `yt-${videoId}`,
      videoId,
      url,
      title: videoData.title || 'YouTube Recipe',
      channelTitle: videoData.channelTitle || 'Unknown Channel',
      thumbnailUrl: videoData.thumbnailUrl,
      recipe: recipe || null,
      extractedIngredients: videoData.extractedIngredients || [],
      createdAt: new Date().toISOString(),
      viewCount: 1,
      extractedBy: extractedBy || 'Anonymous',
    };

    if (existingIndex >= 0) {
      // Update existing entry
      cache.videos[existingIndex].viewCount =
        (cache.videos[existingIndex].viewCount || 0) + 1;
      cache.videos[existingIndex].lastViewed = new Date().toISOString();
    } else {
      // Add new entry
      cache.videos.push(cacheEntry);

      // Also add to community recipes if it has a proper recipe
      if (addToCommunity && recipe) {
        try {
          const communityData = await fs.readFile(COMMUNITY_PATH, 'utf-8');
          const communityRecipes = JSON.parse(communityData);

          const communityRecipe = {
            id: `community-yt-${videoId}`,
            title: recipe.title || videoData.title || 'YouTube Recipe',
            description:
              recipe.description ||
              `Recipe extracted from YouTube video: ${videoData.title}`,
            cuisine: recipe.cuisine || 'Filipino',
            difficulty: recipe.difficulty || 'Medium',
            prepTime: recipe.prep_time || '15 mins',
            cookTime: recipe.cook_time || '30 mins',
            servings: recipe.servings || 4,
            ingredients:
              recipe.ingredients ||
              videoData.extractedIngredients?.map((i: any) => ({
                item: i.name,
                amount: i.quantity ? `${i.quantity} ${i.unit || ''}`.trim() : '',
              })) ||
              [],
            instructions: recipe.instructions || [],
            tips: recipe.chef_tips || [],
            tags: ['youtube', 'video-recipe', ...(recipe.tags || [])],
            videoUrl: url,
            thumbnailUrl: videoData.thumbnailUrl,
            source: 'youtube',
            sharedBy: {
              name: extractedBy || 'YouTube Extractor',
              avatar: '📺',
              location: 'YouTube',
            },
            sharedAt: new Date().toISOString(),
            likes: 0,
            saves: 0,
          };

          // Check if not already in community
          const exists = communityRecipes.some(
            (r: any) => r.id === communityRecipe.id || r.videoUrl === url
          );

          if (!exists) {
            communityRecipes.push(communityRecipe);
            await fs.writeFile(COMMUNITY_PATH, JSON.stringify(communityRecipes, null, 2));
          }
        } catch (error) {
          console.error('Failed to add to community:', error);
        }
      }
    }

    cache.metadata.lastUpdated = new Date().toISOString();
    await fs.writeFile(YOUTUBE_CACHE_PATH, JSON.stringify(cache, null, 2));

    return NextResponse.json({
      success: true,
      message:
        existingIndex >= 0
          ? 'Video already in cache'
          : 'Video saved to universal database!',
      videoId,
      isNew: existingIndex < 0,
    });
  } catch (error) {
    console.error('YouTube cache POST error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to save video',
      },
      { status: 500 }
    );
  }
}
