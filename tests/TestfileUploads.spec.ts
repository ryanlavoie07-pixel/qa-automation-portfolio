import { test, expect } from '@playwright/test';
import { dirname, join } from 'path';

test.describe('Authentication Flow', () => {
  
  test('User can log in and securely log out', async ({ page }) => {
    // 1. Navigate to the app
    await page.goto('http://localhost:5173'); 

    // 2. Perform Login
    await page.getByTestId('email-input').fill('testuser@example.com'); 
    await page.getByTestId('password-input').fill('password123');       
    
    // Click login and wait for the dashboard to appear
    await page.getByTestId('login-button').click();
    await expect(page.getByTestId('dashboard-screen')).toBeVisible();

    // Verify we are actually logged in by checking the welcome message
    await expect(page.getByTestId('welcome-message')).toHaveText('Welcome to the Dashboard!');

    // 3. Perform Logout (HANDLING THE NATIVE CONFIRM BOX)
    page.once('dialog', async dialog => {
      console.log(`Dialog message: ${dialog.message()}`); 
      await dialog.accept();
    });

    // Now click the logout button which triggers the dialog
    await page.getByTestId('logout-button').click();

    // 4. Verify successful logout
    await expect(page.getByTestId('dashboard-screen')).toBeHidden();
    await expect(page.getByTestId('email-input')).toBeVisible();
    await expect(page.getByTestId('status-message')).toHaveText('You have successfully securely logged out.');
  });

  test('User can upload and delete PNG and PDF files', async ({ page }, testInfo) => {
    // 1. Navigate and Log In (Prerequisite)
    await page.goto('http://localhost:5173'); 
    await page.getByTestId('email-input').fill('testuser@example.com');
    await page.getByTestId('password-input').fill('password123');
    await page.getByTestId('login-button').click();
    await expect(page.getByTestId('dashboard-screen')).toBeVisible();

    // ==========================================
    // 2. TEST PROFILE PICTURE (PNG) UPLOAD
    // ==========================================
    const imageChooserPromise = page.waitForEvent('filechooser');
    await page.locator('#custom-upload-btn').click(); 
    const imageChooser = await imageChooserPromise;
    
    // Use testInfo to get the current file directory securely
    const imagePath = join(dirname(testInfo.file), 'test-image.png');
    await imageChooser.setFiles(imagePath);

    await expect(page.getByTestId('upload-status')).toHaveText('Cloud Upload Successful!');
    await expect(page.getByTestId('profile-preview')).toBeVisible();

    // ==========================================
    // 3. TEST DOCUMENT (PDF) UPLOAD
    // ==========================================
    const pdfChooserPromise = page.waitForEvent('filechooser');
    await page.locator('#custom-pdf-btn').click();
    const pdfChooser = await pdfChooserPromise;
    
    // Use testInfo for the PDF file as well
    const pdfPath = join(dirname(testInfo.file), 'test-doc.pdf');
    await pdfChooser.setFiles(pdfPath);
    
    await page.locator('#upload-pdf-btn').click();

    await expect(page.getByTestId('pdf-upload-status')).toHaveText('PDF Upload Successful!');
    await expect(page.locator('#pdf-link-container')).toBeVisible();

    // ==========================================
    // 4. TEST DELETION (CLEANUP)
    // ==========================================
    page.once('dialog', dialog => dialog.accept());
    await page.locator('#remove-picture-btn').click();
    await expect(page.getByTestId('upload-status')).toHaveText('Picture permanently removed.');

    page.once('dialog', dialog => dialog.accept());
    await page.locator('#remove-pdf-btn').click();
    await expect(page.getByTestId('pdf-upload-status')).toHaveText('Document permanently removed.');
  });
});