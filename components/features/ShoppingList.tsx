'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';

interface ShoppingItem {
  name: string;
  amount: string;
  checked: boolean;
  category: string;
  recipeSource: string;
}

interface SavedRecipe {
  slug: string;
  title: string;
  ingredients: Array<{ name: string; amount: string }>;
}

const STORAGE_KEY = 'mix-munch-shopping-list';

// Categorize ingredients for organized shopping
function categorizeIngredient(name: string): string {
  const lowerName = name.toLowerCase();

  // Proteins
  if (/chicken|pork|beef|fish|shrimp|squid|mussels|tilapia|egg|tofu/.test(lowerName)) {
    return '🥩 Proteins';
  }
  // Vegetables
  if (
    /cabbage|carrot|potato|onion|garlic|tomato|eggplant|kangkong|pechay|okra|squash|sitaw|beans|pepper|ginger/.test(
      lowerName
    )
  ) {
    return '🥬 Vegetables';
  }
  // Fruits
  if (/calamansi|banana|pineapple|mango|jackfruit|tamarind/.test(lowerName)) {
    return '🍌 Fruits';
  }
  // Dairy
  if (/milk|cheese|butter|cream/.test(lowerName)) {
    return '🧀 Dairy';
  }
  // Rice & Noodles
  if (/rice|noodle|pasta|bihon|canton|miki/.test(lowerName)) {
    return '🍚 Rice & Noodles';
  }
  // Sauces & Condiments
  if (/soy sauce|vinegar|fish sauce|oyster sauce|ketchup|bagoong|patis/.test(lowerName)) {
    return '🫙 Sauces & Condiments';
  }
  // Spices
  if (/pepper|salt|bay|laurel|sugar|annatto|paprika/.test(lowerName)) {
    return '🧂 Spices & Seasonings';
  }
  // Canned Goods
  if (/canned|sardine|corned|spam|coconut milk|tomato sauce/.test(lowerName)) {
    return '🥫 Canned Goods';
  }

  return '📦 Others';
}

export function ShoppingListGenerator() {
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load shopping list and saved recipes from localStorage
  useEffect(() => {
    const savedList = localStorage.getItem(STORAGE_KEY);
    if (savedList) {
      try {
        setShoppingList(JSON.parse(savedList));
      } catch {
        // Invalid data
      }
    }

    // Load saved recipes from favorites
    const favorites = localStorage.getItem('mix-munch-favorites');
    if (favorites) {
      try {
        setSavedRecipes(JSON.parse(favorites));
      } catch {
        // Invalid data
      }
    }
    setIsLoading(false);
  }, []);

  // Save shopping list to localStorage
  const saveList = useCallback((list: ShoppingItem[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    setShoppingList(list);
  }, []);

  // Add items from a recipe
  const addRecipeIngredients = useCallback(
    (recipe: SavedRecipe) => {
      const newItems: ShoppingItem[] = recipe.ingredients.map((ing) => ({
        name: ing.name,
        amount: ing.amount,
        checked: false,
        category: categorizeIngredient(ing.name),
        recipeSource: recipe.title,
      }));

      // Merge with existing items (avoid duplicates)
      const merged = [...shoppingList];
      newItems.forEach((newItem) => {
        const exists = merged.find(
          (item) => item.name.toLowerCase() === newItem.name.toLowerCase()
        );
        if (!exists) {
          merged.push(newItem);
        }
      });

      saveList(merged);
    },
    [shoppingList, saveList]
  );

  // Toggle item checked status
  const toggleItem = useCallback(
    (index: number) => {
      const updated = [...shoppingList];
      updated[index].checked = !updated[index].checked;
      saveList(updated);
    },
    [shoppingList, saveList]
  );

  // Remove an item
  const removeItem = useCallback(
    (index: number) => {
      const updated = shoppingList.filter((_, i) => i !== index);
      saveList(updated);
    },
    [shoppingList, saveList]
  );

  // Clear checked items
  const clearChecked = useCallback(() => {
    const updated = shoppingList.filter((item) => !item.checked);
    saveList(updated);
  }, [shoppingList, saveList]);

  // Clear all items
  const clearAll = useCallback(() => {
    saveList([]);
  }, [saveList]);

  // Add custom item
  const [customItem, setCustomItem] = useState('');
  const addCustomItem = useCallback(() => {
    if (!customItem.trim()) return;

    const newItem: ShoppingItem = {
      name: customItem.trim(),
      amount: '',
      checked: false,
      category: categorizeIngredient(customItem),
      recipeSource: 'Manual',
    };

    saveList([...shoppingList, newItem]);
    setCustomItem('');
  }, [customItem, shoppingList, saveList]);

  // Group items by category
  const groupedItems = shoppingList.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, ShoppingItem[]>
  );

  const checkedCount = shoppingList.filter((item) => item.checked).length;
  const totalCount = shoppingList.length;

  if (isLoading) {
    return <div className="text-center py-8 text-brand-gray-400">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-surface p-6 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-brand-lime flex items-center gap-2">
              <span>🛒</span> Shopping List
            </h2>
            <p className="text-brand-gray-300 text-sm">
              {checkedCount} of {totalCount} items checked
            </p>
          </div>
          {totalCount > 0 && (
            <div className="flex gap-2">
              {checkedCount > 0 && (
                <Button variant="ghost" onClick={clearChecked}>
                  Clear Done
                </Button>
              )}
              <Button variant="secondary" onClick={clearAll}>
                Clear All
              </Button>
            </div>
          )}
        </div>

        {/* Progress bar */}
        {totalCount > 0 && (
          <div className="h-2 bg-brand-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-lime transition-all duration-300"
              style={{ width: `${(checkedCount / totalCount) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* Add Custom Item */}
      <div className="card-surface p-4 rounded-xl">
        <div className="flex gap-2">
          <input
            type="text"
            value={customItem}
            onChange={(e) => setCustomItem(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCustomItem()}
            placeholder="Add an item manually..."
            className="flex-1 bg-brand-gray-700 border border-brand-gray-600 rounded-lg px-4 py-2 text-white placeholder-brand-gray-400 focus:outline-none focus:border-brand-lime"
          />
          <Button variant="primary" onClick={addCustomItem}>
            Add
          </Button>
        </div>
      </div>

      {/* Add from Saved Recipes */}
      {savedRecipes.length > 0 && (
        <div className="card-surface p-4 rounded-xl">
          <h3 className="text-sm font-semibold text-brand-gray-300 mb-3">
            Add from Saved Recipes
          </h3>
          <div className="flex flex-wrap gap-2">
            {savedRecipes.map((recipe) => (
              <button
                key={recipe.slug}
                onClick={() => addRecipeIngredients(recipe)}
                className="px-3 py-1.5 bg-brand-gray-700 hover:bg-brand-lime/20 text-sm text-white rounded-lg transition-colors"
              >
                + {recipe.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Shopping List by Category */}
      {totalCount === 0 ? (
        <div className="card-surface p-8 rounded-xl text-center">
          <span className="text-4xl mb-4 block">📝</span>
          <p className="text-brand-gray-300 mb-2">Your shopping list is empty</p>
          <p className="text-brand-gray-400 text-sm">
            Add items manually or from your saved recipes
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedItems)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([category, items]) => (
              <div key={category} className="card-surface rounded-xl overflow-hidden">
                <div className="bg-brand-gray-700/50 px-4 py-2 font-semibold text-white">
                  {category}
                </div>
                <div className="divide-y divide-brand-gray-700">
                  {items.map((item, idx) => {
                    const globalIndex = shoppingList.findIndex(
                      (i) => i.name === item.name && i.recipeSource === item.recipeSource
                    );
                    return (
                      <div
                        key={`${item.name}-${idx}`}
                        className={`flex items-center gap-3 px-4 py-3 transition-all ${
                          item.checked ? 'bg-brand-gray-800/50' : ''
                        }`}
                      >
                        <button
                          onClick={() => toggleItem(globalIndex)}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                            item.checked
                              ? 'bg-brand-lime border-brand-lime text-black'
                              : 'border-brand-gray-500 hover:border-brand-lime'
                          }`}
                        >
                          {item.checked && <span className="text-xs">✓</span>}
                        </button>
                        <div className="flex-1">
                          <span
                            className={`text-white ${
                              item.checked ? 'line-through opacity-50' : ''
                            }`}
                          >
                            {item.name}
                          </span>
                          {item.amount && (
                            <span className="text-brand-gray-400 text-sm ml-2">
                              ({item.amount})
                            </span>
                          )}
                          {item.recipeSource !== 'Manual' && (
                            <span className="text-brand-gray-500 text-xs ml-2">
                              from {item.recipeSource}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(globalIndex)}
                          className="text-brand-gray-500 hover:text-red-400 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Export Options */}
      {totalCount > 0 && (
        <div className="card-surface p-4 rounded-xl">
          <h3 className="text-sm font-semibold text-brand-gray-300 mb-3">Export</h3>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                const text = Object.entries(groupedItems)
                  .map(
                    ([cat, items]) =>
                      `${cat}\n${items.map((i) => `  ${i.checked ? '✓' : '○'} ${i.name}${i.amount ? ` (${i.amount})` : ''}`).join('\n')}`
                  )
                  .join('\n\n');
                navigator.clipboard.writeText(text);
                alert('Shopping list copied to clipboard!');
              }}
            >
              📋 Copy to Clipboard
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                const unchecked = shoppingList.filter((i) => !i.checked);
                const text = unchecked
                  .map((i) => `${i.name}${i.amount ? ` - ${i.amount}` : ''}`)
                  .join('\n');
                const blob = new Blob([text], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'shopping-list.txt';
                a.click();
              }}
            >
              📥 Download
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
