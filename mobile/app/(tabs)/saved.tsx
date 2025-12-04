import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recipe } from '@/lib/types';
import { api } from '@/lib/api';

const BRAND_COLORS = {
  lime: '#A3E635',
  darkBg: '#1a1a2e',
  darkSurface: '#16213e',
  text: '#e4e4e7',
  textMuted: '#a1a1aa',
};

const SAVED_RECIPES_KEY = 'mix_munch_saved_recipes';

export default function SavedScreen() {
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [savedSlugs, setSavedSlugs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSavedRecipes();
  }, []);

  const loadSavedRecipes = async () => {
    try {
      // Get saved slugs from storage
      const saved = await AsyncStorage.getItem(SAVED_RECIPES_KEY);
      const slugs: string[] = saved ? JSON.parse(saved) : [];
      setSavedSlugs(slugs);

      if (slugs.length === 0) {
        setSavedRecipes([]);
        setLoading(false);
        return;
      }

      // Fetch full recipe details
      const allRecipes = await api.getRecipes();
      const recipes = allRecipes.filter((r) => slugs.includes(r.slug));
      setSavedRecipes(recipes);
    } catch (error) {
      console.error('Failed to load saved recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeRecipe = async (slug: string) => {
    Alert.alert(
      'Remove Recipe',
      'Are you sure you want to remove this recipe from your saved list?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const newSlugs = savedSlugs.filter((s) => s !== slug);
            await AsyncStorage.setItem(SAVED_RECIPES_KEY, JSON.stringify(newSlugs));
            setSavedSlugs(newSlugs);
            setSavedRecipes(savedRecipes.filter((r) => r.slug !== slug));
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Loading saved recipes...</Text>
      </View>
    );
  }

  if (savedRecipes.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.emptyIcon}>💝</Text>
        <Text style={styles.emptyTitle}>No saved recipes yet</Text>
        <Text style={styles.emptySubtitle}>
          Save recipes you love to access them quickly later!
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved Recipes</Text>
        <Text style={styles.headerSubtitle}>
          {savedRecipes.length} recipe{savedRecipes.length !== 1 ? 's' : ''} saved
        </Text>
      </View>

      {savedRecipes.map((recipe) => (
        <View key={recipe.slug} style={styles.recipeCard}>
          <View style={styles.recipeImagePlaceholder}>
            <Text style={styles.recipeEmoji}>🍲</Text>
          </View>
          <View style={styles.recipeContent}>
            <Text style={styles.recipeTitle} numberOfLines={2}>
              {recipe.title}
            </Text>
            <Text style={styles.recipeDescription} numberOfLines={2}>
              {recipe.description || 'A delicious Filipino recipe'}
            </Text>
            <View style={styles.recipeMeta}>
              {recipe.prepTime && (
                <Text style={styles.metaText}>⏱️ {recipe.prepTime}</Text>
              )}
              {recipe.servings && (
                <Text style={styles.metaText}>👥 {recipe.servings}</Text>
              )}
            </View>
          </View>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => removeRecipe(recipe.slug)}
          >
            <Text style={styles.removeIcon}>🗑️</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND_COLORS.darkBg,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    color: BRAND_COLORS.textMuted,
    fontSize: 16,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    color: BRAND_COLORS.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: BRAND_COLORS.textMuted,
    fontSize: 14,
    textAlign: 'center',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: BRAND_COLORS.darkSurface,
  },
  headerTitle: {
    color: BRAND_COLORS.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: BRAND_COLORS.textMuted,
    marginTop: 4,
  },
  recipeCard: {
    backgroundColor: BRAND_COLORS.darkSurface,
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  recipeImagePlaceholder: {
    width: 80,
    backgroundColor: BRAND_COLORS.darkBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipeEmoji: {
    fontSize: 32,
  },
  recipeContent: {
    flex: 1,
    padding: 12,
  },
  recipeTitle: {
    color: BRAND_COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  recipeDescription: {
    color: BRAND_COLORS.textMuted,
    fontSize: 12,
    marginBottom: 8,
  },
  recipeMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  metaText: {
    color: BRAND_COLORS.textMuted,
    fontSize: 12,
  },
  removeButton: {
    padding: 12,
    justifyContent: 'center',
  },
  removeIcon: {
    fontSize: 20,
  },
});
