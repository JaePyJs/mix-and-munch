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
  category: string;
  emoji: string;
}

export interface RecipeIngredient {
  name: string;
  amount: string;
}

export interface RecipeStep {
  step?: number;
  text: string;
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
}

export interface TranscriptChunk {
  time: string;
  text: string;
}

export interface TranscriptRecipe {
  title: string;
  ingredients: string[];
  steps: string[];
}

export interface TranscriptDemo {
  id: string;
  title: string;
  channel: string;
  videoUrl: string;
  embedUrl: string;
  thumbnail: string;
  imageAttribution: string;
  transcript: TranscriptChunk[];
  extractedRecipe: TranscriptRecipe;
}

export interface PantrySelection {
  [ingredientId: string]: boolean;
}

export interface MatchResult extends RecipeSummary {
  matchPercentage: number;
  missingIngredients: string[];
  matchedIngredients: string[];
}
