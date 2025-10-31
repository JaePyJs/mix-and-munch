export const NAV_ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/pantry', label: 'Pantry' },
  { href: '/recipes', label: 'Recipes' },
  { href: '/chat', label: 'AI Chat' },
  { href: '/youtube-demo', label: 'YouTube' },
  { href: '/profile', label: 'Profile' },
] as const;

export const FOOTER_EXPLORE_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/recipes', label: 'Recipes' },
  { href: '/chat', label: 'AI Chat' },
  { href: '/profile', label: 'Profile' },
] as const;

export const FOOTER_CONTACT_EMAIL = 'studio@mixandmunch.app';

export const AI_MODEL_CONFIG = {
  'gemini-2.5-pro': {
    label: 'Gemini 2.5 Pro',
    color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    icon: '🧠',
  },
  'gemini-2.5-flash': {
    label: 'Gemini 2.5 Flash',
    color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    icon: '⚡',
  },
  'glm-4.6': {
    label: 'GLM 4.6 (Fallback)',
    color: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    icon: '🔄',
  },
  default: {
    label: 'Mix AI',
    color: 'bg-brand-lime/20 text-brand-lime border-brand-lime/30',
    icon: '✨',
  },
} as const;

export type AIModelType = keyof typeof AI_MODEL_CONFIG;
