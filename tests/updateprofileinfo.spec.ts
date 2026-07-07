import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
 // 1. Navigate to the app (Update this URL to match your local dev server)
    await page.goto('http://localhost:5173'); 

    // 2. Perform Login
    await page.getByTestId('email-input').fill('testuser@example.com'); // Replace with your test email
    await page.getByTestId('password-input').fill('password123');     
  await page.locator('html').click();
  await page.getByTestId('email-input').click();
  await page.getByTestId('email-input').fill('testuser@example.com');
  await page.getByTestId('password-input').click();
  await page.getByTestId('password-input').fill('password123');
  await page.getByTestId('login-button').click();
  await page.getByTestId('edit-profile-btn').click();
  await page.getByTestId('firstName-input').click();
  await page.getByTestId('firstName-input').fill('New');
  await page.getByTestId('lastName-input').click();
  await page.getByTestId('lastName-input').fill('Tester');
  await page.getByTestId('phone-input').click();
  await page.getByTestId('phone-input').fill('401333333');
  await page.getByTestId('city-input').click();
  await page.getByTestId('city-input').fill('Coventry');
  await page.getByTestId('state-input').click();
  await page.getByTestId('state-input').selectOption('NY');
  await page.getByTestId('zip-input').dblclick();
  await page.getByTestId('zip-input').fill('02816');
  await page.getByTestId('save-profile-btn').click();
});