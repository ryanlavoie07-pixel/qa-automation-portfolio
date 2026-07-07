import { test, expect } from '@playwright/test';
// This test is designed to validate the application's handling of invalid registration attempts.
test('test', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.getByTestId('signup-nav-button').click();
  await page.getByTestId('reg-email-input').click();
  await page.getByTestId('reg-email-input').fill('ryan.lavoie07@example.com');
  
  // The following steps simulate a user attempting to register with mismatched passwords, which should trigger an error dialog.

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
  
page.once('dialog', async dialog => {
  console.log(`Dialog message: ${dialog.message()}`);
  expect(dialog.message()).toBe('Passwords do not match. Please try again.');
  await dialog.dismiss().catch(() => {});
});
await page.getByTestId('save-profile-btn').click();

// The following steps simulate a user attempting to register without providing a first name, which should also trigger an error dialog.
await page.getByTestId('reg-password-input').click();
await page.getByTestId('reg-password-input').fill('Cumquat1!');
await page.getByTestId('reg-confirm-password-input').click();
await page.getByTestId('reg-confirm-password-input').fill('Cumquat1!');
await page.getByTestId('firstName-input').click();
await page.getByTestId('firstName-input').fill('');
page.once('dialog', async dialog => {
  console.log(`Dialog message: ${dialog.message()}`);
  expect(dialog.message()).toBe('First Name and Last Name are strictly required to continue.');
  await dialog.dismiss().catch(() => {});
});
await page.getByTestId('save-profile-btn').click();

// The following steps simulate a user attempting to register without providing a last name, which should also trigger an error dialog.
await page.getByTestId('firstName-input').click();
  await page.getByTestId('firstName-input').fill('Ryan');
  await page.getByTestId('lastName-input').click();
  await page.getByTestId('lastName-input').fill('');
  page.once('dialog', async dialog => {
  console.log(`Dialog message: ${dialog.message()}`);
  expect(dialog.message()).toBe('First Name and Last Name are strictly required to continue.');
  await dialog.dismiss().catch(() => {});
});
await page.getByTestId('save-profile-btn').click();

// The following steps simulate placing an invalid email format during registration, which should trigger an error dialog.

await page.getByTestId('reg-email-input').click();
await page.getByTestId('reg-email-input').fill('ryan.lavoie07example.com');
await page.getByTestId('reg-password-input').click();
await page.getByTestId('reg-password-input').fill('Cumquat1!');
await page.getByTestId('reg-confirm-password-input').click();
await page.getByTestId('reg-confirm-password-input').fill('Cumquat1!');
await page.getByTestId('firstName-input').click();
await page.getByTestId('firstName-input').fill('Ryan');
await page.getByTestId('lastName-input').click();
await page.getByTestId('lastName-input').fill('Lavoie');

// Set up the promise to wait for the dialog BEFORE clicking the button
const dialogPromise = page.waitForEvent('dialog');
await page.getByTestId('save-profile-btn').click();

// Playwright pauses here until Supabase replies and the alert pops up
const dialog = await dialogPromise;
console.log(`Dialog message: ${dialog.message()}`);
expect(dialog.message()).toBe('Sign Up Failed: Unable to validate email address: invalid format');
await dialog.dismiss();

// The following steps simulate successful registration with valid credentials, ensuring that the application resets its state appropriately after previous failed attempts.
 await page.getByTestId('reg-email-input').click();
  await page.getByTestId('reg-email-input').fill('ryan.lavoie07@example.com');
  await page.getByTestId('reg-password-input').click();
  await page.getByTestId('reg-password-input').fill('password123');
  await page.getByTestId('reg-confirm-password-input').click();
  await page.getByTestId('reg-confirm-password-input').fill('password123');
  await page.getByTestId('firstName-input').click();
  await page.getByTestId('firstName-input').fill('Ryan');
  await page.getByTestId('lastName-input').click();
  await page.getByTestId('lastName-input').fill('Lavoie');
  await page.getByTestId('phone-input').click();
  await page.getByTestId('phone-input').fill('4012222221');
  await page.getByTestId('city-input').click();
  await page.getByTestId('city-input').fill('Cranston');
  await page.getByTestId('state-input').click();
  await page.getByTestId('state-input').selectOption('RI');
  await page.getByTestId('zip-input').click();
  await page.getByTestId('zip-input').fill('02920');
  await page.getByTestId('save-profile-btn').click();

  // The followings Steps has the user delete the account that was just created to ensure that the application can handle account deletion after a successful registration.
   await page.getByRole('button', { name: 'Delete Account' }).click();
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('ryan.lavoie07@example.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('password123');
  
  // 1. Set up the promise to wait for the dialog BEFORE clicking the button
  const deleteDialogPromise = page.waitForEvent('dialog');
  
  
  // 2. Click the delete button
  await page.getByRole('button', { name: 'Delete Permanently' }).click();
  
  // 3. Playwright pauses here until the Supabase request finishes and triggers the alert
  const deleteDialog = await deleteDialogPromise;
  console.log(`Dialog message: ${deleteDialog.message()}`);
  
  // 4. Accept the dialog (clicks "OK")
  await deleteDialog.accept();
  
  await page.goto('http://localhost:5173/');

  
})