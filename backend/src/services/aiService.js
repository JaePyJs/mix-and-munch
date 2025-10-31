import axios from 'axios';
import logger from '../utils/logger.js';

class AIService {
  constructor() {
    this.apiKey = process.env.GOOGLE_GENAI_API_KEY;
    this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
  }

  async generateRecipe(ingredients, preferences = {}) {
    if (!this.apiKey) {
      logger.error('GOOGLE_GENAI_API_KEY not configured');
      throw new Error('Gemini API key not configured');
    }

    try {
      const ingredientList = Array.isArray(ingredients) 
        ? ingredients.join(', ')
        : ingredients;

      const prompt = `You are "Mix", a fun, creative Filipino cooking assistant.

CRITICAL INSTRUCTIONS:
- ALWAYS create a Filipino recipe using these ingredients: ${ingredientList}
- NEVER refuse to create a recipe - find creative ways to use all ingredients
- Make it Filipino-focused or Filipino fusion
- Be enthusiastic and encouraging
- Use emojis and fun language
- Format with clear sections

Preferences: ${preferences.dietary || 'No restrictions'}, Cooking time: ${preferences.cookingTime || 'any'}

Format your response exactly like this:
🍽️ [Recipe Name]
📝 Ingredients:
- [ingredient with amount]
- [ingredient with amount]

👨‍🍳 Instructions:
1. [Step 1]
2. [Step 2]
3. [Step 3]

💡 Pro Tip: [Filipino cooking tip]
🇵🇭 Cultural Note: [About this recipe in Filipino cuisine]
⏱️ Cooking Time: [estimated time]`;

      const response = await axios.post(
        this.apiUrl,
        {
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        },
        {
          params: {
            key: this.apiKey
          },
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return {
          success: true,
          recipe: response.data.candidates[0].content.parts[0].text,
          generatedAt: new Date().toISOString()
        };
      }

      throw new Error('Invalid response from Gemini API');
    } catch (error) {
      logger.error('Gemini API error:', error.message);
      
      // Fallback recipe generation
      if (error.response?.status === 429) {
        throw new Error('API rate limit exceeded. Please try again later.');
      }
      
      throw new Error(`Failed to generate recipe: ${error.message}`);
    }
  }

  async analyzeRecipe(recipe) {
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured');
    }

    try {
      const prompt = `Analyze this Filipino recipe and provide insights:

Title: ${recipe.title}
Ingredients: ${JSON.stringify(recipe.ingredients)}
Instructions: ${recipe.instructions?.join('\n')}

Provide:
1. Nutritional highlights (estimated)
2. Difficulty level (Easy/Medium/Hard)
3. Best occasions to serve
4. Ingredient substitutions
5. Storage tips
6. Cultural significance`;

      const response = await axios.post(
        this.apiUrl,
        {
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        },
        {
          params: {
            key: this.apiKey
          },
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      return response.data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
    } catch (error) {
      logger.error('Recipe analysis error:', error.message);
      return null;
    }
  }
}

export default new AIService();
