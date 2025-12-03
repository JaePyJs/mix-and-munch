export const NAV_ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/pantry', label: 'Pantry' },
  { href: '/recipes', label: 'Recipes' },
  { href: '/tools', label: '🛠️ Tools' },
  { href: '/community', label: '👨‍👩‍👧‍👦 Community' },
  { href: '/chat', label: 'AI Chat' },
] as const;

export const FOOTER_EXPLORE_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/recipes', label: 'Recipes' },
  { href: '/tools', label: 'Cooking Tools' },
  { href: '/chat', label: 'AI Chat' },
  { href: '/profile', label: 'Profile' },
] as const;

export const FOOTER_CONTACT_EMAIL = 'm23-1470-578@manila.uphsl.edu.ph';

export const AI_MODEL_CONFIG = {
  'gemini-2.5-pro': {
    label: 'Gemini Pro',
    color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    icon: '🧠',
  },
  'gemini-2.5-flash': {
    label: 'Gemini Flash',
    color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    icon: '⚡',
  },
  default: {
    label: 'Mix AI',
    color: 'bg-brand-lime/20 text-brand-lime border-brand-lime/30',
    icon: '✨',
  },
} as const;

export type AIModelType = keyof typeof AI_MODEL_CONFIG;
