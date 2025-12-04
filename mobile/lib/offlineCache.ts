import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recipe, Ingredient } from './types';

const CACHE_KEYS = {
  RECIPES: 'offline_recipes',
  INGREDIENTS: 'offline_ingredients',
  LAST_SYNC: 'offline_last_sync',
};

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export const offlineCache = {
  // Save recipes to offline storage
  async saveRecipes(recipes: Recipe[]): Promise<void> {
    try {
      await AsyncStorage.setItem(CACHE_KEYS.RECIPES, JSON.stringify(recipes));
      await AsyncStorage.setItem(CACHE_KEYS.LAST_SYNC, Date.now().toString());
      console.log('[Offline] Cached', recipes.length, 'recipes');
    } catch (error) {
      console.error('[Offline] Failed to cache recipes:', error);
    }
  },

  // Get cached recipes
  async getRecipes(): Promise<Recipe[] | null> {
    try {
      const data = await AsyncStorage.getItem(CACHE_KEYS.RECIPES);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('[Offline] Failed to get cached recipes:', error);
      return null;
    }
  },

  // Save ingredients to offline storage
  async saveIngredients(ingredients: Ingredient[]): Promise<void> {
    try {
      await AsyncStorage.setItem(CACHE_KEYS.INGREDIENTS, JSON.stringify(ingredients));
      console.log('[Offline] Cached', ingredients.length, 'ingredients');
    } catch (error) {
      console.error('[Offline] Failed to cache ingredients:', error);
    }
  },

  // Get cached ingredients
  async getIngredients(): Promise<Ingredient[] | null> {
    try {
      const data = await AsyncStorage.getItem(CACHE_KEYS.INGREDIENTS);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('[Offline] Failed to get cached ingredients:', error);
      return null;
    }
  },

  // Check if cache is stale
  async isCacheStale(): Promise<boolean> {
    try {
      const lastSync = await AsyncStorage.getItem(CACHE_KEYS.LAST_SYNC);
      if (!lastSync) return true;

      const elapsed = Date.now() - parseInt(lastSync, 10);
      return elapsed > CACHE_DURATION;
    } catch {
      return true;
    }
  },

  // Clear all offline cache
  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        CACHE_KEYS.RECIPES,
        CACHE_KEYS.INGREDIENTS,
        CACHE_KEYS.LAST_SYNC,
      ]);
      console.log('[Offline] Cache cleared');
    } catch (error) {
      console.error('[Offline] Failed to clear cache:', error);
    }
  },

  // Get last sync time
  async getLastSyncTime(): Promise<Date | null> {
    try {
      const lastSync = await AsyncStorage.getItem(CACHE_KEYS.LAST_SYNC);
      return lastSync ? new Date(parseInt(lastSync, 10)) : null;
    } catch {
      return null;
    }
  },
};
