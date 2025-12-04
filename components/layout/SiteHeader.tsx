'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import clsx from 'clsx';
import { NAV_ITEMS } from '@/lib/constants';
import { LogoBrand } from './LogoBrand';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useTranslation } from '@/lib/hooks/useTranslation';

export function SiteHeader() {
  const pathname = usePathname() ?? '/';
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useTranslation();

  const handleToggle = () => setMobileOpen((prev) => !prev);
  const handleClose = () => setMobileOpen(false);

  // Dynamic navigation items with translations
  const navItems = [
    { href: '/', label: t('navigation.home') },
    { href: '/pantry', label: t('navigation.pantry') },
    { href: '/recipes', label: t('navigation.recipes') },
    { href: '/chat', label: t('navigation.aiChat') },
    { href: '/community', label: t('navigation.community') },
    { href: '/saved-recipes', label: t('navigation.saved') },
    { href: '/profile', label: t('navigation.profile') },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-brand-gray-800/80 bg-brand-gray-950/90 backdrop-blur-lg">
      <div className="page-grid flex items-center justify-between py-3 sm:py-4">
        <LogoBrand />

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 text-sm font-medium md:flex">
          {navItems.map(({ href, label }) => {
            const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  'rounded-full px-3 lg:px-4 py-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime/60 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-gray-950 text-xs lg:text-sm',
                  isActive
                    ? 'bg-brand-lime text-brand-gray-950 shadow-glow font-semibold'
                    : 'text-brand-gray-300 hover:bg-brand-gray-800 hover:text-brand-lime'
                )}
              >
                {label}
              </Link>
            );
          })}
          <LanguageSwitcher />
        </nav>

        {/* Mobile menu button */}
        <button
          type="button"
          className="focus-ring inline-flex items-center justify-center rounded-full border border-brand-gray-800 p-2 text-brand-gray-300 hover:border-brand-lime/60 hover:text-brand-lime md:hidden transition"
          aria-label="Toggle navigation"
          onClick={handleToggle}
          aria-expanded={mobileOpen}
        >
          <svg
            className={clsx('h-5 w-5 transition-transform duration-300', mobileOpen && 'rotate-90')}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {mobileOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <g>
                <path d="M4 6h16" />
                <path d="M4 12h16" />
                <path d="M4 18h16" />
              </g>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile nav dropdown */}
      {mobileOpen && (
        <div className="page-grid pb-3 md:hidden border-t border-brand-gray-800/50 animate-in slide-in-from-top-2 duration-200">
          <div className="card-surface divide-y divide-brand-gray-800 overflow-hidden rounded-2xl">
            {navItems.map(({ href, label }) => {
              const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={handleClose}
                  className={clsx(
                    'block px-4 py-3 text-sm font-medium transition',
                    isActive
                      ? 'bg-brand-lime/10 text-brand-lime font-semibold'
                      : 'text-brand-gray-200 hover:bg-brand-gray-900/80 active:bg-brand-gray-800'
                  )}
                >
                  {label}
                </Link>
              );
            })}
            <div className="px-4 py-3 border-t border-brand-gray-800">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
