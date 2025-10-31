import { Tag } from '@/components/ui/Tag';

export default function AboutPage() {
  return (
    <div className="page-grid space-y-8">
      <Tag tone="lime" className="w-fit">About Mix &amp; Munch</Tag>
      <h1 className="text-3xl font-semibold text-white sm:text-4xl">Capstone-grade Filipino culinary lab</h1>
      <p className="max-w-3xl text-sm text-brand-gray-400">
        Mix &amp; Munch is an academic portfolio project crafted to demonstrate full-stack product thinking. Every screen is purpose-built for storytelling—from pantry intelligence and AI-driven chat to chef transcript parsing demos.
      </p>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-brand-gray-800/70 bg-brand-gray-900/50 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-gray-400">Product pillars</h2>
          <ul className="mt-4 space-y-3 text-sm text-brand-gray-300">
            <li>• Reduce ingredient waste through pantry-first recipe surfacing.</li>
            <li>• Celebrate Filipino flavors with creative AI mentorship using Gemini.</li>
            <li>• Showcase transcript-to-recipe workflow for chef collaborations.</li>
          </ul>
        </div>
        <div className="rounded-3xl border border-brand-gray-800/70 bg-brand-gray-900/50 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-gray-400">Technology stack</h2>
          <ul className="mt-4 space-y-3 text-sm text-brand-gray-300">
            <li>• Next.js App Router + TypeScript for cohesive UX flows.</li>
            <li>• Tailwind CSS with custom dark theme and micro-interactions.</li>
            <li>• Gemini AI via <code className="rounded bg-brand-gray-900 px-2 py-1">@ai-sdk/google</code> for conversational intelligence.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
