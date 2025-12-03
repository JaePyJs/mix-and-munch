'use client';

import { Tag } from '@/components/ui/Tag';
import { useTranslation } from '@/lib/hooks/useTranslation';

export default function AboutPage() {
  const { t } = useTranslation();
  
  return (
    <div className="page-grid space-y-8">
      <Tag tone="lime" className="w-fit">{t('about.tag')}</Tag>
      <h1 className="text-3xl font-semibold text-white sm:text-4xl">{t('about.title')}</h1>
      <p className="max-w-3xl text-sm text-brand-gray-400">
        {t('about.description')}
      </p>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-brand-gray-800/70 bg-brand-gray-900/50 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-gray-400">{t('about.productPillars.title')}</h2>
          <ul className="mt-4 space-y-3 text-sm text-brand-gray-300">
            <li>• {t('about.productPillars.reduceWaste')}</li>
            <li>• {t('about.productPillars.celebrateFlavors')}</li>
            <li>• {t('about.productPillars.showcaseWorkflow')}</li>
          </ul>
        </div>
        <div className="rounded-3xl border border-brand-gray-800/70 bg-brand-gray-900/50 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-gray-400">{t('about.technologyStack.title')}</h2>
          <ul className="mt-4 space-y-3 text-sm text-brand-gray-300">
            <li>• {t('about.technologyStack.nextjs')}</li>
            <li>• {t('about.technologyStack.tailwind')}</li>
            <li>• {t('about.technologyStack.gemini')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
