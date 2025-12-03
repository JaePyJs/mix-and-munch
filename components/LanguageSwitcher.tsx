'use client';

import { useTranslation } from '../lib/hooks/useTranslation';
import { Button } from './ui/Button';

export function LanguageSwitcher() {
  const { currentLanguage, changeLanguage, isTagalog } = useTranslation();

  const toggleLanguage = () => {
    const newLanguage = isTagalog ? 'en' : 'tl';
    changeLanguage(newLanguage);
  };

  return (
    <Button
      variant="ghost"
      onClick={toggleLanguage}
      className="text-sm font-medium text-brand-gray-300 hover:text-white transition-colors"
      aria-label={`Switch to ${isTagalog ? 'English' : 'Tagalog'}`}
    >
      <span className="flex items-center gap-2">
        <span className="text-lg">🌐</span>
        <span>{isTagalog ? 'EN' : 'TL'}</span>
      </span>
    </Button>
  );
}