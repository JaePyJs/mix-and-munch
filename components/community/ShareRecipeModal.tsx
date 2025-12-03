'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface ShareRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: {
    title: string;
    description?: string;
    cuisine?: string;
    difficulty?: string;
    prep_time?: string;
    cook_time?: string;
    servings?: number;
    ingredients?: any[];
    instructions?: any[];
    chef_tips?: string[];
    tags?: string[];
    video_url?: string;
  };
  source: 'ai' | 'youtube';
}

export function ShareRecipeModal({
  isOpen,
  onClose,
  recipe,
  source,
}: ShareRecipeModalProps) {
  const [sharing, setSharing] = useState(false);
  const [shared, setShared] = useState(false);
  const [chefName, setChefName] = useState('');
  const [location, setLocation] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('👨‍🍳');

  const avatars = ['👨‍🍳', '👩‍🍳', '🧑‍🍳', '👵', '👴', '🧑', '👩', '👨', '🍳', '🥘'];

  async function handleShare() {
    if (!chefName.trim()) {
      alert('Please enter your name');
      return;
    }

    setSharing(true);
    try {
      const res = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipe: {
            ...recipe,
            source,
          },
          sharedBy: {
            name: chefName,
            avatar: selectedAvatar,
            location: location || 'Philippines',
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShared(true);
        setTimeout(() => {
          onClose();
          setShared(false);
          setChefName('');
          setLocation('');
        }, 2000);
      } else {
        alert('Failed to share: ' + data.message);
      }
    } catch (error) {
      console.error('Share error:', error);
      alert('Failed to share recipe');
    } finally {
      setSharing(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-brand-gray-900 rounded-2xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {shared ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-white mb-2">Recipe Shared!</h2>
            <p className="text-brand-gray-400">
              Your recipe is now in the community kitchen!
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Share to Community</h2>
              <button
                onClick={onClose}
                className="text-brand-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            {/* Recipe Preview */}
            <div className="p-4 rounded-xl bg-brand-gray-800 mb-6">
              <h3 className="font-semibold text-white">{recipe.title}</h3>
              <p className="text-sm text-brand-gray-400 mt-1 line-clamp-2">
                {recipe.description}
              </p>
              <div className="flex gap-2 mt-2">
                {source === 'youtube' && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">
                    ▶️ From YouTube
                  </span>
                )}
                {source === 'ai' && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-brand-lime/20 text-brand-lime">
                    ✨ AI Generated
                  </span>
                )}
              </div>
            </div>

            {/* Chef Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-brand-gray-400 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  value={chefName}
                  onChange={(e) => setChefName(e.target.value)}
                  placeholder="e.g., Tita Maria"
                  className="w-full px-4 py-3 rounded-xl bg-brand-gray-800 border border-brand-gray-700 text-white placeholder-brand-gray-500 focus:border-brand-lime focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-brand-gray-400 mb-2">
                  Location (optional)
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Pampanga"
                  className="w-full px-4 py-3 rounded-xl bg-brand-gray-800 border border-brand-gray-700 text-white placeholder-brand-gray-500 focus:border-brand-lime focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-brand-gray-400 mb-2">
                  Choose Avatar
                </label>
                <div className="flex flex-wrap gap-2">
                  {avatars.map((avatar) => (
                    <button
                      key={avatar}
                      onClick={() => setSelectedAvatar(avatar)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all ${
                        selectedAvatar === avatar
                          ? 'bg-brand-lime text-brand-gray-950 scale-110'
                          : 'bg-brand-gray-800 hover:bg-brand-gray-700'
                      }`}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <Button variant="ghost" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleShare}
                disabled={sharing}
                className="flex-1 bg-brand-lime text-brand-gray-950"
              >
                {sharing ? 'Sharing...' : '🚀 Share Recipe'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
