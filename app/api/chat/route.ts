export const runtime = 'nodejs';

const mockRecipes: Record<string, string> = {
  'eggs': `📋 **RECIPE TITLE: Crispy Filipino Egg Omelet (Tortang Itlog)**

⏱️ **TIME & SERVINGS**
* Prep: 5 min
* Cook: 10 min
* Servings: 2

🥘 **INGREDIENTS**
* 3 eggs, beaten
* 2 potatoes, thinly sliced
* 1 onion, diced
* 2 tbsp cooking oil
* Salt and pepper to taste

👨‍🍳 **INSTRUCTIONS**
1. Heat oil in a pan over medium heat
2. Fry potatoes until golden brown, set aside
3. Sauté onions until fragrant
4. Pour beaten eggs over potatoes and onions
5. Cook until edges are golden, about 5 minutes
6. Flip and cook other side until set
7. Transfer to plate and serve hot with rice

💡 **PRO TIP**
Keep the heat moderate to prevent the outside from burning before the inside cooks through. A non-stick pan works best!

🇵🇭 **CULTURAL INSIGHT**
Tortang Itlog is a classic Filipino comfort food, commonly served for breakfast or as a quick lunch. It's humble, delicious, and perfect for busy mornings.

✨ **PLATING**
Serve hot on a plate with steamed white rice and a side of vinegar-based dipping sauce. Garnish with fresh parsley if available.`,

  'chicken': `📋 **RECIPE TITLE: Filipino Chicken Adobo**

⏱️ **TIME & SERVINGS**
* Prep: 10 min
* Cook: 45 min
* Servings: 4

🥘 **INGREDIENTS**
* 2 lbs chicken, cut into pieces
* ½ cup soy sauce
* ⅓ cup vinegar
* 6 garlic cloves, minced
* 1 tbsp oil
* 1 cup water
* 1 tsp black pepper
* 3 bay leaves

👨‍🍳 **INSTRUCTIONS**
1. Heat oil in a large pot over medium-high heat
2. Brown chicken pieces on all sides, about 8 minutes
3. Add garlic and sauté until fragrant
4. Pour in soy sauce, vinegar, and water
5. Add bay leaves and black pepper
6. Bring to a boil, then reduce heat and simmer for 30-35 minutes
7. Chicken is done when tender and cooked through
8. Serve over steamed rice

💡 **PRO TIP**
The combination of soy sauce and vinegar creates the perfect balance of salty and tangy flavors. Don't skip the vinegar!

🇵🇭 **CULTURAL INSIGHT**
Chicken Adobo is considered the unofficial national dish of the Philippines. Every family has their own recipe variation, and it's a staple at family gatherings and celebrations.

✨ **PLATING**
Serve in a deep bowl over fluffy white rice. Drizzle the rich sauce over the rice. Pair with pickled vegetables for a complete meal.`,

  'default': `📋 **RECIPE TITLE: Filipino Vegetable Lumpia (Spring Rolls)**

⏱️ **TIME & SERVINGS**
* Prep: 20 min
* Cook: 15 min
* Servings: 4

🥘 **INGREDIENTS**
* 12 lumpia wrappers
* 2 cups cabbage, finely chopped
* 1 carrot, shredded
* 3 garlic cloves, minced
* 2 tbsp soy sauce
* 1 tbsp oil
* Water for sealing

👨‍🍳 **INSTRUCTIONS**
1. Heat oil in a pan and sauté garlic until fragrant
2. Add cabbage and carrot, stir-fry for 3 minutes
3. Add soy sauce and mix well, then cool the filling
4. Place wrapper on a flat surface in diamond shape
5. Add 2 tbsp filling in the center
6. Fold bottom corner over filling, then fold sides inward
7. Roll tightly and seal with water on the edge
8. Deep fry at 350°F until golden brown
9. Drain on paper towels

💡 **PRO TIP**
Keep wrappers covered with a damp cloth to prevent them from drying out. Don't overfill or they'll burst while frying!

🇵🇭 **CULTURAL INSIGHT**
Lumpia is a beloved Filipino appetizer, traditionally served at parties and celebrations. Each region has its own variation and filling style.

✨ **PLATING**
Serve hot with sweet and sour sauce or vinegar-based dipping sauce. Arrange on a platter lined with decorative leaves for a beautiful presentation.`,
};

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    if (!messages || !messages.length) {
      return new Response(JSON.stringify({ error: 'No messages' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const lastMessage = messages[messages.length - 1]?.content || '';
    let recipe = mockRecipes.default;
    
    const lowerMessage = lastMessage.toLowerCase();
    if (lowerMessage.includes('egg')) {
      recipe = mockRecipes.eggs;
    } else if (lowerMessage.includes('chicken')) {
      recipe = mockRecipes.chicken;
    }

    const chunks: string[] = [];
    const chunkSize = 75;
    
    for (let i = 0; i < recipe.length; i += chunkSize) {
      const chunk = recipe.substring(i, i + chunkSize);
      chunks.push(`0:${JSON.stringify({ type: 'text-delta', text: chunk })}`);
    }
    chunks.push(`0:${JSON.stringify({ type: 'finish', finishReason: 'stop' })}`);
    
    const fullResponse = chunks.join('\n') + '\n';
    const encoder = new TextEncoder();
    const encoded = encoder.encode(fullResponse);
    
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoded);
        controller.close();
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
