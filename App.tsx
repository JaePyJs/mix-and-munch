import React, { useState, useEffect, useCallback } from 'react';
import { Page, Recipe, MealPlanItem } from './types';
import { supabase } from './services/supabaseClient';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import DemoPage from './pages/DemoPage';
import MealPlannerPage from './pages/MealPlannerPage';
import ShoppingListPage from './pages/ShoppingListPage';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [mealPlan, setMealPlan] = useState<MealPlanItem[]>([]);
  const [isLoadingMealPlan, setIsLoadingMealPlan] = useState(true);

  const fetchMealPlan = useCallback(async () => {
    setIsLoadingMealPlan(true);
    // Fetch meal plan and join with recipes table to get recipe details
    const { data, error } = await supabase
      .from('meal_plan')
      .select(`
        id,
        day,
        recipe:recipes(*)
      `)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching meal plan:', error);
      alert('Could not load your meal plan.');
    } else if (data) {
      // Supabase returns 'recipe' as a single object if the join is one-to-one
      const formattedData = data.map(item => ({...item, recipe: item.recipe as Recipe}));
      setMealPlan(formattedData);
    }
    setIsLoadingMealPlan(false);
  }, []);

  useEffect(() => {
    fetchMealPlan();
  }, [fetchMealPlan]);

  const handleAddToMealPlan = async (recipe: Recipe, day: string) => {
    const { error } = await supabase
      .from('meal_plan')
      .insert([{ day: day, recipe_id: recipe.id }]);

    if (error) {
      console.error('Error adding to meal plan:', error);
      alert(`Failed to add ${recipe.name} to the meal plan.`);
      throw error; // Propagate error to the caller
    } else {
      await fetchMealPlan(); // Re-fetch to update the UI
    }
  };

  const handleRemoveFromMealPlan = async (itemId: number) => {
    const { error } = await supabase
      .from('meal_plan')
      .delete()
      .eq('id', itemId);
    
    if (error) {
      console.error('Error removing from meal plan:', error);
      alert('Failed to remove item from meal plan.');
    } else {
      await fetchMealPlan(); // Re-fetch to update UI
    }
  };
  
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage setCurrentPage={setCurrentPage} />;
      case 'demo':
        return <DemoPage onAddToMealPlan={handleAddToMealPlan} />;
      case 'meal-planner':
        return <MealPlannerPage mealPlan={mealPlan} onRemoveFromMealPlan={handleRemoveFromMealPlan} isLoading={isLoadingMealPlan} />;
      case 'shopping-list':
        return <ShoppingListPage mealPlan={mealPlan} />;
      default:
        return <HomePage setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="bg-brand-gray-950 text-white min-h-screen font-sans">
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} className="no-print" />
      <main className="container mx-auto px-4 py-8">
        {renderPage()}
      </main>
      <footer className="text-center py-4 text-brand-gray-700 border-t border-brand-gray-800 no-print">
        <p>Mix & Munch - Your Filipino Cuisine Companion. Powered by Gemini.</p>
      </footer>
    </div>
  );
};

export default App;