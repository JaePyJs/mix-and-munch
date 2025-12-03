'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { getAllRecipes } from '@/lib/data';

const recipes = getAllRecipes();

export function RandomRecipeButton() {
  const router = useRouter();
  const [isSpinning, setIsSpinning] = useState(false);

  const handleRandomRecipe = () => {
    setIsSpinning(true);

    // Spin animation duration
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * recipes.length);
      const randomRecipe = recipes[randomIndex];
      setIsSpinning(false);
      router.push(`/recipes/${randomRecipe.slug}`);
    }, 800);
  };

  return (
    <Button
      variant="secondary"
      onClick={handleRandomRecipe}
      disabled={isSpinning}
      className={`${isSpinning ? 'animate-pulse' : ''}`}
    >
      <span className={`inline-block ${isSpinning ? 'animate-spin' : ''}`}>🎲</span>
      {isSpinning ? 'Picking...' : 'Random Recipe'}
    </Button>
  );
}

export function QuickSuggestion() {
  const router = useRouter();
  const [suggestion, setSuggestion] = useState<string | null>(null);

  const quickPrompts = [
    {
      text: "What's for lunch?",
      prompt: 'Suggest a quick Filipino lunch I can make in 30 mins',
    },
    { text: 'Ulam ideas', prompt: "Give me 5 ulam ideas for tonight's dinner" },
    {
      text: 'Use my leftovers',
      prompt: 'I have leftover rice and some vegetables. What Filipino dish can I make?',
    },
    {
      text: 'Merienda time!',
      prompt: "What's a good Filipino merienda I can make right now?",
    },
    {
      text: 'Impress my guests',
      prompt: 'I need to impress dinner guests with Filipino food. What should I cook?',
    },
  ];

  const handleQuickPrompt = (prompt: string) => {
    sessionStorage.setItem('pendingChatPrompt', prompt);
    router.push('/chat');
  };

  return (
    <div className="flex flex-wrap gap-2">
      {quickPrompts.map((item) => (
        <button
          key={item.text}
          onClick={() => handleQuickPrompt(item.prompt)}
          className="px-4 py-2 text-sm rounded-full border border-brand-gray-700 bg-brand-gray-800/50 text-brand-gray-300 hover:border-brand-lime/50 hover:text-white transition-all"
        >
          {item.text}
        </button>
      ))}
    </div>
  );
}
