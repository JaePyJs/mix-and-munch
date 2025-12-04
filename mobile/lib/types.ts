// Shared types from web app
export type DietaryTag =
  | 'gluten-optional'
  | 'high-protein'
  | 'contains-peanut'
  | 'gluten-free'
  | 'pescetarian'
  | 'dairy-free'
  | 'vegetarian'
  | 'sweet'
  | 'plant-forward'
  | 'spicy'
  | string;

export interface Ingredient {
  id: string;
  name: string;
  filipinoName: string;
  category: string;
  emoji: string;
  substitutes: string[];
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sodium?: number;
}

export interface RecipeIngredient {
  name: string;
  amount: string;
}

export interface RecipeSummary {
  id: string;
  slug: string;
  title: string;
  summary: string;
  heroImage: string;
  imageAttribution: string;
  rating: number;
  reviews: number;
  matchIngredients: string[];
  dietaryTags: DietaryTag[];
  difficulty: string;
}

export interface Recipe extends RecipeSummary {
  description: string;
  servings: number;
  prepTime: string;
  cookTime: string;
  totalTime: string;
  ingredients: RecipeIngredient[];
  steps: string[];
  chef: string;
  sourceUrl: string;
  nutrition?: NutritionInfo;
  region?: string;
  occasion?: string[];
}

export interface MatchResult {
  recipe: Recipe;
  matchPercentage: number;
  matchedCount: number;
  totalIngredients: number;
  missingIngredients: string[];
  matchedIngredients: string[];
}

export interface RecipeReview {
  id: string;
  recipe_slug: string;
  rating: number;
  comment: string;
  author_name: string;
  created_at: string;
}

export interface CommunityRecipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  steps: string[];
  author_name: string;
  author_avatar?: string;
  image_url?: string;
  prep_time?: string;
  cook_time?: string;
  servings?: number;
  difficulty?: string;
  tags: string[];
  likes: number;
  created_at: string;
}
