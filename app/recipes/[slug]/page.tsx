import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { ButtonLink } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { getRecipeBySlug } from '@/lib/data';

interface RecipePageProps {
  params: { slug: string };
}

export function generateMetadata({ params }: RecipePageProps): Metadata {
  const { slug } = params;
  const recipe = getRecipeBySlug(slug);
  if (!recipe) {
    return {
      title: 'Recipe not found | Mix & Munch',
    };
  }

  return {
    title: `${recipe.title} | Mix & Munch`,
    description: recipe.summary,
    openGraph: {
      title: recipe.title,
      description: recipe.summary,
      images: [recipe.heroImage],
    },
  };
}

export default function RecipeDetailPage({ params }: RecipePageProps) {
  const { slug } = params;
  const recipe = getRecipeBySlug(slug);

  if (!recipe) {
    notFound();
  }

  return (
    <div className="page-grid space-y-12">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr),minmax(0,0.9fr)] lg:items-start">
        <div className="space-y-6">
          <Tag tone="lime" className="w-fit">Signature Filipino plate</Tag>
          <h1 className="text-4xl font-semibold text-white">{recipe.title}</h1>
          <p className="text-lg text-brand-gray-300">{recipe.description}</p>
          <div className="flex flex-wrap gap-4 text-sm text-brand-gray-400">
            <span className="rounded-full bg-brand-gray-900/70 px-4 py-2">⭐ {recipe.rating.toFixed(1)} ({recipe.reviews} reviews)</span>
            <span className="rounded-full bg-brand-gray-900/70 px-4 py-2">Prep {recipe.prepTime}</span>
            <span className="rounded-full bg-brand-gray-900/70 px-4 py-2">Cook {recipe.cookTime}</span>
            <span className="rounded-full bg-brand-gray-900/70 px-4 py-2">Serves {recipe.servings}</span>
            <span className="rounded-full bg-brand-gray-900/70 px-4 py-2">Difficulty {recipe.difficulty}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {recipe.dietaryTags.map((tag) => (
              <Tag key={tag} tone="gray">
                #{tag}
              </Tag>
            ))}
          </div>
          <div className="flex items-center gap-2 text-sm text-brand-gray-500">
            <span>Chef {recipe.chef}</span>
            <span aria-hidden>•</span>
            <a
              href={recipe.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="text-brand-lime hover:text-brand-green"
            >
              View source inspiration
            </a>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-brand-gray-800/70 bg-brand-gray-900/40 shadow-2xl">
          <div className="relative h-80 w-full sm:h-[420px]">
            <Image src={recipe.heroImage} alt={recipe.title} fill className="object-cover" priority />
          </div>
          <div className="border-t border-brand-gray-800/60 bg-black/30 p-4 text-xs text-brand-gray-400">
            {recipe.imageAttribution}
          </div>
        </div>
      </div>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr),minmax(0,1.1fr)] lg:items-start">
        <div className="space-y-6 rounded-3xl border border-brand-gray-800/70 bg-brand-gray-900/40 p-8">
          <h2 className="text-xl font-semibold text-white">Ingredients</h2>
          <ul className="space-y-3 text-sm text-brand-gray-200">
            {recipe.ingredients.map((ingredient) => (
              <li key={ingredient.name} className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-brand-lime" aria-hidden />
                <span>
                  <strong className="text-brand-lime/90">{ingredient.amount}</strong>
                  <span className="ml-2 text-brand-gray-300">{ingredient.name}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-6 rounded-3xl border border-brand-gray-800/70 bg-brand-gray-900/40 p-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Method</h2>
            <ButtonLink variant="secondary" href="/chat">
              Ask Mix for tweaks
            </ButtonLink>
          </div>
          <ol className="space-y-5 text-sm text-brand-gray-200">
            {recipe.steps.map((step, index) => (
              <li key={index} className="relative pl-8">
                <span className="absolute left-0 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-brand-lime/15 text-sm font-semibold text-brand-lime">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
