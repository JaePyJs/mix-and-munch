// Mix & Munch Web Crawler for Panlasang Pinoy
// To run this script:
// 1. Make sure you have Deno installed (https://deno.land/manual/getting_started/installation).
// 2. Create a file named '.env' in the root of your project.
// 3. Add your Supabase credentials to the '.env' file:
//    SUPABASE_URL=your_supabase_url
//    SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
//    (Note: Use the 'service_role' key, not the 'anon' key, for backend scripts)
// 4. Run the script from your terminal: deno run --allow-net --allow-env scripts/crawl.ts

declare const Deno: any;

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { DOMParser, Element } from 'https://deno.land/x/deno_dom/deno-dom-wasm.ts';
import 'https://deno.land/std@0.224.0/dotenv/load.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    '%cError: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be provided in a .env file.',
    'color: red; font-weight: bold;'
  );
  Deno.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const CATEGORIES = {
    'Pork': 'https://panlasangpinoy.com/categories/recipes/pork-recipes/',
    'Chicken': 'https://panlasangpinoy.com/categories/recipes/chicken-recipes/',
    'Beef': 'https://panlasangpinoy.com/categories/recipes/beef-recipes/',
    'Seafood': 'https://panlasangpinoy.com/categories/recipes/seafood/',
};

async function fetchHtml(url: string) {
  console.log(`%cFetching page: ${url}`, 'color: cyan');
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }
  return await response.text();
}

async function scrapeRecipe(url: string, category: string) {
  const html = await fetchHtml(url);
  const doc = new DOMParser().parseFromString(html, 'text/html');
  if (!doc) throw new Error('Failed to parse document');

  const name = doc.querySelector('h1.entry-title')?.textContent.trim() || '';
  const description = doc.querySelector('meta[property="og:description"]')?.getAttribute('content') || '';
  const imageUrl = doc.querySelector('meta[property="og:image"]')?.getAttribute('content') || '';
  
  const ingredients = Array.from(doc.querySelectorAll('.wprm-recipe-ingredient')).map(el => {
    const element = el as Element;
    const amount = element.querySelector('.wprm-recipe-ingredient-amount')?.textContent || '';
    const unit = element.querySelector('.wprm-recipe-ingredient-unit')?.textContent || '';
    const name = element.querySelector('.wprm-recipe-ingredient-name')?.textContent || '';
    return { name: name.trim(), quantity: amount.trim(), unit: unit.trim() };
  }).filter(ing => ing.name);

  const instructions = Array.from(doc.querySelectorAll('.wprm-recipe-instruction-text')).map(el => (el as Element).textContent.trim()).filter(Boolean);

  if (!name || ingredients.length === 0 || instructions.length === 0) {
      throw new Error(`Could not extract all required data from ${url}`);
  }

  return {
    name,
    description,
    imageUrl,
    ingredients,
    instructions,
    source_url: url,
    category: category,
  };
}

async function main() {
  console.log(`%cStarting Mix & Munch Crawler...`, 'color: lime; font-weight: bold;');
  let totalSuccessCount = 0;

  for (const [category, url] of Object.entries(CATEGORIES)) {
    console.log(`\n%c--- Processing Category: ${category} ---`, 'color: magenta; font-weight: bold;');
    try {
      const listHtml = await fetchHtml(url);
      const doc = new DOMParser().parseFromString(listHtml, 'text/html');
      if (!doc) throw new Error('Failed to parse main recipe list');

      const recipeLinks = Array.from(doc.querySelectorAll('h2.entry-title a')).map(a => (a as Element).getAttribute('href')).filter(Boolean) as string[];

      if (recipeLinks.length === 0) {
          console.warn(`Could not find any recipe links for ${category}.`);
          continue;
      }

      console.log(`Found ${recipeLinks.length} recipes in ${category}.`);
      let categorySuccessCount = 0;

      for (const link of recipeLinks) {
        try {
          const recipeData = await scrapeRecipe(link, category);
          const { error } = await supabase.from('recipes').upsert(recipeData, { onConflict: 'source_url' });
          
          if (error) {
            console.error(`%cFailed to save "${recipeData.name}": ${error.message}`, 'color: yellow;');
          } else {
            console.log(`%cSuccessfully saved: "${recipeData.name}"`, 'color: green;');
            categorySuccessCount++;
          }
        } catch (scrapeError) {
          console.error(`%cFailed to scrape ${link}: ${scrapeError.message}`, 'color: yellow;');
        }
      }
      totalSuccessCount += categorySuccessCount;
      console.log(`%cFinished ${category}. Saved ${categorySuccessCount} recipes.`, 'color: magenta;');
    } catch (error) {
      console.error(`%cAn error occurred while processing ${category}: ${error.message}`, 'color: red; font-weight: bold;');
    }
  }
  console.log(`\n%cCrawler finished. Successfully saved ${totalSuccessCount} new/updated recipes in total.`, 'color: lime; font-weight: bold;');
}

main();