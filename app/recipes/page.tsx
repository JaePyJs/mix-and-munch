'use client';

import { RecipeCard } from '@/components/recipes/RecipeCard';
import { Tag } from '@/components/ui/Tag';
import { getAllIngredients, getAllRecipes } from '@/lib/data';
import { useTranslation } from '@/lib/hooks/useTranslation';

const recipes = getAllRecipes();
const ingredients = getAllIngredients();

export default function RecipesPage() {
  const { t } = useTranslation();
  
  return (
    <div className="page-grid space-y-10">
      <header className="space-y-4">
        <Tag tone="lime" className="w-fit">{t('recipes.tag')}</Tag>
        <h1 className="text-3xl font-semibold text-white sm:text-4xl">
          {t('recipes.title')}
        </h1>
        <p className="max-w-2xl text-sm text-brand-gray-400">
          {t('recipes.description')}
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {recipes.map((recipe, index) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            index={index}
            ingredients={ingredients}
          />
        ))}
      </section>
    </div>
  );
}
