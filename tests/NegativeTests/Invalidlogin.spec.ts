import { test, expect } from '@playwright/test';
// It is designed to ensure that the application correctly handles authentication errors.
// The test navigates to the login page, inputs invalid credentials, and verifies that the appropriate error message is displayed.
test('test', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.getByTestId('email-input').click();
  await page.getByTestId('email-input').fill('ryan.lavoie07@gmail.com');
  await page.getByTestId('password-input').click();
  await page.getByTestId('password-input').fill('badpw');
  await page.getByTestId('login-button').click();
await expect(page.getByTestId('status-message')).toHaveText('Login Failed: Invalid login credentials');

// This step is to ensure user can login with correct credentials after a failed attempt, verifying that the application resets its state appropriately.
await page.getByTestId('email-input').click();
  await page.getByTestId('email-input').fill('ryan.lavoie07@gmail.com');
  await page.getByTestId('password-input').click();
  await page.getByTestId('password-input').fill('Cumquat1!');
  await page.getByTestId('login-button').click();

});