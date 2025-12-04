import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Link } from 'expo-router';
import { api } from '@/lib/api';
import { Recipe } from '@/lib/types';

const BRAND_COLORS = {
  lime: '#A3E635',
  darkBg: '#1a1a2e',
  darkSurface: '#16213e',
  text: '#e4e4e7',
  textMuted: '#a1a1aa',
};

export default function HomeScreen() {
  const [featuredRecipes, setFeaturedRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedRecipes();
  }, []);

  const loadFeaturedRecipes = async () => {
    try {
      const recipes = await api.getRecipes();
      // Get 6 random recipes as featured
      const shuffled = recipes.sort(() => 0.5 - Math.random());
      setFeaturedRecipes(shuffled.slice(0, 6));
    } catch (error) {
      console.error('Failed to load recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Hero Section */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Mix & Munch</Text>
        <Text style={styles.heroSubtitle}>
          Discover Filipino recipes with what's in your pantry
        </Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Link href="/(tabs)/pantry" asChild>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>🥘</Text>
            <Text style={styles.actionText}>What's in your pantry?</Text>
          </TouchableOpacity>
        </Link>
        <Link href="/(tabs)/chat" asChild>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>👨‍🍳</Text>
            <Text style={styles.actionText}>Ask AI Chef</Text>
          </TouchableOpacity>
        </Link>
      </View>

      {/* Featured Recipes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Featured Recipes</Text>
        {loading ? (
          <ActivityIndicator size="large" color={BRAND_COLORS.lime} />
        ) : (
          <View style={styles.recipeGrid}>
            {featuredRecipes.map((recipe) => (
              <TouchableOpacity key={recipe.slug} style={styles.recipeCard}>
                <View style={styles.recipeImagePlaceholder}>
                  <Text style={styles.recipeEmoji}>🍲</Text>
                </View>
                <Text style={styles.recipeTitle} numberOfLines={2}>
                  {recipe.title}
                </Text>
                <Text style={styles.recipeMeta}>
                  {recipe.cookTime || recipe.prepTime || '30 mins'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND_COLORS.darkBg,
  },
  hero: {
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: BRAND_COLORS.darkSurface,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: BRAND_COLORS.lime,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: BRAND_COLORS.textMuted,
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: BRAND_COLORS.darkSurface,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BRAND_COLORS.lime + '30',
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionText: {
    color: BRAND_COLORS.text,
    fontSize: 14,
    textAlign: 'center',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: BRAND_COLORS.text,
    marginBottom: 16,
  },
  recipeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  recipeCard: {
    width: '48%',
    backgroundColor: BRAND_COLORS.darkSurface,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 4,
  },
  recipeImagePlaceholder: {
    height: 100,
    backgroundColor: BRAND_COLORS.darkBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipeEmoji: {
    fontSize: 40,
  },
  recipeTitle: {
    color: BRAND_COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    padding: 12,
    paddingBottom: 4,
  },
  recipeMeta: {
    color: BRAND_COLORS.textMuted,
    fontSize: 12,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
});
