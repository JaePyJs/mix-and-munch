'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import YouTubeCrawler from '@/components/youtube/YouTubeCrawler';
import ContentCreatorManager from '@/components/youtube/ContentCreatorManager';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import type { ExtractedIngredient } from '@/lib/services/youtube-crawler';

export default function YouTubeCrawlerPage() {
  const { t } = useTranslation();
  const [extractedIngredients, setExtractedIngredients] = useState<ExtractedIngredient[]>(
    []
  );
  const [activeTab, setActiveTab] = useState('url-processor');

  const handleIngredientsExtracted = (ingredients: ExtractedIngredient[]) => {
    setExtractedIngredients((prev) => [...prev, ...ingredients]);
  };

  const handleCreatorAdded = (_creator: any) => {
    // Could show a success notification or update some state
  };

  const exportAllIngredients = () => {
    if (extractedIngredients.length === 0) {
      alert(t('youtubeCrawler.noIngredientsToExport'));
      return;
    }

    const data = {
      exportedAt: new Date().toISOString(),
      totalIngredients: extractedIngredients.length,
      ingredients: extractedIngredients,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `all-extracted-ingredients-${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="page-grid space-y-10">
      {/* Header */}
      <header className="space-y-4">
        <Tag tone="lime" className="w-fit">
          {t('youtubeCrawler.tag')}
        </Tag>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-white sm:text-4xl">
              {t('youtubeCrawler.title')}
            </h1>
            <p className="max-w-2xl text-sm text-brand-gray-400 mt-2">
              {t('youtubeCrawler.description')}
            </p>
          </div>

          {extractedIngredients.length > 0 && (
            <div className="flex items-center space-x-4">
              <div className="text-sm text-brand-gray-400">
                <span className="font-medium text-brand-lime">
                  {extractedIngredients.length}
                </span>{' '}
                {t('youtubeCrawler.ingredientsExtracted')}
              </div>
              <Button onClick={exportAllIngredients} variant="secondary">
                {t('youtubeCrawler.exportAll')}
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <section>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="url-processor">
              {t('youtubeCrawler.tabs.urlProcessor')}
            </TabsTrigger>
            <TabsTrigger value="creator-manager">
              {t('youtubeCrawler.tabs.contentCreators')}
            </TabsTrigger>
            <TabsTrigger value="analytics">
              {t('youtubeCrawler.tabs.analytics')}
            </TabsTrigger>
            <TabsTrigger value="settings">
              {t('youtubeCrawler.tabs.settings')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="url-processor" className="space-y-6">
            <YouTubeCrawler onIngredientsExtracted={handleIngredientsExtracted} />
          </TabsContent>

          <TabsContent value="creator-manager" className="space-y-6">
            <ContentCreatorManager onCreatorAdded={handleCreatorAdded} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsTab extractedIngredients={extractedIngredients} />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}

// Analytics Tab Component
function AnalyticsTab({
  extractedIngredients,
}: {
  extractedIngredients: ExtractedIngredient[];
}) {
  const { t } = useTranslation();
  // Calculate analytics
  const totalIngredients = extractedIngredients.length;
  const uniqueIngredients = new Set(
    extractedIngredients.map((ing) => ing.name.toLowerCase())
  ).size;
  const averageConfidence =
    extractedIngredients.length > 0
      ? extractedIngredients.reduce((sum, ing) => sum + ing.confidence, 0) /
        extractedIngredients.length
      : 0;

  const sourceBreakdown = extractedIngredients.reduce(
    (acc, ing) => {
      acc[ing.source] = (acc[ing.source] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const topIngredients = Object.entries(
    extractedIngredients.reduce(
      (acc, ing) => {
        const name = ing.name.toLowerCase();
        acc[name] = (acc[name] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    )
  )
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">
          {t('youtubeCrawler.analytics.title')}
        </h2>
        <p className="text-gray-300">{t('youtubeCrawler.analytics.description')}</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-blue-400 mb-2">{totalIngredients}</div>
          <div className="text-sm text-gray-300">
            {t('youtubeCrawler.analytics.totalIngredients')}
          </div>
        </Card>

        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-green-400 mb-2">
            {uniqueIngredients}
          </div>
          <div className="text-sm text-gray-300">
            {t('youtubeCrawler.analytics.uniqueIngredients')}
          </div>
        </Card>

        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-purple-400 mb-2">
            {Math.round(averageConfidence * 100)}%
          </div>
          <div className="text-sm text-gray-300">
            {t('youtubeCrawler.analytics.avgConfidence')}
          </div>
        </Card>

        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-orange-400 mb-2">
            {Object.keys(sourceBreakdown).length}
          </div>
          <div className="text-sm text-gray-300">
            {t('youtubeCrawler.analytics.sourcesUsed')}
          </div>
        </Card>
      </div>

      {/* Source Breakdown */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          {t('youtubeCrawler.analytics.extractionSources')}
        </h3>
        <div className="space-y-3">
          {Object.entries(sourceBreakdown).map(([source, count]) => (
            <div key={source} className="flex items-center justify-between">
              <span className="capitalize text-gray-200">{source.replace('_', ' ')}</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(count / totalIngredients) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-gray-300 w-12 text-right">{count}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Top Ingredients */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          {t('youtubeCrawler.analytics.mostCommonIngredients')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topIngredients.map(([ingredient, count], index) => (
            <div
              key={ingredient}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                <span className="font-medium text-gray-800 capitalize">{ingredient}</span>
              </div>
              <span className="text-sm text-gray-600">
                {t('youtubeCrawler.analytics.times', { count })}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {totalIngredients === 0 && (
        <Card className="p-8 text-center">
          <h3 className="text-lg font-medium text-white mb-2">
            {t('youtubeCrawler.analytics.noDataAvailable')}
          </h3>
          <p className="text-gray-300 mb-4">
            {t('youtubeCrawler.analytics.startProcessing')}
          </p>
          <Button onClick={() => (window.location.hash = '#url-processor')}>
            {t('youtubeCrawler.analytics.processFirstVideo')}
          </Button>
        </Card>
      )}
    </div>
  );
}

// Settings Tab Component
function SettingsTab() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState({
    enableOCR: true,
    enableSpeechToText: true,
    enableLinkedResources: true,
    maxVideosPerCrawl: 10,
    crawlTimeout: 300,
    confidenceThreshold: 0.5,
    enableNotifications: true,
    autoExport: false,
    exportFormat: 'json' as 'json' | 'csv',
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>(
    'idle'
  );

  const saveSettings = async () => {
    setSaveStatus('saving');
    try {
      // In a real app, this would save to backend
      localStorage.setItem('youtube-crawler-settings', JSON.stringify(settings));
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">
          {t('youtubeCrawler.settings.title')}
        </h2>
        <p className="text-gray-300">{t('youtubeCrawler.settings.description')}</p>
      </div>

      {/* Processing Options */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          {t('youtubeCrawler.settings.processingOptions')}
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-200">
                {t('youtubeCrawler.settings.enableOCR')}
              </label>
              <p className="text-sm text-gray-400">
                {t('youtubeCrawler.settings.enableOCRDescription')}
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.enableOCR}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, enableOCR: e.target.checked }))
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-200">
                {t('youtubeCrawler.settings.enableSpeechToText')}
              </label>
              <p className="text-sm text-gray-400">
                {t('youtubeCrawler.settings.enableSpeechToTextDescription')}
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.enableSpeechToText}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, enableSpeechToText: e.target.checked }))
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-200">
                {t('youtubeCrawler.settings.processLinkedResources')}
              </label>
              <p className="text-sm text-gray-400">
                {t('youtubeCrawler.settings.processLinkedResourcesDescription')}
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.enableLinkedResources}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  enableLinkedResources: e.target.checked,
                }))
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
        </div>
      </Card>

      {/* Performance Settings */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          {t('youtubeCrawler.settings.performanceSettings')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              {t('youtubeCrawler.settings.maxVideosPerCrawl')}
            </label>
            <input
              type="number"
              value={settings.maxVideosPerCrawl}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  maxVideosPerCrawl: parseInt(e.target.value) || 10,
                }))
              }
              min="1"
              max="100"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              {t('youtubeCrawler.settings.crawlTimeout')}
            </label>
            <input
              type="number"
              value={settings.crawlTimeout}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  crawlTimeout: parseInt(e.target.value) || 300,
                }))
              }
              min="60"
              max="1800"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              {t('youtubeCrawler.settings.confidenceThreshold')}
            </label>
            <input
              type="range"
              value={settings.confidenceThreshold}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  confidenceThreshold: parseFloat(e.target.value),
                }))
              }
              min="0"
              max="1"
              step="0.1"
              className="w-full"
            />
            <div className="text-sm text-gray-400 mt-1">
              {Math.round(settings.confidenceThreshold * 100)}%{' '}
              {t('youtubeCrawler.settings.minimumConfidence')}
            </div>
          </div>
        </div>
      </Card>

      {/* Export Settings */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          {t('youtubeCrawler.settings.exportSettings')}
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-200">
                {t('youtubeCrawler.settings.autoExport')}
              </label>
              <p className="text-sm text-gray-400">
                {t('youtubeCrawler.settings.autoExportDescription')}
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.autoExport}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, autoExport: e.target.checked }))
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              {t('youtubeCrawler.settings.defaultExportFormat')}
            </label>
            <select
              value={settings.exportFormat}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  exportFormat: e.target.value as 'json' | 'csv',
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="json">{t('youtubeCrawler.settings.formatJSON')}</option>
              <option value="csv">{t('youtubeCrawler.settings.formatCSV')}</option>
            </select>
          </div>
        </div>
      </Card>

      <div className="flex justify-end items-center gap-4">
        {saveStatus === 'saved' && (
          <span className="text-sm text-green-400">✓ Settings saved!</span>
        )}
        {saveStatus === 'error' && (
          <span className="text-sm text-red-400">Failed to save settings</span>
        )}
        <Button onClick={saveSettings} disabled={saveStatus === 'saving'}>
          {saveStatus === 'saving'
            ? 'Saving...'
            : t('youtubeCrawler.settings.saveSettings')}
        </Button>
      </div>
    </div>
  );
}
