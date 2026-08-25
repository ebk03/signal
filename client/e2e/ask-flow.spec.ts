import { test, expect } from "@playwright/test";

test("sign up, then asking a question renders a chart with no error", async ({ page }) => {
  const email = `e2e-${Date.now()}@example.com`;

  await page.goto("/");

  // App defaults to the public dashboard for logged-out visitors.
  await expect(page.getByTestId("chart")).toBeVisible({ timeout: 15_000 });

  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await page.getByRole("button", { name: "Sign up", exact: true }).click();

  await page.getByPlaceholder("Email").fill(email);
  await page.getByPlaceholder(/password/i).fill("supersecret123");
  await page.getByRole("button", { name: "Sign up", exact: true }).click();

  await expect(page.getByText(email)).toBeVisible();

  // Logging in lands back on the dashboard — switch to the agent page.
  await page.getByRole("button", { name: "Ask Agent", exact: true }).click();

  await page
    .getByPlaceholder(/most in-demand skill/i)
    .fill("How many job postings mention remote work?");
  await page.getByRole("button", { name: "Ask", exact: true }).click();

  await expect(page.getByTestId("chart")).toBeVisible({ timeout: 45_000 });
  await expect(page.getByTestId("error-banner")).not.toBeVisible();
});
