import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { api } from '@/lib/api';
import { RecipeSummary } from '@/lib/types';

const BRAND_COLORS = {
  lime: '#A3E635',
  darkBg: '#1a1a2e',
  darkSurface: '#16213e',
  text: '#e4e4e7',
  textMuted: '#a1a1aa',
};

export default function RecipesScreen() {
  const [recipes, setRecipes] = useState<RecipeSummary[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<RecipeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    loadRecipes();
  }, []);

  useEffect(() => {
    filterRecipes();
  }, [searchQuery, selectedCategory, recipes]);

  const loadRecipes = async () => {
    try {
      const data = await api.getRecipes();
      setRecipes(data);
      setFilteredRecipes(data);
    } catch (error) {
      console.error('Failed to load recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterRecipes = () => {
    let filtered = recipes;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(query) ||
          r.summary?.toLowerCase().includes(query)
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((r) =>
        r.dietaryTags?.some((tag: string) =>
          tag.toLowerCase().includes(selectedCategory.toLowerCase())
        )
      );
    }

    setFilteredRecipes(filtered);
  };

  const categories = ['Pork', 'Chicken', 'Beef', 'Seafood', 'Vegetables', 'Dessert'];

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={BRAND_COLORS.lime} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search recipes..."
          placeholderTextColor={BRAND_COLORS.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Category Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContainer}
      >
        <TouchableOpacity
          style={[styles.categoryPill, !selectedCategory && styles.categoryPillSelected]}
          onPress={() => setSelectedCategory(null)}
        >
          <Text
            style={[
              styles.categoryText,
              !selectedCategory && styles.categoryTextSelected,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryPill,
              selectedCategory === cat && styles.categoryPillSelected,
            ]}
            onPress={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === cat && styles.categoryTextSelected,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Recipe List */}
      <ScrollView style={styles.recipeList}>
        <Text style={styles.resultCount}>{filteredRecipes.length} recipes found</Text>
        {filteredRecipes.map((recipe) => (
          <TouchableOpacity key={recipe.slug} style={styles.recipeCard}>
            <View style={styles.recipeImagePlaceholder}>
              <Text style={styles.recipeEmoji}>🍲</Text>
            </View>
            <View style={styles.recipeContent}>
              <Text style={styles.recipeTitle} numberOfLines={2}>
                {recipe.title}
              </Text>
              <Text style={styles.recipeDescription} numberOfLines={2}>
                {recipe.summary || 'A delicious Filipino recipe'}
              </Text>
              <View style={styles.recipeMeta}>
                <Text style={styles.metaText}>
                  ⭐ {recipe.rating?.toFixed(1) || '4.5'}
                </Text>
                <Text style={styles.metaText}>📊 {recipe.difficulty || 'Medium'}</Text>
              </View>
              {recipe.dietaryTags && recipe.dietaryTags.length > 0 && (
                <View style={styles.tagContainer}>
                  {recipe.dietaryTags.slice(0, 3).map((tag: string) => (
                    <View key={tag} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
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
  },
  searchContainer: {
    padding: 16,
    backgroundColor: BRAND_COLORS.darkSurface,
  },
  searchInput: {
    backgroundColor: BRAND_COLORS.darkBg,
    color: BRAND_COLORS.text,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  categoryScroll: {
    maxHeight: 50,
    backgroundColor: BRAND_COLORS.darkSurface,
  },
  categoryContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
    flexDirection: 'row',
  },
  categoryPill: {
    backgroundColor: BRAND_COLORS.darkBg,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BRAND_COLORS.textMuted + '40',
  },
  categoryPillSelected: {
    backgroundColor: BRAND_COLORS.lime,
    borderColor: BRAND_COLORS.lime,
  },
  categoryText: {
    color: BRAND_COLORS.text,
    fontSize: 14,
  },
  categoryTextSelected: {
    color: BRAND_COLORS.darkBg,
    fontWeight: '600',
  },
  recipeList: {
    flex: 1,
    padding: 16,
  },
  resultCount: {
    color: BRAND_COLORS.textMuted,
    marginBottom: 12,
  },
  recipeCard: {
    backgroundColor: BRAND_COLORS.darkSurface,
    borderRadius: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 12,
  },
  recipeImagePlaceholder: {
    width: 100,
    backgroundColor: BRAND_COLORS.darkBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipeEmoji: {
    fontSize: 36,
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
    marginBottom: 8,
  },
  metaText: {
    color: BRAND_COLORS.textMuted,
    fontSize: 12,
  },
  tagContainer: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: BRAND_COLORS.lime + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    color: BRAND_COLORS.lime,
    fontSize: 10,
  },
});
