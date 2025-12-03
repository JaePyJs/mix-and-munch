/**
 * Mix & Munch - Comprehensive Feature Test Script
 * Tests all API endpoints and functionality
 *
 * Usage: node test-all-features.js
 */

const BASE_URL = 'http://localhost:3000';

// Test results tracking
const results = {
  passed: [],
  failed: [],
};

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(color, symbol, message) {
  console.log(`${colors[color]}${symbol}${colors.reset} ${message}`);
}

function header(title) {
  console.log(
    `\n${colors.bold}${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}`
  );
  console.log(`${colors.bold}${colors.cyan}  ${title}${colors.reset}`);
  console.log(
    `${colors.bold}${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}\n`
  );
}

function subHeader(title) {
  console.log(`\n${colors.blue}▶ ${title}${colors.reset}`);
  console.log(`${colors.blue}${'─'.repeat(50)}${colors.reset}`);
}

async function testEndpoint(name, testFn) {
  try {
    const result = await testFn();
    if (result.success) {
      log('green', '✓', `${name}: ${result.message}`);
      results.passed.push(name);
    } else {
      log('red', '✗', `${name}: ${result.message}`);
      results.failed.push({ name, error: result.message });
    }
    return result;
  } catch (error) {
    log('red', '✗', `${name}: ${error.message}`);
    results.failed.push({ name, error: error.message });
    return { success: false, error: error.message };
  }
}

// ============================================================
// 1. RECIPES API TESTS
// ============================================================

async function testRecipesAPI() {
  subHeader('1. Recipes API');

  // Test GET /api/recipes
  const recipesResult = await testEndpoint('GET /api/recipes', async () => {
    const res = await fetch(`${BASE_URL}/api/recipes`);
    const data = await res.json();

    if (!res.ok) return { success: false, message: `Status ${res.status}` };
    if (!data.data || !Array.isArray(data.data)) {
      return { success: false, message: 'Invalid response format' };
    }

    return {
      success: true,
      message: `Found ${data.data.length} recipes`,
      data: data.data,
    };
  });

  // Test GET /api/recipes/[slug]
  if (recipesResult.success && recipesResult.data?.length > 0) {
    const firstRecipe = recipesResult.data[0];
    await testEndpoint(`GET /api/recipes/${firstRecipe.slug}`, async () => {
      const res = await fetch(`${BASE_URL}/api/recipes/${firstRecipe.slug}`);
      const data = await res.json();

      if (!res.ok) return { success: false, message: `Status ${res.status}` };
      if (!data.data || !data.data.title) {
        return { success: false, message: 'Invalid recipe data' };
      }

      return {
        success: true,
        message: `Recipe "${data.data.title}" loaded successfully`,
      };
    });
  }

  return recipesResult;
}

// ============================================================
// 2. INGREDIENTS API TESTS
// ============================================================

async function testIngredientsAPI() {
  subHeader('2. Ingredients API');

  return await testEndpoint('GET /api/ingredients', async () => {
    const res = await fetch(`${BASE_URL}/api/ingredients`);
    const data = await res.json();

    if (!res.ok) return { success: false, message: `Status ${res.status}` };
    if (!data.data || !Array.isArray(data.data)) {
      return { success: false, message: 'Invalid response format' };
    }

    // Count ingredients by category
    const categories = {};
    data.data.forEach((ing) => {
      categories[ing.category] = (categories[ing.category] || 0) + 1;
    });

    return {
      success: true,
      message: `Found ${data.data.length} ingredients across ${Object.keys(categories).length} categories`,
      data: data.data,
    };
  });
}

// ============================================================
// 3. GEMINI CHAT API TEST
// ============================================================

async function testGeminiChatAPI() {
  subHeader('3. AI Chat API (Gemini 2.5 Flash)');

  return await testEndpoint('POST /api/chat (streaming)', async () => {
    const testMessage = 'What is adobo? Give a very short answer.';

    const res = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: testMessage }],
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      return { success: false, message: `Status ${res.status}: ${errorText}` };
    }

    // Read the streaming response
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';
    let chunks = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      fullResponse += chunk;
      chunks++;
    }

    // Parse the streamed text (Vercel AI SDK v4 format: text-delta with delta field)
    let parsedText = '';

    // Try new format first: {"type":"text-delta","delta":"..."}
    const textDeltaMatches = fullResponse.match(
      /"type":"text-delta"[^}]*"delta":"([^"]*)"/g
    );
    if (textDeltaMatches) {
      parsedText = textDeltaMatches
        .map((part) => {
          const match = part.match(/"delta":"([^"]*)"/);
          return match ? match[1] : '';
        })
        .join('');
    }

    // Unescape the text
    parsedText = parsedText
      .replace(/\\n/g, '\n')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\');

    if (parsedText.length > 0) {
      // Truncate for display
      const displayText =
        parsedText.length > 100 ? parsedText.substring(0, 100) + '...' : parsedText;
      return {
        success: true,
        message: `Received ${chunks} chunks, ${parsedText.length} chars: "${displayText}"`,
        response: parsedText,
      };
    } else {
      return {
        success: false,
        message: `No parseable text in response. Raw: ${fullResponse.substring(0, 200)}...`,
      };
    }
  });
}

// ============================================================
// 4. YOUTUBE CRAWLER API TEST
// ============================================================

async function testYouTubeCrawlerAPI(youtubeUrl) {
  subHeader('4. YouTube Crawler API');

  // Test process_url action
  return await testEndpoint('POST /api/youtube-crawler (process_url)', async () => {
    const res = await fetch(`${BASE_URL}/api/youtube-crawler`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'process_url',
        url: youtubeUrl,
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      return {
        success: false,
        message: data.message || `Status ${res.status}`,
      };
    }

    const result = data.data;
    return {
      success: true,
      message: `Title: "${result.title || 'N/A'}", Transcript: ${result.transcript?.length || 0} chars, Ingredients: ${result.ingredients?.length || 0}`,
      data: result,
    };
  });
}

// ============================================================
// 5. TRANSCRIPTS API TEST
// ============================================================

async function testTranscriptsAPI() {
  subHeader('5. Transcripts API');

  return await testEndpoint('GET /api/transcripts', async () => {
    const res = await fetch(`${BASE_URL}/api/transcripts`);
    const data = await res.json();

    if (!res.ok) return { success: false, message: `Status ${res.status}` };

    const count = Array.isArray(data.data) ? data.data.length : data.data ? 1 : 0;

    return {
      success: true,
      message: `Found ${count} transcripts`,
    };
  });
}

// ============================================================
// 6. PAGE LOAD TESTS (HTML responses)
// ============================================================

async function testPageLoads() {
  subHeader('6. Page Load Tests');

  const pages = [
    { path: '/', name: 'Home' },
    { path: '/recipes', name: 'Recipes List' },
    { path: '/pantry', name: 'Pantry Matching' },
    { path: '/chat', name: 'AI Chat' },
    { path: '/saved-recipes', name: 'Saved Recipes' },
    { path: '/community', name: 'Community' },
    { path: '/about', name: 'About' },
    { path: '/youtube-crawler', name: 'YouTube Crawler' },
  ];

  for (const page of pages) {
    await testEndpoint(`Page: ${page.name} (${page.path})`, async () => {
      const res = await fetch(`${BASE_URL}${page.path}`);

      if (!res.ok) {
        return { success: false, message: `Status ${res.status}` };
      }

      const html = await res.text();
      if (!html.includes('<!DOCTYPE html>') && !html.includes('<html')) {
        return { success: false, message: 'Invalid HTML response' };
      }

      return {
        success: true,
        message: `Loaded (${(html.length / 1024).toFixed(1)} KB)`,
      };
    });
  }
}

// ============================================================
// 7. STATIC ASSETS TEST
// ============================================================

async function testStaticAssets() {
  subHeader('7. Static Assets');

  const assets = [{ path: '/favicon.svg', name: 'Favicon' }];

  for (const asset of assets) {
    await testEndpoint(`Asset: ${asset.name}`, async () => {
      const res = await fetch(`${BASE_URL}${asset.path}`);

      if (!res.ok) {
        return { success: false, message: `Status ${res.status}` };
      }

      const contentType = res.headers.get('content-type');
      return {
        success: true,
        message: `OK (${contentType})`,
      };
    });
  }
}

// ============================================================
// 8. PANTRY MATCHING LOGIC TEST
// ============================================================

async function testPantryMatching() {
  subHeader('8. Pantry Matching Logic');

  return await testEndpoint('Pantry ingredient matching', async () => {
    // Get ingredients
    const ingRes = await fetch(`${BASE_URL}/api/ingredients`);
    const ingData = await ingRes.json();

    // Get recipes
    const recRes = await fetch(`${BASE_URL}/api/recipes`);
    const recData = await recRes.json();

    if (!ingData.data || !recData.data) {
      return { success: false, message: 'Could not load data' };
    }

    // Pick first 5 ingredients
    const selectedIngredients = ingData.data.slice(0, 5).map((i) => i.id);

    // Count recipes that match
    let matchingRecipes = 0;
    for (const recipe of recData.data) {
      const matchIngredients = recipe.matchIngredients || [];
      const hasMatch = matchIngredients.some((id) => selectedIngredients.includes(id));
      if (hasMatch) matchingRecipes++;
    }

    return {
      success: true,
      message: `Selected ${selectedIngredients.length} ingredients, matched ${matchingRecipes}/${recData.data.length} recipes`,
    };
  });
}

// ============================================================
// MAIN TEST RUNNER
// ============================================================

async function runAllTests() {
  header('Mix & Munch - Comprehensive Feature Tests');

  console.log(`${colors.yellow}Testing against: ${BASE_URL}${colors.reset}`);
  console.log(`${colors.yellow}Time: ${new Date().toLocaleString()}${colors.reset}`);

  // Check if server is running
  try {
    await fetch(BASE_URL);
  } catch (error) {
    log('red', '✗', `Server not running at ${BASE_URL}`);
    log('yellow', '!', 'Start the server with: npm run dev');
    process.exit(1);
  }

  // Run all tests
  await testRecipesAPI();
  await testIngredientsAPI();
  await testGeminiChatAPI();
  await testTranscriptsAPI();
  await testPageLoads();
  await testStaticAssets();
  await testPantryMatching();

  // YouTube Crawler - using a Filipino cooking video
  // You can replace this URL with any YouTube video
  const youtubeTestUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'; // Placeholder
  console.log(
    `\n${colors.yellow}⚠ YouTube Crawler test uses placeholder URL. Pass a real cooking video URL as argument.${colors.reset}`
  );
  console.log(
    `${colors.yellow}  Usage: node test-all-features.js "https://youtube.com/watch?v=..."${colors.reset}`
  );

  const customUrl = process.argv[2] || youtubeTestUrl;
  await testYouTubeCrawlerAPI(customUrl);

  // Summary
  header('TEST SUMMARY');

  console.log(`${colors.green}✓ Passed: ${results.passed.length}${colors.reset}`);
  console.log(`${colors.red}✗ Failed: ${results.failed.length}${colors.reset}`);

  if (results.failed.length > 0) {
    console.log(`\n${colors.red}Failed Tests:${colors.reset}`);
    results.failed.forEach(({ name, error }) => {
      console.log(`  ${colors.red}•${colors.reset} ${name}: ${error}`);
    });
  }

  console.log(
    `\n${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}`
  );

  const successRate = (
    (results.passed.length / (results.passed.length + results.failed.length)) *
    100
  ).toFixed(1);
  const emoji = successRate >= 80 ? '🎉' : successRate >= 50 ? '⚠️' : '❌';
  console.log(`${emoji} Success Rate: ${successRate}%`);
  console.log(
    `${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}\n`
  );
}

// Run tests
runAllTests().catch(console.error);
