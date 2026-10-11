import { test, expect, type Page } from "@playwright/test";

const themeKey = "pmh.theme.v1";
const product = {
  id: "ui-test-product", slug: "ui-test-product", name: "Test tissue cartons", sku: "UI-TEST",
  category: "Tissue", categorySlug: "tissue-paper-products", brand: "Test",
  description: "Test fixture", shortDescription: "Test fixture", price: 1200,
  priceOnRequest: false, unitsPerCarton: 12, minimumOrderCartons: 2, stock: 4,
  lowStockThreshold: 2, allowBackorder: false, image: "/images/products/tissue.svg", gallery: [], attributes: [],
};

async function visit(page: Page, path: string) {
  await page.goto(path, { waitUntil: "domcontentloaded" });
  await expect(page.locator("main").first()).toBeVisible();
}
async function setTheme(page: Page, value: string) {
  await page.locator('.theme-switch select:visible').first().selectOption(value);
  await expect(page.locator("html")).toHaveAttribute("data-theme-preference", value);
}
async function seedCart(page: Page, quantity = 2, quote = false) {
  await visit(page, "/cart");
  await page.evaluate(({ product, quantity, quote }) => localStorage.setItem("pmh.cart.v1", JSON.stringify([{ product: { ...product, priceOnRequest: quote }, quantity }])), { product, quantity, quote });
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator(".cart-item")).toBeVisible();
}
async function fillCheckout(page: Page) {
  for (const [name, value] of Object.entries({ fullName: "UI Test", phone: "03001234567", email: "ui-test@example.test", companyName: "UI Test", city: "Lahore", address: "Test address" })) {
    await page.locator(`[name="${name}"]`).fill(value);
  }
  await page.locator('[name="province"]').selectOption("Punjab");
  await page.locator('input[type="checkbox"][required]').check();
}
async function noOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

test.beforeEach(async ({ page }) => {
  // No test sends an order, email, message or account mutation to a real service.
  await page.route("**/api/**", route => {
    if (["POST", "PATCH", "PUT", "DELETE"].includes(route.request().method())) return route.fulfill({ status: 503, json: { error: "UI test: service unavailable" } });
    return route.continue();
  });
  await page.route("**/api/settings/public", route => route.fulfill({ json: { settings: { whatsapp: "923001234567", bankTransferEnabled: false } } }));
});

for (const theme of ["light", "dark"] as const) {
  test.describe(theme, () => {
    test.use({ colorScheme: theme });

    test("system theme, manual override, reload and cross-tab sync", async ({ page, context }) => {
      await visit(page, "/");
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      const opposite = theme === "light" ? "dark" : "light";
      await setTheme(page, opposite);
      await page.reload({ waitUntil: "domcontentloaded" });
      await expect(page.locator("html")).toHaveAttribute("data-theme", opposite);
      await visit(page, "/shop");
      await expect(page.locator("html")).toHaveAttribute("data-theme", opposite);
      await page.emulateMedia({ colorScheme: opposite });
      await page.emulateMedia({ colorScheme: theme });
      await expect(page.locator("html")).toHaveAttribute("data-theme", opposite);
      const other = await context.newPage();
      await visit(other, "/cart");
      await expect(other.locator("html")).toHaveAttribute("data-theme", opposite);
      await setTheme(page, theme);
      await expect(other.locator("html")).toHaveAttribute("data-theme", theme);
      await setTheme(page, "system");
      await page.emulateMedia({ colorScheme: opposite });
      await expect(page.locator("html")).toHaveAttribute("data-theme", opposite);
      await other.close();
    });

    test("all public pages, 404s and admin login stay readable and fit the viewport", async ({ page, isMobile }) => {
      const errors: string[] = [];
      page.on("pageerror", error => errors.push(error.message));
      page.on("console", message => { if (message.type() === "error" && /hydrat|uncaught|Invalid regular expression/i.test(message.text())) errors.push(message.text()); });
      const paths = ["/", "/shop", "/shop/tissue-paper-products", "/search?q=tissue", "/product/pop-up", "/cart", "/checkout", "/login", "/register", "/forgot-password", "/account", "/request-quote", "/about", "/contact", "/corporate-orders", "/privacy", "/terms", "/returns", "/order-confirmation", "/missing-ui-test", "/shop/missing-ui-test", "/product/missing-ui-test", "/admin/login"];
      for (const path of paths) {
        await visit(page, path);
        await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
        await noOverflow(page);
        if (!path.startsWith("/admin")) {
          await expect(page.locator(".mobile-bottom-nav")).toBeVisible({ visible: isMobile });
        }
        const colors = await page.locator("body").evaluate(el => ({ scheme: getComputedStyle(el).colorScheme, bg: getComputedStyle(el).backgroundColor }));
        expect(colors.scheme, path).toBe(theme);
        expect(colors.bg, path).toBe(theme === "dark" ? "rgb(24, 36, 29)" : "rgb(255, 255, 255)");
      }
      expect(errors).toEqual([]);
    });

    test("catalog search, empty results, filters, sorting, layout and pagination", async ({ page, isMobile }) => {
      await visit(page, "/shop");
      const cards = page.locator(".catalog-products .product-card");
      await expect(cards.first()).toBeVisible();
      const title = (await cards.first().locator(".product-card-title").innerText()).trim();
      const query = page.locator(isMobile ? "#catalog-mobile-query" : "#desktop-catalog-search");
      await query.fill("no-such-ui-test-product");
      await expect(page.getByRole("heading", { name: "No matching products" })).toBeVisible();
      await query.fill(title);
      await expect(cards.first().locator(".product-card-title")).toContainText(title);
      await query.fill("");
      await expect(cards).toHaveCount(6);
      await page.getByRole("button", { name: "Load more products" }).click();
      await expect.poll(() => cards.count()).toBeGreaterThan(6);
      await page.getByRole("button", { name: "List view", exact: true }).click();
      await expect(cards.first()).toHaveClass(/product-card-list/);
      await noOverflow(page);
      await page.getByRole("button", { name: "Grid view", exact: true }).click();
      await page.getByRole("combobox", { name: "Sort by", exact: true }).selectOption("best-selling");
      if (isMobile) await page.locator(".catalog-mobile-filters summary").click();
      const prefix = isMobile ? "mobile" : "desktop";
      await page.locator(`#${prefix}-category`).selectOption("washroom-supplies");
      await expect(page.getByRole("heading", { name: "No matching products" })).toBeVisible();
      await page.locator(`#${prefix}-category`).selectOption("");
      await expect(cards.first()).toBeVisible();
    });

    test("product controls, quote pricing, WhatsApp number and desktop dialogs", async ({ page, isMobile }) => {
      await visit(page, "/product/pop-up");
      await expect(page.getByText("Price on request", { exact: true }).first()).toBeVisible();
      await expect(page.getByText("Rs 0", { exact: true })).toHaveCount(0);
      await page.getByRole("button", { name: "Increase cartons", exact: true }).click();
      await expect(page.locator("#product-quantity")).toHaveValue("2");
      await expect(page.getByRole("link", { name: "WhatsApp about Pop Up" })).toHaveAttribute("href", /wa.me\/923001234567/);
      await page.getByRole("button", { name: "Add to cart", exact: true }).click();
      await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("pmh.cart.v1") || "[]")[0]?.quantity)).toBe(2);
      if (isMobile) {
        await expect(page.locator(".mobile-cart-badge")).toHaveText("2");
        await expect(page.locator('.mobile-bottom-nav a[aria-current="page"]')).toHaveAttribute("href", "/shop");
      } else {
        await page.getByRole("button", { name: /Open bulk cart with 2 cartons/ }).click();
        const drawer = page.getByRole("dialog", { name: "Bulk carton cart" });
        await expect(drawer).toBeVisible();
        await page.keyboard.press("Escape");
        await expect(drawer).not.toBeVisible();
        await visit(page, "/shop");
        await page.getByRole("button", { name: "Quick view Pop Up", exact: true }).click();
        await expect(page.getByRole("dialog", { name: "Pop Up", exact: true })).toBeVisible();
        await page.getByRole("button", { name: "Close quick view" }).click();
        await expect(page.getByRole("dialog", { name: "Pop Up", exact: true })).not.toBeVisible();
      }
    });

    test("cart respects MOQ and stock, persists, removes and recovers from invalid storage", async ({ page }) => {
      await seedCart(page, 99);
      await expect(page.getByRole("button", { name: "Increase test tissue cartons cartons" })).toBeDisabled();
      await expect(page.locator("#cart-items-heading")).toHaveText("4 cartons");
      const decrease = page.getByRole("button", { name: "Decrease test tissue cartons cartons" });
      await decrease.click(); await decrease.click();
      await expect(decrease).toBeDisabled();
      await page.reload({ waitUntil: "domcontentloaded" });
      await expect(page.locator("#cart-items-heading")).toHaveText("2 cartons");
      await page.getByRole("button", { name: "Remove Test tissue cartons from cart" }).click();
      await expect(page.getByRole("heading", { name: "Your cart is empty" })).toBeVisible();
      await page.evaluate(() => localStorage.setItem("pmh.cart.v1", "invalid-json"));
      await page.reload({ waitUntil: "domcontentloaded" });
      await expect(page.getByRole("heading", { name: "Your cart is empty" })).toBeVisible();
    });

    test("checkout validates inputs, preserves cart on error and confirms a mocked successful order", async ({ page }) => {
      await seedCart(page, 2, true);
      await visit(page, "/checkout");
      let submissions = 0;
      await page.route("**/api/orders", route => { submissions++; return route.fulfill({ status: 503, json: { error: "Please try again shortly." } }); });
      await page.getByRole("button", { name: "Submit bulk order request" }).click();
      expect(submissions).toBe(0);
      await fillCheckout(page);
      await page.locator('[name="phone"]').fill("not a phone");
      expect(await page.locator('[name="phone"]').evaluate((el: HTMLInputElement) => el.checkValidity())).toBe(false);
      await page.locator('[name="phone"]').fill("03001234567");
      await page.getByRole("button", { name: "Submit bulk order request" }).click();
      await expect(page.locator("main").getByRole("alert")).toContainText("Please try again shortly.");
      await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("pmh.cart.v1") || "[]").length)).toBe(1);
      await page.route("**/api/orders", route => route.fulfill({ json: { order: { id: "UI-ORDER", orderNumber: "UI-ORDER", requiresQuote: true, createdAt: "2026-01-01T00:00:00Z" } } }));
      await page.getByRole("button", { name: "Submit bulk order request" }).click();
      await expect(page).toHaveURL(/order-confirmation\?order=UI-ORDER&mode=server/);
      await expect(page.getByRole("heading", { name: "Thank you for your order" })).toBeVisible();
      await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("pmh.cart.v1") || "[]").length)).toBe(0);
      await expect(page.getByText("Quote required", { exact: true })).toBeVisible();
    });

    test("login, registration validation, recovery and account errors", async ({ page }) => {
      await visit(page, "/login");
      await page.locator('[name="email"]').fill("ui-test@example.test");
      await page.locator('[name="password"]').fill("TestPassword123");
      await page.getByRole("button", { name: "Sign in", exact: true }).click();
      await expect(page.locator("main").getByRole("alert")).toContainText("UI test: service unavailable");
      await expect(page.getByRole("button", { name: "Sign in", exact: true })).toBeEnabled();
      await visit(page, "/register");
      await page.locator('[name="name"]').fill("UI Test");
      await page.locator('[name="email"]').fill("ui-test@example.test");
      await page.locator('[name="password"]').fill("TestPassword123");
      await page.locator('[name="confirmPassword"]').fill("DifferentPassword123");
      await page.getByRole("button", { name: "Create account", exact: true }).click();
      await expect(page.locator("main").getByRole("alert")).toContainText("confirmation does not match");
      await visit(page, "/forgot-password");
      await page.locator('[name="email"]').fill("ui-test@example.test");
      await page.locator('main button[type="submit"]').click();
      await expect(page.locator("main").getByRole("alert")).toContainText("UI test: service unavailable");
      await page.route("**/api/account", route => route.fulfill({ status: 401, json: {} }));
      await visit(page, "/account");
      await expect(page.getByRole("heading", { name: "Sign in for your customer account" })).toBeVisible();
      await page.route("**/api/account", route => route.fulfill({ status: 503, json: { error: "Temporarily unavailable" } }));
      await page.reload({ waitUntil: "domcontentloaded" });
      await expect(page.getByRole("heading", { name: "Customer account service unavailable" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Try again" })).toBeEnabled();
    });

    test("quote lines, required fields, failure and mocked success", async ({ page }) => {
      await visit(page, "/request-quote");
      await page.getByRole("button", { name: "Add product", exact: true }).click();
      await expect(page.getByRole("button", { name: "Remove requested product 2" })).toBeEnabled();
      await page.getByRole("button", { name: "Remove requested product 2" }).click();
      await expect(page.getByRole("button", { name: "Remove requested product 1" })).toBeDisabled();
      for (const [name, value] of Object.entries({ customerName: "UI Test", companyName: "Test company", phone: "03001234567", email: "ui-test@example.test", city: "Lahore" })) await page.locator(`[name="${name}"]`).fill(value);
      await page.getByRole("combobox", { name: /Product or requirement 1/ }).fill("Test tissue cartons");
      await page.getByRole("button", { name: "Send quote request" }).click();
      await expect(page.locator("main").getByRole("alert")).toContainText("UI test: service unavailable");
      await page.route("**/api/quotes", route => route.fulfill({ json: { quote: { id: "UI-QUOTE", createdAt: "2026-01-01T00:00:00Z" } } }));
      await page.getByRole("button", { name: "Send quote request" }).click();
      await expect(page.getByRole("status").filter({ hasText: "Quotation request received." })).toContainText("UI-QUOTE");
    });
  });
}

test("invalid preference and blocked storage still allow switching", async ({ page }) => {
  await page.addInitScript(key => {
    localStorage.setItem(key, "not-a-theme");
    Storage.prototype.setItem = () => { throw new DOMException("Blocked", "SecurityError"); };
    Storage.prototype.getItem = () => { throw new DOMException("Blocked", "SecurityError"); };
  }, themeKey);
  await visit(page, "/");
  await expect(page.locator("html")).toHaveAttribute("data-theme-preference", "system");
  await setTheme(page, "dark");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await setTheme(page, "light");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("saved dark theme is applied before hydration", async ({ page }) => {
  await page.addInitScript(key => localStorage.setItem(key, "dark"), themeKey);
  await page.route(/\/_next\/.*\.js(?:\?|$)/, route => route.abort());
  await page.goto("/cart", { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("body")).toHaveCSS("color-scheme", "dark");
});

test("responsive breakpoints and readable theme colors", async ({ page, isMobile }) => {
  for (const theme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme: theme });
    for (const path of ["/", "/shop", "/cart", "/checkout", "/product/pop-up", "/login"]) {
      await visit(page, path);
      for (const width of isMobile ? [320, 390, 767] : [768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await noOverflow(page);
        await expect(page.locator(".mobile-bottom-nav")).toBeVisible({ visible: width < 768 });
      }
      const lowContrast = await page.evaluate(() => {
        function rgb(value: string) {
          const channels = (value.match(/[\d.]+/g) || []).map(Number);
          return value.startsWith("color(srgb ") ? channels.map((v, i) => i < 3 ? v * 255 : v) : channels;
        }
        function luminance(color: number[]) {
          const linear = color.slice(0, 3).map(v => { v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; });
          return .2126 * linear[0] + .7152 * linear[1] + .0722 * linear[2];
        }
        return [...document.querySelectorAll<HTMLElement>('main h1, main h2, main label, main .commerce-button, main .mobile-add-to-cart, .mobile-nav-item')].flatMap(el => {
          if (!el.getBoundingClientRect().width || el.closest('[aria-hidden="true"]') || el.closest('button:disabled')) return [];
          const style = getComputedStyle(el);
          let ancestor: HTMLElement | null = el;
          let background: number[] = [];
          while (ancestor) {
            const parentStyle = getComputedStyle(ancestor);
            // Gradients and photograph overlays are inspected in screenshots.
            if (parentStyle.backgroundImage !== "none") return [];
            background = rgb(parentStyle.backgroundColor);
            if (background.length === 3 || background[3] >= .95) break;
            ancestor = ancestor.parentElement;
          }
          if (!ancestor) return [];
          const foreground = luminance(rgb(style.color));
          const back = luminance(background);
          const ratio = (Math.max(foreground, back) + .05) / (Math.min(foreground, back) + .05);
          const large = parseFloat(style.fontSize) >= 24 || (parseFloat(style.fontSize) >= 18.66 && Number(style.fontWeight) >= 700);
          return ratio + .05 < (large ? 3 : 4.5) ? [{ text: el.textContent?.trim().slice(0, 65), ratio: ratio.toFixed(2) }] : [];
        });
      });
      expect(lowContrast, `${theme} ${path}`).toEqual([]);
    }
  }
});
