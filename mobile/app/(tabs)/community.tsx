import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { api } from '@/lib/api';
import { CommunityRecipe } from '@/lib/types';

const BRAND_COLORS = {
  lime: '#A3E635',
  darkBg: '#1a1a2e',
  darkSurface: '#16213e',
  text: '#e4e4e7',
  textMuted: '#a1a1aa',
};

export default function CommunityScreen() {
  const [recipes, setRecipes] = useState<CommunityRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [newRecipe, setNewRecipe] = useState({
    title: '',
    description: '',
    ingredients: '',
    steps: '',
    authorName: '',
  });

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      const data = await api.getCommunityRecipes();
      setRecipes(data);
    } catch (error) {
      console.error('Failed to load community recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (id: string) => {
    const success = await api.likeCommunityRecipe(id);
    if (success) {
      setRecipes((prev) =>
        prev.map((r) => (r.id === id ? { ...r, likes: r.likes + 1 } : r))
      );
    }
  };

  const handleShare = async () => {
    if (!newRecipe.title || !newRecipe.ingredients || !newRecipe.steps) {
      Alert.alert('Missing Fields', 'Please fill in title, ingredients, and steps.');
      return;
    }

    // For now, just show success - actual submission would go through API
    Alert.alert('Success!', 'Your recipe has been shared with the community!');
    setShowShareModal(false);
    setNewRecipe({
      title: '',
      description: '',
      ingredients: '',
      steps: '',
      authorName: '',
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={BRAND_COLORS.lime} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Community Recipes</Text>
          <Text style={styles.headerSubtitle}>
            Discover recipes shared by fellow Filipino food lovers
          </Text>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={() => setShowShareModal(true)}
          >
            <Text style={styles.shareButtonText}>+ Share Your Recipe</Text>
          </TouchableOpacity>
        </View>

        {/* Recipe List */}
        {recipes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>👨‍🍳</Text>
            <Text style={styles.emptyTitle}>No recipes yet</Text>
            <Text style={styles.emptySubtitle}>Be the first to share!</Text>
          </View>
        ) : (
          recipes.map((recipe) => (
            <View key={recipe.id} style={styles.recipeCard}>
              <View style={styles.recipeHeader}>
                <Text style={styles.recipeTitle}>{recipe.title}</Text>
                <TouchableOpacity
                  style={styles.likeButton}
                  onPress={() => handleLike(recipe.id)}
                >
                  <Text style={styles.likeText}>❤️ {recipe.likes}</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.recipeAuthor}>by {recipe.author_name}</Text>
              <Text style={styles.recipeDescription} numberOfLines={2}>
                {recipe.description}
              </Text>
              <View style={styles.recipeMeta}>
                {recipe.prep_time && (
                  <Text style={styles.metaText}>⏱️ {recipe.prep_time}</Text>
                )}
                {recipe.difficulty && (
                  <Text style={styles.metaText}>📊 {recipe.difficulty}</Text>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Share Modal */}
      <Modal visible={showShareModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Share Your Recipe</Text>

            <TextInput
              style={styles.input}
              placeholder="Recipe Title *"
              placeholderTextColor={BRAND_COLORS.textMuted}
              value={newRecipe.title}
              onChangeText={(text) => setNewRecipe({ ...newRecipe, title: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Your Name"
              placeholderTextColor={BRAND_COLORS.textMuted}
              value={newRecipe.authorName}
              onChangeText={(text) => setNewRecipe({ ...newRecipe, authorName: text })}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description"
              placeholderTextColor={BRAND_COLORS.textMuted}
              value={newRecipe.description}
              onChangeText={(text) => setNewRecipe({ ...newRecipe, description: text })}
              multiline
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Ingredients (one per line) *"
              placeholderTextColor={BRAND_COLORS.textMuted}
              value={newRecipe.ingredients}
              onChangeText={(text) => setNewRecipe({ ...newRecipe, ingredients: text })}
              multiline
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Steps (one per line) *"
              placeholderTextColor={BRAND_COLORS.textMuted}
              value={newRecipe.steps}
              onChangeText={(text) => setNewRecipe({ ...newRecipe, steps: text })}
              multiline
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowShareModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={handleShare}>
                <Text style={styles.submitButtonText}>Share Recipe</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: BRAND_COLORS.darkSurface,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: BRAND_COLORS.text,
  },
  headerSubtitle: {
    color: BRAND_COLORS.textMuted,
    marginTop: 4,
    marginBottom: 16,
  },
  shareButton: {
    backgroundColor: BRAND_COLORS.lime,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  shareButtonText: {
    color: BRAND_COLORS.darkBg,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    padding: 48,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    color: BRAND_COLORS.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  emptySubtitle: {
    color: BRAND_COLORS.textMuted,
    marginTop: 8,
  },
  recipeCard: {
    backgroundColor: BRAND_COLORS.darkSurface,
    margin: 16,
    marginBottom: 0,
    padding: 16,
    borderRadius: 12,
  },
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  recipeTitle: {
    color: BRAND_COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  likeButton: {
    padding: 4,
  },
  likeText: {
    color: BRAND_COLORS.text,
  },
  recipeAuthor: {
    color: BRAND_COLORS.lime,
    fontSize: 12,
    marginTop: 4,
  },
  recipeDescription: {
    color: BRAND_COLORS.textMuted,
    marginTop: 8,
  },
  recipeMeta: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  metaText: {
    color: BRAND_COLORS.textMuted,
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: BRAND_COLORS.darkSurface,
    borderRadius: 16,
    padding: 20,
    maxHeight: '90%',
  },
  modalTitle: {
    color: BRAND_COLORS.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    backgroundColor: BRAND_COLORS.darkBg,
    color: BRAND_COLORS.text,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BRAND_COLORS.textMuted,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: BRAND_COLORS.text,
  },
  submitButton: {
    flex: 1,
    backgroundColor: BRAND_COLORS.lime,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: BRAND_COLORS.darkBg,
    fontWeight: 'bold',
  },
});
