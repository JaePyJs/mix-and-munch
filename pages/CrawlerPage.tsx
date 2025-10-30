import React from 'react';
import { MealPlanItem } from '../types';

interface MealPlannerPageProps {
    mealPlan: MealPlanItem[];
    // FIX: Changed itemId type from string to number to match the MealPlanItem interface.
    onRemoveFromMealPlan: (itemId: number) => void;
}

const MealPlannerPage: React.FC<MealPlannerPageProps> = ({ mealPlan, onRemoveFromMealPlan }) => {
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    return (
        <div className="space-y-8">
            <div className="text-center p-6 bg-brand-gray-900 rounded-lg">
                <h1 className="text-4xl font-bold text-brand-lime mb-2">Your Weekly Meal Planner</h1>
                <p className="text-brand-gray-200">Plan your delicious Filipino meals for the week. Add recipes from the 'Recipes' page!</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {daysOfWeek.map(day => {
                    const mealsForDay = mealPlan.filter(item => item.day === day);
                    return (
                        <div key={day} className="bg-brand-gray-900 rounded-lg p-4 min-h-[200px]">
                            <h2 className="text-xl font-bold text-center text-brand-lime mb-4 border-b-2 border-brand-gray-700 pb-2">{day}</h2>
                            <div className="space-y-3">
                                {mealsForDay.length > 0 ? (
                                    mealsForDay.map(item => (
                                        <div key={item.id} className="bg-brand-gray-800 p-2 rounded flex items-center justify-between group">
                                            <span className="text-white font-medium">{item.recipe.name}</span>
                                            <button 
                                                onClick={() => onRemoveFromMealPlan(item.id)}
                                                className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Remove"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-brand-gray-700 italic mt-8">No meals planned.</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MealPlannerPage;