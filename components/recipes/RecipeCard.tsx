"use client";

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ButtonLink } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { formatMatchPercentage } from '@/lib/utils';
import type { Ingredient, MatchResult, RecipeSummary } from '@/lib/types';

interface RecipeCardProps {
  recipe: RecipeSummary | MatchResult;
  index?: number;
  ingredients?: Ingredient[];
  showMatch?: boolean;
}

export function RecipeCard({ recipe, index = 0, ingredients, showMatch = false }: RecipeCardProps) {
  const matchResult = recipe as MatchResult;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index }}
      className="card-surface flex flex-col overflow-hidden"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={recipe.heroImage}
          alt={recipe.title}
          fill
          className="object-cover transition duration-500 hover:scale-105"
          priority={index < 2}
        />
        {showMatch && typeof matchResult.matchPercentage === 'number' && (
          <div className="absolute left-4 top-4">
            <Tag tone="lime">{formatMatchPercentage(matchResult.matchPercentage)}</Tag>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-xs text-brand-gray-300">
          {recipe.imageAttribution}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-brand-gray-500">
            <span className="rounded-full bg-brand-gray-900/90 px-3 py-1">
              ⭐ {recipe.rating.toFixed(1)} ({recipe.reviews})
            </span>
            <span>{recipe.difficulty}</span>
          </div>
          <h3 className="text-xl font-semibold text-white">{recipe.title}</h3>
          <p className="text-sm text-brand-gray-400">{recipe.summary}</p>
        </div>

        {showMatch && ingredients && matchResult.matchedIngredients && (
          <div className="rounded-2xl border border-brand-gray-800 bg-brand-gray-900/50 p-4 text-xs text-brand-gray-300">
            <p className="font-semibold text-brand-lime">Pantry Highlights</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <div>
                <p className="text-brand-gray-400">Matched</p>
                <ul className="mt-1 space-y-1">
                  {matchResult.matchedIngredients.length > 0 ? (
                    matchResult.matchedIngredients.map((id) => {
                      const item = ingredients.find((ing) => ing.id === id);
                      return (
                        <li key={id}>
                          {item?.emoji} {item?.name ?? id}
                        </li>
                      );
                    })
                  ) : (
                    <li>No pantry matches yet — toggle ingredients above.</li>
                  )}
                </ul>
              </div>
              <div>
                <p className="text-brand-gray-400">Missing</p>
                <ul className="mt-1 space-y-1">
                  {matchResult.missingIngredients && matchResult.missingIngredients.length > 0 ? (
                    matchResult.missingIngredients.map((id) => {
                      const item = ingredients.find((ing) => ing.id === id);
                      return (
                        <li key={id} className="text-brand-gray-500">
                          {item?.emoji} {item?.name ?? id}
                        </li>
                      );
                    })
                  ) : (
                    <li className="text-brand-gray-500">You have everything you need!</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-3">
          {recipe.dietaryTags.map((tag) => (
            <Tag key={tag} tone="gray">
              #{tag}
            </Tag>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xs uppercase tracking-widest text-brand-gray-500">View full recipe</div>
          <ButtonLink href={`/recipes/${recipe.slug}`} variant="secondary">
            View Recipe →
          </ButtonLink>
        </div>
      </div>
    </motion.article>
  );
}
