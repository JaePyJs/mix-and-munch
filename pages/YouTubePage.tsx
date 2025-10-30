import React, { useState, useMemo, useEffect } from 'react';
import { MealPlanItem, ShoppingListItem, Ingredient } from '../types';

// FIX: Destructure `mealPlan` from props to make it available in the component scope.
const ShoppingListPage: React.FC<{ mealPlan: MealPlanItem[] }> = ({ mealPlan }) => {
  
  const aggregateIngredients = (plan: MealPlanItem[]): Map<string, ShoppingListItem> => {
    const aggregated = new Map<string, ShoppingListItem>();

    plan.forEach(item => {
      item.recipe.ingredients.forEach(ing => {
        const key = ing.name.toLowerCase();
        
        if (!aggregated.has(key)) {
          aggregated.set(key, {
            name: ing.name,
            quantity: new Map<string, number>(),
            checked: false,
          });
        }
        
        const existingItem = aggregated.get(key)!;
        const unit = ing.unit || 'count';
        const currentQty = existingItem.quantity.get(unit) || 0;
        const newQty = typeof ing.quantity === 'number' ? ing.quantity : 1;

        existingItem.quantity.set(unit, currentQty + newQty);
      });
    });

    return aggregated;
  };

  const initialList = useMemo(() => Array.from(aggregateIngredients(mealPlan).values()), [mealPlan]);
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);

  useEffect(() => {
    setShoppingList(initialList);
  }, [initialList]);


  const handleToggleItem = (itemName: string) => {
    setShoppingList(prevList =>
      prevList.map(item =>
        item.name === itemName ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const formatQuantity = (quantityMap: Map<string, number>): string => {
    return Array.from(quantityMap.entries())
      .map(([unit, qty]) => `${qty} ${unit === 'count' ? '' : unit}`)
      .join(', ');
  };

  return (
    <div className="space-y-8">
      <div className="text-center p-6 bg-brand-gray-900 rounded-lg">
        <h1 className="text-4xl font-bold text-brand-lime mb-2">Your Shopping List</h1>
        <p className="text-brand-gray-200">Automatically generated from your meal plan. Happy shopping!</p>
      </div>

      <div className="max-w-2xl mx-auto bg-brand-gray-900 rounded-lg p-6">
        {shoppingList.length > 0 ? (
          <ul className="space-y-3">
            {shoppingList.map(item => (
              <li key={item.name} className="flex items-center p-3 bg-brand-gray-800 rounded-lg">
                <input
                  type="checkbox"
                  id={`item-${item.name}`}
                  checked={item.checked}
                  onChange={() => handleToggleItem(item.name)}
                  className="h-5 w-5 rounded bg-brand-gray-700 border-brand-gray-600 text-brand-lime focus:ring-brand-lime focus:ring-offset-brand-gray-800 cursor-pointer"
                />
                <label
                  htmlFor={`item-${item.name}`}
                  className={`flex-grow ml-4 cursor-pointer transition-colors ${
                    item.checked ? 'text-brand-gray-700 line-through' : 'text-white'
                  }`}
                >
                  <span className="font-bold">{item.name}</span>
                  <span className="text-sm text-brand-gray-200 ml-2">({formatQuantity(item.quantity)})</span>
                </label>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-brand-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            <h3 className="mt-2 text-lg font-medium text-white">Your shopping list is empty.</h3>
            <p className="mt-1 text-sm text-brand-gray-700">Add some recipes to your meal planner to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShoppingListPage;
