'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { getAllRecipes } from '@/lib/data';
import { useTranslation } from '@/lib/hooks/useTranslation';

const dietOptions = ['Pescetarian', 'Vegetarian', 'Flexitarian', 'Keto', 'Halal'];
const allergyOptions = ['Shellfish', 'Peanut', 'Gluten', 'Dairy', 'Soy'];

const favoriteRecipes = getAllRecipes().slice(0, 3);

export default function ProfilePage() {
  const { t } = useTranslation();
  const [displayName, setDisplayName] = useState('Jose Miguel Barron');
  const [bio, setBio] = useState(
    'Capstone developer creating the ultimate Filipino AI recipe companion. Passionate about culinary innovation and code.'
  );
  const [diet, setDiet] = useState<string[]>(['Pescetarian']);
  const [allergies, setAllergies] = useState<string[]>(['Peanut']);
  const [notifications, setNotifications] = useState({
    recipeDrops: true,
    chatSummaries: false,
    pantryReminders: true,
  });

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const toggleSelection = (
    value: string,
    collection: string[],
    setCollection: (values: string[]) => void
  ) => {
    if (collection.includes(value)) {
      setCollection(collection.filter((entry) => entry !== value));
    } else {
      setCollection([...collection, value]);
    }
  };

  const handleSaveProfile = () => {
    setSaveStatus('saving');
    try {
      const profileData = {
        displayName,
        bio,
        diet,
        allergies,
        notifications,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem('mix-munch-profile', JSON.stringify(profileData));
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to save profile:', error);
      setSaveStatus('idle');
    }
  };

  return (
    <div className="page-grid space-y-10">
      <header className="space-y-4">
        <Tag tone="lime" className="w-fit">
          {t('profile.tag')}
        </Tag>
        <h1 className="text-3xl font-semibold text-white sm:text-4xl">
          {t('profile.title')}
        </h1>
        <p className="max-w-3xl text-sm text-brand-gray-400">
          {t('profile.description')}
        </p>
      </header>

      <section className="grid gap-6 lg:gap-8 lg:grid-cols-[minmax(0,1.1fr),minmax(0,0.9fr)] lg:items-start">
        <div className="space-y-4 sm:space-y-6">
          <div className="rounded-2xl sm:rounded-3xl border border-brand-gray-800/70 bg-brand-gray-900/50 p-4 sm:p-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-gray-400">
              {t('profile.profileBasics')}
            </h2>
            <div className="mt-6 space-y-5 text-sm">
              <label className="block">
                <span className="text-brand-gray-500">{t('profile.displayName')}</span>
                <input
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-brand-gray-800 bg-brand-gray-900 px-4 py-3 text-brand-gray-100 focus:border-brand-lime/60 focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="text-brand-gray-500">{t('profile.bio')}</span>
                <textarea
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  className="mt-2 h-32 w-full resize-none rounded-2xl border border-brand-gray-800 bg-brand-gray-900 px-4 py-3 text-brand-gray-100 focus:border-brand-lime/60 focus:outline-none"
                />
              </label>
              <Button
                className="w-full"
                onClick={handleSaveProfile}
                disabled={saveStatus === 'saving'}
              >
                {saveStatus === 'saving'
                  ? 'Saving...'
                  : saveStatus === 'saved'
                    ? '✓ Saved!'
                    : t('profile.saveProfile')}
              </Button>
            </div>
          </div>

          <div className="rounded-2xl sm:rounded-3xl border border-brand-gray-800/70 bg-brand-gray-900/50 p-4 sm:p-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-gray-400">
              {t('profile.dietaryFocus')}
            </h2>
            <div className="mt-3 sm:mt-4 flex flex-wrap gap-2 sm:gap-3">
              {dietOptions.map((option) => {
                const active = diet.includes(option);
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => toggleSelection(option, diet, setDiet)}
                    className={`rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs uppercase tracking-widest transition ${
                      active
                        ? 'bg-brand-lime/20 text-brand-lime border border-brand-lime/40'
                        : 'border border-brand-gray-800 text-brand-gray-300 hover:border-brand-gray-700'
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl sm:rounded-3xl border border-brand-gray-800/70 bg-brand-gray-900/50 p-4 sm:p-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-gray-400">
              {t('profile.allergyWatchlist')}
            </h2>
            <div className="mt-3 sm:mt-4 flex flex-wrap gap-2 sm:gap-3">
              {allergyOptions.map((option) => {
                const active = allergies.includes(option);
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => toggleSelection(option, allergies, setAllergies)}
                    className={`rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs uppercase tracking-widest transition ${
                      active
                        ? 'bg-red-400/15 text-red-300 border border-red-400/40'
                        : 'border border-brand-gray-800 text-brand-gray-300 hover:border-brand-gray-700'
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <aside className="space-y-4 sm:space-y-6">
          <div className="rounded-2xl sm:rounded-3xl border border-brand-gray-800/70 bg-brand-gray-900/50 p-4 sm:p-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-gray-400">
              {t('profile.notificationCadence')}
            </h2>
            <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-4 text-sm text-brand-gray-300">
              {Object.entries(notifications).map(([key, value]) => (
                <label
                  key={key}
                  className="flex items-center justify-between rounded-xl sm:rounded-2xl border border-brand-gray-800/70 bg-brand-gray-900/60 px-3 sm:px-4 py-2.5 sm:py-3"
                >
                  <span className="capitalize text-xs sm:text-sm">
                    {t(`profile.notifications.${key}`)}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setNotifications((prev) => ({
                        ...prev,
                        [key]: !prev[key as keyof typeof prev],
                      }))
                    }
                    className={`inline-flex h-6 w-10 items-center rounded-full border px-1 transition ${
                      value
                        ? 'border-brand-lime/70 bg-brand-lime/25'
                        : 'border-brand-gray-700 bg-brand-gray-900'
                    }`}
                  >
                    <span
                      className={`h-4 w-4 rounded-full bg-white shadow transition ${
                        value ? 'translate-x-4 bg-brand-lime' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-2xl sm:rounded-3xl border border-brand-gray-800/70 bg-brand-gray-900/50 p-4 sm:p-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-gray-400">
              {t('profile.pinnedFavorites')}
            </h2>
            <ul className="mt-3 sm:mt-4 space-y-3 sm:space-y-4 text-sm text-brand-gray-300">
              {favoriteRecipes.map((recipe) => (
                <li
                  key={recipe.id}
                  className="rounded-xl sm:rounded-2xl border border-brand-gray-800/70 bg-brand-gray-900/60 p-3 sm:p-4"
                >
                  <div className="text-xs uppercase tracking-widest text-brand-gray-500">
                    {recipe.difficulty}
                  </div>
                  <div className="mt-1 font-semibold text-white">{recipe.title}</div>
                  <div className="mt-2 text-xs text-brand-gray-500">
                    ⭐ {recipe.rating.toFixed(1)} ({recipe.reviews})
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </section>
    </div>
  );
}
