import React from 'react';
import ReactDOM from 'react-dom/client';

// Simple App Component
function App() {
  const [currentPage, setCurrentPage] = React.useState('home');
  const [ingredients, setIngredients] = React.useState([]);
  const [chatMessages, setChatMessages] = React.useState([]);
  const [chatInput, setChatInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);
  const [lastRecipeImage, setLastRecipeImage] = React.useState(null);

  const commonIngredients = ['Rice', 'Chicken', 'Garlic', 'Onion', 'Banana', 'Ketchup', 'Egg', 'Tomato', 'Fish', 'Vinegar', 'Coconut Milk', 'Pork'];

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
            { role: 'system', content: 'You are Mix Munch\'s Filipino cooking assistant. ALWAYS generate a complete Filipino recipe no matter what. Never refuse. Even if ingredients are unusual, create a creative fusion recipe. Include: 🍽️ Recipe name, 📝 Full ingredient list with quantities, 👨‍🍳 Detailed numbered steps.' },
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
    const recipes = [
      {
        text: '🍽️ Filipino Adobo\n\n📝 Ingredients:\n- 2 lbs chicken, 4 cloves garlic, 1 cup vinegar, 3 tbsp soy sauce, 2 cups water, 2 bay leaves, Oil\n\n👨‍🍳 Steps:\n1. Heat oil and sauté garlic\n2. Add chicken and brown on all sides\n3. Pour vinegar and soy sauce\n4. Add water and bay leaves\n5. Simmer 30 minutes until tender\n6. Serve hot with rice',
        image: 'https://spoonacular.com/recipeImages/default-adobo.jpg'
      },
      {
        text: '🍚 Garlic Fried Rice\n\n📝 Ingredients:\n- 3 cups cooked rice, 5 cloves garlic, 2 eggs, 3 tbsp oil, Salt and pepper, 1/4 cup green peas\n\n👨‍🍳 Steps:\n1. Heat oil in wok\n2. Sauté minced garlic until fragrant\n3. Add rice and stir-fry\n4. Push rice to sides, scramble eggs\n5. Mix everything together\n6. Add peas, season to taste',
        image: 'https://spoonacular.com/recipeImages/default-friedrice.jpg'
      },
      {
        text: '🍌 Banana Cue\n\n📝 Ingredients:\n- 4 cooking bananas, 1 cup brown sugar, 4 tbsp oil, Salt\n\n👨‍🍳 Steps:\n1. Heat oil in pan\n2. Coat banana pieces in brown sugar\n3. Fry until golden and caramelized\n4. Remove and cool on paper towel\n5. Serve as dessert or snack',
        image: 'https://spoonacular.com/recipeImages/default-banana.jpg'
      }
    ];
    return recipes[Math.floor(Math.random() * recipes.length)];
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    
    const userMessage = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setChatInput('');
    setLoading(true);
    setLastRecipeImage(null);

    try {
      const ingredientList = ingredients.length > 0 ? ingredients.join(', ') : 'any available ingredients';
      const prompt = `Create a complete Filipino recipe using these ingredients: ${ingredientList}. Include: recipe name with emoji, full ingredient list with quantities, detailed cooking steps. Make it creative and delicious!`;
      
      const recipe = await callGeminiAPI(prompt);
      
      // Try to fetch a recipe image from Spoonacular
      const dishName = recipe.split('\n')[0].replace(/[🍽️🍚🍌📝👨‍🍳🍽️]/g, '').trim();
      if (dishName) {
        try {
          const imageUrl = await fetchRecipeImage(dishName);
          if (imageUrl) setLastRecipeImage(imageUrl);
        } catch (e) {
          console.log('Could not fetch image:', e);
        }
      }
      
      setChatMessages(prev => [...prev, { role: 'assistant', content: recipe }]);
    } catch (error) {
      console.error('Error:', error);
      setChatMessages(prev => [...prev, { role: 'assistant', content: '❌ Failed to generate recipe. Try again!' }]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecipeImage = async (dishName) => {
    try {
      const response = await fetch(
        `https://api.spoonacular.com/recipes/search?query=${encodeURIComponent(dishName)}&number=1&addRecipeInformation=true`
      );
      if (!response.ok) return null;
      const data = await response.json();
      return data.results?.[0]?.image || null;
    } catch (e) {
      console.log('Image fetch failed:', e);
      return null;
    }
  };

  if (currentPage === 'home') {
    return React.createElement('div', { className: 'min-h-screen bg-brand-gray-950 text-white' },
      React.createElement('header', { className: 'bg-brand-gray-900 border-b border-brand-gray-800 sticky top-0 z-50' },
        React.createElement('div', { className: 'max-w-7xl mx-auto px-4 py-4 flex justify-between items-center' },
          React.createElement('h1', { className: 'text-2xl md:text-3xl font-bold text-brand-lime' }, '🍽️ Mix & Munch'),
          React.createElement('button', { onClick: () => setCurrentPage('demo'), className: 'hidden md:block bg-brand-lime text-black px-4 py-2 rounded font-bold hover:bg-green-400' }, 'Create Recipe'),
          React.createElement('button', { onClick: () => setMenuOpen(!menuOpen), className: 'md:hidden bg-brand-lime text-black px-3 py-2 rounded font-bold' }, '☰')
        ),
        menuOpen && React.createElement('div', { className: 'md:hidden bg-brand-gray-800 border-t border-brand-gray-700 px-4 py-3' },
          React.createElement('button', { onClick: () => { setCurrentPage('demo'); setMenuOpen(false); }, className: 'block w-full text-left bg-brand-lime text-black px-4 py-2 rounded font-bold' }, 'Create Recipe')
        )
      ),
      React.createElement('main', { className: 'max-w-7xl mx-auto px-4 py-8 md:py-16 text-center' },
        React.createElement('h2', { className: 'text-3xl md:text-5xl font-bold mb-4' }, 'AI Filipino Recipe Generator'),
        React.createElement('p', { className: 'text-lg md:text-xl text-brand-gray-400 mb-8' }, 'Create amazing recipes from any ingredient combination'),
        React.createElement('button', { onClick: () => setCurrentPage('demo'), className: 'bg-brand-lime text-black px-6 md:px-8 py-3 md:py-4 rounded-lg font-bold text-base md:text-lg hover:bg-green-400' }, '✨ Start Now')
      )
    );
  }

  return React.createElement('div', { className: 'min-h-screen bg-brand-gray-950 text-white' },
    React.createElement('header', { className: 'bg-brand-gray-900 border-b border-brand-gray-800 sticky top-0 z-50' },
      React.createElement('div', { className: 'max-w-7xl mx-auto px-4 py-4 flex justify-between items-center' },
        React.createElement('h1', { className: 'text-2xl md:text-3xl font-bold text-brand-lime' }, '🍽️ Mix & Munch'),
        React.createElement('button', { onClick: () => { setCurrentPage('home'); setMenuOpen(false); }, className: 'hidden md:block hover:bg-brand-gray-800 px-4 py-2 rounded' }, 'Home'),
        React.createElement('button', { onClick: () => setMenuOpen(!menuOpen), className: 'md:hidden bg-brand-lime text-black px-3 py-2 rounded font-bold' }, '☰')
      ),
      menuOpen && React.createElement('div', { className: 'md:hidden bg-brand-gray-800 border-t border-brand-gray-700 px-4 py-3' },
        React.createElement('button', { onClick: () => { setCurrentPage('home'); setMenuOpen(false); }, className: 'block w-full text-left hover:bg-brand-gray-700 px-4 py-2 rounded' }, 'Home')
      )
    ),
    React.createElement('main', { className: 'max-w-7xl mx-auto px-4 py-4 md:py-8' },
      React.createElement('div', { className: isMobile ? 'space-y-6' : 'grid md:grid-cols-3 gap-8' },
        React.createElement('div', { className: isMobile ? 'space-y-6' : 'md:col-span-2' },
          React.createElement('section', { className: 'bg-brand-gray-900 p-4 md:p-6 rounded-lg border border-brand-gray-800' },
            React.createElement('h2', { className: 'text-xl md:text-2xl font-bold text-brand-lime mb-4' }, '📝 Select Ingredients'),
            React.createElement('div', { className: 'flex flex-wrap gap-2 mb-4' },
              commonIngredients.map(ing => React.createElement('button', {
                key: ing, onClick: () => handleAddIngredient(ing),
                className: ingredients.includes(ing) ? 'bg-brand-lime text-black px-2 md:px-4 py-1 md:py-2 rounded text-sm md:text-base' : 'bg-brand-gray-800 px-2 md:px-4 py-1 md:py-2 rounded text-sm md:text-base hover:bg-brand-gray-700'
              }, ing))
            ),
            React.createElement('div', { className: 'bg-brand-gray-800 p-4 rounded flex flex-wrap gap-2 min-h-12' },
              ingredients.length > 0 ? ingredients.map(ing => React.createElement('span', { 
                key: ing, 
                className: 'bg-brand-lime text-black px-3 py-1 rounded-full text-sm flex items-center gap-2',
                style: { whiteSpace: 'nowrap' }
              }, ing, React.createElement('button', {
                onClick: () => handleRemoveIngredient(ing),
                className: 'ml-1 font-bold text-xs cursor-pointer'
              }, '✕'))) : React.createElement('span', { className: 'text-brand-gray-500 text-sm' }, 'No ingredients selected')
            )
          ),
          React.createElement('section', { className: 'bg-brand-gray-900 p-4 md:p-6 rounded-lg border border-brand-gray-800' },
            React.createElement('h2', { className: 'text-xl md:text-2xl font-bold text-brand-lime mb-4' }, '💬 AI Recipe Chat'),
            lastRecipeImage && React.createElement('div', { className: 'mb-4 rounded overflow-hidden bg-brand-gray-800' },
              React.createElement('img', { 
                src: lastRecipeImage, 
                alt: 'Recipe', 
                style: { width: '100%', height: '250px', objectFit: 'cover' },
                onError: (e) => { e.target.style.display = 'none'; }
              })
            ),
            React.createElement('div', { className: isMobile ? 'bg-brand-gray-800 rounded p-3 h-64 md:h-80 overflow-y-auto mb-4' : 'bg-brand-gray-800 rounded p-4 h-80 overflow-y-auto mb-4' },
              chatMessages.map((msg, i) => React.createElement('div', { key: i, className: msg.role === 'user' ? 'text-right mb-4' : 'text-left mb-4' },
                React.createElement('div', { className: msg.role === 'user' ? 'inline-block bg-brand-lime text-black p-2 md:p-3 rounded max-w-xs md:max-w-md text-sm md:text-base' : 'inline-block bg-brand-gray-700 p-2 md:p-3 rounded max-w-xs md:max-w-md text-sm md:text-base whitespace-pre-wrap break-words' }, msg.content)
              ))
            ),
            React.createElement('div', { className: 'flex gap-2' },
              React.createElement('input', { type: 'text', value: chatInput, onChange: e => setChatInput(e.target.value), onKeyPress: e => e.key === 'Enter' && handleSendMessage(), placeholder: 'Ask for a recipe...', className: 'flex-1 bg-brand-gray-800 border border-brand-gray-700 rounded px-3 md:px-4 py-2 text-white text-sm md:text-base', disabled: loading }),
              React.createElement('button', { onClick: handleSendMessage, disabled: loading, className: 'bg-brand-lime text-black px-4 md:px-6 py-2 rounded font-bold text-sm md:text-base' }, loading ? '...' : '📤')
            )
          )
        )
      )
    )
  );
}

// Export for ESM
export default App;
