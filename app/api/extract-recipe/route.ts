import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

// Types for extracted recipe
interface ExtractedIngredient {
  item: string;
  amount: string;
  notes?: string;
}

interface ExtractedStep {
  step: number;
  action: string;
  tip?: string;
}

interface ExtractedRecipe {
  title: string;
  cuisine: string;
  description: string;
  ingredients: ExtractedIngredient[];
  instructions: ExtractedStep[];
  prep_time: string;
  cook_time: string;
  total_time: string;
  servings: number;
  difficulty: string;
  chef_tips: string[];
  equipment: string[];
  tags: string[];
  video_id: string;
  video_url: string;
  video_title: string;
  channel: string;
  transcript_length: number;
  source_language?: string;
}

interface ExtractionResponse {
  success: boolean;
  recipe?: ExtractedRecipe;
  message?: string;
  error?: string;
  video_id?: string;
}

// Extract video ID from various YouTube URL formats
function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
    /[?&]v=([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, autoSave = false } = body;

    if (!url) {
      return NextResponse.json(
        { success: false, message: 'YouTube URL is required' },
        { status: 400 }
      );
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json(
        { success: false, message: 'Invalid YouTube URL format' },
        { status: 400 }
      );
    }

    // Get the project root directory
    const projectRoot = process.cwd();
    const scriptPath = path.join(projectRoot, 'scripts', 'recipe_extractor_gemini.py');

    console.log(`[extract-recipe] Processing video: ${videoId}`);
    console.log(`[extract-recipe] Script path: ${scriptPath}`);

    try {
      // Call the Python script with --quiet flag for clean JSON output
      const { stdout, stderr } = await execAsync(
        `python "${scriptPath}" "${url}" --quiet`,
        {
          maxBuffer: 10 * 1024 * 1024, // 10MB buffer for large responses
          timeout: 120000, // 2 minute timeout
          cwd: projectRoot,
          env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
        }
      );

      if (stderr) {
        console.log('[extract-recipe] Python stderr:', stderr);
      }

      // Parse the JSON output from the Python script
      const result: ExtractionResponse = JSON.parse(stdout);

      if (result.success && result.recipe) {
        let savedToDb = false;

        // Auto-save to database if requested
        if (autoSave) {
          try {
            const saveResponse = await fetch(new URL('/api/recipes/save', request.url), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ recipe: result.recipe, videoId }),
            });
            const saveResult = await saveResponse.json();
            savedToDb = saveResult.success;
          } catch (saveError) {
            console.log('[extract-recipe] Auto-save failed:', saveError);
          }
        }

        return NextResponse.json({
          success: true,
          recipe: result.recipe,
          message: 'Recipe extracted successfully',
          savedToDb,
        });
      } else {
        return NextResponse.json({
          success: false,
          message: result.message || 'Failed to extract recipe',
          error: result.error,
          video_id: videoId,
        });
      }
    } catch (execError: any) {
      console.error('[extract-recipe] Python execution error:', execError);

      // Check if it's a timeout
      if (execError.killed) {
        return NextResponse.json(
          {
            success: false,
            message: 'Recipe extraction timed out. The video may be too long.',
            video_id: videoId,
          },
          { status: 504 }
        );
      }

      // Try to parse any output that might have been returned
      if (execError.stdout) {
        try {
          const result = JSON.parse(execError.stdout);
          return NextResponse.json(result);
        } catch {
          // Couldn't parse output
        }
      }

      return NextResponse.json(
        {
          success: false,
          message: 'Failed to execute recipe extraction script',
          error: execError.message,
          video_id: videoId,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('[extract-recipe] Request error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// GET endpoint for health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/extract-recipe',
    method: 'POST',
    description: 'Extract recipe from YouTube video using AI',
    usage: {
      body: {
        url: 'YouTube video URL (regular videos or Shorts)',
      },
    },
    supported_formats: [
      'https://www.youtube.com/watch?v=VIDEO_ID',
      'https://youtu.be/VIDEO_ID',
      'https://www.youtube.com/shorts/VIDEO_ID',
    ],
  });
}
