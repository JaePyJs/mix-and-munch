'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

// Challenge types and their scoring
interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  points: number;
  requiredIngredients?: string[];
  minIngredients?: number;
  recipeCategory?: string;
  timeLimit?: number; // in minutes
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
}

interface UserProgress {
  totalPoints: number;
  level: number;
  challengesCompleted: string[];
  achievements: string[];
  streak: number;
  lastPlayedDate: string;
}

// Pantry Challenge definitions
const challenges: Challenge[] = [
  {
    id: 'egg-master',
    title: 'Egg Master',
    description: 'Cook any recipe using eggs as the main ingredient',
    icon: '🥚',
    difficulty: 'Easy',
    points: 50,
    requiredIngredients: ['egg'],
  },
  {
    id: 'one-pot-wonder',
    title: 'One Pot Wonder',
    description: 'Make a complete meal using only one pot (Sinigang, Nilaga, etc.)',
    icon: '🍲',
    difficulty: 'Easy',
    points: 75,
    recipeCategory: 'soup',
  },
  {
    id: 'minimal-chef',
    title: 'Minimal Chef',
    description: 'Cook a delicious dish with only 5 ingredients or less',
    icon: '✋',
    difficulty: 'Medium',
    points: 100,
    minIngredients: 5,
  },
  {
    id: 'street-food-star',
    title: 'Street Food Star',
    description: 'Recreate a Filipino street food at home (Kwek-kwek, Fishball, etc.)',
    icon: '🛒',
    difficulty: 'Medium',
    points: 100,
    recipeCategory: 'street-food',
  },
  {
    id: 'regional-explorer',
    title: 'Regional Explorer',
    description: "Try a dish from a region you've never cooked before",
    icon: '🗺️',
    difficulty: 'Medium',
    points: 125,
  },
  {
    id: 'speed-run',
    title: 'Speed Run',
    description: 'Complete a full meal in under 20 minutes',
    icon: '⏱️',
    difficulty: 'Hard',
    points: 150,
    timeLimit: 20,
  },
  {
    id: 'fusion-friday',
    title: 'Fusion Friday',
    description: 'Create a Filipino fusion dish combining two cuisines',
    icon: '🌏',
    difficulty: 'Hard',
    points: 175,
  },
  {
    id: 'zero-waste',
    title: 'Zero Waste Chef',
    description: 'Use every part of your ingredients with no waste',
    icon: '♻️',
    difficulty: 'Hard',
    points: 150,
  },
  {
    id: 'sweet-tooth',
    title: 'Sweet Tooth',
    description: 'Make a Filipino dessert from scratch',
    icon: '🍮',
    difficulty: 'Medium',
    points: 100,
    recipeCategory: 'dessert',
  },
  {
    id: 'veggie-victory',
    title: 'Veggie Victory',
    description: 'Cook a dish with 5 or more vegetables',
    icon: '🥬',
    difficulty: 'Easy',
    points: 75,
    minIngredients: 5,
  },
];

// Achievement definitions
const achievements: Achievement[] = [
  {
    id: 'first-challenge',
    title: 'First Steps',
    description: 'Complete your first challenge',
    icon: '🎯',
  },
  {
    id: 'five-challenges',
    title: 'Getting Started',
    description: 'Complete 5 challenges',
    icon: '⭐',
  },
  {
    id: 'ten-challenges',
    title: 'Dedicated Chef',
    description: 'Complete 10 challenges',
    icon: '🏆',
  },
  {
    id: 'streak-3',
    title: 'On Fire!',
    description: 'Maintain a 3-day cooking streak',
    icon: '🔥',
  },
  {
    id: 'streak-7',
    title: 'Week Warrior',
    description: 'Maintain a 7-day cooking streak',
    icon: '💪',
  },
  { id: 'level-5', title: 'Rising Star', description: 'Reach Level 5', icon: '🌟' },
  { id: 'level-10', title: 'Master Chef', description: 'Reach Level 10', icon: '👨‍🍳' },
  {
    id: 'all-difficulties',
    title: 'Versatile Cook',
    description: 'Complete challenges of all difficulties',
    icon: '🎨',
  },
  {
    id: 'points-500',
    title: 'Half K Club',
    description: 'Earn 500 total points',
    icon: '💰',
  },
  {
    id: 'points-1000',
    title: 'Thousand Point Chef',
    description: 'Earn 1000 total points',
    icon: '💎',
  },
];

const difficultyColors: Record<string, string> = {
  Easy: 'text-green-400 bg-green-400/10 border-green-400/30',
  Medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  Hard: 'text-red-400 bg-red-400/10 border-red-400/30',
};

const STORAGE_KEY = 'mix-munch-pantry-challenge';

// Calculate level from points
function calculateLevel(points: number): number {
  return Math.floor(points / 200) + 1;
}

// Points needed for next level
function pointsForNextLevel(level: number): number {
  return level * 200;
}

export function PantryChallenge() {
  const [progress, setProgress] = useState<UserProgress>({
    totalPoints: 0,
    level: 1,
    challengesCompleted: [],
    achievements: [],
    streak: 0,
    lastPlayedDate: '',
  });
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);

  // Load progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProgress(parsed);
      } catch {
        // Invalid data, use defaults
      }
    }
  }, []);

  // Save progress to localStorage
  const saveProgress = useCallback((newProgress: UserProgress) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
    setProgress(newProgress);
  }, []);

  // Check for new achievements
  const checkAchievements = useCallback(
    (currentProgress: UserProgress): Achievement[] => {
      const newlyUnlocked: Achievement[] = [];
      const completedCount = currentProgress.challengesCompleted.length;

      if (
        completedCount >= 1 &&
        !currentProgress.achievements.includes('first-challenge')
      ) {
        newlyUnlocked.push(achievements.find((a) => a.id === 'first-challenge')!);
      }
      if (
        completedCount >= 5 &&
        !currentProgress.achievements.includes('five-challenges')
      ) {
        newlyUnlocked.push(achievements.find((a) => a.id === 'five-challenges')!);
      }
      if (
        completedCount >= 10 &&
        !currentProgress.achievements.includes('ten-challenges')
      ) {
        newlyUnlocked.push(achievements.find((a) => a.id === 'ten-challenges')!);
      }
      if (
        currentProgress.streak >= 3 &&
        !currentProgress.achievements.includes('streak-3')
      ) {
        newlyUnlocked.push(achievements.find((a) => a.id === 'streak-3')!);
      }
      if (
        currentProgress.streak >= 7 &&
        !currentProgress.achievements.includes('streak-7')
      ) {
        newlyUnlocked.push(achievements.find((a) => a.id === 'streak-7')!);
      }
      if (
        currentProgress.level >= 5 &&
        !currentProgress.achievements.includes('level-5')
      ) {
        newlyUnlocked.push(achievements.find((a) => a.id === 'level-5')!);
      }
      if (
        currentProgress.level >= 10 &&
        !currentProgress.achievements.includes('level-10')
      ) {
        newlyUnlocked.push(achievements.find((a) => a.id === 'level-10')!);
      }
      if (
        currentProgress.totalPoints >= 500 &&
        !currentProgress.achievements.includes('points-500')
      ) {
        newlyUnlocked.push(achievements.find((a) => a.id === 'points-500')!);
      }
      if (
        currentProgress.totalPoints >= 1000 &&
        !currentProgress.achievements.includes('points-1000')
      ) {
        newlyUnlocked.push(achievements.find((a) => a.id === 'points-1000')!);
      }

      // Check all difficulties
      const completedDifficulties = new Set(
        currentProgress.challengesCompleted
          .map((id) => challenges.find((c) => c.id === id)?.difficulty)
          .filter(Boolean)
      );
      if (
        completedDifficulties.size >= 3 &&
        !currentProgress.achievements.includes('all-difficulties')
      ) {
        newlyUnlocked.push(achievements.find((a) => a.id === 'all-difficulties')!);
      }

      return newlyUnlocked;
    },
    []
  );

  // Complete a challenge
  const completeChallenge = useCallback(
    (challenge: Challenge) => {
      const today = new Date().toDateString();
      const lastPlayed = progress.lastPlayedDate;
      const yesterday = new Date(Date.now() - 86400000).toDateString();

      // Calculate streak
      let newStreak = progress.streak;
      if (lastPlayed === yesterday) {
        newStreak += 1;
      } else if (lastPlayed !== today) {
        newStreak = 1;
      }

      const newPoints = progress.totalPoints + challenge.points;
      const newLevel = calculateLevel(newPoints);

      const newProgress: UserProgress = {
        ...progress,
        totalPoints: newPoints,
        level: newLevel,
        challengesCompleted: [...progress.challengesCompleted, challenge.id],
        streak: newStreak,
        lastPlayedDate: today,
      };

      // Check for new achievements
      const unlocked = checkAchievements(newProgress);
      if (unlocked.length > 0) {
        newProgress.achievements = [
          ...progress.achievements,
          ...unlocked.map((a) => a.id),
        ];
        setNewAchievements(unlocked);
      }

      saveProgress(newProgress);
      setActiveChallenge(challenge);
      setShowCompletionModal(true);
    },
    [progress, checkAchievements, saveProgress]
  );

  // Get today's featured challenge (rotates daily)
  const getTodaysChallenge = useCallback((): Challenge => {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
    );
    return challenges[dayOfYear % challenges.length];
  }, []);

  const todaysChallenge = getTodaysChallenge();
  const progressPercent = ((progress.totalPoints % 200) / 200) * 100;

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="card-surface p-6 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-brand-lime">Pantry Challenge</h2>
            <p className="text-brand-gray-300 text-sm">Level up your cooking skills!</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <span className="text-3xl">🔥</span>
              <span className="text-2xl font-bold text-orange-400">
                {progress.streak}
              </span>
              <span className="text-brand-gray-400 text-sm">day streak</span>
            </div>
          </div>
        </div>

        {/* Level Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-brand-lime font-semibold">Level {progress.level}</span>
            <span className="text-brand-gray-400">
              {progress.totalPoints} / {pointsForNextLevel(progress.level)} pts
            </span>
          </div>
          <div className="h-3 bg-brand-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-lime to-brand-green transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-brand-gray-700/50 rounded-lg p-3">
            <div className="text-2xl font-bold text-brand-lime">
              {progress.totalPoints}
            </div>
            <div className="text-xs text-brand-gray-400">Total Points</div>
          </div>
          <div className="bg-brand-gray-700/50 rounded-lg p-3">
            <div className="text-2xl font-bold text-yellow-400">
              {progress.challengesCompleted.length}
            </div>
            <div className="text-xs text-brand-gray-400">Challenges Done</div>
          </div>
          <div className="bg-brand-gray-700/50 rounded-lg p-3">
            <div className="text-2xl font-bold text-purple-400">
              {progress.achievements.length}
            </div>
            <div className="text-xs text-brand-gray-400">Achievements</div>
          </div>
        </div>
      </div>

      {/* Today's Featured Challenge */}
      <div className="card-surface p-6 rounded-xl border-2 border-brand-lime/30">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">⭐</span>
          <h3 className="text-lg font-semibold text-brand-lime">
            Today&apos;s Challenge
          </h3>
        </div>
        <div className="flex items-start gap-4">
          <span className="text-4xl">{todaysChallenge.icon}</span>
          <div className="flex-1">
            <h4 className="font-bold text-white text-lg">{todaysChallenge.title}</h4>
            <p className="text-brand-gray-300 text-sm mb-2">
              {todaysChallenge.description}
            </p>
            <div className="flex items-center gap-3">
              <span
                className={`px-2 py-0.5 rounded-full text-xs border ${difficultyColors[todaysChallenge.difficulty]}`}
              >
                {todaysChallenge.difficulty}
              </span>
              <span className="text-brand-lime font-semibold text-sm">
                +{todaysChallenge.points} pts
              </span>
            </div>
          </div>
          {progress.challengesCompleted.includes(todaysChallenge.id) ? (
            <span className="text-green-400 text-2xl">✓</span>
          ) : (
            <Button variant="primary" onClick={() => completeChallenge(todaysChallenge)}>
              Complete
            </Button>
          )}
        </div>
      </div>

      {/* All Challenges */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">All Challenges</h3>
        <div className="grid gap-3">
          {challenges.map((challenge) => {
            const isCompleted = progress.challengesCompleted.includes(challenge.id);
            return (
              <div
                key={challenge.id}
                className={`card-surface p-4 rounded-xl flex items-center gap-4 transition-all ${
                  isCompleted ? 'opacity-60' : 'hover:bg-brand-gray-700/50'
                }`}
              >
                <span className="text-3xl">{challenge.icon}</span>
                <div className="flex-1">
                  <h4 className="font-semibold text-white">{challenge.title}</h4>
                  <p className="text-brand-gray-400 text-sm">{challenge.description}</p>
                </div>
                <div className="text-right">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs border ${difficultyColors[challenge.difficulty]}`}
                  >
                    {challenge.difficulty}
                  </span>
                  <div className="text-brand-lime font-semibold text-sm mt-1">
                    +{challenge.points} pts
                  </div>
                </div>
                {isCompleted ? (
                  <span className="text-green-400 text-xl">✓</span>
                ) : (
                  <Button variant="ghost" onClick={() => completeChallenge(challenge)}>
                    Done
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievements Section */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Achievements</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {achievements.map((achievement) => {
            const isUnlocked = progress.achievements.includes(achievement.id);
            return (
              <div
                key={achievement.id}
                className={`card-surface p-3 rounded-xl text-center transition-all ${
                  isUnlocked
                    ? 'bg-brand-lime/10 border border-brand-lime/30'
                    : 'opacity-40 grayscale'
                }`}
                title={achievement.description}
              >
                <span className="text-3xl block mb-1">{achievement.icon}</span>
                <span className="text-xs text-white font-medium">
                  {achievement.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Completion Modal */}
      {showCompletionModal && activeChallenge && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="card-surface p-8 rounded-2xl max-w-md w-full text-center animate-in zoom-in-95">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-brand-lime mb-2">
              Challenge Complete!
            </h2>
            <p className="text-white text-lg mb-1">{activeChallenge.title}</p>
            <p className="text-brand-lime text-2xl font-bold mb-4">
              +{activeChallenge.points} points
            </p>

            {newAchievements.length > 0 && (
              <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-4 mb-4">
                <p className="text-yellow-400 font-semibold mb-2">
                  🏆 New Achievement{newAchievements.length > 1 ? 's' : ''}!
                </p>
                {newAchievements.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-center gap-2 text-white"
                  >
                    <span>{a.icon}</span>
                    <span>{a.title}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <Button variant="secondary" onClick={() => setShowCompletionModal(false)}>
                Continue
              </Button>
              <Link href="/recipes">
                <Button variant="primary">Find Recipes</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
