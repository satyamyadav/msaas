import { test, expect } from "@playwright/test";

import { BASE_URL, ensureApplicationIsReachable } from "./test-helpers";

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD;

test.describe("end-to-end customer flows", () => {
  test.beforeAll(async ({ request }) => {
    await ensureApplicationIsReachable(request, "Customer flow coverage");
  });

  test("new customer can onboard and manage a workspace", async ({ page }) => {
    const uniqueSuffix = Date.now().toString(36);
    const email = `e2e-${uniqueSuffix}@example.com`;
    const password = `Password!${uniqueSuffix}`;
    const fullName = "E2E Tester";
    const organizationName = `E2E Workspace ${uniqueSuffix}`;
    const linkSlug = `launch-${uniqueSuffix}`;
    const destinationUrl = `https://example.com/campaign-${uniqueSuffix}`;
    const linkTags = "launch, marketing";
    const customDomain = `links-${uniqueSuffix}.example.com`;
    const apiKeyLabel = `Automation ${uniqueSuffix}`;
    const inviteEmail = `teammate-${uniqueSuffix}@example.com`;

    let workspaceSlug = "";

    await test.step("visit marketing site and start signup", async () => {
      await page.goto(BASE_URL);
      await expect(page.getByText("Simplify Your Links, Amplify Your Reach")).toBeVisible();
      await page.getByRole("link", { name: "Get Started for Free" }).click();
      await expect(page).toHaveURL(/\/sign-in/);
    });

    await test.step("register a new account and workspace", async () => {
      await expect(page.getByText("Create your workspace")).toBeVisible();
      await page.getByLabel("Email").fill(email);
      await page.getByLabel("Password").fill(password);
      await page.getByLabel("Confirm password").fill(password);
      await page.getByLabel("Full name").fill(fullName);
      await page.getByLabel("Organization name").fill(organizationName);
      await page.getByRole("button", { name: "Create account" }).click();
      await page.waitForURL(/\/app\/[a-z0-9-]+$/i);
      const url = new URL(page.url());
      const segments = url.pathname.split("/");
      workspaceSlug = segments[2] ?? "";
      expect(workspaceSlug).toBeTruthy();
      await expect(page.getByText("Launch checklist")).toBeVisible();
    });

    await test.step("create the first short link", async () => {
      await page.getByRole("link", { name: "Links", exact: true }).click();
      await expect(page.getByText("Create short link")).toBeVisible();
      await page.getByLabel("Destination URL").fill(destinationUrl);
      await page.getByLabel("Custom slug").fill(linkSlug);
      await page.getByLabel("Tags").fill(linkTags);
      await page.getByRole("button", { name: "Create short link" }).click();
      await expect(page.getByRole("alert").filter({ hasText: "Link ready" })).toContainText("Short link created.");
      await page.reload();
      await expect(page.getByRole("cell", { name: linkSlug })).toBeVisible();
      await expect(page.getByRole("cell", { name: destinationUrl, exact: false })).toBeVisible();
    });

    await test.step("review analytics", async () => {
      await page.getByRole("link", { name: "Analytics" }).click();
      await expect(page.getByText("Traffic timeline")).toBeVisible();
      await expect(page.getByText("Top referrers")).toBeVisible();
      await expect(page.getByText("Top countries")).toBeVisible();
    });

    await test.step("update workspace profile", async () => {
      await page.getByRole("link", { name: "Settings" }).click();
      await expect(page.getByText("Workspace settings")).toBeVisible();
      const updatedName = `${organizationName} Updated`;
      await page.getByLabel("Workspace name").fill(updatedName);
      await page.getByLabel("Primary domain").fill(`${workspaceSlug}.msaastemplate.dev`);
      await page.getByRole("button", { name: "Save changes" }).click();
      await expect(page.getByRole("alert").filter({ hasText: "Workspace updated" })).toContainText("Workspace updated.");
    });

    await test.step("request a custom domain", async () => {
      await page.getByRole("link", { name: "Domains" }).click();
      await expect(page.getByText("Custom domains")).toBeVisible();
      await page.getByLabel("Custom domain").fill(customDomain);
      await page.getByRole("button", { name: "Request domain" }).click();
      await expect(page.getByRole("alert").filter({ hasText: "Domain registered" })).toContainText("Domain request saved.");
      await page.reload();
      await expect(page.getByText(customDomain)).toBeVisible();
    });

    await test.step("create an API key", async () => {
      await page.getByRole("link", { name: "API Keys" }).click();
      await expect(page.getByText("API keys")).toBeVisible();
      await page.getByLabel("Key label").fill(apiKeyLabel);
      await page.getByRole("button", { name: "Generate key" }).click();
      const apiKeyAlert = page.getByRole("alert").filter({ hasText: "API key generated" });
      await expect(apiKeyAlert).toBeVisible();
      const secretText = await apiKeyAlert.locator("code").innerText();
      expect(secretText).toMatch(/^msa_/);
      await page.reload();
      await expect(page.getByText(apiKeyLabel)).toBeVisible();
    });

    await test.step("invite a teammate", async () => {
      await page.getByRole("link", { name: "Members" }).click();
      await expect(page.getByText("Workspace members")).toBeVisible();
      await page.getByLabel("Email").fill(inviteEmail);
      await page.getByRole("button", { name: "Send invite" }).click();
      await expect(page.getByRole("alert").filter({ hasText: "Invite sent" })).toContainText("Invitation sent.");
      await page.reload();
      await expect(page.getByText(inviteEmail)).toBeVisible();
    });

    await test.step("sign out and sign back in", async () => {
      await page.getByRole("button", { name: "Sign out" }).click();
      await page.waitForURL((url) => url.pathname === "/" || url.pathname === "");
      await expect(page.getByRole("link", { name: "Log In" })).toBeVisible();
      await page.getByRole("link", { name: "Log In" }).click();
      await page.getByLabel("Email").fill(email);
      await page.getByLabel("Password").fill(password);
      await page.getByRole("button", { name: "Continue" }).click();
      await page.waitForURL(/\/app\//);
      await expect(page.getByText("Launch checklist")).toBeVisible();
    });
  });
});

test.describe("end-to-end admin flows", () => {
  test.beforeAll(async ({ request }) => {
    await ensureApplicationIsReachable(request, "Admin flow coverage");
  });

  test.skip(!ADMIN_EMAIL || !ADMIN_PASSWORD, "E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD must be configured");

  test("platform admin can audit and configure the platform", async ({ page }) => {
    await test.step("sign in to the admin console", async () => {
      await page.goto(`${BASE_URL}/sign-in?mode=login&redirectTo=%2Fadmin`);
      await expect(page.getByLabel("Email")).toBeVisible();
      await page.getByLabel("Email").fill(ADMIN_EMAIL!);
      await page.getByLabel("Password").fill(ADMIN_PASSWORD!);
      await page.getByRole("button", { name: "Continue" }).click();
      await page.waitForURL(/\/admin(\/)?$/);
      await expect(page.getByText(/Control center/i)).toBeVisible();
      await expect(page.getByRole("heading", { name: "Platform overview" })).toBeVisible();
      await expect(page.getByText("Monthly recurring revenue")).toBeVisible();
      await expect(page.getByText("Platform admins")).toBeVisible();
    });

    await test.step("review organizations directory", async () => {
      await page.getByRole("link", { name: "Organizations" }).click();
      await page.waitForURL(/\/admin\/orgs/);
      await expect(page.getByRole("heading", { name: "Organizations" })).toBeVisible();
      await expect(page.getByPlaceholder("Search by name or slug")).toBeVisible();
      await expect(page.getByRole("columnheader", { name: "Name" })).toBeVisible();
      await expect(page.getByRole("columnheader", { name: "Status" })).toBeVisible();
    });

    await test.step("inspect platform users", async () => {
      await page.getByRole("link", { name: "Users" }).click();
      await page.waitForURL(/\/admin\/users/);
      await expect(page.getByRole("heading", { name: "Users" })).toBeVisible();
      await expect(page.getByPlaceholder("Search by email or name")).toBeVisible();
      await expect(page.getByRole("columnheader", { name: "Role" })).toBeVisible();
      await expect(page.getByRole("columnheader", { name: "Status" })).toBeVisible();
    });

    await test.step("monitor payments activity", async () => {
      await page.getByRole("link", { name: "Payments" }).click();
      await page.waitForURL(/\/admin\/payments/);
      await expect(page.getByRole("heading", { name: "Payments" })).toBeVisible();
      await expect(page.getByText("Transactions", { exact: true })).toBeVisible();
      await expect(page.getByText("Invoices", { exact: true })).toBeVisible();
      await expect(page.getByText("Refunds", { exact: true })).toBeVisible();
    });

    await test.step("manage platform settings", async () => {
      await page.getByRole("link", { name: "Settings" }).click();
      await page.waitForURL(/\/admin\/settings/);
      await expect(page.getByRole("heading", { name: "Platform settings" })).toBeVisible();
      await expect(page.getByText("Pricing plans", { exact: true })).toBeVisible();
      await expect(page.getByRole("button", { name: "Refresh" })).toBeVisible();
      await expect(page.getByText("Feature flags", { exact: true })).toBeVisible();
      await expect(page.getByText("Integrations", { exact: true })).toBeVisible();
    });

    await test.step("audit system logs", async () => {
      await page.getByRole("link", { name: "Logs" }).click();
      await page.waitForURL(/\/admin\/logs/);
      await expect(page.getByRole("heading", { name: "System logs" })).toBeVisible();
      await expect(page.getByText("Audit trail", { exact: true })).toBeVisible();
      await expect(page.getByRole("link", { name: "Previous" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Next" })).toBeVisible();
    });
  });
});
