// FIX: Removed self-import of the 'Page' type which conflicted with its local declaration.

export type Page = 'home' | 'demo' | 'recipes' | 'favorites' | 'meal-planner' | 'shopping-list';

export interface Ingredient {
  name: string;
  quantity?: number | string;
  unit?: string;
}

export interface Comment {
  id: number;
  author: string;
  avatarUrl: string;
  text: string;
  rating: number;
}

export interface Recipe {
  id: string;
  title: string;
  author?: string;
  description?: string;
  sourceUrl?: string;
  sourceSite?: string;
  servings?: string;
  prepTime?: number;
  cookTime?: number;
  totalTime?: string;
  ingredients: Ingredient[];
  instructions: string[];
  image?: string;
  primaryImageUrl?: string;
  imageAttribution?: string;
  rating?: number;
  reviewCount?: number;
  category?: string;
  tags?: string[];
  comments?: Comment[];
  matchScore?: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface CrawlerSeed {
  id: number;
  url: string;
  status: 'active' | 'inactive';
}

export interface DiscoveredRecipe {
  id: number;
  title: string;
  source: string;
  imageUrl: string;
}

export interface TranscriptLine {
  speaker: string;
  line: string;
}

export interface MealPlanItem {
  id: number; // Changed from string to number to match DB primary key
  day: string;
  recipe: Recipe;
}

export interface ShoppingListItem {
  name: string;
  quantity: Map<string, number>; // Maps unit to total quantity
  checked: boolean;
}