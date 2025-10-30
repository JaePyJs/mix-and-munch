import axios from 'axios';
import { URL } from 'url';
import logger from '../utils/logger.js';

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

export async function extractImages($, pageUrl, sourceSite) {
  const images = {
    primary: null,
    attribution: `Image courtesy of ${new URL(sourceSite).hostname}`,
    all: []
  };

  try {
    // Primary image from meta tags
    const ogImage = $('meta[property="og:image"]').attr('content');
    if (ogImage && (await validateImageUrl(ogImage))) {
      images.primary = ogImage;
    }

    // Fallback to image alt recipe or first image
    if (!images.primary) {
      const recipeImages = $('img[class*="recipe"], img[alt*="recipe"]');
      if (recipeImages.length > 0) {
        const src = $(recipeImages[0]).attr('src');
        if (src && (await validateImageUrl(src))) {
          images.primary = resolveUrl(src, pageUrl);
        }
      }
    }

    // Collect all recipe-related images
    $('img').each(async (i, elem) => {
      const src = $(elem).attr('src');
      const alt = $(elem).attr('alt') || 'Recipe image';

      if (src) {
        const fullUrl = resolveUrl(src, pageUrl);
        if (await validateImageUrl(fullUrl)) {
          images.all.push({
            url: fullUrl,
            alt: alt,
            attribution: `Image courtesy of ${new URL(sourceSite).hostname}`
          });
        }
      }
    });

    logger.info(`Extracted ${images.all.length} images from ${pageUrl}`);
  } catch (error) {
    logger.warn(`Image extraction error: ${error.message}`);
  }

  return images;
}

export async function validateImageUrl(url) {
  if (!url) return false;

  try {
    // Check if URL is valid
    new URL(url);

    // Check file extension
    const urlObj = new URL(url);
    const pathname = urlObj.pathname.toLowerCase();
    const hasValidExt = IMAGE_EXTENSIONS.some(ext => pathname.endsWith(ext));

    if (!hasValidExt && !pathname.includes('image')) {
      return false;
    }

    // Optional: Make a HEAD request to validate (commented to avoid rate limiting)
    // const response = await axios.head(url, { timeout: 5000 });
    // return response.status === 200;

    return true;
  } catch (error) {
    logger.debug(`Invalid image URL: ${url}`);
    return false;
  }
}

export function resolveUrl(url, baseUrl) {
  if (!url) return null;

  try {
    if (url.startsWith('http')) {
      return url;
    }

    if (url.startsWith('//')) {
      return `https:${url}`;
    }

    const base = new URL(baseUrl);
    if (url.startsWith('/')) {
      return `${base.protocol}//${base.host}${url}`;
    }

    return new URL(url, baseUrl).toString();
  } catch (error) {
    logger.warn(`URL resolution error for ${url}: ${error.message}`);
    return null;
  }
}

export async function downloadAndCacheImage(imageUrl, recipeName) {
  try {
    // In production, implement actual image caching/CDN logic
    logger.debug(`Would cache image: ${imageUrl} for recipe: ${recipeName}`);
    return imageUrl; // Return original URL with attribution
  } catch (error) {
    logger.error(`Image caching error: ${error.message}`);
    return null;
  }
}
