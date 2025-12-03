'use client';

import { ButtonLink } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { getAllRecipes } from '@/lib/data';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { MoodPicker } from '@/components/fun/MoodPicker';
import { DailyChallenge } from '@/components/fun/DailyChallenge';
import { RandomRecipeButton, QuickSuggestion } from '@/components/fun/RandomRecipe';

const spotlight = getAllRecipes().slice(0, 3);

export default function HomePage() {
  const { t } = useTranslation();

  const featureTiles = [
    {
      title: t('home.features.pantryAware.title'),
      description: t('home.features.pantryAware.description'),
      accent: t('home.features.pantryAware.accent'),
    },
    {
      title: t('home.features.aiSousChef.title'),
      description: t('home.features.aiSousChef.description'),
      accent: t('home.features.aiSousChef.accent'),
    },
    {
      title: t('home.features.chefTranscripts.title'),
      description: t('home.features.chefTranscripts.description'),
      accent: t('home.features.chefTranscripts.accent'),
    },
  ];

  return (
    <div className="page-grid space-y-16">
      <section className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr),minmax(0,0.8fr)] lg:items-center">
        <div className="space-y-8">
          <Tag tone="lime" className="w-fit">
            {t('home.hero.tag')}
          </Tag>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
            {t('home.hero.title')}
          </h1>
          <p className="max-w-xl text-base sm:text-lg text-brand-gray-400">
            {t('home.hero.description')}
          </p>
          <div className="flex flex-wrap gap-4">
            <ButtonLink href="/pantry" icon="🧺">
              {t('home.hero.buttons.pantry')}
            </ButtonLink>
            <ButtonLink variant="secondary" href="/chat" icon="🤖">
              {t('home.hero.buttons.explore')}
            </ButtonLink>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {featureTiles.map((tile) => (
              <div
                key={tile.title}
                className="rounded-2xl border border-brand-gray-800/80 bg-brand-gray-900/40 p-4"
              >
                <p className="text-xs uppercase tracking-widest text-brand-lime">
                  {tile.accent}
                </p>
                <h3 className="mt-3 text-base font-semibold text-brand-gray-100">
                  {tile.title}
                </h3>
                <p className="mt-2 text-sm text-brand-gray-500">{tile.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Spotlight - Desktop: grid, Mobile: horizontal scroll */}
        <div className="relative min-h-[200px] lg:min-h-[320px] overflow-hidden rounded-2xl lg:rounded-3xl border border-brand-gray-800/70 bg-gradient-to-br from-brand-gray-900 via-brand-gray-950 to-black p-4 sm:p-6 lg:p-8 shadow-2xl shadow-black/40">
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(163,230,53,0.12),transparent_70%)]" />
          <div className="relative z-10 flex flex-col gap-3 lg:gap-5">
            <div className="text-xs uppercase tracking-[0.2rem] lg:tracking-[0.4rem] text-brand-gray-500">
              {t('home.spotlight.title')}
            </div>
            {/* Mobile: horizontal scroll, Desktop: vertical stack */}
            <div className="flex lg:flex-col gap-3 lg:gap-5 overflow-x-auto pb-2 lg:pb-0 -mx-2 px-2 lg:mx-0 lg:px-0 snap-x snap-mandatory lg:snap-none scrollbar-thin">
              {spotlight.map((recipe, index) => (
                <div
                  key={recipe.id}
                  className="flex-shrink-0 w-[280px] sm:w-[300px] lg:w-full rounded-xl lg:rounded-2xl border border-brand-gray-800/60 bg-brand-gray-900/50 p-4 lg:p-5 backdrop-blur snap-start"
                >
                  <div className="flex items-center justify-between text-xs lg:text-sm text-brand-gray-500">
                    <span>{index + 1}</span>
                    <span>⭐ {recipe.rating.toFixed(1)}</span>
                  </div>
                  <h3 className="mt-2 lg:mt-3 text-base lg:text-lg font-semibold text-white line-clamp-1">
                    {recipe.title}
                  </h3>
                  <p className="mt-1 lg:mt-2 text-xs lg:text-sm text-brand-gray-400 line-clamp-2">
                    {recipe.summary}
                  </p>
                  <div className="mt-3 lg:mt-4 flex flex-wrap gap-1 lg:gap-2">
                    {recipe.dietaryTags.slice(0, 2).map((tag) => (
                      <Tag key={tag} tone="gray">
                        #{tag}
                      </Tag>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-white">
              {t('home.makers.title')}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-brand-gray-400">
              {t('home.makers.description')}
            </p>
          </div>
          <div className="flex gap-3">
            <RandomRecipeButton />
            <ButtonLink variant="secondary" href="/recipes">
              {t('home.makers.button')}
            </ButtonLink>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {spotlight.map((recipe, index) => (
            <div
              key={recipe.id}
              className="rounded-3xl border border-brand-gray-800/70 bg-brand-gray-900/40 p-6"
            >
              <div className="flex items-center justify-between text-xs uppercase tracking-widest text-brand-gray-500">
                <span>{t('home.signatureDish')}</span>
                <span>{recipe.difficulty}</span>
              </div>
              <h3 className="mt-3 text-lg font-semibold text-white">{recipe.title}</h3>
              <p className="mt-3 text-sm text-brand-gray-400">{recipe.summary}</p>
              <div className="mt-4 text-xs text-brand-gray-500">
                #{index + 1} {t('home.chefCurated')}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Fun Interactive Section */}
      <section className="space-y-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Mood Picker */}
          <div className="rounded-2xl border border-brand-gray-800 bg-brand-gray-900/40 p-6">
            <MoodPicker />
          </div>

          {/* Daily Challenge */}
          <DailyChallenge />
        </div>

        {/* Quick Suggestions */}
        <div className="rounded-2xl border border-brand-gray-800 bg-brand-gray-900/40 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💬</span>
            <h3 className="text-lg font-semibold text-white">Quick Questions</h3>
          </div>
          <p className="text-sm text-brand-gray-400">
            Tap any question to get instant AI Chef suggestions!
          </p>
          <QuickSuggestion />
        </div>
      </section>
    </div>
  );
}
