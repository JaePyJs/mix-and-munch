import { test, expect } from '@playwright/test';

test.describe('Responsive Header', () => {
  test('should maintain header title visibility at problematic viewport 564x359', async ({ page }) => {
    // Set the specific problematic viewport size
    await page.setViewportSize({ width: 564, height: 359 });
    
    // Navigate to the home page
    await page.goto('http://localhost:3000');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check that the header is visible
    const header = page.locator('header');
    await expect(header).toBeVisible();
    
    // Check that the logo brand is visible
    const logoBrand = page.locator('a[href="/"]').first();
    await expect(logoBrand).toBeVisible();
    
    // Check that "Mix & Munch" text is visible in the header specifically
    // Look for the mobile version that should be visible at this viewport
    const mobileHeaderTitle = page.locator('header').locator('span.block.sm\\:hidden');
    await expect(mobileHeaderTitle).toBeVisible();
    await expect(mobileHeaderTitle).toContainText('Mix & Munch');
    
    // Verify the logo image is visible in the header specifically
    const headerLogoImage = page.locator('header').locator('img[alt="Mix & Munch Logo"]');
    await expect(headerLogoImage).toBeVisible();
    
    // Take a screenshot for visual verification
    await page.screenshot({ 
      path: 'tests/screenshots/header-564x359.png',
      fullPage: false 
    });
  });

  test('should maintain header visibility across multiple small viewport sizes', async ({ page }) => {
    const viewports = [
      { width: 320, height: 568 }, // iPhone SE
      { width: 375, height: 667 }, // iPhone 8
      { width: 414, height: 896 }, // iPhone XR
      { width: 564, height: 359 }, // Problematic size
      { width: 600, height: 400 }, // Small tablet
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');
      
      // Check header visibility
      const header = page.locator('header');
      await expect(header).toBeVisible();
      
      // Check title visibility in header specifically
      // For small viewports, check the mobile version
      if (viewport.width < 640) {
        const mobileHeaderTitle = page.locator('header').locator('span.block.sm\\:hidden');
        await expect(mobileHeaderTitle).toBeVisible();
        await expect(mobileHeaderTitle).toContainText('Mix & Munch');
      } else {
        // For larger viewports, check the desktop version
        const desktopHeaderTitle = page.locator('header').locator('span.hidden.sm\\:block');
        await expect(desktopHeaderTitle).toBeVisible();
        await expect(desktopHeaderTitle).toContainText('Mix & Munch');
      }
      
      console.log(`✓ Header visible at ${viewport.width}x${viewport.height}`);
    }
  });

  test('should verify features section displays actual content', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Check that AI Assistant feature is visible with actual content
    const aiAssistantAccent = page.locator('text=AI Assistant');
    await expect(aiAssistantAccent).toBeVisible();
    
    // Check that Smart Pantry feature is visible
    const smartPantryAccent = page.locator('text=Smart Pantry');
    await expect(smartPantryAccent).toBeVisible();
    
    // Check that Expert Guidance feature is visible
    const expertGuidanceAccent = page.locator('text=Expert Guidance');
    await expect(expertGuidanceAccent).toBeVisible();
    
    // Verify no placeholder text is showing
    const placeholderText = page.locator('text=her_section');
    await expect(placeholderText).not.toBeVisible();
  });
});