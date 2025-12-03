'use client';

import { useRef, useEffect, useState } from 'react';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { ShareRecipeModal } from '@/components/community/ShareRecipeModal';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt?: Date;
}

export default function ChatPage() {
  const { t } = useTranslation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [recipeToShare, setRecipeToShare] = useState<any>(null);
  const [lastExtractedIngredients, setLastExtractedIngredients] = useState<string[]>([]);
  const [recipeSaved, setRecipeSaved] = useState(false);

  // Extract recipe from AI response
  function extractRecipeFromMessage(content: string) {
    // Try to find recipe structure in the message
    const titleMatch = content.match(/\*\*([^*]+)\*\*/);
    const title = titleMatch
      ? titleMatch[1].replace(/[🍽️🍛🍲]/g, '').trim()
      : 'AI Generated Recipe';

    // Extract ingredients (look for bullet points after "Ingredients")
    const ingredientsSection = content.match(
      /ingredients[:\s]*\n([\s\S]*?)(?=\n\n|\nsteps|\ninstructions|\n\*\*)/i
    );
    const ingredients = ingredientsSection
      ? ingredientsSection[1]
          .split('\n')
          .filter((l) => l.trim().startsWith('-') || l.trim().startsWith('•'))
          .map((l) => ({ item: l.replace(/^[-•]\s*/, '').trim(), amount: '' }))
      : [];

    // Extract instructions
    const stepsSection = content.match(
      /(?:steps|instructions)[:\s]*\n([\s\S]*?)(?=\n\n💡|\n\n🍚|\n\ntip|$)/i
    );
    const instructions = stepsSection
      ? stepsSection[1]
          .split('\n')
          .filter((l) => /^\d+\./.test(l.trim()) || l.trim().startsWith('-'))
          .map((l) =>
            l
              .replace(/^\d+\.\s*/, '')
              .replace(/^[-•]\s*/, '')
              .trim()
          )
      : [];

    return {
      title,
      description: content.substring(0, 200).replace(/[*#]/g, '') + '...',
      cuisine: 'Filipino',
      difficulty: 'Medium',
      prep_time: '15 mins',
      cook_time: '30 mins',
      servings: 4,
      ingredients,
      instructions,
      tags: ['ai-generated', 'filipino'],
    };
  }

  function handleShareRecipe() {
    // Find the last assistant message with recipe content
    const lastRecipeMessage = [...messages]
      .reverse()
      .find(
        (m) =>
          m.role === 'assistant' &&
          (m.content.includes('Ingredients') || m.content.includes('ingredients'))
      );

    if (lastRecipeMessage) {
      const recipe = extractRecipeFromMessage(lastRecipeMessage.content);
      setRecipeToShare(recipe);
      setShowShareModal(true);
    } else {
      alert('No recipe found in the chat. Ask for a recipe first!');
    }
  }

  const starterPrompts = [
    {
      title: t('chat.starterPrompts.garlicOnions.title'),
      prompt: t('chat.starterPrompts.garlicOnions.prompt'),
    },
    {
      title: t('chat.starterPrompts.chickenLime.title'),
      prompt: t('chat.starterPrompts.chickenLime.prompt'),
    },
    {
      title: t('chat.starterPrompts.surprise.title'),
      prompt: t('chat.starterPrompts.surprise.prompt'),
    },
  ];

  useEffect(() => {
    setMounted(true);
    // Initialize with intro message only on client side
    setMessages([
      {
        id: 'mix-intro',
        role: 'assistant',
        content: t('chat.introMessage'),
        createdAt: new Date(),
      },
    ]);

    // Check for pending prompt from pantry page
    const pendingPrompt = sessionStorage.getItem('pendingChatPrompt');
    if (pendingPrompt) {
      sessionStorage.removeItem('pendingChatPrompt');
      // Small delay to ensure the page is ready
      setTimeout(() => {
        setInput(pendingPrompt);
        // Auto-submit the form
        const form = document.querySelector('form');
        if (form) {
          form.requestSubmit();
        }
      }, 500);
    }
  }, [t]);

  // Only scroll when user sends a new message, not during streaming
  const [shouldScroll, setShouldScroll] = useState(false);

  useEffect(() => {
    if (shouldScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setShouldScroll(false);
    }
  }, [shouldScroll]);

  // Extract ingredients from user message
  function extractIngredientsFromMessage(content: string): string[] {
    // Common Filipino cooking words to filter out
    const filterWords = [
      'recipe',
      'cook',
      'make',
      'want',
      'have',
      'with',
      'and',
      'the',
      'can',
      'you',
      'please',
      'what',
      'dish',
      'food',
      'meal',
      'ang',
      'may',
      'gusto',
      'ko',
      'ako',
      'mga',
    ];

    // Extract words that could be ingredients
    const words = content
      .toLowerCase()
      .replace(/[^a-zA-Z\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !filterWords.includes(w));

    return [...new Set(words)];
  }

  // Save recipe to cache and community
  async function handleSaveRecipe() {
    const lastRecipeMessage = [...messages]
      .reverse()
      .find(
        (m) =>
          m.role === 'assistant' &&
          (m.content.includes('Ingredients') || m.content.includes('ingredients'))
      );

    if (!lastRecipeMessage) {
      alert('No recipe found to save!');
      return;
    }

    const recipe = extractRecipeFromMessage(lastRecipeMessage.content);

    try {
      const response = await fetch('/api/ai-recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients: lastExtractedIngredients,
          recipe,
          addToCommunity: true,
          chefName: 'AI Chef',
          avatar: '🤖',
        }),
      });

      const data = await response.json();
      if (data.success) {
        setRecipeSaved(true);
        setTimeout(() => setRecipeSaved(false), 3000);
      }
    } catch (error) {
      console.error('Save error:', error);
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      createdAt: new Date(),
    };

    // Extract ingredients from user message for caching
    const extractedIngredients = extractIngredientsFromMessage(input);
    setLastExtractedIngredients(extractedIngredients);
    setRecipeSaved(false);

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setShouldScroll(true); // Scroll when user sends message

    try {
      // Check cache first if we have ingredients
      if (extractedIngredients.length > 0) {
        const cacheCheck = await fetch(
          `/api/ai-recipes?ingredients=${encodeURIComponent(extractedIngredients.join(','))}`
        );
        const cacheData = await cacheCheck.json();

        if (cacheData.cached && cacheData.recipe) {
          // Show cached recipe as assistant message
          const cachedMessage: Message = {
            id: crypto.randomUUID(),
            role: 'assistant',
            content:
              `🎉 **Found a saved recipe for similar ingredients!**\n\nThis recipe was already created and saved by other users. Here it is:\n\n` +
              `🍽️ **${cacheData.recipe.title}**\n\n` +
              `**Ingredients:**\n${cacheData.recipe.ingredients?.map((i: any) => `- ${i.amount || ''} ${i.item}`).join('\n') || 'N/A'}\n\n` +
              `**Steps:**\n${cacheData.recipe.instructions?.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n') || 'N/A'}\n\n` +
              `💡 *This recipe has been used ${cacheData.usageCount || 1} times!*\n\n` +
              `---\n_Want a different recipe? Just ask! "Give me another option" or specify what dish you want._`,
            createdAt: new Date(),
          };

          setMessages((prev) => [...prev, cachedMessage]);
          setIsLoading(false);
          return;
        }
      }

      // No cache hit - generate new recipe
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages
            .map((m) => ({ role: m.role, content: m.content }))
            .concat([userMessage].map((m) => ({ role: m.role, content: m.content }))),
        }),
      });

      // Check for error response
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      if (!response.body) throw new Error('No response body');

      const assistantMessageId = crypto.randomUUID();
      let accumulatedContent = '';

      // Add empty assistant message first
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMessageId,
          role: 'assistant',
          content: '',
          createdAt: new Date(),
        },
      ]);

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
            // Handle Server-Sent Events format: data: {...}
            if (line.startsWith('data: ')) {
              const jsonStr = line.substring(6);
              if (jsonStr === '[DONE]') continue;

              const data = JSON.parse(jsonStr);

              // Handle text-delta events from Vercel AI SDK
              if (data.type === 'text-delta' && data.delta) {
                accumulatedContent += data.delta;
                const newContent = accumulatedContent;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId ? { ...msg, content: newContent } : msg
                  )
                );
              }
            }
            // Also handle old format: 0:"text content"
            else if (line.startsWith('0:')) {
              const textContent = line.substring(2);
              const text = JSON.parse(textContent);
              if (typeof text === 'string') {
                accumulatedContent += text;
                const newContent = accumulatedContent;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId ? { ...msg, content: newContent } : msg
                  )
                );
              }
            }
          } catch {
            // Ignore parse errors for incomplete JSON
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `Ay nako! 😅 Sorry, something went wrong: ${errorMessage}\n\nPlease try again. If the problem persists, check if your GEMINI_API_KEY is set correctly in .env.local.`,
          createdAt: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStarterPrompt = (prompt: string) => {
    setInput(prompt);
  };

  if (!mounted) {
    return (
      <div className="page-grid flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <div className="animate-pulse text-brand-lime">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-grid grid gap-4 pb-6 lg:gap-10 lg:grid-cols-[minmax(0,0.9fr),minmax(0,1.1fr)] lg:items-start">
      {/* Sidebar - Left section */}
      <aside className="flex flex-col gap-4 order-2 lg:order-1">
        {/* Header section - responsive */}
        <section className="space-y-3 sm:space-y-4">
          <div className="flex items-start gap-2 sm:gap-3 flex-wrap">
            <Tag tone="lime" className="w-fit text-xs sm:text-sm">
              AI Recipe Assistant
            </Tag>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
            Mix & Cook Filipino Recipes
          </h1>
          <p className="text-xs sm:text-sm text-brand-gray-400 leading-relaxed">
            Transform any ingredients into authentic Filipino dishes. Start with just 2
            items—I&apos;ll handle the rest.
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
                <p className="mt-1.5 sm:mt-2 text-xs text-brand-gray-500 line-clamp-2">
                  {prompt.prompt}
                </p>
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
            <ErrorBoundary>
              {messages
                .filter(
                  (message) => message.content.trim() !== '' || message.role === 'user'
                )
                .map((message) => (
                  <MessageBubble key={message.id} message={message as any} />
                ))}
            </ErrorBoundary>
            {isLoading &&
              (() => {
                const lastMsg = messages[messages.length - 1];
                const showLoader =
                  !lastMsg ||
                  lastMsg.role !== 'assistant' ||
                  lastMsg.content.trim() === '';
                return showLoader ? (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-xs text-brand-gray-500">
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand-lime/20 px-2 py-0.5 text-brand-lime font-medium">
                        ✨ Mix AI
                      </span>
                      <span>
                        {new Date().toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="rounded-2xl sm:rounded-3xl border border-brand-lime/30 bg-brand-lime/10 p-3 sm:p-4 text-xs sm:text-sm text-brand-gray-300">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex gap-1">
                          <span className="w-2 h-2 bg-brand-lime rounded-full animate-bounce"></span>
                          <span
                            className="w-2 h-2 bg-brand-lime rounded-full animate-bounce"
                            style={{ animationDelay: '0.15s' }}
                          ></span>
                          <span
                            className="w-2 h-2 bg-brand-lime rounded-full animate-bounce"
                            style={{ animationDelay: '0.3s' }}
                          ></span>
                        </span>
                        <span>Mix is crafting your recipe...</span>
                      </div>
                    </div>
                  </div>
                ) : null;
              })()}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input form */}
        <form
          onSubmit={handleSubmit}
          className="card-surface flex flex-col sm:flex-row items-stretch sm:items-end gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl sm:rounded-3xl"
        >
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
                  <span
                    className="w-1 h-1 bg-current rounded-full animate-bounce"
                    style={{ animationDelay: '0.1s' }}
                  ></span>
                </span>
                Cooking
              </span>
            ) : (
              'Get Recipe ➜'
            )}
          </Button>
        </form>

        {/* Mobile-only tip */}
        <div className="sm:hidden rounded-2xl border border-brand-gray-800/70 bg-brand-gray-900/40 p-3 text-xs text-brand-gray-400">
          <p>
            <span className="text-brand-lime">💡 Tip:</span> Press Ctrl+Enter to send
            quickly
          </p>
        </div>

        {/* Recipe saved notification */}
        {recipeSaved && (
          <div className="w-full py-3 rounded-xl bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-medium text-center animate-pulse">
            ✅ Recipe saved to database! Others can now use it.
          </div>
        )}

        {/* Action buttons - shows when there are recipes */}
        {messages.some(
          (m) => m.role === 'assistant' && m.content.includes('ngredient')
        ) && (
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleSaveRecipe}
              disabled={recipeSaved}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-400 text-sm font-medium hover:from-blue-500/30 hover:to-purple-500/30 transition-all disabled:opacity-50"
            >
              💾 Save Recipe to Database
            </button>
            <button
              onClick={handleShareRecipe}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-brand-lime/20 to-brand-green/20 border border-brand-lime/30 text-brand-lime text-sm font-medium hover:from-brand-lime/30 hover:to-brand-green/30 transition-all"
            >
              🚀 Share to Community
            </button>
          </div>
        )}
      </section>

      {/* Share Modal */}
      {recipeToShare && (
        <ShareRecipeModal
          isOpen={showShareModal}
          onClose={() => {
            setShowShareModal(false);
            setRecipeToShare(null);
          }}
          recipe={recipeToShare}
          source="ai"
        />
      )}
    </div>
  );
}
