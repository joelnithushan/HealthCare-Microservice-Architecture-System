import { test, expect } from '@playwright/test';

test.describe('UI & Validation Audit Suite', () => {

  test('Design Consistency - Sharp Corners', async ({ page }) => {
    await page.goto('/login');
    // Check main button
    const button = page.locator('button[type="submit"]').first();
    const borderRadius = await button.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return computed.borderRadius;
    });
    // According to the prompt: border-radius should be 0px
    expect(['0px', '']).toContain(borderRadius);
  });

  test('Design Consistency - Colors and Fonts', async ({ page }) => {
    await page.goto('/');
    const bodyFont = await page.evaluate(() => {
      return window.getComputedStyle(document.body).fontFamily;
    });
    expect(bodyFont.toLowerCase()).toContain('poppins');
  });

  test('Responsive Design', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/login');
    
    // Ensure no horizontal scrolling
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });

  test('404 handling', async ({ page }) => {
    const res = await page.goto('/some-nonexistent-route-12345');
    // Basic react apps return 200 for index.html on arbitrary paths 
    // so we check UI for 404 or Not Found
    const bodyText = await page.locator('body').innerText();
    expect(bodyText).toMatch(/404|not found/i);
  });

});
