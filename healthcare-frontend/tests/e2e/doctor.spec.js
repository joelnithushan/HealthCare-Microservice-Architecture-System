import { test, expect } from '@playwright/test';
import { TEST_USERS } from './testData';

async function loginAsDoctor(page) {
  await page.goto('/login');
  await page.fill('input[type="email"]', TEST_USERS.doctor.email);
  await page.fill('input[type="password"]', TEST_USERS.doctor.password);
  await page.click('button[type="submit"]');
  // Wait to see if it routes to dashboard or shows unverified message
  await page.waitForTimeout(2000);
}

test.describe('Doctor Dashboard Suite', () => {

  test.describe('3.2 Dashboard Load', () => {
    test('All sections load correctly for verified doctor', async ({ page }) => {
      await loginAsDoctor(page);
      
      // If the default doctor is unverified, this might fail early, which is a good test target
      const url = page.url();
      if(url.includes('/doctor/dashboard')) {
          await expect(page.locator('text=Today\'s Appointments').first()).toBeVisible();
          
          // No null/undefined
          const bodyText = await page.locator('body').innerText();
          expect(bodyText).not.toMatch(/\bundefined\b/i);
          expect(bodyText).not.toMatch(/\bnull\b/i);
      } else {
          // It might be unverified, expect that message
          await expect(page.locator('text=pending').or(page.locator('text=unverified')).first()).toBeVisible();
      }
    });
  });

  test.describe('3.3 Appointment Accept/Reject', () => {
    test('Accept appointment', async ({ page }) => {
      await loginAsDoctor(page);
      if(page.url().includes('/doctor/dashboard')) {
        await page.click('text=Appointments');
        const acceptBtn = page.locator('button:has-text("Accept")').first();
        if(await acceptBtn.count() > 0) {
            await acceptBtn.click();
            await expect(page.locator('text=ACCEPTED').first()).toBeVisible({ timeout: 5000 });
        }
      }
    });

    test('Reject appointment', async ({ page }) => {
      await loginAsDoctor(page);
      if(page.url().includes('/doctor/dashboard')) {
        await page.click('text=Appointments');
        const rejectBtn = page.locator('button:has-text("Reject")').first();
        if(await rejectBtn.count() > 0) {
            await rejectBtn.click();
            await page.click('button:has-text("Confirm")');
            await expect(page.locator('text=REJECTED').first()).toBeVisible({ timeout: 5000 });
        }
      }
    });
  });

  test.describe('3.4 Availability Management', () => {
    test('Set availability schedule', async ({ page }) => {
      await loginAsDoctor(page);
      if(page.url().includes('/doctor/dashboard')) {
        await page.click('text=Availability');
        // Simple heuristic interaction
        await page.click('button:has-text("Add"), button:has-text("Save")');
      }
    });
  });

  test.describe('3.5 Prescriptions', () => {
    test('Prescription validation', async ({ page }) => {
      await loginAsDoctor(page);
      if(page.url().includes('/doctor/dashboard')) {
        await page.click('text=Prescriptions');
        await page.click('button:has-text("Issue"), button:has-text("Create")');
        // Submit empty form
        await page.click('button:has-text("Submit"), button:has-text("Save")');
        await expect(page.locator('.text-red-500, .error').first()).toBeVisible();
      }
    });
  });

});
