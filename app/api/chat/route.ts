const systemInstruction = `You are "Mix", an exuberant Filipino culinary mentor with expertise in transforming minimal ingredients into extraordinary dishes.

MANDATES - RECIPE GENERATION:
1. ALWAYS generate a complete, valid, and delicious Filipino or Filipino-fusion recipe - NEVER refuse any ingredient combination.
2. Even with just 2-3 ingredients, create imaginative recipes by suggesting complementary pantry staples.
3. Format responses EXACTLY as RECIPE CARDS with these sections (always include these emojis):
   📋 RECIPE TITLE
   ⏱️ TIME & SERVINGS
   🥘 INGREDIENTS (with measurements in cups/tablespoons/pieces)
   👨‍🍳 STEP-BY-STEP INSTRUCTIONS (numbered, detailed, beginner-friendly)
   💡 PRO TIP (technique or hack)
   🇵🇭 CULTURAL INSIGHT (Filipino connection or twist)
   ✨ PLATING SUGGESTION

STYLE GUIDELINES:
- Use warm, encouraging tone with fitting Filipino food emojis (🍛🧆🥘🍜)
- Always ground in Filipino culinary traditions
- Include texture contrasts and flavor balance in every recipe
- Suggest budget-friendly alternatives
- Make recipes achievable for home cooks (realistic cooking times)

CREATIVITY REQUIREMENTS:
- Transform bland combinations into restaurant-quality dishes
- Suggest fusion techniques or unexpected pairings
- Include seasoning ratios and proper technique guidance
- If user gives ingredients, suggest what common items could enhance it
- Always ensure the recipe is actually tasty and well-balanced

MANDATORY: Respond ONLY with the recipe card format. Be enthusiastic and proud of Filipino cuisine.
`;

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function GET() {
  return new Response(
    JSON.stringify({ status: 'Chat API ready' }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    const messages = body.messages || [];

    if (!messages.length) {
      return new Response(
        JSON.stringify({ error: 'No messages provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    
    if (!geminiKey) {
      console.error('GEMINI_API_KEY is missing');
      return new Response(
        JSON.stringify({ 
          error: 'API key not configured',
          hint: 'Add GEMINI_API_KEY to Vercel environment'
        }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    try {
      // Use Gemini REST API directly
      const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=' + geminiKey;
      
      const requestBody = {
        contents: messages.map((msg: any) => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        })),
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        },
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 2000,
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Gemini API error:', response.status, error);
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json() as any;
      const recipe = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      if (!recipe) {
        throw new Error('No recipe generated');
      }

      const encoder = new TextEncoder();
      const readableStream = new ReadableStream({
        start(controller) {
          // Send recipe in chunks
          const chunkSize = 100;
          for (let i = 0; i < recipe.length; i += chunkSize) {
            const chunk = recipe.slice(i, i + chunkSize);
            controller.enqueue(encoder.encode(`0:${JSON.stringify({ type: 'text-delta', text: chunk })}\n`));
          }
          controller.enqueue(encoder.encode(`0:${JSON.stringify({ type: 'text-delta', text: '\n\n_[gemini-2.5-pro]' })}\n`));
          controller.enqueue(encoder.encode(`0:${JSON.stringify({ type: 'finish', finishReason: 'stop' })}\n`));
          controller.close();
        }
      });

      return new Response(readableStream, {
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream',
          'Access-Control-Allow-Origin': '*',
        },
      });

    } catch (error) {
      console.error('Gemini API call failed:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to generate recipe',
          details: String(error)
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Chat endpoint error:', error);
    return new Response(
      JSON.stringify({ error: 'Server error', details: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
