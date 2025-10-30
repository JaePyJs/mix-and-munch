import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { GoogleGenAI } from 'https://esm.sh/@google/genai@1.27.0';

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const API_KEY = Deno.env.get('API_KEY');
    if (!API_KEY) {
      throw new Error("API_KEY environment variable not set. Please configure it in your Supabase function's secrets.");
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const { history, newMessage, context, enableThinking } = await req.json();

    const model = 'gemini-2.5-flash';
    
    const systemInstruction = `You are "Mix", a friendly and helpful AI cooking assistant specializing in Filipino cuisine. Your goal is to help users cook delicious meals with the ingredients they have.
    - Be conversational and encouraging.
    - Provide clear, step-by-step instructions.
    - If a user is missing an ingredient, suggest a common substitute.
    - Keep your responses concise and easy to read.
    ${context || ''}`;

    const contents = [...history, { role: 'user', parts: [{ text: newMessage }] }];

    const geminiStream = await ai.models.generateContentStream({
      model,
      contents,
      config: {
        systemInstruction,
        // Conditionally add thinkingConfig if enabled
        ...(enableThinking && { thinkingConfig: { thinkingBudget: 8192 } }),
      },
    });

    // Use a TransformStream to reliably format the Gemini stream into Server-Sent Events (SSE).
    const transformer = new TransformStream({
      transform(chunk, controller) {
        const text = chunk.text;
        if (text) {
          const sseChunk = `data: ${JSON.stringify({ text })}\n\n`;
          controller.enqueue(new TextEncoder().encode(sseChunk));
        }
      },
    });

    // Pipe the Gemini stream through our transformer to get a correctly formatted response stream.
    const responseStream = geminiStream.pipeThrough(transformer);

    return new Response(responseStream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error processing chat request:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to process chat request.';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json' 
      },
    });
  }
});
