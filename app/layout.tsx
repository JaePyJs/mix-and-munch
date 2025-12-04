import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import clsx from 'clsx';

import './globals.css';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { I18nProvider } from '@/components/providers/I18nProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NODE_ENV === 'production'
      ? 'https://mix-munch.vercel.app'
      : 'http://localhost:3000'
  ),
  title: 'Mix & Munch | Filipino Recipe Companion',
  description:
    'AI-powered Filipino recipe and meal planning assistant. Discover authentic dishes, get personalized cooking guidance.',
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'Mix & Munch | Filipino Recipe Companion',
    description:
      'Capstone-grade Filipino recipe and meal planning assistant with AI chat',
    images: [
      {
        url: '/MixandMunch_LOGO.png',
        width: 400,
        height: 400,
        alt: 'Mix & Munch Logo',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, viewport-fit=cover"
        />
        <meta name="theme-color" content="#a3e635" />
        {/* PWA Meta Tags */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Mix & Munch" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body
        className={clsx(
          inter.variable,
          'bg-brand-gray-950 text-brand-gray-200 antialiased'
        )}
      >
        <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,_rgba(163,230,53,0.06),_rgba(9,9,11,1))] overflow-x-hidden w-full max-w-full">
          <I18nProvider>
            <SiteHeader />
            <main className="flex-1 pb-12 sm:pb-16 pt-8 sm:pt-10 lg:pt-14 px-4 sm:px-0 overflow-x-hidden w-full max-w-full">
              {children}
            </main>
            <SiteFooter />
          </I18nProvider>
        </div>
        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('SW registered:', registration.scope);
                    },
                    function(err) {
                      console.log('SW registration failed:', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
