'use client';

import { useState } from 'react';
import { CookingTimer } from '@/components/features/CookingTimer';
import { ShoppingListGenerator } from '@/components/features/ShoppingList';
import { PantryChallenge } from '@/components/fun/PantryChallenge';

type TabType = 'timer' | 'shopping' | 'challenge';

const tabs: { id: TabType; label: string; icon: string }[] = [
  { id: 'timer', label: 'Cooking Timer', icon: '⏱️' },
  { id: 'shopping', label: 'Shopping List', icon: '🛒' },
  { id: 'challenge', label: 'Pantry Challenge', icon: '🎯' },
];

export function ToolsClient() {
  const [activeTab, setActiveTab] = useState<TabType>('timer');

  return (
    <div>
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-brand-lime text-black'
                : 'bg-brand-gray-800 text-brand-gray-300 hover:bg-brand-gray-700'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'timer' && <CookingTimer />}
        {activeTab === 'shopping' && <ShoppingListGenerator />}
        {activeTab === 'challenge' && <PantryChallenge />}
      </div>
    </div>
  );
}
