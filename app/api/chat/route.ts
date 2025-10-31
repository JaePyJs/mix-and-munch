export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    if (!messages || !messages.length) {
      return new Response(JSON.stringify({ error: 'No messages' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ 
        error: 'API key missing - add GEMINI_API_KEY to Vercel' 
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const systemPrompt = `You are Mix, a Filipino culinary mentor. Generate ONLY a recipe in this exact format:

📋 **RECIPE TITLE: [Name]**

⏱️ **TIME & SERVINGS**
* Prep: X min
* Cook: X min  
* Servings: X

🥘 **INGREDIENTS**
* [ingredient]
* [ingredient]

👨‍🍳 **INSTRUCTIONS**
1. [step]
2. [step]

💡 **PRO TIP**
[tip]

🇵🇭 **CULTURAL INSIGHT**
[insight]

✨ **PLATING**
[plating]`;

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: messages.map((msg: any) => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }],
          })),
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { temperature: 0.8, maxOutputTokens: 1500 },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Gemini error:', error);
      return new Response(JSON.stringify({ error: 'Gemini API failed' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = (await response.json()) as any;
    const recipe = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!recipe) {
      return new Response(JSON.stringify({ error: 'No recipe generated' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Stream response in chunks
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        const chunkSize = 50;
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
    return new Response(JSON.stringify({ 
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
