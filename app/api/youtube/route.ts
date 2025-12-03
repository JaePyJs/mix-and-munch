import { NextRequest, NextResponse } from 'next/server';
import { youtubeService } from '@/lib/services/youtube';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const query = searchParams.get('q');
    const videoId = searchParams.get('videoId');
    const maxResults = parseInt(searchParams.get('maxResults') || '10');

    switch (action) {
      case 'search':
        if (!query) {
          return NextResponse.json(
            { error: 'Query parameter is required for search' },
            { status: 400 }
          );
        }
        
        const searchResults = await youtubeService.searchRecipeVideos(query, maxResults);
        return NextResponse.json({ 
          success: true, 
          data: searchResults 
        });

      case 'video':
        if (!videoId) {
          return NextResponse.json(
            { error: 'videoId parameter is required' },
            { status: 400 }
          );
        }
        
        const videoDetails = await youtubeService.getVideoDetails(videoId);
        if (!videoDetails) {
          return NextResponse.json(
            { error: 'Video not found' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({ 
          success: true, 
          data: videoDetails 
        });

      case 'transcript':
        if (!videoId) {
          return NextResponse.json(
            { error: 'videoId parameter is required' },
            { status: 400 }
          );
        }
        
        const transcript = await youtubeService.getVideoTranscript(videoId);
        return NextResponse.json({ 
          success: true, 
          data: transcript 
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: search, video, or transcript' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('YouTube API error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('API key not configured')) {
        return NextResponse.json(
          { 
            error: 'YouTube API not configured', 
            message: 'Please set YOUTUBE_API_KEY in environment variables' 
          },
          { status: 503 }
        );
      }
      
      if (error.message.includes('YouTube API error')) {
        return NextResponse.json(
          { 
            error: 'YouTube API error', 
            message: error.message 
          },
          { status: 502 }
        );
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: 'An unexpected error occurred' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, videoUrl, query } = body;

    switch (action) {
      case 'extractVideoId':
        if (!videoUrl) {
          return NextResponse.json(
            { error: 'videoUrl is required' },
            { status: 400 }
          );
        }
        
        const videoId = youtubeService.extractVideoId(videoUrl);
        if (!videoId) {
          return NextResponse.json(
            { error: 'Invalid YouTube URL' },
            { status: 400 }
          );
        }
        
        return NextResponse.json({ 
          success: true, 
          data: { 
            videoId,
            embedUrl: youtubeService.getEmbedUrl(videoId),
            watchUrl: youtubeService.getWatchUrl(videoId)
          }
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action for POST request' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('YouTube POST API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: 'An unexpected error occurred' 
      },
      { status: 500 }
    );
  }
}