'use client';

import { useRef, useEffect, useState } from 'react';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt?: Date;
}

const starterPrompts = [
  {
    title: 'Just garlic & onions',
    prompt: 'I only have garlic, onions, and rice. Make me something amazing and uniquely Filipino!'
  },
  {
    title: 'Chicken & lime',
    prompt: 'I have chicken breast, limes, and basic pantry items. Create a Filipino-inspired recipe that wows.'
  },
  {
    title: 'Surprise me!',
    prompt: 'Give me your best Filipino recipe idea with any combination of ingredients. Go crazy with your imagination!'
  }
];

export default function ChatPage() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'mix-intro',
      role: 'assistant',
      content:
        '🍛 Kumusta! I am Mix, your Filipino AI culinary mentor. I transform ANY ingredients into delicious recipes.\n\n⚡ Even 2-3 items? No problem! I\'ll suggest pantry staples and create an incredible dish.\n\nTell me:\n• What ingredients do you have?\n• Any dietary preferences?\n• How much time do you have?\n\nLet\'s cook something amazing together! 🇵🇭',
      createdAt: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      createdAt: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.map(m => ({ role: m.role, content: m.content })).concat([userMessage].map(m => ({ role: m.role, content: m.content })))
        })
      });

      if (!response.body) throw new Error('No response body');

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '',
        createdAt: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            if (line.startsWith('0:')) {
              const data = JSON.parse(line.substring(2));
              if (data.type === 'text-delta' && data.text) {
                setMessages(prev => {
                  const updated = [...prev];
                  const lastMsg = updated[updated.length - 1];
                  if (lastMsg.role === 'assistant') {
                    lastMsg.content += data.text;
                  }
                  return updated;
                });
              }
            }
          } catch (e) {
            // Ignore parse errors for incomplete JSON
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        createdAt: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStarterPrompt = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="page-grid grid gap-4 pb-6 lg:gap-10 lg:grid-cols-[minmax(0,0.9fr),minmax(0,1.1fr)] lg:items-start">
      {/* Sidebar - Left section */}
      <aside className="flex flex-col gap-4 order-2 lg:order-1">
        {/* Header section - responsive */}
        <section className="space-y-3 sm:space-y-4">
          <div className="flex items-start gap-2 sm:gap-3 flex-wrap">
            <Tag tone="lime" className="w-fit text-xs sm:text-sm">
              Gemini 2.5 Pro • GLM 4.6
            </Tag>
            <span className="text-xs text-brand-gray-400 px-2 py-1 rounded-full bg-brand-gray-800/50 flex-shrink-0">
              Recipe AI
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
            Mix & Cook Filipino Recipes
          </h1>
          <p className="text-xs sm:text-sm text-brand-gray-400 leading-relaxed">
            Transform any ingredients into authentic Filipino dishes. Start with just 2 items—I'll handle the rest. Powered by the latest AI models with intelligent fallback.
          </p>
        </section>

        {/* Starter prompts */}
        <div className="rounded-2xl sm:rounded-3xl border border-brand-gray-800/70 bg-brand-gray-900/40 p-4 sm:p-6">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-brand-gray-400 mb-3 sm:mb-4">
            Try these
          </h2>
          <div className="grid gap-2 sm:gap-3 grid-cols-1">
            {starterPrompts.map((prompt) => (
              <button
                key={prompt.title}
                type="button"
                className="rounded-lg sm:rounded-2xl border border-brand-gray-800 bg-brand-gray-900/60 p-3 sm:p-4 text-left text-xs sm:text-sm text-brand-gray-300 transition hover:border-brand-lime/50 hover:text-brand-lime hover:bg-brand-gray-900/80 active:scale-95"
                onClick={() => handleStarterPrompt(prompt.prompt)}
              >
                <div className="text-brand-lime font-semibold">{prompt.title}</div>
                <p className="mt-1.5 sm:mt-2 text-xs text-brand-gray-500 line-clamp-2">{prompt.prompt}</p>
              </button>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="hidden sm:block rounded-2xl sm:rounded-3xl border border-brand-gray-800/70 bg-brand-gray-900/40 p-4 sm:p-6">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-brand-gray-400 mb-3 sm:mb-4">
            How Mix Works
          </h2>
          <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-brand-gray-400">
            <li className="flex gap-2">
              <span className="text-brand-lime flex-shrink-0">1️⃣</span>
              <span>Tell me your ingredients</span>
            </li>
            <li className="flex gap-2">
              <span className="text-brand-lime flex-shrink-0">2️⃣</span>
              <span>I create a recipe card</span>
            </li>
            <li className="flex gap-2">
              <span className="text-brand-lime flex-shrink-0">3️⃣</span>
              <span>Cook & enjoy! 🍛</span>
            </li>
          </ul>
        </div>
      </aside>

      {/* Chat section - Right side */}
      <section className="flex flex-col gap-3 sm:gap-4 order-1 lg:order-2">
        {/* Messages container */}
        <div className="flex-1 space-y-3 sm:space-y-4 overflow-hidden rounded-2xl sm:rounded-3xl border border-brand-gray-800/70 bg-brand-gray-900/60 p-4 sm:p-6">
          <div className="max-h-[400px] sm:max-h-[520px] space-y-3 sm:space-y-4 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-brand-gray-700 scrollbar-track-brand-gray-900">
            {messages.map((message) => (
              <MessageBubble 
                key={message.id} 
                message={message as any}
              />
            ))}
            {isLoading && (
              <div className="animate-pulse rounded-2xl sm:rounded-3xl border border-brand-gray-800 bg-brand-gray-900/70 p-3 sm:p-4 text-xs sm:text-sm text-brand-gray-400 flex items-center gap-2">
                <span className="inline-flex gap-1">
                  <span className="w-1.5 h-1.5 bg-brand-lime rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-brand-lime rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                  <span className="w-1.5 h-1.5 bg-brand-lime rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                </span>
                Mix is crafting your recipe...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input form */}
        <form onSubmit={handleSubmit} className="card-surface flex flex-col sm:flex-row items-stretch sm:items-end gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl sm:rounded-3xl">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Share your ingredients or cravings..."
            className="flex-1 resize-none rounded-xl sm:rounded-2xl border border-brand-gray-800/70 bg-brand-gray-900/60 px-3 sm:px-4 py-2 sm:py-3 text-sm text-brand-gray-100 placeholder:text-brand-gray-600 focus:border-brand-lime/60 focus:outline-none focus:ring-1 focus:ring-brand-lime/40 transition min-h-12"
            rows={3}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey && !isLoading && input.trim()) {
                handleSubmit(e as any);
              }
            }}
          />
          <Button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="w-full sm:w-auto whitespace-nowrap"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="inline-flex gap-1">
                  <span className="w-1 h-1 bg-current rounded-full animate-bounce"></span>
                  <span className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                </span>
                Cooking
              </span>
            ) : (
              'Get Recipe ➜'
            )}
          </Button>
        </form>

        {/* Mobile-only how it works */}
        <div className="sm:hidden rounded-2xl border border-brand-gray-800/70 bg-brand-gray-900/40 p-3 text-xs text-brand-gray-400 space-y-1.5">
          <p className="font-semibold text-brand-lime">🧠 Powered by:</p>
          <ul className="space-y-1 text-xs">
            <li>• Gemini 2.5 Pro (Primary)</li>
            <li>• GLM 4.6 (Fallback)</li>
            <li>• Filipino recipe specialist</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
