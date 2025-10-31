import Image from 'next/image';

import { ButtonLink } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { getTranscriptDemo } from '@/lib/data';

const demo = getTranscriptDemo();

export default function YoutubeDemoPage() {
  return (
    <div className="page-grid space-y-10">
      <header className="space-y-4">
        <Tag tone="lime" className="w-fit">YouTube chef extraction demo</Tag>
        <h1 className="text-3xl font-semibold text-white sm:text-4xl">
          Watch how we translate chef storytelling into structured recipes
        </h1>
        <p className="max-w-3xl text-sm text-brand-gray-400">
          This demo showcases a static transcript from a fictional chef video. The pipeline identifies culinary intent, aligns timestamps, and outputs a concise recipe card suitable for Mix &amp; Munch experiences.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.3fr),minmax(0,0.7fr)] lg:items-start">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-3xl border border-brand-gray-800/70 bg-black/40 shadow-2xl">
            <div className="relative w-full pt-[56.25%]">
              <iframe
                src={`${demo.embedUrl}?rel=0`}
                title={demo.title}
                className="absolute inset-0 h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="border-t border-brand-gray-800/60 bg-brand-gray-900/70 p-5 text-sm text-brand-gray-300">
              <div className="font-semibold text-white">{demo.title}</div>
              <div className="mt-2 text-xs uppercase tracking-widest text-brand-gray-500">{demo.channel}</div>
              <div className="mt-2 text-xs text-brand-gray-500">{demo.imageAttribution}</div>
            </div>
          </div>

          <section className="space-y-4 rounded-3xl border border-brand-gray-800/70 bg-brand-gray-900/40 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-gray-400">Transcript highlights</h2>
            <ul className="space-y-3 text-sm text-brand-gray-300">
              {demo.transcript.map((chunk) => (
                <li key={chunk.time} className="flex items-start gap-3">
                  <span className="rounded-full bg-brand-lime/15 px-3 py-1 text-xs font-semibold text-brand-lime">
                    {chunk.time}
                  </span>
                  <span>{chunk.text}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-brand-gray-800/70 bg-brand-gray-900/50 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-gray-400">Structured recipe</h2>
            <div className="mt-4 space-y-4">
              <h3 className="text-xl font-semibold text-white">{demo.extractedRecipe.title}</h3>
              <div>
                <h4 className="text-xs uppercase tracking-widest text-brand-gray-500">Ingredients</h4>
                <ul className="mt-2 space-y-2 text-sm text-brand-gray-300">
                  {demo.extractedRecipe.ingredients.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-widest text-brand-gray-500">Steps</h4>
                <ol className="mt-2 space-y-2 text-sm text-brand-gray-300">
                  {demo.extractedRecipe.steps.map((step, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="rounded-full bg-brand-lime/15 px-3 py-1 text-xs font-semibold text-brand-lime">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <ButtonLink variant="secondary" href="/recipes/soy-calamansi-chicken-adobo">
                Compare with app recipe →
              </ButtonLink>
            </div>
          </div>

          <div className="rounded-3xl border border-brand-gray-800/70 bg-brand-gray-900/50 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-gray-400">Pipeline notes</h2>
            <ul className="mt-4 space-y-3 text-sm text-brand-gray-400">
              <li>• Transcript is pre-curated; no live scraping involved.</li>
              <li>• Keyword spotting groups steps, while heuristics detect ingredient measurements.</li>
              <li>• Resulting structure feeds into Mix &amp; Munch recipe models for manual review.</li>
            </ul>
            <ButtonLink variant="secondary" href="#" className="mt-4 w-full">
              View parsing workflow spec
            </ButtonLink>
          </div>

          <div className="rounded-3xl border border-brand-gray-800/70 bg-brand-gray-900/50 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-gray-400">Thumbnail reference</h2>
            <div className="relative mt-3 h-40 w-full overflow-hidden rounded-2xl border border-brand-gray-800/60">
              <Image src={demo.thumbnail} alt={demo.title} fill className="object-cover" />
            </div>
            <p className="mt-2 text-xs text-brand-gray-500">{demo.imageAttribution}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
