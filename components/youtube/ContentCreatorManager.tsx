'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import type { ContentCreator, CrawlResult } from '@/lib/services/content-creator-manager';

interface ContentCreatorManagerProps {
  onCreatorAdded?: (creator: ContentCreator) => void;
}

export default function ContentCreatorManager({ onCreatorAdded }: ContentCreatorManagerProps) {
  const [creators, setCreators] = useState<ContentCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [crawling, setCrawling] = useState<Record<string, boolean>>({});
  const [crawlResults, setCrawlResults] = useState<Record<string, CrawlResult[]>>({});

  // Form state for adding new creator
  const [newCreator, setNewCreator] = useState({
    name: '',
    channelId: '',
    channelUrl: '',
    description: '',
    category: 'filipino',
    crawlFrequency: 'weekly' as 'daily' | 'weekly' | 'monthly',
    maxVideos: 10,
    enabled: true
  });

  // Load creators on component mount
  useEffect(() => {
    loadCreators();
  }, []);

  const loadCreators = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/youtube-crawler?action=get_creators');
      const data = await response.json();

      if (data.success) {
        setCreators(data.data || []);
      } else {
        setError(data.message || 'Failed to load creators');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load creators');
    } finally {
      setLoading(false);
    }
  };

  const addCreator = async () => {
    if (!newCreator.name.trim() || !newCreator.channelId.trim()) {
      setError('Name and Channel ID are required');
      return;
    }

    try {
      const response = await fetch('/api/youtube-crawler', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'add_creator',
          creator: {
            ...newCreator,
            id: `creator_${Date.now()}`,
            addedAt: new Date().toISOString(),
            lastCrawl: null,
            totalVideos: 0,
            totalIngredients: 0
          }
        }),
      });

      const data = await response.json();

      if (data.success) {
        await loadCreators(); // Reload the list
        setShowAddForm(false);
        setNewCreator({
          name: '',
          channelId: '',
          channelUrl: '',
          description: '',
          category: 'filipino',
          crawlFrequency: 'weekly',
          maxVideos: 10,
          enabled: true
        });
        setError(null);

        if (onCreatorAdded && data.creator) {
          onCreatorAdded(data.creator);
        }
      } else {
        setError(data.message || 'Failed to add creator');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add creator');
    }
  };

  const crawlCreator = async (creatorId: string) => {
    try {
      setCrawling(prev => ({ ...prev, [creatorId]: true }));
      
      const response = await fetch('/api/youtube-crawler', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'crawl_creator',
          creatorId,
          options: {
            maxVideos: 5, // Limit for manual crawls
            includeOCR: true,
            includeSpeechToText: true
          }
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update crawl results
        setCrawlResults(prev => ({
          ...prev,
          [creatorId]: [data.data, ...(prev[creatorId] || [])]
        }));
        
        // Reload creators to update stats
        await loadCreators();
      } else {
        setError(data.message || 'Failed to crawl creator');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to crawl creator');
    } finally {
      setCrawling(prev => ({ ...prev, [creatorId]: false }));
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'bg-red-100 text-red-800';
      case 'weekly': return 'bg-yellow-100 text-yellow-800';
      case 'monthly': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'filipino': return 'bg-blue-100 text-blue-800';
      case 'international': return 'bg-purple-100 text-purple-800';
      case 'baking': return 'bg-pink-100 text-pink-800';
      case 'healthy': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading content creators...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Content Creator Manager</h1>
          <p className="text-brand-gray-400 mt-2">
            Manage YouTube content creators and their crawling schedules
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          Add Creator
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="p-4 bg-red-900/20 border-red-800/50">
          <div className="flex items-center space-x-2">
            <span className="text-red-400">⚠️</span>
            <span className="text-red-300">{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setError(null)}
              className="ml-auto border-red-700 text-red-300 hover:bg-red-800 hover:text-white"
            >
              Dismiss
            </Button>
          </div>
        </Card>
      )}

      {/* Add Creator Form */}
      {showAddForm && (
        <Card className="p-6 bg-brand-gray-900/50 border-brand-gray-800/70">
          <h2 className="text-xl font-semibold text-white mb-4">Add New Creator</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-brand-gray-300 mb-2">
                Creator Name *
              </label>
              <input
                type="text"
                value={newCreator.name}
                onChange={(e) => setNewCreator(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Panlasang Pinoy"
                className="w-full px-3 py-2 border border-brand-gray-700 bg-brand-gray-800/50 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-brand-lime placeholder-brand-gray-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-brand-gray-300 mb-2">
                Channel ID *
              </label>
              <input
                type="text"
                value={newCreator.channelId}
                onChange={(e) => setNewCreator(prev => ({ ...prev, channelId: e.target.value }))}
                placeholder="e.g., UCTGIDmCb8d4schJeN7PIjuA"
                className="w-full px-3 py-2 border border-brand-gray-700 bg-brand-gray-800/50 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-brand-lime placeholder-brand-gray-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-brand-gray-300 mb-2">
                Channel URL
              </label>
              <input
                type="url"
                value={newCreator.channelUrl}
                onChange={(e) => setNewCreator(prev => ({ ...prev, channelUrl: e.target.value }))}
                placeholder="https://www.youtube.com/@panlasangpinoy"
                className="w-full px-3 py-2 border border-brand-gray-700 bg-brand-gray-800/50 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-brand-lime placeholder-brand-gray-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-brand-gray-300 mb-2">
                Category
              </label>
              <select
                value={newCreator.category}
                onChange={(e) => setNewCreator(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-brand-gray-700 bg-brand-gray-800/50 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-brand-lime"
              >
                <option value="filipino">Filipino Cuisine</option>
                <option value="international">International</option>
                <option value="baking">Baking & Desserts</option>
                <option value="healthy">Healthy Cooking</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-brand-gray-300 mb-2">
                Crawl Frequency
              </label>
              <select
                value={newCreator.crawlFrequency}
                onChange={(e) => setNewCreator(prev => ({ ...prev, crawlFrequency: e.target.value as any }))}
                className="w-full px-3 py-2 border border-brand-gray-700 bg-brand-gray-800/50 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-brand-lime"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-brand-gray-300 mb-2">
                Max Videos per Crawl
              </label>
              <input
                type="number"
                value={newCreator.maxVideos}
                onChange={(e) => setNewCreator(prev => ({ ...prev, maxVideos: parseInt(e.target.value) || 10 }))}
                min="1"
                max="50"
                className="w-full px-3 py-2 border border-brand-gray-700 bg-brand-gray-800/50 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-brand-lime"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-brand-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={newCreator.description}
                onChange={(e) => setNewCreator(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the creator's content..."
                rows={3}
                className="w-full px-3 py-2 border border-brand-gray-700 bg-brand-gray-800/50 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-brand-lime placeholder-brand-gray-500"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-4 mt-6">
            <Button
              variant="outline"
              onClick={() => setShowAddForm(false)}
              className="border-brand-gray-700 text-brand-gray-300 hover:bg-brand-gray-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button onClick={addCreator}>
              Add Creator
            </Button>
          </div>
        </Card>
      )}

      {/* Creators List */}
      <div className="grid gap-6">
        {creators.length === 0 ? (
          <Card className="p-8 text-center bg-brand-gray-900/50 border-brand-gray-700">
            <h3 className="text-lg font-medium text-white mb-2">No Creators Added</h3>
            <p className="text-brand-gray-300 mb-4">
              Start by adding your first content creator to begin crawling their videos for ingredients.
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              Add Your First Creator
            </Button>
          </Card>
        ) : (
          creators.map((creator) => (
            <Card key={creator.id} className="p-6 bg-brand-gray-900/50 border-brand-gray-700">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-white">
                      {creator.name}
                    </h3>
                    <Tag className={getCategoryColor(creator.category || 'filipino')}>
                      {creator.category || 'filipino'}
                    </Tag>
                    <Tag className={getFrequencyColor(creator.crawlFrequency)}>
                      {creator.crawlFrequency}
                    </Tag>
                    {!creator.enabled && (
                      <Tag tone="gray">Disabled</Tag>
                    )}
                  </div>
                  
                  {creator.description && (
                    <p className="text-brand-gray-300 mb-3">{creator.description}</p>
                  )}
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-brand-gray-400">Total Videos</div>
                      <div className="text-lg font-semibold text-white">
                        {creator.totalVideos || 0}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-brand-gray-400">Total Ingredients</div>
                      <div className="text-lg font-semibold text-white">
                        {creator.totalIngredients || 0}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-brand-gray-400">Last Crawl</div>
                      <div className="text-lg font-semibold text-white">
                        {formatDate(creator.lastCrawled || null)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-brand-gray-400">Added</div>
                      <div className="text-lg font-semibold text-white">
                        {formatDate(creator.addedAt)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-brand-gray-400">
                    <span>Channel ID: {creator.channelId}</span>
                    {creator.channelUrl && (
                      <>
                        <span>•</span>
                        <a
                          href={creator.channelUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-lime hover:text-brand-lime/80"
                        >
                          View Channel
                        </a>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <Button
                    onClick={() => crawlCreator(creator.id)}
                    disabled={crawling[creator.id] || !creator.enabled}
                  >
                    {crawling[creator.id] ? 'Crawling...' : 'Crawl Now'}
                  </Button>
                  <Button variant="secondary">
                    Edit
                  </Button>
                </div>
              </div>
              
              {/* Recent Crawl Results */}
              {crawlResults[creator.id] && crawlResults[creator.id].length > 0 && (
                <div className="mt-4 pt-4 border-t border-brand-gray-700">
                  <h4 className="text-sm font-medium text-brand-gray-300 mb-2">Recent Crawl Results</h4>
                  <div className="space-y-2">
                    {crawlResults[creator.id].slice(0, 3).map((result, index) => (
                      <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 bg-brand-gray-800/50 rounded gap-2">
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-white block sm:inline">
                            {result.videosProcessed} videos processed
                          </span>
                          <span className="text-sm text-brand-gray-400 block sm:inline sm:ml-2">
                            {result.ingredientsExtracted} ingredients found
                          </span>
                        </div>
                        <span className="text-xs text-brand-gray-400 flex-shrink-0">
                          {formatDate(result.timestamp)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Statistics Summary */}
      {creators.length > 0 && (
        <Card className="p-6 bg-brand-gray-900/50 border-brand-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">Summary Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {creators.length}
              </div>
              <div className="text-sm text-brand-gray-300">Total Creators</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {creators.filter(c => c.enabled).length}
              </div>
              <div className="text-sm text-brand-gray-300">Active Creators</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {creators.reduce((sum, c) => sum + (c.totalVideos || 0), 0)}
              </div>
              <div className="text-sm text-brand-gray-300">Total Videos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">
                {creators.reduce((sum, c) => sum + (c.totalIngredients || 0), 0)}
              </div>
              <div className="text-sm text-brand-gray-300">Total Ingredients</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}