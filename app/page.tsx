import { ButtonLink } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { getAllRecipes } from '@/lib/data';

const spotlight = getAllRecipes().slice(0, 3);

const featureTiles = [
  {
    title: 'Pantry-aware matches',
    description: 'Toggle ingredients and instantly surface Filipino recipes that celebrate what you already have.',
    accent: 'Pantry intelligence powered by heuristics',
  },
  {
    title: 'Gemini AI sous-chef',
    description: 'Ask for substitutions, plating ideas, or cultural notes. Mix remembers your cooking vibe each session.',
    accent: 'Powered by Google Gemini via @ai-sdk/google',
  },
  {
    title: 'Chef transcript extractions',
    description: 'See how we translate YouTube chef storytelling into structured, step-by-step recipes.',
    accent: 'Static transcript demos formatted for study',
  },
];

export default function HomePage() {
  return (
    <div className="page-grid space-y-16">
      <section className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr),minmax(0,0.8fr)] lg:items-center">
        <div className="space-y-8">
          <Tag tone="lime" className="w-fit">Capstone-grade Filipino Cuisine Studio</Tag>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            From pantry to plate—reinvent Filipino classics with Mix &amp; Munch.
          </h1>
          <p className="max-w-xl text-lg text-brand-gray-400">
            Discover pantry-aware recipes, AI-driven cooking guidance, and chef transcript extractions—all in a cohesive Next.js experience designed for your capstone showcase.
          </p>
          <div className="flex flex-wrap gap-4">
            <ButtonLink href="/pantry" icon="🧺">
              Start with your pantry
            </ButtonLink>
            <ButtonLink variant="secondary" href="/chat" icon="🤖">
              Ask Mix for ideas
            </ButtonLink>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {featureTiles.map((tile) => (
              <div key={tile.title} className="rounded-2xl border border-brand-gray-800/80 bg-brand-gray-900/40 p-4">
                <p className="text-xs uppercase tracking-widest text-brand-lime">{tile.accent}</p>
                <h3 className="mt-3 text-base font-semibold text-brand-gray-100">{tile.title}</h3>
                <p className="mt-2 text-sm text-brand-gray-500">{tile.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative hidden h-full min-h-[320px] overflow-hidden rounded-3xl border border-brand-gray-800/70 bg-gradient-to-br from-brand-gray-900 via-brand-gray-950 to-black p-8 shadow-2xl shadow-black/40 lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(163,230,53,0.12),transparent_70%)]" />
          <div className="relative z-10 flex flex-col gap-5">
            <div className="text-xs uppercase tracking-[0.4rem] text-brand-gray-500">Spotlight Recipes</div>
            {spotlight.map((recipe, index) => (
              <div key={recipe.id} className="rounded-2xl border border-brand-gray-800/60 bg-brand-gray-900/50 p-5 backdrop-blur">
                <div className="flex items-center justify-between text-sm text-brand-gray-500">
                  <span>{index + 1}</span>
                  <span>⭐ {recipe.rating.toFixed(1)}</span>
                </div>
                <h3 className="mt-3 text-lg font-semibold text-white">{recipe.title}</h3>
                <p className="mt-2 text-sm text-brand-gray-400">{recipe.summary}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {recipe.dietaryTags.slice(0, 2).map((tag) => (
                    <Tag key={tag} tone="gray">
                      #{tag}
                    </Tag>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-white">Designed for modern Filipino makers</h2>
            <p className="mt-2 max-w-2xl text-sm text-brand-gray-400">
              Each screen delivers a purpose-built flow: pantry matching, AI cook-along, chef transcript demos, and profile personalization.
            </p>
          </div>
          <ButtonLink variant="secondary" href="/recipes">
            Browse recipes →
          </ButtonLink>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {spotlight.map((recipe, index) => (
            <div key={recipe.id} className="rounded-3xl border border-brand-gray-800/70 bg-brand-gray-900/40 p-6">
              <div className="flex items-center justify-between text-xs uppercase tracking-widest text-brand-gray-500">
                <span>Signature Dish</span>
                <span>{recipe.difficulty}</span>
              </div>
              <h3 className="mt-3 text-lg font-semibold text-white">{recipe.title}</h3>
              <p className="mt-3 text-sm text-brand-gray-400">{recipe.summary}</p>
              <div className="mt-4 text-xs text-brand-gray-500">#{index + 1} in our chef-curated set</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
