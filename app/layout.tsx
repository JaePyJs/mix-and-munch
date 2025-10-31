import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import clsx from 'clsx';

import './globals.css';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Mix & Munch | Filipino Recipe Companion',
  description:
    'Capstone-grade Filipino recipe and meal planning assistant with AI chat powered by Gemini 2.5 Pro and GLM 4.6 fallback.',
  viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'Mix & Munch | Filipino Recipe Companion',
    description: 'Capstone-grade Filipino recipe and meal planning assistant with AI chat',
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
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <meta name="theme-color" content="#09090B" />
      </head>
      <body
        className={clsx(
          inter.variable,
          'bg-brand-gray-950 text-brand-gray-200 antialiased'
        )}
      >
        <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,_rgba(163,230,53,0.06),_rgba(9,9,11,1))]">
          <SiteHeader />
          <main className="flex-1 pb-12 sm:pb-16 pt-8 sm:pt-10 lg:pt-14 px-4 sm:px-0">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
