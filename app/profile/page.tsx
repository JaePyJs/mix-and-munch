'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { getAllRecipes } from '@/lib/data';

const dietOptions = ['Pescetarian', 'Vegetarian', 'Flexitarian', 'Keto', 'Halal'];
const allergyOptions = ['Shellfish', 'Peanut', 'Gluten', 'Dairy', 'Soy'];

const favoriteRecipes = getAllRecipes().slice(0, 3);

export default function ProfilePage() {
  const [displayName, setDisplayName] = useState('Jose Miguel Barron');
  const [bio, setBio] = useState('Capstone developer creating the ultimate Filipino AI recipe companion. Passionate about culinary innovation and code.');
  const [diet, setDiet] = useState<string[]>(['Pescetarian']);
  const [allergies, setAllergies] = useState<string[]>(['Peanut']);
  const [notifications, setNotifications] = useState({
    recipeDrops: true,
    chatSummaries: false,
    pantryReminders: true,
  });

  const toggleSelection = (value: string, collection: string[], setCollection: (values: string[]) => void) => {
    if (collection.includes(value)) {
      setCollection(collection.filter((entry) => entry !== value));
    } else {
      setCollection([...collection, value]);
    }
  };

  return (
    <div className="page-grid space-y-10">
      <header className="space-y-4">
        <Tag tone="lime" className="w-fit">Profile &amp; preferences</Tag>
        <h1 className="text-3xl font-semibold text-white sm:text-4xl">Tune Mix &amp; Munch to your taste buds</h1>
        <p className="max-w-3xl text-sm text-brand-gray-400">
          Save pantry staples, dietary goals, and notification cadence. These settings personalize AI chat prompts and recipe ordering across the experience.
        </p>
      </header>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr),minmax(0,0.9fr)] lg:items-start">
        <div className="space-y-6">
          <div className="rounded-3xl border border-brand-gray-800/70 bg-brand-gray-900/50 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-gray-400">Profile basics</h2>
            <div className="mt-6 space-y-5 text-sm">
              <label className="block">
                <span className="text-brand-gray-500">Display name</span>
                <input
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-brand-gray-800 bg-brand-gray-900 px-4 py-3 text-brand-gray-100 focus:border-brand-lime/60 focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="text-brand-gray-500">Bio</span>
                <textarea
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  className="mt-2 h-32 w-full resize-none rounded-2xl border border-brand-gray-800 bg-brand-gray-900 px-4 py-3 text-brand-gray-100 focus:border-brand-lime/60 focus:outline-none"
                />
              </label>
              <Button className="w-full">Save profile</Button>
            </div>
          </div>

          <div className="rounded-3xl border border-brand-gray-800/70 bg-brand-gray-900/50 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-gray-400">Dietary focus</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {dietOptions.map((option) => {
                const active = diet.includes(option);
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => toggleSelection(option, diet, setDiet)}
                    className={`rounded-full px-4 py-2 text-xs uppercase tracking-widest transition ${
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

          <div className="rounded-3xl border border-brand-gray-800/70 bg-brand-gray-900/50 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-gray-400">Allergy watchlist</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {allergyOptions.map((option) => {
                const active = allergies.includes(option);
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => toggleSelection(option, allergies, setAllergies)}
                    className={`rounded-full px-4 py-2 text-xs uppercase tracking-widest transition ${
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

        <aside className="space-y-6">
          <div className="rounded-3xl border border-brand-gray-800/70 bg-brand-gray-900/50 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-gray-400">Notification cadence</h2>
            <div className="mt-4 space-y-4 text-sm text-brand-gray-300">
              {Object.entries(notifications).map(([key, value]) => (
                <label key={key} className="flex items-center justify-between rounded-2xl border border-brand-gray-800/70 bg-brand-gray-900/60 px-4 py-3">
                  <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
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

          <div className="rounded-3xl border border-brand-gray-800/70 bg-brand-gray-900/50 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-gray-400">Pinned favorites</h2>
            <ul className="mt-4 space-y-4 text-sm text-brand-gray-300">
              {favoriteRecipes.map((recipe) => (
                <li key={recipe.id} className="rounded-2xl border border-brand-gray-800/70 bg-brand-gray-900/60 p-4">
                  <div className="text-xs uppercase tracking-widest text-brand-gray-500">{recipe.difficulty}</div>
                  <div className="mt-1 font-semibold text-white">{recipe.title}</div>
                  <div className="mt-2 text-xs text-brand-gray-500">⭐ {recipe.rating.toFixed(1)} ({recipe.reviews})</div>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </section>
    </div>
  );
}
