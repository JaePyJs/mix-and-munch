'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

const moods = [
  { emoji: '😊', name: 'Happy', prompt: 'Give me a fun, celebratory Filipino dish!' },
  {
    emoji: '😴',
    name: 'Lazy',
    prompt: 'I want a super easy Filipino recipe, minimal effort!',
  },
  {
    emoji: '🤒',
    name: 'Under the Weather',
    prompt: 'I need comforting Filipino soup or arroz caldo',
  },
  {
    emoji: '🎉',
    name: 'Celebrating',
    prompt: 'Special occasion! Give me a fiesta-worthy Filipino dish!',
  },
  {
    emoji: '💰',
    name: 'Budget Mode',
    prompt: 'Budget-friendly Filipino recipe with cheap ingredients',
  },
  {
    emoji: '🔥',
    name: 'Adventurous',
    prompt: 'Challenge me with an exotic regional Filipino dish!',
  },
  { emoji: '🌧️', name: 'Rainy Day', prompt: 'Perfect rainy day Filipino comfort food' },
  {
    emoji: '💪',
    name: 'Healthy',
    prompt: 'Healthy Filipino dish, high protein or low carb',
  },
];

export function MoodPicker() {
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const handleMoodSelect = (mood: (typeof moods)[0]) => {
    setSelectedMood(mood.name);
    sessionStorage.setItem('pendingChatPrompt', mood.prompt);

    // Small delay for visual feedback
    setTimeout(() => {
      router.push('/chat');
    }, 300);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🎭</span>
        <h3 className="text-lg font-semibold text-white">How are you feeling?</h3>
      </div>
      <p className="text-sm text-brand-gray-400">
        Pick your mood and let AI Chef suggest the perfect dish!
      </p>

      <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
        {moods.map((mood) => (
          <button
            key={mood.name}
            onClick={() => handleMoodSelect(mood)}
            className={`
              flex flex-col items-center gap-1 p-3 rounded-xl transition-all
              border border-brand-gray-800 hover:border-brand-lime/50
              ${
                selectedMood === mood.name
                  ? 'bg-brand-lime/20 border-brand-lime scale-105'
                  : 'bg-brand-gray-900/50 hover:bg-brand-gray-800/50'
              }
            `}
            title={mood.name}
          >
            <span className="text-2xl">{mood.emoji}</span>
            <span className="text-[10px] text-brand-gray-400 truncate w-full text-center">
              {mood.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
