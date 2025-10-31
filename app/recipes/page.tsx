import { RecipeCard } from '@/components/recipes/RecipeCard';
import { Tag } from '@/components/ui/Tag';
import { getAllIngredients, getAllRecipes } from '@/lib/data';

const recipes = getAllRecipes();
const ingredients = getAllIngredients();

export default function RecipesPage() {
  return (
    <div className="page-grid space-y-10">
      <header className="space-y-4">
        <Tag tone="lime" className="w-fit">Recipe gallery</Tag>
        <h1 className="text-3xl font-semibold text-white sm:text-4xl">
          Filipino dishes reimagined for the modern home cook
        </h1>
        <p className="max-w-2xl text-sm text-brand-gray-400">
          Browse our curated set of chef-tested recipes. Each card indicates pantry matches when you hop over from the checklist, and includes attribution for every visual asset.
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
