/**
 * Test script for Vercel AI SDK with Gemini
 * This tests the same setup as app/api/chat/route.ts
 * Run with: npx tsx scripts/test-ai-sdk-chat.ts
 */

import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

// Load environment
const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach((line: string) => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  });
}

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('❌ GEMINI_API_KEY not found');
  process.exit(1);
}

console.log('✓ API Key found:', apiKey.substring(0, 10) + '...');

async function testAISDK() {
  try {
    console.log('\n📡 Testing Vercel AI SDK with Gemini...\n');

    // Set the env var that AI SDK expects
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = apiKey;

    const model = google('gemini-2.5-flash');

    console.log('Model: gemini-2.5-flash via @ai-sdk/google');
    console.log('Testing generateText (non-streaming)...');
    console.log('\n---Response---\n');

    const { text } = await generateText({
      model,
      prompt: 'Give me a very brief Filipino recipe for adobo (3 sentences max).',
    });

    console.log(text);
    console.log('\n---End Response---\n');
    console.log('✅ Vercel AI SDK with Gemini is working!');
  } catch (error: any) {
    console.error('\n❌ AI SDK Error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

testAISDK();
