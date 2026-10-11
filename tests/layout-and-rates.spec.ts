import { test, expect, type Page } from "@playwright/test";
import nextEnv from "@next/env";
import { SignJWT } from "jose";

async function fits(page: Page) {
  const overflow = await page.evaluate(() => ({ width: innerWidth, content: document.documentElement.scrollWidth }));
  expect(overflow.content, `${page.url()} at ${overflow.width}px`).toBeLessThanOrEqual(overflow.width);
}

test("customer rate list filters, image preview and print layout", async ({ page }) => {
  await page.goto("/rate-list");
  await expect(page.getByRole("heading", { name: "Rate List", exact: true })).toBeVisible();
  const rows = page.locator(".rate-list-page tbody tr");
  await expect(rows.first()).toBeVisible();
  const count = await rows.count();
  const name = await rows.first().locator("td").first().getByRole("link").innerText();
  await page.getByRole("searchbox", { name: "Search rate list" }).fill("no-product-matches-this-123");
  await expect(page.getByRole("heading", { name: "No matching products" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Print / Save PDF" })).toBeDisabled();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(rows).toHaveCount(count);
  await page.getByRole("searchbox", { name: "Search rate list" }).fill(name);
  await expect(rows.first()).toContainText(name);
  await page.getByRole("searchbox", { name: "Search rate list" }).fill("");
  await page.getByRole("combobox", { name: "Category", exact: true }).selectOption({ index: 1 });
  const filteredCount = await rows.count();
  expect(filteredCount).toBeGreaterThan(0);
  await page.getByRole("combobox", { name: "Sort by" }).selectOption("price-asc");
  await fits(page);
  const image = page.getByRole("button", { name: /Enlarge image of/ }).first();
  await image.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(image).toBeFocused();
  await expect(page.getByRole("button", { name: "Print / Save PDF" })).toHaveCSS("border-radius", "0px");
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".storefront-header")).not.toBeVisible();
  await expect(page.locator(".mobile-bottom-nav")).not.toBeVisible();
  await expect(page.getByRole("button", { name: "Print / Save PDF" })).not.toBeVisible();
  await expect(rows).toHaveCount(filteredCount);
  await expect(rows.first()).toHaveCSS("display", "table-row");
  await expect(page.locator(".rate-list-page thead")).toHaveCSS("display", "table-header-group");
});

test("shared navigation and square controls fit narrow phones and tablets", async ({ page, isMobile }) => {
  for (const width of isMobile ? [320, 390] : [768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["/", "/shop", "/rate-list", "/product/pop-up", "/request-quote"]) {
      await page.goto(path);
      await fits(page);
      await expect(page.locator(".storefront-header")).toBeVisible();
      const rounded = await page.locator(".storefront-shell button:visible, .storefront-shell .commerce-button:visible").evaluateAll(elements => elements.filter(el => parseFloat(getComputedStyle(el).borderTopLeftRadius) > 0).map(el => el.textContent));
      expect(rounded, path).toEqual([]);
    }
    if (width < 1024) {
      await page.getByRole("button", { name: "Open navigation menu" }).click();
      const menu = page.getByRole("dialog", { name: "Navigation menu" });
      await expect(menu).toBeVisible();
      await menu.getByRole("link", { name: "Rate List", exact: true }).click();
      await expect(page).toHaveURL(/\/rate-list$/);
      await expect(menu).not.toBeVisible();
    }
  }
});

test("admin navigation, forms and tables fit the viewport in both themes", async ({ page, context, baseURL, isMobile }) => {
  test.setTimeout(120_000);
  test.skip(!baseURL || !["localhost", "127.0.0.1"].includes(new URL(baseURL).hostname), "Local admin UI verification only");
  nextEnv.loadEnvConfig(process.cwd());
  const secret = process.env.AUTH_SECRET || process.env.JWT_SECRET;
  test.skip(!secret, "A configured local session secret is required");
  const token = await new SignJWT({ email: "layout-test@example.test", name: "Layout verification", role: "ADMIN" })
    .setProtectedHeader({ alg: "HS256" }).setSubject("local-layout-test").setIssuedAt().setExpirationTime("10m")
    .setIssuer("pak-multilinks-hygiene").setAudience("pak-multilinks-web").sign(new TextEncoder().encode(secret));
  await context.addCookies([{ name: "pmh_session", value: token, url: baseURL!, httpOnly: true, sameSite: "Lax" }]);
  await page.route("**/api/**", route => ["POST", "PUT", "PATCH", "DELETE"].includes(route.request().method()) ? route.abort() : route.continue());
  await page.setViewportSize({ width: isMobile ? 320 : 1024, height: 900 });
  for (const theme of ["light", "dark"]) {
    await page.goto("/admin");
    await page.locator(".theme-switch select:visible").selectOption(theme);
    for (const path of ["/admin", "/admin/products", "/admin/products/new", "/admin/pricing", "/admin/categories", "/admin/brands", "/admin/orders", "/admin/quotes", "/admin/customers", "/admin/deals", "/admin/settings"]) {
      await page.goto(path);
      await expect(page.locator(".admin-workspace")).toBeVisible();
      await expect(page.getByRole("main")).toHaveCount(1);
      await fits(page);
    }
    if (isMobile) {
      await page.getByRole("button", { name: "Open menu", exact: true }).click();
      const menu = page.getByRole("dialog", { name: "Admin navigation" });
      await expect(menu).toBeVisible();
      await menu.getByRole("link", { name: "Pricing & inventory" }).click();
      await expect(page).toHaveURL(/\/admin\/pricing$/);
      await expect(menu).not.toBeVisible();
    }
  }
});
