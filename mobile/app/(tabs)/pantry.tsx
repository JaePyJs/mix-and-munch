import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { api } from '@/lib/api';
import { Ingredient, MatchResult } from '@/lib/types';

const BRAND_COLORS = {
  lime: '#A3E635',
  darkBg: '#1a1a2e',
  darkSurface: '#16213e',
  text: '#e4e4e7',
  textMuted: '#a1a1aa',
};

export default function PantryScreen() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    loadIngredients();
  }, []);

  const loadIngredients = async () => {
    try {
      const data = await api.getIngredients();
      setIngredients(data);
    } catch (error) {
      console.error('Failed to load ingredients:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleIngredient = (id: string) => {
    setSelectedIngredients((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const findRecipes = async () => {
    if (selectedIngredients.length === 0) return;

    setSearching(true);
    try {
      const results = await api.getMatchResults(selectedIngredients);
      setMatchResults(results);
    } catch (error) {
      console.error('Failed to find recipes:', error);
    } finally {
      setSearching(false);
    }
  };

  // Group ingredients by category
  const groupedIngredients = ingredients.reduce(
    (acc, ing) => {
      const category = ing.category || 'Other';
      if (!acc[category]) acc[category] = [];
      acc[category].push(ing);
      return acc;
    },
    {} as Record<string, Ingredient[]>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={BRAND_COLORS.lime} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>What's in your pantry?</Text>
        <Text style={styles.subtitle}>
          Select ingredients you have, and we'll find recipes you can make!
        </Text>
      </View>

      {/* Selected count and search button */}
      <View style={styles.actionBar}>
        <Text style={styles.selectedCount}>
          {selectedIngredients.length} ingredients selected
        </Text>
        <TouchableOpacity
          style={[
            styles.searchButton,
            selectedIngredients.length === 0 && styles.searchButtonDisabled,
          ]}
          onPress={findRecipes}
          disabled={selectedIngredients.length === 0 || searching}
        >
          <Text style={styles.searchButtonText}>
            {searching ? 'Searching...' : 'Find Recipes'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Match Results */}
      {matchResults.length > 0 && (
        <View style={styles.resultsSection}>
          <Text style={styles.sectionTitle}>{matchResults.length} Recipes Found</Text>
          {matchResults.slice(0, 10).map((result) => (
            <View key={result.recipe.slug} style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultTitle}>{result.recipe.title}</Text>
                <View style={styles.matchBadge}>
                  <Text style={styles.matchText}>
                    {Math.round(result.matchPercentage)}% match
                  </Text>
                </View>
              </View>
              <Text style={styles.resultMeta}>
                {result.matchedCount}/{result.totalIngredients} ingredients
              </Text>
              {result.missingIngredients.length > 0 && (
                <Text style={styles.missingText}>
                  Missing: {result.missingIngredients.slice(0, 3).join(', ')}
                  {result.missingIngredients.length > 3 && '...'}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Ingredients by Category */}
      {Object.entries(groupedIngredients).map(([category, items]) => (
        <View key={category} style={styles.categorySection}>
          <Text style={styles.categoryTitle}>{category}</Text>
          <View style={styles.ingredientGrid}>
            {items.map((ingredient) => (
              <TouchableOpacity
                key={ingredient.id}
                style={[
                  styles.ingredientChip,
                  selectedIngredients.includes(ingredient.id) &&
                    styles.ingredientChipSelected,
                ]}
                onPress={() => toggleIngredient(ingredient.id)}
              >
                <Text
                  style={[
                    styles.ingredientText,
                    selectedIngredients.includes(ingredient.id) &&
                      styles.ingredientTextSelected,
                  ]}
                >
                  {ingredient.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
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
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: BRAND_COLORS.darkSurface,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: BRAND_COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: BRAND_COLORS.textMuted,
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: BRAND_COLORS.darkSurface,
  },
  selectedCount: {
    color: BRAND_COLORS.textMuted,
    fontSize: 14,
  },
  searchButton: {
    backgroundColor: BRAND_COLORS.lime,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  searchButtonDisabled: {
    opacity: 0.5,
  },
  searchButtonText: {
    color: BRAND_COLORS.darkBg,
    fontWeight: 'bold',
  },
  resultsSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: BRAND_COLORS.darkSurface,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BRAND_COLORS.lime,
    marginBottom: 12,
  },
  resultCard: {
    backgroundColor: BRAND_COLORS.darkSurface,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  resultTitle: {
    color: BRAND_COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  matchBadge: {
    backgroundColor: BRAND_COLORS.lime + '30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  matchText: {
    color: BRAND_COLORS.lime,
    fontSize: 12,
    fontWeight: 'bold',
  },
  resultMeta: {
    color: BRAND_COLORS.textMuted,
    fontSize: 12,
  },
  missingText: {
    color: BRAND_COLORS.textMuted,
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  categorySection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: BRAND_COLORS.darkSurface,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BRAND_COLORS.text,
    marginBottom: 12,
  },
  ingredientGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ingredientChip: {
    backgroundColor: BRAND_COLORS.darkSurface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BRAND_COLORS.textMuted + '40',
  },
  ingredientChipSelected: {
    backgroundColor: BRAND_COLORS.lime,
    borderColor: BRAND_COLORS.lime,
  },
  ingredientText: {
    color: BRAND_COLORS.text,
    fontSize: 14,
  },
  ingredientTextSelected: {
    color: BRAND_COLORS.darkBg,
    fontWeight: '600',
  },
});
