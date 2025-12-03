import { youtubeCrawlerService, ContentCreator, ProcessedVideo } from './youtube-crawler';
import { youtubeService } from './youtube';
import * as cron from 'node-cron';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Re-export types for external use
export type { ContentCreator, ProcessedVideo } from './youtube-crawler';

interface CrawlSchedule {
  creatorId: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  lastRun?: string;
  nextRun: string;
  isActive: boolean;
}

export interface CrawlResult {
  creatorId: string;
  crawlDate: string;
  videosProcessed: number;
  successfulExtractions: number;
  failedExtractions: number;
  totalIngredients: number;
  averageConfidence: number;
  errors: string[];
  ingredientsExtracted: number;
  timestamp: string;
}

export class ContentCreatorManager {
  private creators: Map<string, ContentCreator> = new Map();
  private schedules: Map<string, CrawlSchedule> = new Map();
  private crawlResults: CrawlResult[] = [];
  private dataDir: string;
  private isInitialized = false;

  constructor() {
    this.dataDir = join(process.cwd(), 'data', 'content-creators');
    this.ensureDataDirectory();
  }

  /**
   * Initialize the content creator manager
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    await this.loadCreators();
    await this.loadSchedules();
    await this.loadCrawlResults();
    this.setupCronJobs();
    
    this.isInitialized = true;
  }

  /**
   * Ensure data directory exists
   */
  private ensureDataDirectory(): void {
    const fs = require('fs');
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  /**
   * Add a new content creator
   */
  async addCreator(creator: Omit<ContentCreator, 'id' | 'totalVideosProcessed' | 'averageIngredientAccuracy'>): Promise<string> {
    const id = `creator-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newCreator: ContentCreator = {
      ...creator,
      id,
      totalVideosProcessed: 0,
      averageIngredientAccuracy: 0,
    };

    this.creators.set(id, newCreator);
    await this.saveCreators();

    // Create crawl schedule
    await this.scheduleCreator(id, creator.crawlFrequency);

    return id;
  }

  /**
   * Get all content creators
   */
  getCreators(): ContentCreator[] {
    return Array.from(this.creators.values());
  }

  /**
   * Get creator by ID
   */
  getCreator(id: string): ContentCreator | null {
    return this.creators.get(id) || null;
  }

  /**
   * Update creator information
   */
  async updateCreator(id: string, updates: Partial<ContentCreator>): Promise<boolean> {
    const creator = this.creators.get(id);
    if (!creator) return false;

    Object.assign(creator, updates);
    this.creators.set(id, creator);
    await this.saveCreators();

    // Update schedule if frequency changed
    if (updates.crawlFrequency) {
      await this.scheduleCreator(id, updates.crawlFrequency);
    }

    return true;
  }

  /**
   * Remove a content creator
   */
  async removeCreator(id: string): Promise<boolean> {
    const removed = this.creators.delete(id);
    if (removed) {
      this.schedules.delete(id);
      await this.saveCreators();
      await this.saveSchedules();
    }
    return removed;
  }

  /**
   * Schedule periodic crawling for a creator
   */
  private async scheduleCreator(creatorId: string, frequency: 'daily' | 'weekly' | 'monthly'): Promise<void> {
    const now = new Date();
    let nextRun: Date;

    switch (frequency) {
      case 'daily':
        nextRun = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        nextRun = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        nextRun = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        break;
    }

    const schedule: CrawlSchedule = {
      creatorId,
      frequency,
      nextRun: nextRun.toISOString(),
      isActive: true
    };

    this.schedules.set(creatorId, schedule);
    await this.saveSchedules();
  }

  /**
   * Crawl a specific creator's content
   */
  async crawlCreator(creatorId: string, maxVideos: number = 10): Promise<CrawlResult> {
    const creator = this.creators.get(creatorId);
    if (!creator) {
      throw new Error(`Creator with ID ${creatorId} not found`);
    }

    const crawlResult: CrawlResult = {
      creatorId,
      crawlDate: new Date().toISOString(),
      videosProcessed: 0,
      successfulExtractions: 0,
      failedExtractions: 0,
      totalIngredients: 0,
      averageConfidence: 0,
      errors: [],
      ingredientsExtracted: 0,
      timestamp: new Date().toISOString()
    };

    try {
      // Search for recent videos from this creator
      const searchQuery = `${creator.name} ${creator.categories.join(' ')} recipe cooking`;
      const searchResult = await youtubeService.searchRecipeVideos(searchQuery, maxVideos);

      // Filter videos from this specific channel
      const creatorVideos = searchResult.videos.filter(video => 
        video.channelTitle.toLowerCase().includes(creator.name.toLowerCase()) ||
        creator.channelId === video.channelTitle // This would need proper channel ID matching
      );

      crawlResult.videosProcessed = creatorVideos.length;

      const processedVideos: ProcessedVideo[] = [];
      let totalConfidence = 0;
      let totalIngredients = 0;

      for (const video of creatorVideos) {
        try {
          const videoUrl = `https://www.youtube.com/watch?v=${video.id}`;
          const processedVideo = await youtubeCrawlerService.processVideoUrl(videoUrl);
          
          processedVideos.push(processedVideo);
          crawlResult.successfulExtractions++;
          
          totalIngredients += processedVideo.extractedIngredients.length;
          totalConfidence += processedVideo.processingMetadata.confidence;
          
        } catch (error) {
          crawlResult.failedExtractions++;
          crawlResult.errors.push(`Failed to process video ${video.id}: ${error}`);
        }
      }

      crawlResult.totalIngredients = totalIngredients;
      crawlResult.averageConfidence = crawlResult.successfulExtractions > 0 
        ? totalConfidence / crawlResult.successfulExtractions 
        : 0;

      // Update creator statistics
      creator.totalVideosProcessed += crawlResult.successfulExtractions;
      creator.averageIngredientAccuracy = crawlResult.averageConfidence;
      creator.lastCrawled = crawlResult.crawlDate;

      await this.updateCreator(creatorId, creator);

      // Save processed videos
      await this.saveProcessedVideos(creatorId, processedVideos);

      // Update schedule
      const schedule = this.schedules.get(creatorId);
      if (schedule) {
        schedule.lastRun = crawlResult.crawlDate;
        const nextRun = this.calculateNextRun(schedule.frequency);
        schedule.nextRun = nextRun.toISOString();
        await this.saveSchedules();
      }

    } catch (error) {
      crawlResult.errors.push(`Crawl failed: ${error}`);
    }

    this.crawlResults.push(crawlResult);
    await this.saveCrawlResults();

    return crawlResult;
  }

  /**
   * Get crawl results for a creator
   */
  getCreatorCrawlResults(creatorId: string): CrawlResult[] {
    return this.crawlResults.filter(result => result.creatorId === creatorId);
  }

  /**
   * Get all crawl results
   */
  getAllCrawlResults(): CrawlResult[] {
    return [...this.crawlResults];
  }

  /**
   * Calculate next run time based on frequency
   */
  private calculateNextRun(frequency: 'daily' | 'weekly' | 'monthly'): Date {
    const now = new Date();
    switch (frequency) {
      case 'daily':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case 'monthly':
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    }
  }

  /**
   * Setup cron jobs for scheduled crawling
   */
  private setupCronJobs(): void {
    // Run every hour to check for scheduled crawls
    cron.schedule('0 * * * *', async () => {
      await this.runScheduledCrawls();
    });

    console.log('Content creator crawl scheduler initialized');
  }

  /**
   * Run scheduled crawls
   */
  private async runScheduledCrawls(): Promise<void> {
    const now = new Date();
    
    for (const [creatorId, schedule] of this.schedules) {
      if (!schedule.isActive) continue;
      
      const nextRun = new Date(schedule.nextRun);
      if (now >= nextRun) {
        try {
          console.log(`Running scheduled crawl for creator ${creatorId}`);
          await this.crawlCreator(creatorId);
        } catch (error) {
          console.error(`Scheduled crawl failed for creator ${creatorId}:`, error);
        }
      }
    }
  }

  /**
   * Load creators from file
   */
  private async loadCreators(): Promise<void> {
    const filePath = join(this.dataDir, 'creators.json');
    if (existsSync(filePath)) {
      try {
        const data = readFileSync(filePath, 'utf-8');
        const creators: ContentCreator[] = JSON.parse(data);
        this.creators.clear();
        creators.forEach(creator => this.creators.set(creator.id, creator));
      } catch (error) {
        console.error('Error loading creators:', error);
      }
    }
  }

  /**
   * Save creators to file
   */
  private async saveCreators(): Promise<void> {
    const filePath = join(this.dataDir, 'creators.json');
    const creators = Array.from(this.creators.values());
    writeFileSync(filePath, JSON.stringify(creators, null, 2));
  }

  /**
   * Load schedules from file
   */
  private async loadSchedules(): Promise<void> {
    const filePath = join(this.dataDir, 'schedules.json');
    if (existsSync(filePath)) {
      try {
        const data = readFileSync(filePath, 'utf-8');
        const schedules: CrawlSchedule[] = JSON.parse(data);
        this.schedules.clear();
        schedules.forEach(schedule => this.schedules.set(schedule.creatorId, schedule));
      } catch (error) {
        console.error('Error loading schedules:', error);
      }
    }
  }

  /**
   * Save schedules to file
   */
  private async saveSchedules(): Promise<void> {
    const filePath = join(this.dataDir, 'schedules.json');
    const schedules = Array.from(this.schedules.values());
    writeFileSync(filePath, JSON.stringify(schedules, null, 2));
  }

  /**
   * Load crawl results from file
   */
  private async loadCrawlResults(): Promise<void> {
    const filePath = join(this.dataDir, 'crawl-results.json');
    if (existsSync(filePath)) {
      try {
        const data = readFileSync(filePath, 'utf-8');
        this.crawlResults = JSON.parse(data);
      } catch (error) {
        console.error('Error loading crawl results:', error);
      }
    }
  }

  /**
   * Save crawl results to file
   */
  private async saveCrawlResults(): Promise<void> {
    const filePath = join(this.dataDir, 'crawl-results.json');
    writeFileSync(filePath, JSON.stringify(this.crawlResults, null, 2));
  }

  /**
   * Save processed videos for a creator
   */
  private async saveProcessedVideos(creatorId: string, videos: ProcessedVideo[]): Promise<void> {
    const filePath = join(this.dataDir, `${creatorId}-videos-${Date.now()}.json`);
    writeFileSync(filePath, JSON.stringify(videos, null, 2));
  }

  /**
   * Add popular Filipino cooking content creators
   */
  async addPopularCreators(): Promise<void> {
    const popularCreators = [
      {
        name: 'Panlasang Pinoy',
        channelId: 'UCsqGqiOKLKrzGg-kfCtJiWg',
        channelUrl: 'https://www.youtube.com/@PanlasangPinoy',
        crawlFrequency: 'weekly' as const,
        categories: ['filipino', 'traditional', 'recipe'],
        isActive: true,
        enabled: true,
        totalVideos: 0,
        totalIngredients: 0,
        addedAt: new Date().toISOString()
      },
      {
        name: 'Ninong Ry',
        channelId: 'UCkP2l4h4z8f4z8f4z8f4z8f',
        channelUrl: 'https://www.youtube.com/@NinongRy',
        crawlFrequency: 'weekly' as const,
        categories: ['filipino', 'street food', 'cooking'],
        isActive: true,
        enabled: true,
        totalVideos: 0,
        totalIngredients: 0,
        addedAt: new Date().toISOString()
      },
      {
        name: 'Lutong Bahay Recipe',
        channelId: 'UCkP2l4h4z8f4z8f4z8f4z8g',
        channelUrl: 'https://www.youtube.com/@LutongBahayRecipe',
        crawlFrequency: 'weekly' as const,
        categories: ['home cooking', 'filipino', 'easy recipes'],
        isActive: true,
        enabled: true,
        totalVideos: 0,
        totalIngredients: 0,
        addedAt: new Date().toISOString()
      },
      {
        name: 'Chef RV Manabat',
        channelId: 'UCkP2l4h4z8f4z8f4z8f4z8h',
        channelUrl: 'https://www.youtube.com/@ChefRVManabat',
        crawlFrequency: 'monthly' as const,
        categories: ['professional', 'filipino', 'techniques'],
        isActive: true,
        enabled: true,
        totalVideos: 0,
        totalIngredients: 0,
        addedAt: new Date().toISOString()
      },
      {
        name: 'Simpol',
        channelId: 'UCkP2l4h4z8f4z8f4z8f4z8i',
        channelUrl: 'https://www.youtube.com/@Simpol',
        crawlFrequency: 'weekly' as const,
        categories: ['simple', 'filipino', 'quick recipes'],
        isActive: true,
        enabled: true,
        totalVideos: 0,
        totalIngredients: 0,
        addedAt: new Date().toISOString()
      }
    ];

    for (const creator of popularCreators) {
      try {
        await this.addCreator(creator);
        console.log(`Added creator: ${creator.name}`);
      } catch (error) {
        console.error(`Failed to add creator ${creator.name}:`, error);
      }
    }
  }

  /**
   * Get statistics for all creators
   */
  getStatistics(): {
    totalCreators: number;
    activeCreators: number;
    totalVideosProcessed: number;
    averageAccuracy: number;
    recentCrawls: number;
  } {
    const creators = Array.from(this.creators.values());
    const activeCreators = creators.filter(c => c.isActive);
    const totalVideosProcessed = creators.reduce((sum, c) => sum + c.totalVideosProcessed, 0);
    const averageAccuracy = creators.length > 0 
      ? creators.reduce((sum, c) => sum + c.averageIngredientAccuracy, 0) / creators.length 
      : 0;
    
    const recentCrawls = this.crawlResults.filter(result => {
      const crawlDate = new Date(result.crawlDate);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return crawlDate >= weekAgo;
    }).length;

    return {
      totalCreators: creators.length,
      activeCreators: activeCreators.length,
      totalVideosProcessed,
      averageAccuracy,
      recentCrawls
    };
  }
}

export const contentCreatorManager = new ContentCreatorManager();
export type { CrawlSchedule };