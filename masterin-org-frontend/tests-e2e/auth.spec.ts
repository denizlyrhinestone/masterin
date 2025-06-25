// tests-e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication Flows', () => {

  // Note: For robust E2E tests, a proper test data seeding strategy for the backend DB is essential.
  // These tests assume certain user states (e.g., a known user for login, an unused email for signup).
  // Clearing localStorage helps isolate frontend state between tests.

  test.beforeEach(async ({ page }) => {
    // Go to the base URL (homepage) to ensure a clean slate for localStorage interactions.
    await page.goto('/');
    // Clear localStorage to ensure no stale auth tokens affect the test.
    await page.evaluate(() => localStorage.clear());
    // It's also good practice to clear cookies if your app uses them for auth/session.
    // await page.context().clearCookies();
  });

  test('should allow a new user to sign up successfully', async ({ page }) => {
    await page.goto('/signup');
    await expect(page).toHaveTitle(/Sign Up/); // Or a more specific title if available

    const uniqueEmail = `testuser_${Date.now()}@example.com`;
    await page.fill('input[name="email"]', uniqueEmail);
    await page.fill('input[name="password"]', 'Password123!');
    await page.fill('input[name="confirmPassword"]', 'Password123!');
    // Assuming role selection exists, adjust if needed. Default might be 'student'.
    // await page.selectOption('select[name="role"]', 'student');

    await page.click('button[type="submit"]:has-text("Sign Up")');

    // Expect redirection to login page or a success message/state on signup page
    // This depends on your application's signup flow.
    // For this example, let's assume it redirects to login after successful signup.
    await expect(page).toHaveURL(/.*login/, { timeout: 10000 });
    // Or check for a success message:
    // await expect(page.getByText(/Signup successful! Please log in./i)).toBeVisible();
  });


  test('should allow an existing user to log in successfully', async ({ page }) => {
    // THIS TEST REQUIRES A PRE-EXISTING USER IN YOUR E2E DATABASE:
    // e.g., student@example.com / Password123!
    // Ensure this user is available in the backend DB used for E2E tests.

    await page.goto('/login');
    await expect(page).toHaveTitle(/Log In/);

    await page.fill('input[name="email"]', 'student@example.com'); // Use actual name/selector
    await page.fill('input[name="password"]', 'Password123!');   // Use actual name/selector
    await page.click('button[type="submit"]:has-text("Log In")'); // Adjust selector if needed

    // Wait for navigation to dashboard or check for a dashboard element
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 }); // Increased timeout for page load
    // A more robust check for login success:
    await expect(page.getByRole('button', { name: /logout/i })).toBeVisible();
  });

  test('should show error on login with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.fill('input[name="password"]', 'WrongPassword!');
    await page.click('button[type="submit"]:has-text("Log In")');

    // Check for error message display (adjust selector as per actual implementation)
    // This depends on how errors are displayed on your login page.
    // Example: if error is in a div with class 'error-message' or specific text
    const errorMessage = await page.locator('form').getByText(/Invalid credentials|Login failed/i).first();
    await expect(errorMessage).toBeVisible();

    await expect(page).toHaveURL(/.*login/); // Should remain on login page
    await expect(page.getByRole('button', { name: /logout/i })).not.toBeVisible();
  });

  test('should allow a logged-in user to log out', async ({ page }) => {
    // Log in first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'student@example.com');
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]:has-text("Log In")');
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });

    // Now, log out
    // The logout button might be in a dropdown or directly visible.
    // Adjust selector as needed. This assumes a visible "Logout" button.
    const logoutButton = page.getByRole('button', { name: /logout/i });
    await expect(logoutButton).toBeVisible();
    await logoutButton.click();

    // Expect redirection to login page after logout
    await expect(page).toHaveURL(/.*login/, { timeout: 10000 });
    // Verify no user-specific elements are present (e.g., logout button should not be visible)
    await expect(page.getByRole('button', { name: /logout/i })).not.toBeVisible();
  });

});
