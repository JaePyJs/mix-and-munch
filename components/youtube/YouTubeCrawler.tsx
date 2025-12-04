'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import { ShareRecipeModal } from '@/components/community/ShareRecipeModal';
import type { ProcessedVideo, ExtractedIngredient } from '@/lib/services/youtube-crawler';

interface YouTubeCrawlerProps {
  onIngredientsExtracted?: (ingredients: ExtractedIngredient[]) => void;
}

export default function YouTubeCrawler({ onIngredientsExtracted }: YouTubeCrawlerProps) {
  const [url, setUrl] = useState('');
  const [processing, setProcessing] = useState(false);
  const [processedVideo, setProcessedVideo] = useState<ProcessedVideo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validationResults, setValidationResults] = useState<any>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [cacheStatus, setCacheStatus] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);

  // URL validation
  const isValidYouTubeUrl = (url: string): boolean => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
      /youtube\.com\/shorts\/([^&\n?#]+)/,
    ];
    return patterns.some((pattern) => pattern.test(url));
  };

  // Process YouTube URL
  const processUrl = async () => {
    if (!url.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    if (!isValidYouTubeUrl(url)) {
      setError('Please enter a valid YouTube URL');
      return;
    }

    setProcessing(true);
    setError(null);
    setProcessedVideo(null);
    setValidationResults(null);
    setCacheStatus(null);
    setIsFromCache(false);

    try {
      // FIRST: Check if this video is already in cache
      const cacheCheckResponse = await fetch(
        `/api/youtube-cache?url=${encodeURIComponent(url.trim())}`
      );
      const cacheData = await cacheCheckResponse.json();

      if (cacheData.cached && cacheData.video) {
        // Video already processed! Use cached data
        setCacheStatus(cacheData.message);
        setIsFromCache(true);

        const cachedVideo: ProcessedVideo = {
          id: cacheData.video.videoId,
          title: cacheData.video.title,
          channelTitle: cacheData.video.channelTitle,
          description: cacheData.video.description || '',
          channelId: cacheData.video.channelId || '',
          publishedAt: cacheData.video.publishedAt || new Date().toISOString(),
          thumbnails: cacheData.video.thumbnails || {},
          extractedIngredients: cacheData.video.extractedIngredients || [],
          processingMetadata: {
            processedAt: cacheData.video.processedAt || new Date().toISOString(),
            processingDuration: 0,
            sourcesProcessed: ['cache'],
            confidence: cacheData.video.confidence || 0.8,
            errors: [],
          },
        };

        setProcessedVideo(cachedVideo);
        setProcessing(false);

        if (onIngredientsExtracted && cachedVideo.extractedIngredients) {
          onIngredientsExtracted(cachedVideo.extractedIngredients);
        }
        return;
      }

      // Not in cache - process the video
      const response = await fetch('/api/youtube-crawler', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'process_url',
          url: url.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to process video');
      }

      const video: ProcessedVideo = data.data;
      setProcessedVideo(video);

      // Save to cache for future users
      await fetch('/api/youtube-cache', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          videoData: {
            title: video.title,
            channelTitle: video.channelTitle,
            extractedIngredients: video.extractedIngredients,
            thumbnailUrl: video.thumbnails?.high?.url,
          },
          addToCommunity: true, // Auto-add to universal database
        }),
      });

      setCacheStatus('✨ New recipe! Saved to universal database for all users.');

      // Validate ingredients
      const validationResponse = await fetch('/api/youtube-crawler', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'validate_ingredients',
          ingredients: video.extractedIngredients,
        }),
      });

      if (validationResponse.ok) {
        const validationData = await validationResponse.json();
        setValidationResults(validationData.data);
      }

      // Callback with extracted ingredients
      if (onIngredientsExtracted) {
        onIngredientsExtracted(video.extractedIngredients);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setProcessing(false);
    }
  };

  // Format confidence as percentage
  const formatConfidence = (confidence: number): string => {
    return `${Math.round(confidence * 100)}%`;
  };

  // Get confidence color - dark theme compatible
  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return 'text-green-400';
    if (confidence >= 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Group ingredients by source
  const groupIngredientsBySource = (ingredients: ExtractedIngredient[]) => {
    return ingredients.reduce(
      (groups, ingredient) => {
        const source = ingredient.source;
        if (!groups[source]) {
          groups[source] = [];
        }
        groups[source].push(ingredient);
        return groups;
      },
      {} as Record<string, ExtractedIngredient[]>
    );
  };

  // Format processed video as recipe content for sharing
  const getRecipeContentForSharing = (): string => {
    if (!processedVideo) return '';

    const ingredients = processedVideo.extractedIngredients
      .map((ing) => {
        const qty = ing.quantity && ing.unit ? `${ing.quantity} ${ing.unit} ` : '';
        return `- ${qty}${ing.name}`;
      })
      .join('\n');

    return (
      `# ${processedVideo.title || 'Extracted Recipe'}\n\n` +
      `**Source:** YouTube Video\n` +
      `**Extracted from:** ${url}\n\n` +
      `## Ingredients\n${ingredients}\n\n` +
      `*Extracted using Mix & Munch AI*`
    );
  };

  // Demo video data - Real YouTube video for testing
  const demoVideo = {
    id: 'WloIceiE7GU',
    title: 'How A Filipino Chef Makes Traditional Adobo',
    channelTitle: 'Epicurious',
    publishedAt: '2023-01-15T10:00:00Z',
    thumbnails: {
      default: { url: 'https://i.ytimg.com/vi/WloIceiE7GU/default.jpg' },
      medium: { url: 'https://i.ytimg.com/vi/WloIceiE7GU/mqdefault.jpg' },
      high: { url: 'https://i.ytimg.com/vi/WloIceiE7GU/hqdefault.jpg' },
    },
  };

  const demoIngredients = [
    {
      name: 'Chicken',
      quantity: '1',
      unit: 'kg',
      confidence: 0.95,
      source: 'description',
      timestamp: 45,
    },
    {
      name: 'Soy Sauce',
      quantity: '1/2',
      unit: 'cup',
      confidence: 0.92,
      source: 'transcript',
      timestamp: 120,
    },
    {
      name: 'White Vinegar',
      quantity: '1/4',
      unit: 'cup',
      confidence: 0.88,
      source: 'description',
      timestamp: 135,
    },
    {
      name: 'Garlic',
      quantity: '6',
      unit: 'cloves',
      confidence: 0.9,
      source: 'visual',
      timestamp: 180,
    },
    {
      name: 'Bay Leaves',
      quantity: '3',
      unit: 'pieces',
      confidence: 0.85,
      source: 'transcript',
      timestamp: 200,
    },
    {
      name: 'Black Peppercorns',
      quantity: '1',
      unit: 'tsp',
      confidence: 0.82,
      source: 'description',
      timestamp: 220,
    },
    {
      name: 'Onion',
      quantity: '1',
      unit: 'medium',
      confidence: 0.87,
      source: 'visual',
      timestamp: 240,
    },
  ];

  const demoInstructions = [
    'Clean and cut chicken into serving pieces',
    'Marinate chicken in soy sauce and vinegar for 30 minutes',
    'Heat oil in a pan and sauté garlic and onion until fragrant',
    'Add marinated chicken and cook until lightly browned',
    'Pour in the marinade, add bay leaves and peppercorns',
    'Simmer for 30-40 minutes until chicken is tender',
    'Adjust seasoning with salt and pepper if needed',
    'Serve hot with steamed rice',
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 lg:px-6 space-y-4 sm:space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">
          YouTube Recipe Ingredient Extractor
        </h1>
        <p className="text-brand-gray-400 text-sm sm:text-base">
          Extract ingredients from YouTube cooking videos using AI-powered analysis
        </p>
      </div>

      {/* URL Input */}
      <Card className="p-4 sm:p-6 bg-brand-gray-900/50 border-brand-gray-800/70">
        <div className="space-y-4">
          <div>
            <label
              htmlFor="youtube-url"
              className="block text-sm font-medium text-brand-gray-400 mb-2"
            >
              YouTube Video URL
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                id="youtube-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="flex-1 px-3 py-2 bg-brand-gray-800/50 border border-brand-gray-700 rounded-md text-white placeholder-brand-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-lime focus:border-transparent text-sm sm:text-base"
                disabled={processing}
              />
              <Button
                onClick={processUrl}
                disabled={processing || !url.trim()}
                className="px-4 sm:px-6 w-full sm:w-auto"
              >
                {processing ? 'Processing...' : 'Extract'}
              </Button>
            </div>
          </div>

          {/* URL Validation */}
          {url && (
            <div className="text-sm">
              {isValidYouTubeUrl(url) ? (
                <span className="text-green-400">✓ Valid YouTube URL</span>
              ) : (
                <span className="text-red-400">✗ Invalid YouTube URL format</span>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="p-4 bg-red-500/10 border-red-500/20">
          <div className="flex items-center space-x-2">
            <span className="text-red-400">⚠️</span>
            <span className="text-red-400">{error}</span>
          </div>
        </Card>
      )}

      {/* Cache Status Display */}
      {cacheStatus && (
        <Card
          className={`p-4 ${isFromCache ? 'bg-blue-500/10 border-blue-500/30' : 'bg-green-500/10 border-green-500/30'}`}
        >
          <div className="flex items-center space-x-2">
            <span className={isFromCache ? 'text-blue-400' : 'text-green-400'}>
              {isFromCache ? '📦' : '✨'}
            </span>
            <span className={isFromCache ? 'text-blue-400' : 'text-green-400'}>
              {cacheStatus}
            </span>
            {isFromCache && (
              <span className="text-xs text-blue-300 ml-2">
                (No need to re-fetch - already in database)
              </span>
            )}
          </div>
        </Card>
      )}

      {/* Processing Progress */}
      {processing && (
        <Card className="p-6 bg-brand-gray-900/50 border-brand-gray-800/70">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-lime mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-white mb-2">Processing Video</h3>
            <p className="text-brand-gray-400">
              Extracting ingredients from description, transcript, and visual content...
            </p>
          </div>
        </Card>
      )}

      {/* Results */}
      {processedVideo && (
        <div className="space-y-6">
          {/* Video Information */}
          <Card className="p-4 sm:p-6 bg-brand-gray-900/50 border-brand-gray-800/70">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <img
                src={
                  processedVideo.thumbnails.medium?.url ||
                  processedVideo.thumbnails.default?.url
                }
                alt={processedVideo.title}
                className="w-full sm:w-32 h-auto sm:h-24 object-cover rounded-lg"
              />
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-semibold text-white mb-2 break-words">
                  {processedVideo.title}
                </h2>
                <p className="text-brand-gray-400 mb-2 text-sm sm:text-base">
                  by {processedVideo.channelTitle}
                </p>
                <p className="text-xs sm:text-sm text-brand-gray-500">
                  Published: {new Date(processedVideo.publishedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </Card>

          {/* Processing Metadata */}
          <Card className="p-4 sm:p-6 bg-brand-gray-900/50 border-brand-gray-800/70">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Processing Results</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-brand-lime">
                  {processedVideo.extractedIngredients.length}
                </div>
                <div className="text-xs sm:text-sm text-brand-gray-400">Ingredients</div>
              </div>
              <div className="text-center">
                <div
                  className={`text-xl sm:text-2xl font-bold ${getConfidenceColor(processedVideo.processingMetadata.confidence)}`}
                >
                  {formatConfidence(processedVideo.processingMetadata.confidence)}
                </div>
                <div className="text-xs sm:text-sm text-brand-gray-400">Confidence</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-green-400">
                  {processedVideo.processingMetadata.sourcesProcessed.length}
                </div>
                <div className="text-xs sm:text-sm text-brand-gray-400">Sources</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-purple-400">
                  {Math.round(
                    processedVideo.processingMetadata.processingDuration / 1000
                  )}
                  s
                </div>
                <div className="text-xs sm:text-sm text-brand-gray-400">Time</div>
              </div>
            </div>

            {/* Sources Processed */}
            <div className="mt-4">
              <h4 className="text-sm font-medium text-brand-gray-400 mb-2">
                Sources Processed:
              </h4>
              <div className="flex flex-wrap gap-2">
                {processedVideo.processingMetadata.sourcesProcessed.map(
                  (source, index) => (
                    <Tag key={index} tone="gray">
                      {source.replace('_', ' ').toUpperCase()}
                    </Tag>
                  )
                )}
              </div>
            </div>

            {/* Errors */}
            {processedVideo.processingMetadata.errors.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-red-400 mb-2">
                  Processing Warnings:
                </h4>
                <ul className="text-sm text-red-300 space-y-1">
                  {processedVideo.processingMetadata.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </Card>

          {/* Extracted Ingredients */}
          <Card className="p-6 bg-brand-gray-900/50 border-brand-gray-800/70">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Extracted Ingredients</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="border-brand-gray-700 text-brand-gray-300 hover:bg-brand-gray-800 hover:text-white"
              >
                {showAdvanced ? 'Simple View' : 'Advanced View'}
              </Button>
            </div>

            {showAdvanced ? (
              /* Advanced View - Grouped by Source */
              <div className="space-y-6">
                {Object.entries(
                  groupIngredientsBySource(processedVideo.extractedIngredients)
                ).map(([source, ingredients]) => (
                  <div key={source}>
                    <h4 className="text-md font-medium text-brand-gray-300 mb-3 capitalize">
                      From {source.replace('_', ' ')} ({ingredients.length} ingredients)
                    </h4>
                    <div className="grid gap-3">
                      {ingredients.map((ingredient, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-brand-gray-800/50 rounded-lg border border-brand-gray-700/50"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-white">
                              {ingredient.quantity && ingredient.unit
                                ? `${ingredient.quantity} ${ingredient.unit} ${ingredient.name}`
                                : ingredient.name}
                            </div>
                            {ingredient.timestamp && (
                              <div className="text-sm text-brand-gray-400">
                                Timestamp: {ingredient.timestamp}s
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`text-sm font-medium ${getConfidenceColor(ingredient.confidence)}`}
                            >
                              {formatConfidence(ingredient.confidence)}
                            </span>
                            <Tag tone="gray">{ingredient.source}</Tag>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Simple View - List of Ingredients */
              <div className="grid gap-2">
                {processedVideo.extractedIngredients.map((ingredient, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-brand-gray-800/50 rounded-lg border border-brand-gray-700/50 gap-2"
                  >
                    <div className="font-medium text-white flex-1 min-w-0">
                      {ingredient.quantity && ingredient.unit
                        ? `${ingredient.quantity} ${ingredient.unit} ${ingredient.name}`
                        : ingredient.name}
                    </div>
                    <span
                      className={`text-sm font-medium ${getConfidenceColor(ingredient.confidence)} flex-shrink-0`}
                    >
                      {formatConfidence(ingredient.confidence)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Validation Results */}
          {validationResults && (
            <Card className="p-6 bg-brand-gray-900/50 border-brand-gray-800/70">
              <h3 className="text-lg font-semibold text-white mb-4">
                Quality Assessment
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">
                    {validationResults.valid.length}
                  </div>
                  <div className="text-sm text-green-300">Valid Ingredients</div>
                </div>
                <div className="text-center p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <div className="text-2xl font-bold text-red-400">
                    {validationResults.invalid.length}
                  </div>
                  <div className="text-sm text-red-300">Needs Review</div>
                </div>
                <div className="text-center p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">
                    {formatConfidence(validationResults.accuracy)}
                  </div>
                  <div className="text-sm text-blue-300">Accuracy Score</div>
                </div>
              </div>

              {validationResults.invalid.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-red-400 mb-2">
                    Items Needing Review:
                  </h4>
                  <div className="space-y-2">
                    {validationResults.invalid.map(
                      (ingredient: ExtractedIngredient, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-red-500/10 border border-red-500/30 rounded"
                        >
                          <span className="text-red-300">{ingredient.name}</span>
                          <span className="text-sm text-red-400">
                            {formatConfidence(ingredient.confidence)} confidence
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Export & Share Options */}
          <Card className="p-6 bg-brand-gray-900/50 border-brand-gray-800/70">
            <h3 className="text-lg font-semibold text-white mb-4">Export & Share</h3>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  const data = JSON.stringify(processedVideo, null, 2);
                  const blob = new Blob([data], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `ingredients-${processedVideo.id}.json`;
                  a.click();
                }}
                className="border-brand-gray-700 text-brand-gray-300 hover:bg-brand-gray-800 hover:text-white"
              >
                📥 Download JSON
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const csv = [
                    'Name,Quantity,Unit,Confidence,Source',
                    ...processedVideo.extractedIngredients.map(
                      (ing) =>
                        `"${ing.name}","${ing.quantity || ''}","${ing.unit || ''}","${ing.confidence}","${ing.source}"`
                    ),
                  ].join('\n');
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `ingredients-${processedVideo.id}.csv`;
                  a.click();
                }}
                className="border-brand-gray-700 text-brand-gray-300 hover:bg-brand-gray-800 hover:text-white"
              >
                📊 Download CSV
              </Button>
              <Button
                variant="primary"
                onClick={() => setShowShareModal(true)}
                className="bg-brand-lime text-brand-gray-900 hover:bg-brand-lime/90"
              >
                🌟 Share to Community
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Demo Section - Show when no URL is provided or when there's an error */}
      {!processedVideo && !processing && (
        <div className="space-y-6">
          <Card className="p-6 bg-brand-gray-900/50 border-brand-gray-800/70">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-white mb-2">
                Demo: Recipe Extraction
              </h2>
              <p className="text-brand-gray-400">
                See how our AI extracts ingredients and instructions from cooking videos
              </p>
            </div>

            {/* Demo Video */}
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.3fr),minmax(0,0.7fr)] lg:items-start">
              <div className="space-y-6">
                <div className="overflow-hidden rounded-3xl border border-brand-gray-800/70 bg-black/40 shadow-2xl">
                  <div className="relative w-full pt-[56.25%]">
                    <iframe
                      src={`https://www.youtube.com/embed/${demoVideo.id}?rel=0`}
                      title={demoVideo.title}
                      className="absolute inset-0 h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <div className="border-t border-brand-gray-800/60 bg-brand-gray-900/70 p-5 text-sm text-brand-gray-300">
                    <div className="font-semibold text-white">{demoVideo.title}</div>
                    <div className="mt-2 text-xs uppercase tracking-widest text-brand-gray-500">
                      {demoVideo.channelTitle}
                    </div>
                    <div className="mt-2 text-xs text-brand-gray-500">
                      Published: {new Date(demoVideo.publishedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Demo Instructions */}
                <section className="space-y-4 rounded-3xl border border-brand-gray-800/70 bg-brand-gray-900/40 p-6">
                  <h3 className="text-sm font-semibold uppercase tracking-widest text-brand-gray-400">
                    Recipe Instructions
                  </h3>
                  <ol className="space-y-3 text-sm text-brand-gray-300">
                    {demoInstructions.map((instruction, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="rounded-full bg-brand-lime/15 px-3 py-1 text-xs font-semibold text-brand-lime">
                          {index + 1}
                        </span>
                        <span>{instruction}</span>
                      </li>
                    ))}
                  </ol>
                </section>
              </div>

              <aside className="space-y-6">
                {/* Demo Ingredients */}
                <div className="rounded-3xl border border-brand-gray-800/70 bg-brand-gray-900/50 p-6">
                  <h3 className="text-sm font-semibold uppercase tracking-widest text-brand-gray-400 mb-4">
                    Extracted Ingredients
                  </h3>
                  <div className="space-y-3">
                    {demoIngredients.map((ingredient, index) => (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-xl bg-brand-gray-800/30 border border-brand-gray-700/50"
                      >
                        <div className="flex-1 min-w-0">
                          <span className="text-white font-medium">
                            {ingredient.quantity} {ingredient.unit} {ingredient.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Tag tone="gray" className="text-xs">
                            {ingredient.source}
                          </Tag>
                          <span
                            className={`text-xs font-semibold ${getConfidenceColor(ingredient.confidence)}`}
                          >
                            {formatConfidence(ingredient.confidence)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Demo Stats */}
                <div className="rounded-3xl border border-brand-gray-800/70 bg-brand-gray-900/50 p-6">
                  <h3 className="text-sm font-semibold uppercase tracking-widest text-brand-gray-400 mb-4">
                    Processing Results
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-brand-lime">
                        {demoIngredients.length}
                      </div>
                      <div className="text-xs text-brand-gray-500">Ingredients</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">89%</div>
                      <div className="text-xs text-brand-gray-500">Confidence</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">3</div>
                      <div className="text-xs text-brand-gray-500">Sources</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">2.3s</div>
                      <div className="text-xs text-brand-gray-500">Process Time</div>
                    </div>
                  </div>
                </div>

                {/* Demo Note */}
                <div className="rounded-3xl border border-brand-gray-800/70 bg-brand-gray-900/50 p-6">
                  <h3 className="text-sm font-semibold uppercase tracking-widest text-brand-gray-400 mb-4">
                    Demo Note
                  </h3>
                  <p className="text-sm text-brand-gray-400">
                    This is a demonstration of our AI-powered ingredient extraction. Enter
                    a YouTube URL above to process real cooking videos and extract
                    ingredients automatically.
                  </p>
                </div>
              </aside>
            </div>
          </Card>
        </div>
      )}

      {/* Share to Community Modal */}
      {showShareModal && processedVideo && (
        <ShareRecipeModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          recipe={{
            title: processedVideo.title || 'Extracted Recipe',
            description: `Recipe ingredients extracted from YouTube video: ${url}`,
            cuisine: 'Filipino',
            difficulty: 'Medium',
            ingredients: processedVideo.extractedIngredients.map((ing) => ({
              name: ing.name,
              amount: ing.quantity || '',
              unit: ing.unit || '',
            })),
            video_url: url,
          }}
          source="youtube"
        />
      )}
    </div>
  );
}
