export const runtime = 'nodejs';

// Mock recipe database based on ingredients
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

  'fish': `📋 **RECIPE TITLE: Pampano en Papillote (Fish in Parchment)**

⏱️ **TIME & SERVINGS**
* Prep: 15 min
* Cook: 20 min
* Servings: 2

🥘 **INGREDIENTS**
* 2 whole pampano or pompano fish
* 3 tbsp butter
* 4 garlic cloves, minced
* 2 tomatoes, sliced
* 1 onion, sliced
* 2 tbsp lemon juice
* Salt and pepper

👨‍🍳 **INSTRUCTIONS**
1. Preheat oven to 350°F
2. Cut two large pieces of parchment paper
3. Place fish in center of each parchment sheet
4. Sauté garlic, tomatoes, and onions in butter
5. Place vegetable mixture on top of each fish
6. Drizzle with lemon juice
7. Fold parchment paper to seal the packet
8. Bake for 18-20 minutes until fish is flaky
9. Carefully open packets (watch out for steam!)

💡 **PRO TIP**
Cooking in parchment keeps the fish moist and infuses it with wonderful flavors. The presentation when opening the packet at the table is spectacular!

🇵🇭 **CULTURAL INSIGHT**
This elegant preparation is inspired by French cuisine but uses fresh Philippine fish. It's often served at special occasions and upscale Filipino restaurants.

✨ **PLATING**
Serve the entire parchment packet on a plate for dramatic presentation. Open carefully to release the aromatic steam. Pair with jasmine rice and fresh vegetables.`,

  'rice': `📋 **RECIPE TITLE: Perfect Steamed White Rice**

⏱️ **TIME & SERVINGS**
* Prep: 5 min
* Cook: 20 min
* Servings: 4

🥘 **INGREDIENTS**
* 2 cups uncooked white rice
* 3 cups water
* 1 tsp salt
* 1 tbsp butter (optional)

👨‍🍳 **INSTRUCTIONS**
1. Rinse rice under cold water until water runs clear
2. Add rice to a pot with 3 cups water
3. Bring to a boil over high heat
4. Once boiling, reduce heat to low
5. Cover with a tight-fitting lid
6. Simmer for 18 minutes without lifting the lid
7. Remove from heat and let steam for 5 minutes
8. Fluff with a fork and serve

💡 **PRO TIP**
Never stir the rice while it's cooking - this releases starch and makes it gummy. The 1:1.5 ratio of rice to water is perfect every time!

🇵🇭 **CULTURAL INSIGHT**
Rice is the staple of Philippine cuisine and is eaten at virtually every meal. A meal without rice is considered incomplete!

✨ **PLATING**
Serve in a rice bowl or on the side of your main dish. In the Philippines, rice is often served in its own small bowl so diners can take as much as they want.`,

  'garlic': `📋 **RECIPE TITLE: Garlic Fried Rice (Sinangag)**

⏱️ **TIME & SERVINGS**
* Prep: 5 min
* Cook: 10 min
* Servings: 3

🥘 **INGREDIENTS**
* 3 cups cooked rice (day-old, chilled)
* 6 garlic cloves, minced
* 3 tbsp oil
* 2 eggs, beaten
* 2 tbsp soy sauce
* Salt and pepper to taste

👨‍🍳 **INSTRUCTIONS**
1. Heat oil in a wok or large pan over high heat
2. Add minced garlic and stir-fry until golden and fragrant
3. Add cold rice, breaking up clumps with your spatula
4. Stir-fry for 3-4 minutes, mixing well
5. Push rice to the side and scramble eggs in the empty space
6. Mix eggs with rice
7. Add soy sauce and toss everything together
8. Season with salt and pepper to taste

💡 **PRO TIP**
Always use day-old rice for fried rice! Fresh hot rice will become mushy. The key is high heat and constant stirring.

🇵🇭 **CULTURAL INSIGHT**
Sinangag is the ultimate Filipino comfort food, often served for breakfast with fried spam or longanisa (Filipino sausage) on the side.

✨ **PLATING**
Serve in a mound on a plate, topped with a fried egg if desired. Pair with crispy fried meat and fresh tomatoes on the side.`,

  'default': `📋 **RECIPE TITLE: Filipino Vegetable Lumpia (Spring Rolls)**

⏱️ **TIME & SERVINGS**
* Prep: 20 min
* Cook: 15 min
* Servings: 4 (makes 12 rolls)

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

    // Get the last user message
    const lastMessage = messages[messages.length - 1]?.content || '';
    
    // Find matching recipe based on keywords
    let recipe = mockRecipes.default;
    
    const lowerMessage = lastMessage.toLowerCase();
    if (lowerMessage.includes('egg')) {
      recipe = mockRecipes.eggs;
    } else if (lowerMessage.includes('chicken')) {
      recipe = mockRecipes.chicken;
    } else if (lowerMessage.includes('fish')) {
      recipe = mockRecipes.fish;
    } else if (lowerMessage.includes('rice')) {
      recipe = mockRecipes.rice;
    } else if (lowerMessage.includes('garlic')) {
      recipe = mockRecipes.garlic;
    }

    // Stream response in chunks
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        const chunkSize = 75;
        for (let i = 0; i < recipe.length; i += chunkSize) {
          const chunk = recipe.substring(i, i + chunkSize);
          controller.enqueue(
            encoder.encode(`0:${JSON.stringify({ type: 'text-delta', text: chunk })}\n`)
          );
        }
        controller.enqueue(
          encoder.encode(`0:${JSON.stringify({ type: 'finish', finishReason: 'stop' })}\n`)
        );
        controller.close();
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
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
