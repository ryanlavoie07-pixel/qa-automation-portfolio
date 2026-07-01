import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.getByTestId('signup-nav-button').click();
  await page.getByTestId('reg-email-input').click();
  await page.getByTestId('reg-email-input').fill('testuser@example.com');
  await page.getByTestId('reg-password-input').click();
  await page.getByTestId('reg-password-input').fill('password123');
  await page.getByTestId('reg-confirm-password-input').click();
  await page.getByTestId('reg-confirm-password-input').fill('password123');
  await page.getByTestId('firstName-input').click();
  await page.getByTestId('firstName-input').fill('Test');
  await page.getByTestId('lastName-input').click();
  await page.getByTestId('lastName-input').fill('Person');
  await page.getByTestId('phone-input').click();
  await page.getByTestId('phone-input').fill('4012222222');
  await page.getByTestId('city-input').click();
  await page.getByTestId('city-input').fill('Cranston');
  await page.getByTestId('state-input').click();
  await page.getByTestId('state-input').fill('RI');
  await page.getByTestId('zip-input').click();
  await page.getByTestId('zip-input').fill('02920');
  await page.getByTestId('save-profile-btn').click();
});