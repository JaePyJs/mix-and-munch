const getRecipeImage = (recipeName: string) => {
  // Return a placeholder image URL for now
  return `https://via.placeholder.com/400x300?text=${encodeURIComponent(recipeName)}`;
};

export const categorizedIngredients = [
  {
    category: 'Proteins',
    items: [
      { name: 'Chicken' },
      { name: 'Pork Belly' },
      { name: 'Shrimp' },
      { name: 'Ground Beef' },
      { name: 'Fish Fillet' },
    ],
  },
  {
    category: 'Vegetables & Herbs',
    items: [
      { name: 'Garlic' },
      { name: 'Onion' },
      { name: 'Ginger' },
      { name: 'Tomato' },
      { name: 'Carrot' },
      { name: 'Potato' },
      { name: 'Cabbage' },
      { name: 'Green Beans' },
      { name: 'Bell Pepper' },
      { name: 'Kangkong (Water Spinach)' },
      { name: 'Radish (Labanos)' },
      { name: 'Eggplant' },
      { name: 'Bay Leaves' },
    ],
  },
  {
    category: 'Pantry Staples',
    items: [
      { name: 'Soy Sauce' },
      { name: 'Vinegar' },
      { name: 'Fish Sauce (Patis)' },
      { name: 'Oyster Sauce' },
      { name: 'Tamarind Soup Base' },
      { name: 'Jasmine Rice' },
      { name: 'Pancit Canton Noodles' },
      { name: 'Cooking Oil' },
      { name: 'Black Peppercorns' },
      { name: 'Egg' },
      { name: 'Coconut Milk' },
    ],
  },
];

// Mock recipe data for demo/testing purposes
// Note: This uses a simplified structure different from the full Recipe type
export interface MockRecipe {
  id: string;
  title: string;
  description: string;
  category: string;
  primaryImageUrl: string;
  ingredients: { name: string; amount: string }[];
  instructions: string[];
}

export const mockRecipes: MockRecipe[] = [
  {
    id: '1',
    title: 'Chicken Adobo',
    description: 'Classic Filipino braised chicken in a savory soy and vinegar sauce',
    category: 'Main Dish',
    primaryImageUrl: getRecipeImage('Chicken Adobo'),
    ingredients: [
      { name: 'Chicken', amount: '1.5 kg' },
      { name: 'Soy Sauce', amount: '1 cup' },
      { name: 'Vinegar', amount: '0.5 cup' },
      { name: 'Garlic', amount: '6 cloves' },
      { name: 'Bay Leaves', amount: '3 pieces' },
    ],
    instructions: [
      'Heat oil in a pan and brown the chicken',
      'Add garlic and cook until fragrant',
      'Pour in soy sauce and vinegar',
      'Add bay leaves and simmer for 45 minutes',
      'Serve hot with rice',
    ],
  },
  {
    id: '2',
    title: 'Pancit Canton',
    description: 'Stir-fried egg noodles with vegetables and protein',
    category: 'Main Dish',
    primaryImageUrl: getRecipeImage('Pancit Canton'),
    ingredients: [
      { name: 'Pancit Canton Noodles', amount: '1 pack' },
      { name: 'Chicken', amount: '300 g' },
      { name: 'Cabbage', amount: '2 cups' },
      { name: 'Carrot', amount: '1 piece' },
      { name: 'Soy Sauce', amount: '2 tbsp' },
    ],
    instructions: [
      'Boil the noodles until cooked',
      'Heat oil and stir-fry the chicken',
      'Add vegetables and cook until tender',
      'Add noodles and soy sauce',
      'Toss everything together and serve',
    ],
  },
  {
    id: '3',
    title: 'Sinigang',
    description: 'Tamarind-based pork soup with vegetables',
    category: 'Soup',
    primaryImageUrl: getRecipeImage('Sinigang'),
    ingredients: [
      { name: 'Pork Belly', amount: '1 kg' },
      { name: 'Tamarind Soup Base', amount: '1 pack' },
      { name: 'Radish', amount: '2 pieces' },
      { name: 'Kangkong', amount: '1 bunch' },
      { name: 'Onion', amount: '1 piece' },
    ],
    instructions: [
      'Boil pork until tender',
      'Add tamarind soup base',
      'Add harder vegetables first',
      'Add leafy vegetables last',
      'Season with fish sauce to taste',
    ],
  },
  {
    id: '4',
    title: 'Fried Rice',
    description: 'Quick and easy Filipino-style fried rice',
    category: 'Main Dish',
    primaryImageUrl: getRecipeImage('Fried Rice'),
    ingredients: [
      { name: 'Jasmine Rice', amount: '3 cups' },
      { name: 'Egg', amount: '3 pieces' },
      { name: 'Pork Belly', amount: '200 g' },
      { name: 'Soy Sauce', amount: '3 tbsp' },
      { name: 'Garlic', amount: '4 cloves' },
    ],
    instructions: [
      'Heat oil and scramble eggs, set aside',
      'Fry the diced pork',
      'Add minced garlic',
      'Add cold cooked rice and break up clumps',
      'Add soy sauce and eggs, mix well',
    ],
  },
];
