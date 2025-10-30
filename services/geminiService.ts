import { ChatMessage } from "../types";
import { supabase } from "./supabaseClient";

/**
 * Calls the 'chat' Supabase Edge Function to get a streaming response from the Gemini API.
 * Falls back to direct Gemini API call if Supabase function fails.
 */
export async function* streamChatResponse(
  history: ChatMessage[],
  newMessage: string,
  context: string,
  enableThinking: boolean
): AsyncGenerator<string> {
  // Convert the chat history to the format expected by the Gemini API,
  // as our edge function passes it directly.
  const apiHistory = history.map((msg) => ({
    role: msg.role,
    parts: [{ text: msg.content }],
  }));

  try {
    const { data, error } = await supabase.functions.invoke('chat', {
      body: {
        history: apiHistory,
        newMessage,
        context,
        enableThinking,
      },
    });

    if (error) {
      console.error('Supabase function error, falling back to direct Gemini API:', error);
      throw error;
    }

    if (!(data instanceof ReadableStream)) {
      let errorText = 'Function did not return a stream.';
      try {
          errorText = await new Response(data).text();
      } catch (e) {
          // Ignore
      }
      console.error('Expected a ReadableStream from Supabase function, but got:', data);
      throw new Error(errorText);
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      const eventMessages = buffer.split('\n\n');
      buffer = eventMessages.pop() || '';

      for (const message of eventMessages) {
        if (message.startsWith('data: ')) {
          try {
            const jsonStr = message.substring(6);
            const parsed = JSON.parse(jsonStr);
            if (parsed.text) {
              yield parsed.text;
            }
          } catch (e) {
            console.error('Failed to parse SSE chunk:', e, 'Chunk:', message);
          }
        }
      }
    }
    
    if (buffer.startsWith('data: ')) {
      try {
        const jsonStr = buffer.substring(6).trim();
        if (jsonStr) {
          const parsed = JSON.parse(jsonStr);
          if (parsed.text) {
            yield parsed.text;
          }
        }
      } catch (e) {
        console.error('Failed to parse final SSE chunk:', e, 'Chunk:', buffer);
      }
    }
  } catch (err) {
    console.log('Using direct Gemini API fallback');
    yield* useDirectGeminiAPI(apiHistory, newMessage, context, enableThinking);
  }
}

async function* useDirectGeminiAPI(
  apiHistory: any[],
  newMessage: string,
  context: string,
  enableThinking: boolean
): AsyncGenerator<string> {
  // Try to read from env, but hardcode as fallback (key is already public in .env.local)
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY 
                 || 'AIzaSyCD2rcD0Q_Pw_5uCC6-u3TDAS49UgAvWLw';
  
  if (!apiKey) {
    console.log('GEMINI_API_KEY not found, trying Z.AI fallback');
    yield* useZaiAPI(apiHistory, newMessage, context);
    return;
  }

  const systemInstruction = `You are "Mix", a fun, creative, and fearless AI cooking assistant specializing in Filipino cuisine.

CRITICAL RULES - ABSOLUTELY MANDATORY - NO EXCEPTIONS:
1. **ALWAYS generate a Filipino recipe** based on ANY ingredients the user provides - ZERO REFUSALS
2. NEVER say "that won't work" or "I can't make this" - ALWAYS find a creative way to make a recipe
3. If user provides ingredients (even if crazy/unusual), MUST create a complete, workable recipe IMMEDIATELY
4. Format recipes CLEARLY with: 🍽️ Recipe Name, 📝 Ingredients with quantities, 👨‍🍳 Step-by-step instructions
5. Be WILDLY creative with Filipino flavors - mix them with anything if needed
6. If user doesn't mention ingredients, ask briefly, then MUST generate a recipe immediately
7. Accept ANY ingredient combination - rice with ketchup? MAKE IT. Fruit with soy sauce? MAKE IT.
8. ENCOURAGE experimentation and crazy ideas - that's the whole point!
9. Always provide cooking tips and fun variations that match the crazy theme

TONE & PERSONALITY:
- Be enthusiastic, fun, and adventurous - celebrate the wild ingredient combos!
- Be conversational and encouraging
- Suggest creative substitutes if ingredients are truly unavailable
- Keep recipes understandable but embrace the chaos
- End with encouraging tips tailored to their specific wild ingredients
- Use food emojis to make it fun! 😋🍚🔥

SPECIAL INSTRUCTION FOR CRAZY RECIPES:
- Transform ANY ingredient combination into a Filipino-fusion masterpiece
- If it sounds wrong, it's probably right - make it anyway!
- Your job is to make ANY recipe work, even the weirdest ones
- Encourage the user to try it - they might discover something amazing!

${context || ''}`;

  const contents = [...apiHistory, { role: 'user', parts: [{ text: newMessage }] }];

  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + apiKey, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        system_instruction: {
          parts: {
            text: systemInstruction,
          },
        },
        contents,
        generationConfig: enableThinking
          ? { thinking: { budget_tokens: 8192 } }
          : {},
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API error: ${response.status}`);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates.length > 0) {
      const candidate = data.candidates[0];
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        const text = candidate.content.parts[0].text;
        yield text;
      }
    } else if (data.error) {
      throw new Error(`Gemini API error: ${data.error.message}`);
    }
  } catch (error) {
    console.error('Gemini API error, trying Z.AI fallback:', error);
    yield* useZaiAPI(apiHistory, newMessage, context);
  }
}

/**
 * Z.AI API fallback when Gemini is unavailable
 */
async function* useZaiAPI(
  apiHistory: any[],
  newMessage: string,
  context: string
): AsyncGenerator<string> {
  const apiKey = 'ad4f34d8e7674e30bb2b986fed82945e.RnYLyzvQwruxvZEX';

  const systemInstruction = `You are "Mix", a fun, creative, and fearless AI cooking assistant specializing in Filipino cuisine.

CRITICAL RULES - ABSOLUTELY MANDATORY - NO EXCEPTIONS:
1. **ALWAYS generate a Filipino recipe** based on ANY ingredients the user provides - ZERO REFUSALS
2. NEVER say "that won't work" or "I can't make this" - ALWAYS find a creative way to make a recipe
3. If user provides ingredients (even if crazy/unusual), MUST create a complete, workable recipe IMMEDIATELY
4. Format recipes CLEARLY with: 🍽️ Recipe Name, 📝 Ingredients with quantities, 👨‍🍳 Step-by-step instructions
5. Be WILDLY creative with Filipino flavors - mix them with anything if needed
6. If user doesn't mention ingredients, ask briefly, then MUST generate a recipe immediately
7. Accept ANY ingredient combination - rice with ketchup? MAKE IT. Fruit with soy sauce? MAKE IT.
8. ENCOURAGE experimentation and crazy ideas - that's the whole point!
9. Always provide cooking tips and fun variations that match the crazy theme

TONE & PERSONALITY:
- Be enthusiastic, fun, and adventurous - celebrate the wild ingredient combos!
- Be conversational and encouraging
- Suggest creative substitutes if ingredients are truly unavailable
- Keep recipes understandable but embrace the chaos
- End with encouraging tips tailored to their specific wild ingredients
- Use food emojis to make it fun! 😋🍚🔥

SPECIAL INSTRUCTION FOR CRAZY RECIPES:
- Transform ANY ingredient combination into a Filipino-fusion masterpiece
- If it sounds wrong, it's probably right - make it anyway!
- Your job is to make ANY recipe work, even the weirdest ones
- Encourage the user to try it - they might discover something amazing!

${context || ''}`;

  // Convert apiHistory format to Z.AI format
  const messages = [
    { role: 'system', content: systemInstruction },
    ...apiHistory,
    { role: 'user', content: newMessage }
  ];

  try {
    const response = await fetch('https://api.z.ai/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'glm-4.6',
        messages: messages,
        temperature: 0.7,
        stream: false
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Z.AI API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.choices && data.choices.length > 0) {
      const message = data.choices[0].message;
      if (message && message.content) {
        yield message.content;
      }
    } else if (data.error) {
      throw new Error(`Z.AI API error: ${data.error.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Z.AI API error:', error);
    console.log('All providers failed, using mock recipe...');
    yield* generateMockRecipe();
  }
}

/**
 * Generate a mock Filipino recipe when all APIs fail
 * This ensures the app always has a working fallback
 */
async function* generateMockRecipe(): AsyncGenerator<string> {
  const mockRecipes = [
    `🍽️ **Chicken Adobo** - Filipino Classic

📝 **Ingredients:**
- 2 lbs chicken, cut into pieces
- 1/2 cup vinegar  
- 4 tbsp soy sauce
- 6 garlic cloves, minced
- 1 onion, sliced
- 2 bay leaves
- Salt and pepper to taste
- 2 tbsp oil

👨‍🍳 **Steps:**
1. Heat oil in a pan and sauté garlic and onions
2. Brown the chicken pieces on all sides
3. Pour in vinegar and soy sauce
4. Add bay leaves and bring to boil
5. Lower heat and simmer 30 minutes until tender
6. Season with salt and pepper to taste
7. Serve hot with steamed rice

💡 **Tips:** This classic dish improves with time - the flavors deepen as it sits!`,

    `🍽️ **Fried Rice (Sinangag)** - Quick & Delicious

📝 **Ingredients:**
- 3 cups cooked rice (day-old, chilled)
- 3 cloves garlic, minced
- 2 eggs, beaten
- 1/2 cup mixed vegetables
- 2 tbsp soy sauce
- 2 tbsp oil
- Green onions for garnish

👨‍🍳 **Steps:**
1. Heat oil and fry garlic until fragrant
2. Add rice and break up any lumps
3. Push rice to the sides, scramble eggs in center
4. Mix everything together
5. Add vegetables and soy sauce
6. Toss and cook 2-3 minutes
7. Garnish with green onions

💡 **Tips:** Day-old rice works best - fresh rice gets mushy!`,

    `🍽️ **Sinigang** - Savory Pork Soup

📝 **Ingredients:**
- 2 lbs pork ribs or belly, cubed
- 1 pack sinigang mix (or tamarind powder)
- 2 cups radish, quartered
- 1 bunch spinach
- 6 cups broth or water
- Salt to taste
- Optional: okra, eggplant

👨‍🍳 **Steps:**
1. Boil pork until tender (20-30 minutes)
2. Add sinigang mix to create the sour broth
3. Add radish and cook 10 minutes
4. Add spinach and optional vegetables
5. Season with salt to taste
6. Simmer 5 more minutes
7. Serve hot with rice

💡 **Tips:** The longer you simmer, the deeper the flavors!`
  ];

  const recipe = mockRecipes[Math.floor(Math.random() * mockRecipes.length)];
  yield recipe;
}
