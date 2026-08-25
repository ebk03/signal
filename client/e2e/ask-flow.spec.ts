import { test, expect } from "@playwright/test";

test("sign up, then asking a question renders a chart with no error", async ({ page }) => {
  const email = `e2e-${Date.now()}@example.com`;

  await page.goto("/");

  // App defaults to the login view — toggle to signup for a fresh account.
  await page.getByRole("button", { name: "Sign up", exact: true }).click();

  await page.getByPlaceholder("Email").fill(email);
  await page.getByPlaceholder(/password/i).fill("supersecret123");
  await page.getByRole("button", { name: "Sign up", exact: true }).click();

  await expect(page.getByText(email)).toBeVisible();

  await page
    .getByPlaceholder(/most in-demand skill/i)
    .fill("How many job postings mention remote work?");
  await page.getByRole("button", { name: "Ask", exact: true }).click();

  await expect(page.getByTestId("chart")).toBeVisible({ timeout: 45_000 });
  await expect(page.getByTestId("error-banner")).not.toBeVisible();
});
