import { youtubeService, YouTubeVideo } from './youtube';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import * as cheerio from 'cheerio';
import { createWorker } from 'tesseract.js';

// Types for the comprehensive crawling system
export interface ExtractedIngredient {
  name: string;
  quantity?: string;
  unit?: string;
  confidence: number;
  source: 'description' | 'transcript' | 'ocr' | 'linked_resource';
  timestamp?: number;
}

export interface ProcessedVideo {
  id: string;
  title: string;
  description: string;
  channelTitle: string;
  channelId: string;
  publishedAt: string;
  duration?: string;
  viewCount?: number;
  likeCount?: number;
  thumbnails: any;
  extractedIngredients: ExtractedIngredient[];
  processingMetadata: {
    processedAt: string;
    processingDuration: number;
    sourcesProcessed: string[];
    confidence: number;
    errors: string[];
  };
}

export interface ContentCreator {
  id: string;
  name: string;
  channelId: string;
  channelUrl: string;
  description?: string;
  lastCrawled?: string;
  totalVideosProcessed: number;
  averageIngredientAccuracy: number;
  isActive: boolean;
  crawlFrequency: 'daily' | 'weekly' | 'monthly';
  categories: string[];
  category?: string; // For backward compatibility
  enabled: boolean;
  totalVideos: number;
  totalIngredients: number;
  addedAt: string;
}

export interface CrawlingProgress {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  totalVideos: number;
  processedVideos: number;
  successfulVideos: number;
  failedVideos: number;
  startTime: string;
  estimatedCompletion?: string;
  currentVideo?: string;
  errors: string[];
}

export class YouTubeCrawlerService {
  private rateLimiter: RateLimiterMemory;
  private ocrWorker: any = null;
  private progressTracking: Map<string, CrawlingProgress> = new Map();

  constructor() {
    // Rate limiting: 100 requests per hour to respect YouTube's ToS
    this.rateLimiter = new RateLimiterMemory({
      points: 100, // Number of requests
      duration: 3600, // Per hour
    });
  }

  /**
   * Initialize OCR worker
   */
  private async initializeOCR() {
    if (!this.ocrWorker) {
      this.ocrWorker = await createWorker('eng');
    }
    return this.ocrWorker;
  }

  /**
   * Extract video ID from various YouTube URL formats
   */
  extractVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
      /youtube\.com\/shorts\/([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }
    return null;
  }

  /**
   * Process a single YouTube video URL
   * @param url - YouTube video URL
   * @param fastMode - Skip OCR and linked resources for faster processing (default: true)
   */
  async processVideoUrl(url: string, fastMode: boolean = true): Promise<ProcessedVideo> {
    const startTime = Date.now();
    const videoId = this.extractVideoId(url);

    if (!videoId) {
      throw new Error('Invalid YouTube URL format');
    }

    // Rate limiting check
    await this.rateLimiter.consume('youtube-crawler');

    const processingMetadata = {
      processedAt: new Date().toISOString(),
      processingDuration: 0,
      sourcesProcessed: [] as string[],
      confidence: 0,
      errors: [] as string[],
    };

    try {
      // Get video details
      const videoDetails = await youtubeService.getVideoDetails(videoId);
      if (!videoDetails) {
        throw new Error('Video not found or unavailable');
      }

      const extractedIngredients: ExtractedIngredient[] = [];

      // 1. Extract from description (fast)
      try {
        const descriptionIngredients = await this.extractIngredientsFromDescription(
          videoDetails.description
        );
        extractedIngredients.push(...descriptionIngredients);
        processingMetadata.sourcesProcessed.push('description');
      } catch (error) {
        processingMetadata.errors.push(`Description parsing error: ${error}`);
      }

      // 2. Extract from transcript (fast - uses cached/mock data)
      try {
        const transcriptIngredients =
          await this.extractIngredientsFromTranscript(videoId);
        extractedIngredients.push(...transcriptIngredients);
        processingMetadata.sourcesProcessed.push('transcript');
      } catch (error) {
        processingMetadata.errors.push(`Transcript parsing error: ${error}`);
      }

      // 3. Extract from thumbnail OCR (SLOW - skip in fast mode)
      if (!fastMode) {
        try {
          const ocrIngredients = await this.extractIngredientsFromThumbnail(
            videoDetails.thumbnails
          );
          extractedIngredients.push(...ocrIngredients);
          processingMetadata.sourcesProcessed.push('ocr');
        } catch (error) {
          processingMetadata.errors.push(`OCR parsing error: ${error}`);
        }
      } else {
        processingMetadata.errors.push('OCR skipped (fast mode)');
      }

      // 4. Extract from linked resources (SLOW - skip in fast mode)
      if (!fastMode) {
        try {
          const linkedIngredients = await this.extractIngredientsFromLinkedResources(
            videoDetails.description
          );
          extractedIngredients.push(...linkedIngredients);
          processingMetadata.sourcesProcessed.push('linked_resources');
        } catch (error) {
          processingMetadata.errors.push(`Linked resources parsing error: ${error}`);
        }
      } else {
        processingMetadata.errors.push('Linked resources skipped (fast mode)');
      }

      // Deduplicate and calculate confidence
      const deduplicatedIngredients = this.deduplicateIngredients(extractedIngredients);
      processingMetadata.confidence = this.calculateOverallConfidence(
        deduplicatedIngredients
      );
      processingMetadata.processingDuration = Date.now() - startTime;

      return {
        id: videoDetails.id,
        title: videoDetails.title,
        description: videoDetails.description,
        channelTitle: videoDetails.channelTitle,
        channelId: '', // Will be populated from additional API call if needed
        publishedAt: videoDetails.publishedAt,
        thumbnails: videoDetails.thumbnails,
        extractedIngredients: deduplicatedIngredients,
        processingMetadata,
      };
    } catch (error) {
      processingMetadata.errors.push(`Processing error: ${error}`);
      processingMetadata.processingDuration = Date.now() - startTime;
      throw error;
    }
  }

  /**
   * Extract ingredients from video description
   */
  private async extractIngredientsFromDescription(
    description: string
  ): Promise<ExtractedIngredient[]> {
    const ingredients: ExtractedIngredient[] = [];
    const lines = description.split('\n');

    // Common ingredient patterns
    const ingredientPatterns = [
      /(\d+(?:\.\d+)?)\s*(cups?|tbsp|tsp|lbs?|oz|grams?|kg|pieces?|cloves?|slices?)\s+(.+)/i,
      /(\d+(?:\.\d+)?)\s*(.+?)(?:\s*-|\s*,|\s*\n|$)/i,
      /(?:ingredients?|you(?:'ll)?\s+need|recipe|materials?)[\s:]*\n?(.*?)(?:\n\n|instructions?|directions?|steps?|method|preparation)/i,
    ];

    let inIngredientsSection = false;

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Check if we're entering ingredients section
      if (/(?:ingredients?|you(?:'ll)?\s+need|recipe|materials?)/i.test(trimmedLine)) {
        inIngredientsSection = true;
        continue;
      }

      // Check if we're leaving ingredients section
      if (
        inIngredientsSection &&
        /(?:instructions?|directions?|steps?|method|preparation|procedure)/i.test(
          trimmedLine
        )
      ) {
        inIngredientsSection = false;
        continue;
      }

      // Extract ingredients
      if (inIngredientsSection || /^[\d•\-\*]\s*/.test(trimmedLine)) {
        for (const pattern of ingredientPatterns) {
          const match = trimmedLine.match(pattern);
          if (match) {
            const ingredient: ExtractedIngredient = {
              name: match[3] || match[2] || trimmedLine.replace(/^[\d•\-\*]\s*/, ''),
              quantity: match[1] || undefined,
              unit: match[2] || undefined,
              confidence: 0.8,
              source: 'description',
            };

            if (ingredient.name && ingredient.name.length > 2) {
              ingredients.push(ingredient);
            }
            break;
          }
        }
      }
    }

    return ingredients;
  }

  /**
   * Extract ingredients from video transcript
   */
  private async extractIngredientsFromTranscript(
    videoId: string
  ): Promise<ExtractedIngredient[]> {
    const ingredients: ExtractedIngredient[] = [];

    try {
      // Note: Using mock transcript for now since YouTube API doesn't provide transcripts
      // In production, you would use youtube-transcript library or speech-to-text service
      const transcript = await youtubeService.getVideoTranscript(videoId);

      const fullText = transcript.map((item) => item.text).join(' ');

      // Extract ingredients from transcript text using NLP patterns
      const ingredientKeywords = [
        'chicken',
        'pork',
        'beef',
        'fish',
        'shrimp',
        'vegetables',
        'onion',
        'garlic',
        'ginger',
        'tomato',
        'potato',
        'carrot',
        'bell pepper',
        'soy sauce',
        'vinegar',
        'salt',
        'pepper',
        'oil',
        'rice',
        'noodles',
        'flour',
        'sugar',
        'milk',
        'egg',
      ];

      const quantityPatterns = [
        /(\d+(?:\.\d+)?)\s*(cups?|tablespoons?|teaspoons?|pounds?|ounces?|grams?|kilograms?|pieces?|cloves?)\s+(?:of\s+)?(\w+)/gi,
        /(\d+(?:\.\d+)?)\s+(\w+)/gi,
      ];

      for (const pattern of quantityPatterns) {
        let match;
        while ((match = pattern.exec(fullText)) !== null) {
          const quantity = match[1];
          const unit = match[2];
          const name = match[3] || match[2];

          if (
            ingredientKeywords.some(
              (keyword) =>
                name.toLowerCase().includes(keyword) ||
                keyword.includes(name.toLowerCase())
            )
          ) {
            ingredients.push({
              name: name,
              quantity: quantity,
              unit: unit !== name ? unit : undefined,
              confidence: 0.6,
              source: 'transcript',
              timestamp: 0, // Would be actual timestamp in real implementation
            });
          }
        }
      }
    } catch (error) {
      console.error('Transcript extraction error:', error);
    }

    return ingredients;
  }

  /**
   * Extract ingredients from thumbnail using OCR
   */
  private async extractIngredientsFromThumbnail(
    thumbnails: any
  ): Promise<ExtractedIngredient[]> {
    const ingredients: ExtractedIngredient[] = [];

    try {
      const worker = await this.initializeOCR();
      const thumbnailUrl =
        thumbnails.maxres?.url || thumbnails.high?.url || thumbnails.medium?.url;

      if (thumbnailUrl) {
        const {
          data: { text },
        } = await worker.recognize(thumbnailUrl);

        // Extract ingredients from OCR text
        const ocrIngredients = await this.extractIngredientsFromDescription(text);
        ingredients.push(
          ...ocrIngredients.map((ing) => ({
            ...ing,
            source: 'ocr' as const,
            confidence: ing.confidence * 0.7, // Lower confidence for OCR
          }))
        );
      }
    } catch (error) {
      console.error('OCR extraction error:', error);
    }

    return ingredients;
  }

  /**
   * Extract ingredients from linked resources in description
   */
  private async extractIngredientsFromLinkedResources(
    description: string
  ): Promise<ExtractedIngredient[]> {
    const ingredients: ExtractedIngredient[] = [];

    try {
      // Extract URLs from description
      const urlPattern = /https?:\/\/[^\s]+/g;
      const urls = description.match(urlPattern) || [];

      for (const url of urls.slice(0, 3)) {
        // Limit to 3 URLs to avoid excessive requests
        try {
          await this.rateLimiter.consume('youtube-crawler');

          const response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MixAndMunch/1.0)' },
            signal: AbortSignal.timeout(10000), // 10 second timeout
          });

          if (response.ok) {
            const html = await response.text();
            const $ = cheerio.load(html);

            // Look for recipe ingredients in common selectors
            const ingredientSelectors = [
              '.recipe-ingredient',
              '.ingredient',
              '[class*="ingredient"]',
              '.recipe-ingredients li',
              '.ingredients li',
            ];

            for (const selector of ingredientSelectors) {
              $(selector).each((_, element) => {
                const text = $(element).text().trim();
                if (text && text.length > 2) {
                  ingredients.push({
                    name: text,
                    confidence: 0.5,
                    source: 'linked_resource',
                  });
                }
              });
            }
          }
        } catch (error) {
          console.error(`Error processing linked resource ${url}:`, error);
        }
      }
    } catch (error) {
      console.error('Linked resources extraction error:', error);
    }

    return ingredients;
  }

  /**
   * Deduplicate ingredients based on similarity
   */
  private deduplicateIngredients(
    ingredients: ExtractedIngredient[]
  ): ExtractedIngredient[] {
    const deduplicated: ExtractedIngredient[] = [];
    const seen = new Set<string>();

    for (const ingredient of ingredients) {
      const normalizedName = ingredient.name.toLowerCase().trim();

      // Check for exact matches
      if (seen.has(normalizedName)) {
        continue;
      }

      // Check for similar ingredients (simple similarity check)
      let isDuplicate = false;
      for (const existing of deduplicated) {
        const existingNormalized = existing.name.toLowerCase().trim();

        // Simple similarity check - if one name contains the other
        if (
          normalizedName.includes(existingNormalized) ||
          existingNormalized.includes(normalizedName)
        ) {
          // Keep the one with higher confidence or more specific information
          if (
            ingredient.confidence > existing.confidence ||
            (ingredient.quantity && !existing.quantity)
          ) {
            // Replace existing with current
            const index = deduplicated.indexOf(existing);
            deduplicated[index] = ingredient;
          }
          isDuplicate = true;
          break;
        }
      }

      if (!isDuplicate) {
        deduplicated.push(ingredient);
        seen.add(normalizedName);
      }
    }

    return deduplicated;
  }

  /**
   * Calculate overall confidence score
   */
  private calculateOverallConfidence(ingredients: ExtractedIngredient[]): number {
    if (ingredients.length === 0) return 0;

    const totalConfidence = ingredients.reduce((sum, ing) => sum + ing.confidence, 0);
    return totalConfidence / ingredients.length;
  }

  /**
   * Create progress tracking for crawling operation
   */
  createProgressTracker(totalVideos: number): string {
    const id = `crawl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const progress: CrawlingProgress = {
      id,
      status: 'pending',
      totalVideos,
      processedVideos: 0,
      successfulVideos: 0,
      failedVideos: 0,
      startTime: new Date().toISOString(),
      errors: [],
    };

    this.progressTracking.set(id, progress);
    return id;
  }

  /**
   * Update progress tracking
   */
  updateProgress(id: string, updates: Partial<CrawlingProgress>): void {
    const progress = this.progressTracking.get(id);
    if (progress) {
      Object.assign(progress, updates);
      this.progressTracking.set(id, progress);
    }
  }

  /**
   * Get progress status
   */
  getProgress(id: string): CrawlingProgress | null {
    return this.progressTracking.get(id) || null;
  }

  /**
   * Validate extracted ingredients
   */
  validateIngredients(ingredients: ExtractedIngredient[]): {
    valid: ExtractedIngredient[];
    invalid: ExtractedIngredient[];
    accuracy: number;
  } {
    const valid: ExtractedIngredient[] = [];
    const invalid: ExtractedIngredient[] = [];

    const commonIngredients = [
      'chicken',
      'pork',
      'beef',
      'fish',
      'shrimp',
      'vegetables',
      'onion',
      'garlic',
      'ginger',
      'tomato',
      'potato',
      'carrot',
      'bell pepper',
      'soy sauce',
      'vinegar',
      'salt',
      'pepper',
      'oil',
      'rice',
      'noodles',
      'flour',
      'sugar',
      'milk',
      'egg',
      'water',
      'broth',
      'stock',
      'sauce',
      'spice',
      'herb',
    ];

    for (const ingredient of ingredients) {
      const name = ingredient.name.toLowerCase();
      const isValid =
        commonIngredients.some(
          (common) => name.includes(common) || common.includes(name)
        ) || ingredient.confidence > 0.7;

      if (isValid) {
        valid.push(ingredient);
      } else {
        invalid.push(ingredient);
      }
    }

    const accuracy = ingredients.length > 0 ? valid.length / ingredients.length : 0;

    return { valid, invalid, accuracy };
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    if (this.ocrWorker) {
      await this.ocrWorker.terminate();
      this.ocrWorker = null;
    }
  }
}

export const youtubeCrawlerService = new YouTubeCrawlerService();
