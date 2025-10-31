import { GoogleGenAI } from '@google/genai';
import axios from 'axios';

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

async function callGLM46Fallback(messages: any[]): Promise<{ text: string; model: string }> {
  if (!process.env.GLM_API_KEY) {
    throw new Error('GLM API key not configured');
  }

  try {
    const url = 'https://api.z.ai/api/paas/v4/chat/completions';
    const data = {
      model: 'glm-4.6',
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      max_tokens: 1024,
      temperature: 0.9,
    };

    const response = await axios.post(url, data, {
      headers: {
        'Authorization': `Bearer ${process.env.GLM_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    return {
      text: response.data.choices[0]?.message?.content || 'No response from GLM API',
      model: 'glm-4.6'
    };
  } catch (error) {
    throw new Error(`GLM API error: ${error}`);
  }
}

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

    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
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
        console.warn('Gemini 2.5 Pro failed, attempting GLM 4.6 fallback:', geminiError);

        if (process.env.GLM_API_KEY) {
          try {
            const { text } = await callGLM46Fallback(messages);
            const encoder = new TextEncoder();
            const stream = new ReadableStream({
              start(controller) {
                controller.enqueue(encoder.encode(`0:${JSON.stringify({ type: 'text-delta', text: text + '\n\n_[glm-4.6]' })}\n`));
                controller.enqueue(encoder.encode(`0:${JSON.stringify({ type: 'finish', finishReason: 'stop' })}\n`));
                controller.close();
              },
            });
            return new Response(stream, {
              headers: { 'Content-Type': 'text/event-stream' },
            });
          } catch (glmError) {
            console.error('GLM 4.6 fallback failed:', glmError);
            return new Response(
              JSON.stringify({ error: 'All AI providers failed' }),
              { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
          }
        }
      }
    } else if (process.env.GLM_API_KEY) {
      try {
        const { text } = await callGLM46Fallback(messages);
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          start(controller) {
            controller.enqueue(encoder.encode(`0:${JSON.stringify({ type: 'text-delta', text: text + '\n\n_[glm-4.6]' })}\n`));
            controller.enqueue(encoder.encode(`0:${JSON.stringify({ type: 'finish', finishReason: 'stop' })}\n`));
            controller.close();
          },
        });
        return new Response(stream, {
          headers: { 'Content-Type': 'text/event-stream' },
        });
      } catch (error) {
        console.error('GLM 4.6 error:', error);
        return new Response(
          JSON.stringify({ error: 'AI service unavailable' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
    } else {
      return new Response(
        JSON.stringify({ error: 'No AI providers configured - add real API keys to .env.local' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Chat route error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
