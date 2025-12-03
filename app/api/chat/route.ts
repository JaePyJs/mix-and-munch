import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import recipesData from '@/data/recipes.json';

export const runtime = 'edge';

// Generate a compact recipe catalog for AI context
function getRecipeCatalog(): string {
  const recipes = recipesData as Array<{
    title: string;
    slug: string;
    difficulty: string;
    dietaryTags?: string[];
    matchIngredients?: string[];
  }>;

  // Group recipes by category for better AI understanding
  const byDifficulty: Record<string, string[]> = {
    Easy: [],
    Intermediate: [],
    Medium: [],
    Advanced: [],
  };
  const vegetarian: string[] = [];
  const seafood: string[] = [];
  const desserts: string[] = [];

  recipes.forEach((r) => {
    const entry = `${r.title} (/recipes/${r.slug})`;
    if (byDifficulty[r.difficulty]) byDifficulty[r.difficulty].push(r.title);
    if (r.dietaryTags?.includes('vegetarian') || r.dietaryTags?.includes('vegan'))
      vegetarian.push(r.title);
    if (
      r.dietaryTags?.includes('pescetarian') ||
      r.matchIngredients?.some((i) =>
        ['shrimp', 'fish', 'squid', 'mussels', 'tilapia'].includes(i)
      )
    )
      seafood.push(r.title);
    if (r.dietaryTags?.includes('sweet')) desserts.push(r.title);
  });

  return `
## OUR RECIPE DATABASE (100 Filipino Recipes)
When recommending recipes, LINK to them using: /recipes/[slug]

### Quick Reference by Difficulty:
- **Easy (${byDifficulty.Easy.length})**: ${byDifficulty.Easy.slice(0, 10).join(', ')}...
- **Intermediate (${byDifficulty.Intermediate.length})**: ${byDifficulty.Intermediate.slice(0, 8).join(', ')}...
- **Medium (${byDifficulty.Medium.length})**: ${byDifficulty.Medium.slice(0, 8).join(', ')}...
- **Advanced (${byDifficulty.Advanced.length})**: ${byDifficulty.Advanced.slice(0, 5).join(', ')}...

### Special Categories:
- **Vegetarian/Vegan**: ${vegetarian.slice(0, 8).join(', ')}
- **Seafood**: ${seafood.slice(0, 8).join(', ')}
- **Desserts/Sweet**: ${desserts.slice(0, 8).join(', ')}

### Popular Recipes (always recommend these when relevant):
1. Chicken Adobo - /recipes/soy-calamansi-chicken-adobo
2. Sinigang - /recipes/sunrise-tamarind-sinigang
3. Kare-Kare - /recipes/coco-kare-kare
4. Chicken Tinola - /recipes/chicken-tinola-ginger-soup
5. Pancit Bihon - /recipes/pancit-bihon-guisado
6. Lumpia Shanghai - /recipes/lumpia-shanghai-spring-rolls
7. Lechon Kawali - /recipes/lechon-kawali-crispy-pork
8. Sisig - /recipes/plant-powered-sisig
9. Bicol Express - /recipes/bicol-express-spicy
10. Arroz Caldo - /recipes/arroz-caldo-chicken-porridge

### Street Food:
- Kwek-Kwek - /recipes/kwek-kwek-street-food
- Fishball Sauce - /recipes/fishball-sauce-street-food
- Banana Cue - /recipes/banana-cue-snack
- Turon - /recipes/turon-banana-lumpia
- Taho - /recipes/taho-homemade-tofu

### Kakanin (Rice Cakes):
- Bibingka - /recipes/bibingka-rice-cake
- Puto Bumbong - /recipes/puto-bumbong-purple-rice
- Suman - /recipes/suman-malagkit-rice-cake
- Maja Blanca - /recipes/maja-blanca-coconut-pudding
`;
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Validate messages format and content
    if (!messages || !Array.isArray(messages)) {
      return new Response('Invalid request format', { status: 400 });
    }

    if (messages.length === 0) {
      return new Response('Messages array cannot be empty', { status: 400 });
    }

    // Check if Gemini API key is configured
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error:
            'Gemini API key not configured. Please add GEMINI_API_KEY to your environment variables.',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Handle test environment - return mock response for test API key
    if (apiKey === 'test-api-key-for-testing') {
      const mockResponse = new ReadableStream({
        start(controller) {
          controller.enqueue(
            new TextEncoder().encode(
              'data: {"content":"Test response for Filipino recipe assistant"}\n\n'
            )
          );
          controller.close();
        },
      });

      return new Response(mockResponse, {
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    }

    // Use Gemini 2.5 Flash for fast, high-quality recipe responses
    // Set the environment variable that AI SDK expects
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = apiKey;

    // Using gemini-2.5-flash for best speed and quality balance
    // Alternative options: 'gemini-2.0-flash' (stable), 'gemini-1.5-pro' (legacy)
    const model = google('gemini-2.5-flash');

    // Create system prompt for Filipino recipe assistant - Recipe-focused only
    const systemPrompt = `You are Mix & Munch, a Filipino RECIPE GENERATOR. You ONLY generate recipes.

## CRITICAL RULE
You are NOT a chatbot. You do NOT engage in casual conversation.
- If someone says "hi", "hello", "kumusta" → Immediately suggest a popular Filipino recipe
- If someone asks non-food questions → Redirect to recipes: "Let me share a delicious recipe instead!"
- EVERY response must contain a recipe or recipe suggestions

## YOUR ROLE
- Generate Filipino recipes based on ingredients provided
- Suggest recipes when users describe cravings or occasions  
- Always respond with actual recipe content, never just greetings

## RECIPE FORMAT (ALWAYS USE THIS)
🍽️ **[RECIPE NAME]** (Filipino name)
⏱️ Prep: X mins | Cook: X mins | Serves: X

**Ingredients:**
- List with amounts

**Steps:**
1. Clear instructions
2. With helpful tips

💡 **Luto Tips:** Secret tips
🍚 **Serve with:** Pairings

## WHEN USER GIVES INGREDIENTS
Immediately provide 2-3 Filipino recipe options they can make with those ingredients.

## WHEN USER SAYS HELLO/HI/GREETINGS
DO NOT just greet back. Instead respond like:
"Here's a delicious recipe to get you started! 🍳

🍽️ **Classic Chicken Adobo**
⏱️ Prep: 10 mins | Cook: 45 mins | Serves: 4

**Ingredients:**
- 1 kg chicken pieces
- 1/2 cup soy sauce
- 1/4 cup vinegar
- 6 cloves garlic, crushed
- 1 onion, sliced
- 3 bay leaves
- 1 tsp peppercorns

**Steps:**
1. Combine all ingredients in a pot
2. Bring to boil, then simmer 45 mins
3. Remove chicken, fry until golden
4. Pour sauce over and serve

💡 **Luto Tips:** Don't stir vinegar until it boils - prevents sourness!
🍚 **Serve with:** Hot steamed rice

What ingredients do you have? I'll suggest more recipes! 🇵🇭"

## REGIONAL SPECIALTIES
- Ilocos: Bagnet, Pinakbet, Empanada
- Pampanga: Sisig, Tocino, Kare-kare
- Bicol: Laing, Bicol Express
- Visayas: Lechon, La Paz Batchoy, Inasal
- Mindanao: Satti, Pastil

${getRecipeCatalog()}

## LINKING TO RECIPES
Link to our database recipes: "Check out our **[Chicken Adobo](/recipes/soy-calamansi-chicken-adobo)** recipe!"`;

    const result = await streamText({
      model,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      maxOutputTokens: undefined, // Let the model decide token usage
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('Gemini API error:', error);

    // Enhanced error handling for different types of API errors
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return new Response(
          JSON.stringify({
            error:
              'Invalid Gemini API key. Please check your GEMINI_API_KEY configuration.',
          }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      if (error.message.includes('quota') || error.message.includes('limit')) {
        return new Response(
          JSON.stringify({
            error:
              'API quota exceeded. Please try again later or check your Gemini API usage.',
          }),
          {
            status: 429,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }

    return new Response(
      JSON.stringify({
        error: 'Failed to process chat request. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
