import { GoogleGenAI } from '@google/genai';

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

export async function POST(req: Request) {
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
      console.error('GEMINI_API_KEY is not set');
      return new Response(
        JSON.stringify({ 
          error: 'GEMINI_API_KEY not configured',
          hint: 'Add GEMINI_API_KEY to Vercel Environment Variables',
          envKeys: Object.keys(process.env).filter(k => k.includes('GEMINI') || k.includes('API'))
        }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    try {
      console.log('Initializing GoogleGenAI with key');
      const ai = new GoogleGenAI({
        apiKey: geminiKey,
      });

      const modelName = process.env.USE_GEMINI_FLASH === 'true' 
        ? 'gemini-2.5-flash' 
        : 'gemini-2.5-pro';

      const contents = messages.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      const response = await ai.models.generateContentStream({
        model: modelName,
        contents,
        config: {
          systemInstruction: {
            parts: [{ text: systemInstruction }]
          },
          temperature: 0.9,
        }
      });

      const encoder = new TextEncoder();
      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of response) {
              const text = chunk.candidates?.[0]?.content?.parts?.[0]?.text || '';
              if (text) {
                controller.enqueue(encoder.encode(`0:${JSON.stringify({ type: 'text-delta', text })}\n`));
              }
            }
            const modelInfo = `\n\n_[${modelName}]`;
            controller.enqueue(encoder.encode(`0:${JSON.stringify({ type: 'text-delta', text: modelInfo })}\n`));
            controller.enqueue(encoder.encode(`0:${JSON.stringify({ type: 'finish', finishReason: 'stop' })}\n`));
            controller.close();
          } catch (error) {
            console.error('Stream error:', error);
            controller.close();
          }
        },
      });

      return new Response(readableStream, {
        headers: { 'Content-Type': 'text/event-stream' },
      });
    } catch (geminiError) {
      console.error('Gemini API error:', geminiError);
      console.error('Error type:', typeof geminiError);
      console.error('Error message:', String(geminiError));
      return new Response(
        JSON.stringify({ 
          error: 'Gemini API error',
          details: String(geminiError),
          errorType: typeof geminiError
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Chat endpoint error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    return new Response(
      JSON.stringify({ 
        error: 'Server error', 
        details: String(error),
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
