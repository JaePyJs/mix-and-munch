import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { ButtonLink } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { getRecipeBySlug } from '@/lib/data';
import { RecipeRating } from '@/components/recipes/RecipeRating';
import { SaveRecipeButton } from '@/components/recipes/SaveRecipeButton';

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
    <div className="page-grid space-y-8 sm:space-y-12">
      <div className="grid gap-6 sm:gap-8 lg:grid-cols-[minmax(0,1.1fr),minmax(0,0.9fr)] lg:items-start">
        <div className="space-y-4 sm:space-y-6">
          <Tag tone="lime" className="w-fit">
            Signature Filipino plate
          </Tag>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-white">
            {recipe.title}
          </h1>
          <p className="text-base sm:text-lg text-brand-gray-300">{recipe.description}</p>
          <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-brand-gray-400">
            <span className="rounded-full bg-brand-gray-900/70 px-3 sm:px-4 py-1.5 sm:py-2">
              ⭐ {recipe.rating.toFixed(1)} ({recipe.reviews})
            </span>
            <span className="rounded-full bg-brand-gray-900/70 px-3 sm:px-4 py-1.5 sm:py-2">
              Prep {recipe.prepTime}
            </span>
            <span className="rounded-full bg-brand-gray-900/70 px-3 sm:px-4 py-1.5 sm:py-2">
              Cook {recipe.cookTime}
            </span>
            <span className="rounded-full bg-brand-gray-900/70 px-3 sm:px-4 py-1.5 sm:py-2">
              Serves {recipe.servings}
            </span>
            <span className="rounded-full bg-brand-gray-900/70 px-3 sm:px-4 py-1.5 sm:py-2">
              {recipe.difficulty}
            </span>
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
          <div className="pt-2">
            <SaveRecipeButton
              recipeSlug={recipe.slug}
              recipeTitle={recipe.title}
              recipeDescription={recipe.description}
            />
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-brand-gray-800/70 bg-brand-gray-900/40 shadow-2xl">
          <div className="relative h-64 sm:h-80 lg:h-[420px] w-full">
            <Image
              src={recipe.heroImage || '/placeholder-recipe.svg'}
              alt={recipe.title}
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="border-t border-brand-gray-800/60 bg-black/30 p-3 sm:p-4 text-xs text-brand-gray-400">
            {recipe.imageAttribution}
          </div>
        </div>
      </div>

      <section className="grid gap-6 sm:gap-8 lg:grid-cols-[minmax(0,0.9fr),minmax(0,1.1fr)] lg:items-start">
        <div className="space-y-4 sm:space-y-6 rounded-2xl sm:rounded-3xl border border-brand-gray-800/70 bg-brand-gray-900/40 p-4 sm:p-6 lg:p-8">
          <h2 className="text-lg sm:text-xl font-semibold text-white">Ingredients</h2>
          <ul className="space-y-2 sm:space-y-3 text-sm text-brand-gray-200">
            {recipe.ingredients.map((ingredient, index) => (
              <li
                key={`${ingredient.name}-${index}`}
                className="flex items-start gap-2 sm:gap-3"
              >
                <span
                  className="mt-1.5 h-1.5 sm:h-2 w-1.5 sm:w-2 rounded-full bg-brand-lime flex-shrink-0"
                  aria-hidden
                />
                <span>
                  <strong className="text-brand-lime/90">{ingredient.amount}</strong>
                  <span className="ml-1.5 sm:ml-2 text-brand-gray-300">
                    {ingredient.name}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4 sm:space-y-6 rounded-2xl sm:rounded-3xl border border-brand-gray-800/70 bg-brand-gray-900/40 p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-lg sm:text-xl font-semibold text-white">Method</h2>
            <ButtonLink
              variant="secondary"
              href="/chat"
              className="w-fit text-xs sm:text-sm"
            >
              Ask Mix for tweaks
            </ButtonLink>
          </div>
          <ol className="space-y-4 sm:space-y-5 text-sm text-brand-gray-200">
            {recipe.steps.map((step, index) => (
              <li key={index} className="relative pl-7 sm:pl-8">
                <span className="absolute left-0 top-0 flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-brand-lime/15 text-xs sm:text-sm font-semibold text-brand-lime">
                  {index + 1}
                </span>
                {typeof step === 'string'
                  ? step
                  : (step as { instruction?: string }).instruction || ''}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Nutritional Information */}
      {recipe.nutrition && (
        <section className="rounded-2xl sm:rounded-3xl border border-brand-gray-800/70 bg-brand-gray-900/40 p-4 sm:p-6 lg:p-8">
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">
            Nutrition Facts
          </h2>
          <p className="text-xs text-brand-gray-500 mb-3 sm:mb-4">Per serving</p>
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-4">
            <div className="text-center p-2 sm:p-4 rounded-xl sm:rounded-2xl bg-brand-gray-800/50">
              <div className="text-lg sm:text-2xl font-bold text-brand-lime">
                {recipe.nutrition.calories}
              </div>
              <div className="text-[10px] sm:text-xs text-brand-gray-400 mt-0.5 sm:mt-1">
                Calories
              </div>
            </div>
            <div className="text-center p-2 sm:p-4 rounded-xl sm:rounded-2xl bg-brand-gray-800/50">
              <div className="text-lg sm:text-2xl font-bold text-blue-400">
                {recipe.nutrition.protein}g
              </div>
              <div className="text-[10px] sm:text-xs text-brand-gray-400 mt-0.5 sm:mt-1">
                Protein
              </div>
            </div>
            <div className="text-center p-2 sm:p-4 rounded-xl sm:rounded-2xl bg-brand-gray-800/50">
              <div className="text-lg sm:text-2xl font-bold text-amber-400">
                {recipe.nutrition.carbs}g
              </div>
              <div className="text-[10px] sm:text-xs text-brand-gray-400 mt-0.5 sm:mt-1">
                Carbs
              </div>
            </div>
            <div className="text-center p-2 sm:p-4 rounded-xl sm:rounded-2xl bg-brand-gray-800/50">
              <div className="text-lg sm:text-2xl font-bold text-orange-400">
                {recipe.nutrition.fat}g
              </div>
              <div className="text-[10px] sm:text-xs text-brand-gray-400 mt-0.5 sm:mt-1">
                Fat
              </div>
            </div>
            {recipe.nutrition.fiber !== undefined && (
              <div className="text-center p-2 sm:p-4 rounded-xl sm:rounded-2xl bg-brand-gray-800/50">
                <div className="text-lg sm:text-2xl font-bold text-green-400">
                  {recipe.nutrition.fiber}g
                </div>
                <div className="text-[10px] sm:text-xs text-brand-gray-400 mt-0.5 sm:mt-1">
                  Fiber
                </div>
              </div>
            )}
            {recipe.nutrition.sodium !== undefined && (
              <div className="text-center p-2 sm:p-4 rounded-xl sm:rounded-2xl bg-brand-gray-800/50">
                <div className="text-lg sm:text-2xl font-bold text-purple-400">
                  {recipe.nutrition.sodium}mg
                </div>
                <div className="text-[10px] sm:text-xs text-brand-gray-400 mt-0.5 sm:mt-1">
                  Sodium
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* User Reviews & Ratings */}
      <section className="rounded-2xl sm:rounded-3xl border border-brand-gray-800/70 bg-brand-gray-900/40 p-4 sm:p-6 lg:p-8">
        <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">
          Reviews & Ratings
        </h2>
        <RecipeRating recipeSlug={recipe.slug} recipeName={recipe.title} />
      </section>
    </div>
  );
}
