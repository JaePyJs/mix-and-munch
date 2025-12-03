/**
 * Test script for Gemini API chat functionality
 * Run with: node scripts/test-gemini-chat.js
 */

const fs = require('fs');
const path = require('path');

// Load .env.local manually
const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach((line) => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  });
}

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('❌ GEMINI_API_KEY not found in .env.local');
  process.exit(1);
}

console.log('✓ API Key found:', apiKey.substring(0, 10) + '...');

async function testGeminiAPI() {
  const { GoogleGenAI } = require('@google/genai');

  try {
    console.log('\n📡 Testing Gemini API connection...\n');

    const ai = new GoogleGenAI({ apiKey });

    // Test with gemini-2.5-flash (the model we're using in the chat)
    console.log('Model: gemini-2.5-flash');
    console.log(
      'Sending test prompt: "Hello, can you give me a simple Filipino recipe for garlic rice?"'
    );
    console.log('\n---Response---\n');

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents:
        'Hello, can you give me a simple Filipino recipe for garlic rice? Keep it brief.',
    });

    console.log(response.text);
    console.log('\n---End Response---\n');
    console.log('✅ Gemini API is working!');
  } catch (error) {
    console.error('\n❌ Gemini API Error:', error.message);
    console.error('Full error:', error);

    if (error.message.includes('API key')) {
      console.error('   → Your API key may be invalid or expired');
    } else if (error.message.includes('quota')) {
      console.error('   → API quota exceeded');
    } else if (error.message.includes('model')) {
      console.error('   → The model name might be incorrect');
    }

    process.exit(1);
  }
}

testGeminiAPI();
