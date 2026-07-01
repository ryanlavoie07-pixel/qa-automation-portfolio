import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.getByTestId('email-input').click();
  await page.getByTestId('email-input').fill('ryan.lavoie07@gmail.com');
  await page.getByTestId('password-input').click();
  await page.getByTestId('password-input').fill('Cumquat1!');
  await page.getByTestId('login-button').click();
  await page.getByRole('button', { name: 'Delete Account' }).click();
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('ryan.lavoie07@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('password123');
  
  // 1. Set up the promise to wait for the dialog BEFORE clicking the button
  const dialogPromise = page.waitForEvent('dialog');
  
  // 2. Click the delete button
  await page.getByRole('button', { name: 'Delete Permanently' }).click();
  
  // 3. Playwright pauses here until the Supabase request finishes and triggers the alert
  const dialog = await dialogPromise;
  console.log(`Dialog message: ${dialog.message()}`);
  
  // 4. Accept the dialog (clicks "OK")
  await dialog.accept();
  
  await page.goto('http://localhost:5173/');
});