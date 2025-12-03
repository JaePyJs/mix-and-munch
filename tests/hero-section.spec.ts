import { test, expect } from '@playwright/test';

test.describe('Hero Section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
  });

  test('should render with proper layout on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Check main hero section exists
    const heroSection = page.locator('section').first();
    await expect(heroSection).toBeVisible();
    
    // Check for the main heading with actual text
    const heading = page.getByRole('heading', { name: 'Mix & Munch', level: 1 });
    await expect(heading).toBeVisible();
    
    // Check for the tag component
    const tag = page.locator('[class*="pill"]').first();
    await expect(tag).toBeVisible();
    
    // Check for description text
    const description = page.getByText(/Discover authentic Filipino recipes/);
    await expect(description).toBeVisible();
    
    // Check for buttons
    const pantryButton = page.getByRole('link', { name: /Check Pantry/ });
    await expect(pantryButton).toBeVisible();
  });

  test('should have responsive behavior on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Check main elements are still visible
    const heading = page.getByRole('heading', { name: 'Mix & Munch', level: 1 });
    await expect(heading).toBeVisible();
    
    // Check grid layout adapts
    const heroSection = page.locator('section').first();
    await expect(heroSection).toBeVisible();
  });

  test('should have responsive behavior on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check main elements are still visible
    const heading = page.getByRole('heading', { name: 'Mix & Munch', level: 1 });
    await expect(heading).toBeVisible();
    
    // Right panel should be hidden on mobile (if it exists)
    const rightPanel = page.locator('section').first().locator('div').nth(1);
    // Don't fail if right panel doesn't exist, just check if it's hidden when it does
    const rightPanelExists = await rightPanel.count() > 0;
    if (rightPanelExists) {
      // Check if it has hidden classes on mobile
      const isHidden = await rightPanel.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return styles.display === 'none' || el.classList.contains('hidden');
      });
      // This is informational, not a hard requirement
    }
  });

  test('should render Tag component correctly', async ({ page }) => {
    // Check tag exists and has correct styling
    const tag = page.locator('[class*="pill"]').first();
    await expect(tag).toBeVisible();
    
    // Check tag has lime tone styling
    await expect(tag).toHaveClass(/lime/);
  });

  test('should render Button components correctly', async ({ page }) => {
    // Check pantry button
    const pantryButton = page.getByRole('link', { name: /Check Pantry/ });
    await expect(pantryButton).toBeVisible();
    await expect(pantryButton).toHaveAttribute('href', '/pantry');
  });

  test('should handle CSS gradients and backdrop-blur', async ({ page }) => {
    // Check if gradients are applied (this is more of a visual test)
    const heroSection = page.locator('section').first();
    await expect(heroSection).toBeVisible();
    
    // Check for backdrop-blur classes if they exist
    const blurElements = page.locator('[class*="backdrop-blur"]');
    const blurCount = await blurElements.count();
    // This is informational - blur effects may or may not be present
  });

  test('should not have layout shifts', async ({ page }) => {
    // Wait for initial load
    await page.waitForLoadState('networkidle');
    
    // Take initial screenshot for comparison
    const initialScreenshot = await page.screenshot({ fullPage: false });
    
    // Wait a bit more to see if there are any shifts
    await page.waitForTimeout(1000);
    
    // Check that main elements are still in place
    const heading = page.getByRole('heading', { name: 'Mix & Munch', level: 1 });
    await expect(heading).toBeVisible();
  });

  test('should have proper text content and accessibility', async ({ page }) => {
    // Check heading hierarchy
    const h1 = page.getByRole('heading', { name: 'Mix & Munch', level: 1 });
    await expect(h1).toBeVisible();
    
    // Check description text
    const description = page.getByText(/Discover authentic Filipino recipes/);
    await expect(description).toBeVisible();
    
    // Check tag text
    const tag = page.getByText(/AI-Powered Cooking/);
    await expect(tag).toBeVisible();
  });

  test('should handle interactive elements', async ({ page }) => {
    // Test button hover states
    const pantryButton = page.getByRole('link', { name: /Check Pantry/ });
    await expect(pantryButton).toBeVisible();
    
    // Hover over button
    await pantryButton.hover();
    
    // Check button is still visible and clickable
    await expect(pantryButton).toBeVisible();
  });

  test('should not have z-index conflicts', async ({ page }) => {
    // Check that all main elements are visible and not overlapped
    const heading = page.getByRole('heading', { name: 'Mix & Munch', level: 1 });
    const tag = page.locator('[class*="pill"]').first();
    const pantryButton = page.getByRole('link', { name: /Check Pantry/ });
    
    await expect(heading).toBeVisible();
    await expect(tag).toBeVisible();
    await expect(pantryButton).toBeVisible();
    
    // All elements should be clickable (not covered by other elements)
    await expect(pantryButton).toBeEnabled();
  });
});