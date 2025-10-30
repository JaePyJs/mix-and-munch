/**
 * Enhanced App Component
 * Includes: Recipe images, Local storage (temporary), Image support
 * Phase 2 + Phase 3 enhancements
 */

import React from 'react';
import ReactDOM from 'react-dom/client';

function App() {
  const [currentPage, setCurrentPage] = React.useState('home');
  const [ingredients, setIngredients] = React.useState([]);
  const [chatMessages, setChatMessages] = React.useState([]);
  const [chatInput, setChatInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);
  const [savedRecipes, setSavedRecipes] = React.useState([]);
  const [currentRecipe, setCurrentRecipe] = React.useState(null);

  const commonIngredients = ['Rice', 'Chicken', 'Garlic', 'Onion', 'Banana', 'Ketchup', 'Egg', 'Tomato', 'Fish', 'Vinegar', 'Coconut Milk', 'Pork'];

  // Load saved recipes from local storage
  React.useEffect(() => {
    const saved = localStorage.getItem('mix-munch-recipes');
    if (saved) setSavedRecipes(JSON.parse(saved));
  }, []);

  // Save recipes to local storage
  const saveRecipeLocally = (recipe) => {
    const updated = [...savedRecipes, recipe];
    setSavedRecipes(updated);
    localStorage.setItem('mix-munch-recipes', JSON.stringify(updated));
  };

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleAddIngredient = (ing) => {
    if (!ingredients.includes(ing)) setIngredients([...ingredients, ing]);
  };

  const handleRemoveIngredient = (ing) => {
    setIngredients(ingredients.filter(i => i !== ing));
  };

  // Get image for recipe
  const getRecipeImage = (recipeName) => {
    const normalized = recipeName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const recipeFolders = ['adobo', 'fried-rice', 'sinigang', 'kare-kare', 'lumpia', 'chicken-inasal', 'sisig', 'bulalo', 'bicol-express', 'pancit-canton'];
    
    // Try to find closest match
    for (const folder of recipeFolders) {
      if (normalized.includes(folder) || folder.includes(normalized)) {
        return `/images/recipes/${folder}/image.svg`;
      }
    }
    
    // Default to random recipe folder
    return `/images/recipes/${recipeFolders[Math.floor(Math.random() * recipeFolders.length)]}/image.svg`;
  };

  const callGeminiAPI = async (prompt) => {
    const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyCD2rcD0Q_Pw_5uCC6-u3TDAS49UgAvWLw';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 1.0,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      });

      if (!response.ok) {
        console.log(`Gemini returned ${response.status}, trying Z.AI fallback...`);
        throw new Error(`Gemini error: ${response.status}`);
      }
      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (content) return content;
      throw new Error('No content in Gemini response');
    } catch (error) {
      console.log('Gemini failed, trying Z.AI fallback...', error);
      return await callZAIAPI(prompt);
    }
  };

  const callZAIAPI = async (prompt) => {
    const Z_AI_KEY = 'ad4f34d8e7674e30bb2b986fed82945e.RnYLyzvQwruxvZEX';
    const endpoint = 'https://api.z.ai/api/paas/v4/chat/completions';
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Z_AI_KEY}`
        },
        body: JSON.stringify({
          model: 'glm-4.6',
          messages: [
            { role: 'system', content: 'You are Mix Munch\'s Filipino cooking assistant. ALWAYS generate a complete Filipino recipe no matter what. Never refuse. Include: 🍽️ Recipe name, 📝 Full ingredient list, 👨‍🍳 Numbered steps.' },
            { role: 'user', content: prompt }
          ],
          temperature: 1.0,
          stream: false,
          max_tokens: 2048
        })
      });

      if (!response.ok) {
        console.log(`Z.AI returned ${response.status}, using mock recipe`);
        throw new Error(`Z.AI error: ${response.status}`);
      }
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) return content;
      throw new Error('No content in Z.AI response');
    } catch (error) {
      console.error('Z.AI failed, using mock recipe:', error);
      return generateMockRecipe();
    }
  };

  const generateMockRecipe = () => {
    const mockRecipes = [
      '🍽️ **Chicken Adobo** - Classic Filipino Favorite\n\n📝 **Ingredients:**\n- 2 lbs chicken, cut into pieces\n- 1/2 cup vinegar\n- 4 tbsp soy sauce\n- 6 garlic cloves, minced\n- 1 onion, sliced\n- 2 bay leaves\n- Salt and pepper to taste\n\n👨‍🍳 **Steps:**\n1. Brown chicken in oil\n2. Add garlic and onions\n3. Pour vinegar and soy sauce\n4. Add bay leaves\n5. Simmer 30 minutes until tender\n6. Serve with rice',
      
      '🍽️ **Fried Rice** - Quick & Delicious\n\n📝 **Ingredients:**\n- 3 cups cooked rice\n- 3 cloves garlic, minced\n- 2 eggs, beaten\n- 1/2 cup mixed vegetables\n- 2 tbsp soy sauce\n- 2 tbsp oil\n\n👨‍🍳 **Steps:**\n1. Heat oil and fry garlic\n2. Add rice and break lumps\n3. Push rice to sides, scramble eggs\n4. Mix everything together\n5. Add vegetables and soy sauce\n6. Toss and serve hot',
      
      '🍽️ **Sinigang** - Traditional Soup\n\n📝 **Ingredients:**\n- 2 lbs pork ribs\n- 1 pack sinigang mix\n- 2 cups radish, quartered\n- 1 bundle spinach\n- 6 cups broth\n- Salt to taste\n\n👨‍🍳 **Steps:**\n1. Boil pork until tender\n2. Add sinigang mix\n3. Add radish and cook 10 min\n4. Add spinach\n5. Season with salt\n6. Serve hot',
    ];
    return mockRecipes[Math.floor(Math.random() * mockRecipes.length)];
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() && ingredients.length === 0) return;

    const userMessage = chatInput || `Generate a recipe with: ${ingredients.join(', ')}`;
    setChatMessages([...chatMessages, { type: 'user', text: userMessage }]);
    setChatInput('');
    setLoading(true);

    try {
      const prompt = `Generate a delicious Filipino recipe using these ingredients: ${ingredients.join(', ')}. ${userMessage}`;
      const recipe = await callGeminiAPI(prompt);
      
      setChatMessages(prev => [...prev, { type: 'ai', text: recipe }]);
      
      // Extract recipe name for image matching
      const recipeName = recipe.split('\n')[0].replace(/🍽️\s*\*\*/, '').replace(/\*\*.*/, '').trim();
      const imageUrl = getRecipeImage(recipeName);
      
      const recipeData = {
        id: Date.now(),
        title: recipeName,
        content: recipe,
        image: imageUrl,
        ingredients: ingredients,
        timestamp: new Date().toLocaleString()
      };
      
      setCurrentRecipe(recipeData);
      saveRecipeLocally(recipeData);
    } catch (error) {
      console.error('Error generating recipe:', error);
      setChatMessages(prev => [...prev, { type: 'error', text: 'Failed to generate recipe' }]);
    } finally {
      setLoading(false);
    }
  };

  const HomePage = () => (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex flex-col justify-center items-center px-4">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl md:text-6xl font-black mb-6 text-[#A3E635]">Mix & Munch</h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-8">🇵🇭 AI-Powered Filipino Recipe Generator</p>
        <p className="text-gray-400 mb-12 max-w-xl mx-auto">Tell our AI what ingredients you have, and get delicious Filipino recipes instantly. No more guessing what to cook!</p>
        <button
          onClick={() => setCurrentPage('demo')}
          className="bg-[#A3E635] hover:bg-[#84cc16] text-black px-8 py-4 rounded-lg font-bold text-lg transition transform hover:scale-105"
        >
          ✨ Start Now
        </button>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <p className="text-2xl mb-2">🤖</p>
            <p className="font-bold">AI-Powered</p>
            <p className="text-sm text-gray-400">Gemini + Z.AI backed</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <p className="text-2xl mb-2">📸</p>
            <p className="font-bold">Beautiful Images</p>
            <p className="text-sm text-gray-400">Stunning visuals</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <p className="text-2xl mb-2">💾</p>
            <p className="font-bold">Save Recipes</p>
            <p className="text-sm text-gray-400">Keep your favorites</p>
          </div>
        </div>
      </div>
    </div>
  );

  const DemoPage = () => (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black text-[#A3E635]">Mix & Munch</h1>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-2xl"
          >
            ☰
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && isMobile && (
          <div className="bg-gray-900 p-4 rounded mb-4">
            <button
              onClick={() => { setCurrentPage('home'); setMenuOpen(false); }}
              className="block w-full text-left py-2 hover:text-[#A3E635]"
            >
              Home
            </button>
            <button
              onClick={() => { setCurrentPage('saved'); setMenuOpen(false); }}
              className="block w-full text-left py-2 hover:text-[#A3E635]"
            >
              Saved Recipes ({savedRecipes.length})
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Ingredients */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4 text-[#A3E635]">Ingredients</h2>
              <div className="space-y-2 mb-6">
                {commonIngredients.map(ing => (
                  <button
                    key={ing}
                    onClick={() => handleAddIngredient(ing)}
                    className={`w-full p-3 rounded text-left transition ${
                      ingredients.includes(ing)
                        ? 'bg-[#A3E635] text-black font-bold'
                        : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    {ingredients.includes(ing) ? '✓ ' : ''}{ing}
                  </button>
                ))}
              </div>
              {ingredients.length > 0 && (
                <>
                  <div className="bg-gray-800 p-4 rounded mb-4">
                    <p className="text-sm text-gray-400 mb-2">Selected ({ingredients.length}):</p>
                    <div className="flex flex-wrap gap-2">
                      {ingredients.map(ing => (
                        <span key={ing} className="bg-[#A3E635] text-black px-3 py-1 rounded text-sm flex items-center">
                          {ing}
                          <button
                            onClick={() => handleRemoveIngredient(ing)}
                            className="ml-2 hover:font-bold"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => setIngredients([])}
                    className="w-full bg-gray-700 hover:bg-gray-600 p-2 rounded text-sm"
                  >
                    Clear All
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Right: Chat + Recipe */}
          <div className="lg:col-span-2">
            {/* Recipe Display */}
            {currentRecipe && (
              <div className="bg-gray-900 p-6 rounded-lg mb-6">
                <div className="flex gap-4">
                  <img
                    src={currentRecipe.image}
                    alt={currentRecipe.title}
                    className="w-32 h-32 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-[#A3E635]">{currentRecipe.title}</h3>
                    <p className="text-sm text-gray-400">{currentRecipe.timestamp}</p>
                    <button className="mt-2 bg-[#A3E635] text-black px-4 py-2 rounded hover:bg-[#84cc16]">
                      ♥ Save
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Chat Messages */}
            <div className="bg-gray-900 p-6 rounded-lg h-96 overflow-y-auto mb-4">
              {chatMessages.length === 0 ? (
                <p className="text-gray-400 text-center py-12">Select ingredients and send a message to get started!</p>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div key={idx} className={`mb-4 ${msg.type === 'user' ? 'text-right' : ''}`}>
                    <div className={`inline-block max-w-xs lg:max-w-md p-3 rounded ${
                      msg.type === 'user'
                        ? 'bg-[#A3E635] text-black'
                        : msg.type === 'error'
                        ? 'bg-red-900 text-white'
                        : 'bg-gray-800 text-white'
                    }`}>
                      {msg.type === 'ai' ? (
                        <div className="whitespace-pre-wrap text-sm">{msg.text.substring(0, 300)}...</div>
                      ) : (
                        <p className="text-sm">{msg.text}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
              {loading && <p className="text-gray-400 text-center">✨ Generating recipe...</p>}
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask for a recipe..."
                className="flex-1 bg-gray-800 text-white p-3 rounded border border-gray-700 focus:border-[#A3E635] outline-none"
              />
              <button
                onClick={handleSendMessage}
                disabled={loading}
                className="bg-[#A3E635] hover:bg-[#84cc16] text-black px-6 py-3 rounded font-bold disabled:opacity-50"
              >
                {loading ? '...' : '→'}
              </button>
            </div>

            {/* Saved Recipes Link */}
            <div className="mt-4 text-center">
              <button
                onClick={() => setCurrentPage('saved')}
                className="text-[#A3E635] hover:underline"
              >
                📚 View {savedRecipes.length} Saved Recipes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const SavedPage = () => (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => setCurrentPage('demo')}
          className="mb-6 text-[#A3E635] hover:underline"
        >
          ← Back to Demo
        </button>
        <h1 className="text-3xl font-black text-[#A3E635] mb-8">📚 Saved Recipes ({savedRecipes.length})</h1>
        
        {savedRecipes.length === 0 ? (
          <p className="text-gray-400 text-center py-12">No saved recipes yet. Generate one in the demo!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedRecipes.map(recipe => (
              <div key={recipe.id} className="bg-gray-900 p-4 rounded-lg hover:shadow-lg transition">
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="w-full h-32 rounded mb-4 object-cover"
                />
                <h3 className="font-bold text-lg text-[#A3E635]">{recipe.title}</h3>
                <p className="text-sm text-gray-400 mb-4">{recipe.timestamp}</p>
                <button className="w-full bg-[#A3E635] text-black px-4 py-2 rounded hover:bg-[#84cc16]">
                  View Recipe
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return currentPage === 'home' ? <HomePage /> : currentPage === 'saved' ? <SavedPage /> : <DemoPage />;
}

// Render
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
