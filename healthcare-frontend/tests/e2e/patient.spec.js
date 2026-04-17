import { test, expect } from '@playwright/test';
import { TEST_USERS } from './testData';

// Helper to login as patient
async function loginAsPatient(page) {
  await page.goto('/login');
  await page.fill('input[type="email"]', TEST_USERS.patient.email);
  await page.fill('input[type="password"]', TEST_USERS.patient.password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/patient/dashboard');
}

test.describe('Patient Dashboard Suite', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsPatient(page);
  });

  test.describe('2.1 Dashboard Load', () => {
    test('All sections load without errors', async ({ page }) => {
      // Check sidebar links
      await expect(page.locator('.sidebar, nav').locator('text=Symptom Checker').first()).toBeVisible();
      
      // Check stats cards
      await expect(page.locator('text=Upcoming Appointments').first()).toBeVisible();
      await expect(page.locator('text=Past Appointments').first()).toBeVisible();
      
      // Check no "undefined" or "null" text
      const bodyText = await page.locator('body').innerText();
      expect(bodyText).not.toMatch(/\bundefined\b/i);
      expect(bodyText).not.toMatch(/\bnull\b/i);
    });
  });

  test.describe('2.2 Browse & Book Doctors', () => {
    test('Doctor listing loads', async ({ page }) => {
      await page.click('text=Book Appointment');
      // Wait for doctors grid/list
      await expect(page.locator('.doctor-card, .card').first()).toBeVisible();
    });

    test('Filter by specialization', async ({ page }) => {
      await page.click('text=Book Appointment');
      const select = page.locator('select').first();
      // Assuming 'Cardiology' or 'General Medicine' exists
      await select.selectOption({ label: 'General Medicine' });
      await page.waitForTimeout(1000); // Wait for API response
      // Verify doctor card still shows
      await expect(page.locator('.doctor-card, .card').first()).toBeVisible();
    });

    test('Book appointment', async ({ page }) => {
      await page.click('text=Book Appointment');
      await page.locator('text=Book').first().click();
      
      // wait for modal
      await expect(page.locator('.modal, [role="dialog"]').first()).toBeVisible();
      
      // Pick a future date
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 2);
      const dateStr = futureDate.toISOString().split('T')[0];
      
      await page.fill('input[type="date"]', dateStr);
      await page.fill('input[type="time"]', '10:00');
      
      // Try finding a type select or default to basic submit
      const typeSelect = await page.$('select[name="type"]');
      if (typeSelect) await page.selectOption('select[name="type"]', 'IN_PERSON');

      await page.click('button:has-text("Confirm"), button:has-text("Submit"), button:has-text("Book")');
      
      // Wait for success toast
      await expect(page.locator('text=success').first()).toBeVisible({ timeout: 5000 });
    });

    test('Book appointment — validation', async ({ page }) => {
      await page.click('text=Book Appointment');
      await page.locator('text=Book').first().click();
      
      await page.click('button:has-text("Confirm"), button:has-text("Submit"), button:has-text("Book")');
      
      // Should show validation error
      await expect(page.locator('.text-red-500, .error').first()).toBeVisible();
    });
  });

  test.describe('2.3 Appointment Management', () => {
    test('View appointments', async ({ page }) => {
      await page.click('text=My Appointments');
      await expect(page.locator('table, .appointments-list').first()).toBeVisible();
    });

    test('Cancel appointment', async ({ page }) => {
      await page.click('text=My Appointments');
      
      // Find a pending one and click cancel
      const cancelBtn = page.locator('button:has-text("Cancel")').first();
      if(await cancelBtn.count() > 0) {
         await cancelBtn.click();
         // Confirm dialog
         await page.click('button:has-text("Confirm"), button:has-text("Yes")');
         await expect(page.locator('text=Cancelled').first()).toBeVisible();
      }
    });
  });

  test.describe('2.4 Medical Reports', () => {
    test('Upload validation', async ({ page }) => {
      try {
        await page.click('text=Medical Reports');
      } catch (e) {
        // May be named differently
        await page.click('text=Reports');
      }
      
      // Find upload input
      const fileInput = await page.$('input[type="file"]');
      if (fileInput) {
         // Create a dummy txt file in memory and upload
         await page.setInputFiles('input[type="file"]', {
             name: 'test.exe',
             mimeType: 'application/x-msdownload',
             buffer: Buffer.from('dummy data')
         });
         await page.click('button:has-text("Upload")');
         await expect(page.locator('text=Invalid file type').or(page.locator('text=error')).first()).toBeVisible();
      }
    });
  });

  test.describe('2.6 Symptom Checker', () => {
    test('Symptom checker validation', async ({ page }) => {
      await page.click('text=Symptom Checker');
      await page.click('button:has-text("Analyze"), button:has-text("Check")');
      
      await expect(page.locator('text=Please add').or(page.locator('text=required')).first()).toBeVisible();
    });
  });

  test.describe('2.8 Profile', () => {
    test('View and update profile', async ({ page }) => {
      await page.click('text=Profile');
      
      const mobileInput = page.locator('input[name="mobile"], input[name="phone"]');
      await mobileInput.fill('0779998888');
      
      await page.click('button:has-text("Save"), button:has-text("Update")');
      await expect(page.locator('text=success').first()).toBeVisible();
    });
  });

});
