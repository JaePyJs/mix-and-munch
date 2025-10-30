// FIX: Removed self-import of the 'Page' type which conflicted with its local declaration.

export type Page = 'home' | 'demo' | 'meal-planner' | 'shopping-list';

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
  id: number;
  name: string;
  description: string;
  matchScore?: number;
  ingredients: Ingredient[];
  instructions: string[];
  imageUrl: string;
  comments?: Comment[];
  category?: string;
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