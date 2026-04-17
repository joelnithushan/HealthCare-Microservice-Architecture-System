import { test, expect } from '@playwright/test';
import { TEST_USERS } from './testData';

test.describe('Auth & Routing Suite', () => {

  test.describe('1.1 Registration', () => {
    test('Patient registration with valid data', async ({ page }) => {
      await page.goto('/register');
      // Assume the form fields are recognizable
      await page.fill('input[name="name"]', TEST_USERS.patient.name);
      await page.fill('input[name="email"]', 'newpatient_' + Date.now() + '@test.com');
      await page.fill('input[name="password"]', TEST_USERS.patient.password);

      const uniqueId = Date.now().toString().slice(-8);
      const uniqueNic = '96' + uniqueId + 'V';
      const uniqueMobile = '077' + uniqueId;

      const nicInput = await page.$('input[name="nic"]');
      if(nicInput) await nicInput.fill(uniqueNic);

      const mobileInput = await page.$('input[name="mobileNumber"]');
      if(mobileInput) await mobileInput.fill(uniqueMobile);
      
      const dobInput = await page.$('input[name="dob"]');
      if(dobInput) await dobInput.fill('1990-01-01');
      
      const genderSelect = await page.$('select[name="gender"]');
      if(genderSelect) await page.selectOption('select[name="gender"]', 'Male');

      
      await page.click('button[type="submit"]');

      await expect(page).toHaveURL(/.*\/login/);
      // Check for success message or toast
      await expect(page.locator('text=Patient Account created successfully').first()).toBeVisible({ timeout: 10000 });
      
      // Check console for errors - playwright doesn't natively fail on console error automatically without setup
      // Note: We're doing a basic check for redirect
    });

    test('Doctor registration with valid data', async ({ page }) => {
       await page.goto('/register/doctor');
       await page.fill('input[name="name"]', TEST_USERS.doctor.name);
       await page.fill('input[name="email"]', 'newdoc_' + Date.now() + '@test.com');
       await page.fill('input[name="password"]', TEST_USERS.doctor.password);

       const uniqueId = Date.now().toString().slice(-8);
       const uniqueNic = '85' + uniqueId + 'V';
       const uniqueSlmc = uniqueId;

       const slmcInput = await page.$('input[name="slmcNumber"]');
       if(slmcInput) await slmcInput.fill(uniqueSlmc);

       const hospitalInput = await page.$('input[name="hospitalAttached"]');
       if(hospitalInput) await hospitalInput.fill('General Hospital');

       const specialSelect = await page.$('select[name="specialization"]');
       if(specialSelect) await page.selectOption('select[name="specialization"]', 'Cardiologist');

       const mobileInput = await page.$('input[name="mobileNumber"]');
       if(mobileInput) await mobileInput.fill('071' + uniqueId);

       const nicInput = await page.$('input[name="nic"]');
       if(nicInput) await nicInput.fill(uniqueNic);
       
       await page.click('button[type="submit"]');

       // Check it redirects to login
       await expect(page).toHaveURL(/.*\/login/, { timeout: 10000 });
       await expect(page.locator('text=Doctor Application submitted successfully').first()).toBeVisible();
    });

    test('Registration validation', async ({ page }) => {
      await page.goto('/register');
      await page.click('button[type="submit"]');
      // Check required fields
      await expect(page.locator('text=is required').first()).toBeVisible();

      await page.fill('input[name="email"]', 'invalidemail');
      await page.keyboard.press('Tab');
      await expect(page.locator('text=valid email').first()).toBeVisible();

      await page.fill('input[name="password"]', 'short');
      await page.keyboard.press('Tab');
      await expect(page.locator('text=at least 8 characters').first()).toBeVisible();
    });
  });

  test.describe('1.2 Login', () => {
    test('Valid patient login', async ({ page }) => {
      await page.goto('/login');
      await page.fill('input[name="email"], input[type="email"]', TEST_USERS.patient.email);
      await page.fill('input[name="password"], input[type="password"]', TEST_USERS.patient.password);
      await page.click('button[type="submit"]');

      await expect(page).toHaveURL(/.*\/patient\/dashboard/);
      const token = await page.evaluate(() => localStorage.getItem('token'));
      const role = await page.evaluate(() => localStorage.getItem('role'));
      expect(token).toBeTruthy();
      expect(role).toBe('PATIENT');
    });

    test('Valid doctor login', async ({ page }) => {
      await page.goto('/login');
      await page.fill('input[name="email"], input[type="email"]', TEST_USERS.doctor.email);
      await page.fill('input[name="password"], input[type="password"]', TEST_USERS.doctor.password);
      await page.click('button[type="submit"]');

      await expect(page).toHaveURL(/.*\/doctor\/dashboard/);
    });

    test('Valid admin login', async ({ page }) => {
      await page.goto('/login');
      await page.fill('input[name="email"], input[type="email"]', TEST_USERS.admin.email);
      await page.fill('input[name="password"], input[type="password"]', TEST_USERS.admin.password);
      await page.click('button[type="submit"]');

      await expect(page).toHaveURL(/.*\/admin\/dashboard/);
    });

    test('Invalid credentials', async ({ page }) => {
      await page.goto('/login');
      await page.fill('input[name="email"], input[type="email"]', TEST_USERS.patient.email);
      await page.fill('input[name="password"], input[type="password"]', 'WrongPassword123!');
      await page.click('button[type="submit"]');

      await expect(page.locator('text=Invalid credentials').or(page.locator('text=Bad credentials')).first()).toBeVisible();
    });

    test('Role-based route protection', async ({ page }) => {
      await page.goto('/login');
      await page.fill('input[name="email"], input[type="email"]', TEST_USERS.patient.email);
      await page.fill('input[name="password"], input[type="password"]', TEST_USERS.patient.password);
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/.*\/patient\/dashboard/);

      await page.goto('/admin/dashboard');
      // Should bounce back or show unauthorized
      await expect(page).not.toHaveURL('/admin/dashboard');

      await page.goto('/doctor/dashboard');
      await expect(page).not.toHaveURL('/doctor/dashboard');
    });

    test('Logout', async ({ page }) => {
      await page.goto('/login');
      await page.fill('input[type="email"]', TEST_USERS.patient.email);
      await page.fill('input[type="password"]', TEST_USERS.patient.password);
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/.*\/patient\/dashboard/);

      // Find logout button - it's likely a button or link with text "Logout"
      const logoutBtn = page.locator('text=Logout').first();
      await logoutBtn.click();

      await expect(page).toHaveURL(/.*\/login/);

      const token = await page.evaluate(() => localStorage.getItem('token'));
      expect(token).toBeNull();
    });
  });

  test.describe('1.3 Google SSO', () => {
    test('Google login button exists', async ({ page }) => {
      await page.goto('/login');
      const googleBtn = page.locator(':has-text("Google"), :has-text("Sign in with Google")').first();
      await expect(googleBtn).toBeVisible();
      // We don't click it to avoid getting stuck in actual popup if we don't mock it
    });
  });

});
