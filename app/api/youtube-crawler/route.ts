import { NextRequest, NextResponse } from 'next/server';
import { YouTubeCrawlerService } from '@/lib/services/youtube-crawler';
// Removed ContentCreatorManager import to avoid file system operations in serverless environment
import type { ExtractedIngredient } from '@/lib/services/youtube-crawler';

// Initialize services
const crawlerService = new YouTubeCrawlerService();
// Removed creatorManager instantiation to avoid file system operations in serverless environment

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'process_url':
        return await handleProcessUrl(params);

      case 'validate_ingredients':
        return await handleValidateIngredients(params);

      case 'get_progress':
        return await handleGetProgress(params);

      case 'add_creator':
        return await handleAddCreator(params);

      case 'get_creators':
        return await handleGetCreators();

      case 'crawl_creator':
        return await handleCrawlCreator(params);

      case 'get_crawl_results':
        return await handleGetCrawlResults(params);

      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('YouTube Crawler API Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

async function handleProcessUrl({
  url,
  fastMode = true,
}: {
  url: string;
  fastMode?: boolean;
}) {
  if (!url) {
    return NextResponse.json(
      { success: false, message: 'URL is required' },
      { status: 400 }
    );
  }

  try {
    const videoId = crawlerService.extractVideoId(url);
    if (!videoId) {
      return NextResponse.json(
        { success: false, message: 'Invalid YouTube URL' },
        { status: 400 }
      );
    }

    const processedVideo = await crawlerService.processVideoUrl(url, fastMode);

    return NextResponse.json({
      success: true,
      data: processedVideo,
    });
  } catch (error) {
    console.error('Error processing video:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to process video',
      },
      { status: 500 }
    );
  }
}

async function handleValidateIngredients({
  ingredients,
}: {
  ingredients: ExtractedIngredient[];
}) {
  if (!ingredients || !Array.isArray(ingredients)) {
    return NextResponse.json(
      { success: false, message: 'Ingredients array is required' },
      { status: 400 }
    );
  }

  try {
    const validation = await crawlerService.validateIngredients(ingredients);

    return NextResponse.json({
      success: true,
      data: validation,
    });
  } catch (error) {
    console.error('Error validating ingredients:', error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to validate ingredients',
      },
      { status: 500 }
    );
  }
}

async function handleGetProgress({ sessionId }: { sessionId?: string }) {
  try {
    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Session ID is required',
        },
        { status: 400 }
      );
    }

    const progress = crawlerService.getProgress(sessionId);

    return NextResponse.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    console.error('Error getting progress:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get progress',
      },
      { status: 500 }
    );
  }
}

async function handleAddCreator({ creator }: { creator: any }) {
  if (!creator || !creator.channelId || !creator.name) {
    return NextResponse.json(
      { success: false, message: 'Creator with channelId and name is required' },
      { status: 400 }
    );
  }

  try {
    // In serverless environment, we can't persist to file system
    // This would require database integration
    return NextResponse.json({
      success: true,
      message:
        'Creator feature requires database setup for persistence in serverless environment',
    });
  } catch (error) {
    console.error('Error adding creator:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to add creator',
      },
      { status: 500 }
    );
  }
}

async function handleGetCreators() {
  try {
    // Return empty array for serverless environment
    // File system operations are not supported in Vercel serverless functions
    return NextResponse.json({
      success: true,
      data: [],
      message:
        'Content creators feature requires database setup for persistence in serverless environment',
    });
  } catch (error) {
    console.error('Get Creators Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get creators',
      },
      { status: 500 }
    );
  }
}

async function handleCrawlCreator({
  creatorId,
  options,
}: {
  creatorId: string;
  options?: any;
}) {
  if (!creatorId) {
    return NextResponse.json(
      { success: false, message: 'Creator ID is required' },
      { status: 400 }
    );
  }

  try {
    // In serverless environment, crawling would require database integration
    return NextResponse.json({
      success: true,
      data: {
        message:
          'Creator crawling feature requires database setup for persistence in serverless environment',
        creatorId,
      },
    });
  } catch (error) {
    console.error('Error crawling creator:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to crawl creator',
      },
      { status: 500 }
    );
  }
}

async function handleGetCrawlResults({
  creatorId,
  limit,
}: {
  creatorId?: string;
  limit?: number;
}) {
  try {
    // This would typically fetch from a database
    // For now, return mock data structure
    const results = {
      total: 0,
      results: [],
      creators: creatorId ? [creatorId] : [], // Empty array in serverless environment
    };

    return NextResponse.json({
      success: true,
      data: results,
      message:
        'Crawl results feature requires database setup for persistence in serverless environment',
    });
  } catch (error) {
    console.error('Error getting crawl results:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get crawl results',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    switch (action) {
      case 'health':
        return NextResponse.json({
          success: true,
          message: 'YouTube Crawler API is healthy',
          timestamp: new Date().toISOString(),
        });

      case 'stats':
        // Return system statistics
        const stats = {
          totalProcessed: 0, // Would come from database
          totalCreators: 0, // Empty in serverless environment without database
          systemStatus: 'operational',
        };

        return NextResponse.json({
          success: true,
          data: stats,
          message:
            'Stats feature requires database setup for persistence in serverless environment',
        });

      case 'get_creators':
        return await handleGetCreators();

      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action for GET request' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('YouTube Crawler API GET Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
