import { test, expect } from "@playwright/test";

test("asking a question renders a chart with no error", async ({ page }) => {
  await page.goto("/");

  await page
    .getByPlaceholder(/most in-demand skill/i)
    .fill("How many job postings mention remote work?");
  await page.getByRole("button", { name: /ask/i }).click();

  await expect(page.getByTestId("chart")).toBeVisible({ timeout: 45_000 });
  await expect(page.getByTestId("error-banner")).not.toBeVisible();
});
