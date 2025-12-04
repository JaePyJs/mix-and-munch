import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { api } from '@/lib/api';

const BRAND_COLORS = {
  lime: '#A3E635',
  darkBg: '#1a1a2e',
  darkSurface: '#16213e',
  text: '#e4e4e7',
  textMuted: '#a1a1aa',
};

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_PROMPTS = [
  'What can I make with chicken and rice?',
  'Give me a simple adobo recipe',
  "What's a good dessert for beginners?",
  'Suggest a healthy Filipino dish',
];

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "Kamusta! 👋 I'm your AI Filipino Chef. Ask me anything about Filipino cooking - recipes, techniques, ingredient substitutions, or what to cook with ingredients you have!",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || loading) return;

    const userMessage: Message = { role: 'user', content: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // For now, we'll use a simple fetch since streaming is complex on mobile
      const response = await fetch(`${api.baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Chat request failed');
      }

      // Read the streamed response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          // Parse SSE format
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('0:')) {
              // AI SDK format: 0:"text content"
              const text = line.slice(2).replace(/^"|"$/g, '');
              assistantContent += text;
            }
          }
        }
      }

      if (assistantContent) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: assistantContent },
        ]);
      } else {
        // Fallback response
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content:
              "I apologize, but I'm having trouble connecting right now. Please try again later!",
          },
        ]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            "Sorry, I couldn't process your request. Please check your connection and try again.",
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((message, index) => (
          <View
            key={index}
            style={[
              styles.messageBubble,
              message.role === 'user' ? styles.userBubble : styles.assistantBubble,
            ]}
          >
            {message.role === 'assistant' && (
              <Text style={styles.assistantLabel}>🧑‍🍳 AI Chef</Text>
            )}
            <Text
              style={[
                styles.messageText,
                message.role === 'user' && styles.userMessageText,
              ]}
            >
              {message.content}
            </Text>
          </View>
        ))}
        {loading && (
          <View style={[styles.messageBubble, styles.assistantBubble]}>
            <ActivityIndicator size="small" color={BRAND_COLORS.lime} />
            <Text style={styles.loadingText}>Thinking...</Text>
          </View>
        )}
      </ScrollView>

      {/* Quick Prompts */}
      {messages.length === 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.quickPromptsScroll}
          contentContainerStyle={styles.quickPromptsContainer}
        >
          {QUICK_PROMPTS.map((prompt, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickPrompt}
              onPress={() => sendMessage(prompt)}
            >
              <Text style={styles.quickPromptText}>{prompt}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask about Filipino recipes..."
          placeholderTextColor={BRAND_COLORS.textMuted}
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={500}
          onSubmitEditing={() => sendMessage()}
        />
        <TouchableOpacity
          style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
          onPress={() => sendMessage()}
          disabled={!input.trim() || loading}
        >
          <Text style={styles.sendButtonText}>→</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND_COLORS.darkBg,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  userBubble: {
    backgroundColor: BRAND_COLORS.lime,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: BRAND_COLORS.darkSurface,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  assistantLabel: {
    color: BRAND_COLORS.lime,
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  messageText: {
    color: BRAND_COLORS.text,
    fontSize: 15,
    lineHeight: 22,
  },
  userMessageText: {
    color: BRAND_COLORS.darkBg,
  },
  loadingText: {
    color: BRAND_COLORS.textMuted,
    marginTop: 4,
    fontSize: 12,
  },
  quickPromptsScroll: {
    maxHeight: 60,
    borderTopWidth: 1,
    borderTopColor: BRAND_COLORS.darkSurface,
  },
  quickPromptsContainer: {
    padding: 8,
    gap: 8,
    flexDirection: 'row',
  },
  quickPrompt: {
    backgroundColor: BRAND_COLORS.darkSurface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BRAND_COLORS.lime + '40',
  },
  quickPromptText: {
    color: BRAND_COLORS.text,
    fontSize: 13,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    backgroundColor: BRAND_COLORS.darkSurface,
    borderTopWidth: 1,
    borderTopColor: BRAND_COLORS.darkBg,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: BRAND_COLORS.darkBg,
    color: BRAND_COLORS.text,
    padding: 12,
    borderRadius: 20,
    fontSize: 15,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: BRAND_COLORS.lime,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: BRAND_COLORS.darkBg,
    fontSize: 20,
    fontWeight: 'bold',
  },
});
