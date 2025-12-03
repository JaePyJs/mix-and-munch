import type { Metadata } from 'next';
import { ToolsClient } from './ToolsClient';

export const metadata: Metadata = {
  title: 'Cooking Tools | Mix & Munch',
  description:
    'Helpful cooking tools: timer, shopping list, and pantry challenges to enhance your Filipino cooking experience.',
};

export default function ToolsPage() {
  return (
    <main className="min-h-screen bg-brand-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Cooking <span className="text-brand-lime">Tools</span>
          </h1>
          <p className="text-brand-gray-300">
            Everything you need to make cooking easier and more fun!
          </p>
        </div>

        <ToolsClient />
      </div>
    </main>
  );
}
