import { test, expect } from '@playwright/test';

// This test is designed to verify that the registration process can be canceled successfully and the user is returned to the main page
test('test', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.getByTestId('signup-nav-button').click();
  await page.getByTestId('reg-password-input').click();
  await page.getByTestId('reg-password-input').fill('Cumquat1!');
  await page.getByTestId('reg-confirm-password-input').click();
  await page.getByTestId('reg-confirm-password-input').fill('Cumquat1!');
  await page.getByTestId('firstName-input').click();
  await page.getByTestId('reg-confirm-password-input').fill('cumquat1!');
  await page.getByTestId('firstName-input').click();
  await page.getByTestId('firstName-input').fill('Ryan');
  await page.getByTestId('lastName-input').click();
  await page.getByTestId('lastName-input').fill('Lavoie');
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByRole('heading', { name: 'QA Practice: Secure Portal' })).toBeVisible();

});