'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

// Daily challenges rotate based on day of year
const challenges = [
  {
    title: 'Egg Master',
    description: 'Make 3 different egg dishes today!',
    icon: '🥚',
    difficulty: 'Easy',
  },
  {
    title: 'One Pot Wonder',
    description: 'Cook a complete meal in just one pot',
    icon: '🍲',
    difficulty: 'Easy',
  },
  {
    title: 'Regional Explorer',
    description: "Try a dish from a region you've never cooked before",
    icon: '🗺️',
    difficulty: 'Medium',
  },
  {
    title: 'Fusion Friday',
    description: 'Create a Filipino fusion dish with another cuisine',
    icon: '🌏',
    difficulty: 'Hard',
  },
  {
    title: 'Zero Waste Chef',
    description: 'Use every part of your ingredients, no waste!',
    icon: '♻️',
    difficulty: 'Medium',
  },
  {
    title: 'Speed Run',
    description: 'Complete a full meal in under 20 minutes',
    icon: '⏱️',
    difficulty: 'Hard',
  },
  {
    title: 'Breakfast Champion',
    description: 'Make a traditional Filipino breakfast spread',
    icon: '🍳',
    difficulty: 'Easy',
  },
  {
    title: 'Sweet Tooth',
    description: 'Make a Filipino dessert from scratch',
    icon: '🍮',
    difficulty: 'Medium',
  },
  {
    title: 'Vegetable Victory',
    description: 'Cook a dish with 5+ vegetables',
    icon: '🥬',
    difficulty: 'Easy',
  },
  {
    title: 'Fermentation Station',
    description: 'Try making or using fermented Filipino ingredients',
    icon: '🫙',
    difficulty: 'Hard',
  },
  {
    title: 'Street Food Star',
    description: 'Recreate a Filipino street food at home',
    icon: '🛒',
    difficulty: 'Medium',
  },
  {
    title: 'Sauce Boss',
    description: 'Make 3 different sawsawan (dipping sauces)',
    icon: '🥣',
    difficulty: 'Easy',
  },
  {
    title: 'Rice is Nice',
    description: 'Cook rice 3 different ways today',
    icon: '🍚',
    difficulty: 'Easy',
  },
  {
    title: 'Seafood Sunday',
    description: 'Create a seafood-focused Filipino feast',
    icon: '🦐',
    difficulty: 'Medium',
  },
];

const difficultyColors: Record<string, string> = {
  Easy: 'text-green-400 bg-green-400/10',
  Medium: 'text-yellow-400 bg-yellow-400/10',
  Hard: 'text-red-400 bg-red-400/10',
};

export function DailyChallenge() {
  const router = useRouter();
  const [challenge, setChallenge] = useState(challenges[0]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    // Get challenge based on day of year
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    const challengeIndex = dayOfYear % challenges.length;
    setChallenge(challenges[challengeIndex]);

    // Check local storage for completion status
    const completedKey = `challenge-${now.toDateString()}`;
    setIsCompleted(localStorage.getItem(completedKey) === 'true');

    // Get streak
    const savedStreak = parseInt(localStorage.getItem('challenge-streak') || '0');
    setStreak(savedStreak);
  }, []);

  const handleComplete = () => {
    const now = new Date();
    const completedKey = `challenge-${now.toDateString()}`;
    localStorage.setItem(completedKey, 'true');

    // Update streak
    const newStreak = streak + 1;
    localStorage.setItem('challenge-streak', newStreak.toString());
    setStreak(newStreak);
    setIsCompleted(true);
  };

  const handleGetHelp = () => {
    sessionStorage.setItem(
      'pendingChatPrompt',
      `Help me with today's cooking challenge: "${challenge.title}" - ${challenge.description}`
    );
    router.push('/chat');
  };

  return (
    <div className="rounded-2xl border border-brand-gray-800 bg-gradient-to-br from-brand-gray-900 to-brand-gray-950 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏆</span>
          <h3 className="text-lg font-semibold text-white">Daily Challenge</h3>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-brand-lime/10 text-brand-lime text-sm">
            🔥 {streak} day streak
          </div>
        )}
      </div>

      <div
        className={`p-4 rounded-xl border ${isCompleted ? 'border-green-500/50 bg-green-500/10' : 'border-brand-gray-700 bg-brand-gray-800/50'}`}
      >
        <div className="flex items-start gap-4">
          <span className="text-4xl">{challenge.icon}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-white">{challenge.title}</h4>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${difficultyColors[challenge.difficulty]}`}
              >
                {challenge.difficulty}
              </span>
            </div>
            <p className="text-sm text-brand-gray-400 mt-1">{challenge.description}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        {!isCompleted ? (
          <>
            <Button variant="primary" onClick={handleComplete} className="flex-1">
              ✅ Mark Complete
            </Button>
            <Button variant="ghost" onClick={handleGetHelp}>
              💡 Get Help
            </Button>
          </>
        ) : (
          <div className="flex-1 text-center py-3 rounded-xl bg-green-500/10 text-green-400">
            🎉 Challenge Complete! Come back tomorrow for a new one!
          </div>
        )}
      </div>
    </div>
  );
}
