import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  
  test('User can log in and securely log out', async ({ page }) => {
    // 1. Navigate to the app (Update this URL to match your local dev server)
    await page.goto('http://localhost:5173'); 

    // 2. Perform Login
    await page.getByTestId('email-input').fill('ryan.lavoie07@gmail.com'); // Replace with your test email
    await page.getByTestId('password-input').fill('Cumquat1!');       // Replace with your test password
    
    // Click login and wait for the dashboard to appear
    await page.getByTestId('login-button').click();
    await expect(page.getByTestId('dashboard-screen')).toBeVisible();

    // Verify we are actually logged in by checking the welcome message
    await expect(page.getByTestId('welcome-message')).toHaveText('Welcome to the Dashboard!');

    // 3. Perform Logout (HANDLING THE NATIVE CONFIRM BOX)
    
    // Tell Playwright: "The next time a dialog pops up, click OK (accept)"
    page.once('dialog', async dialog => {
      console.log(`Dialog message: ${dialog.message()}`); // Optional: logs the alert message
      await dialog.accept();
    });

    // Now click the logout button which triggers the dialog
    await page.getByTestId('logout-button').click();

    // 4. Verify successful logout
    // The dashboard should be hidden, and the email input should be visible again
    await expect(page.getByTestId('dashboard-screen')).toBeHidden();
    await expect(page.getByTestId('email-input')).toBeVisible();
    
    // Check for the success message
    await expect(page.getByTestId('status-message')).toHaveText('You have successfully securely logged out.');
  });
});