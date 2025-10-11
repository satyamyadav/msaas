import { expect, test } from "@playwright/test";

import { BASE_URL, ensureApplicationIsReachable } from "./test-helpers";

test.describe("public link health", () => {
  test.beforeAll(async ({ request }) => {
    await ensureApplicationIsReachable(request, "Link health checks");
  });

  test("marketing and auth pages respond without link errors", async ({ page, request }) => {
    const baseOrigin = new URL(BASE_URL).origin;
    const visitedPages = new Set<string>();
    const seedPages = [
      BASE_URL,
      `${BASE_URL}/pricing`,
      `${BASE_URL}/sign-in`,
      `${BASE_URL}/sign-in?mode=register`,
      `${BASE_URL}/docs/getting-started`,
      `${BASE_URL}/docs/workspaces`,
      `${BASE_URL}/docs/ejection`,
    ];
    const queuedPages: string[] = Array.from(new Set(seedPages));
    const checkedLinks = new Set<string>();

    const shouldCrawl = (url: URL) => {
      if (url.origin !== baseOrigin) {
        return false;
      }
      const pathname = url.pathname;
      if (pathname.startsWith("/app") || pathname.startsWith("/admin")) {
        return false;
      }
      if (pathname.startsWith("/api")) {
        return false;
      }
      return true;
    };

    while (queuedPages.length > 0) {
      const target = queuedPages.shift();
      if (!target || visitedPages.has(target)) {
        continue;
      }
      visitedPages.add(target);

      const navigationResponse = await page.goto(target, { waitUntil: "domcontentloaded" });
      const status = navigationResponse?.status();
      expect.soft(status ?? 200, `Page ${target} should load without error`).toBeLessThan(400);

      const hrefs = await page.$$eval("a[href]", (anchors) =>
        anchors
          .map((anchor) => anchor.getAttribute("href"))
          .filter((href): href is string => Boolean(href && href.trim().length > 0)),
      );

      for (const rawHref of hrefs) {
        const trimmed = rawHref.trim();
        if (trimmed.startsWith("#")) {
          continue;
        }
        if (trimmed.startsWith("mailto:")) {
          continue;
        }
        if (trimmed.startsWith("tel:")) {
          continue;
        }
        if (trimmed.startsWith("javascript:")) {
          continue;
        }

        let absoluteUrl: URL;
        try {
          absoluteUrl = new URL(trimmed, target);
        } catch (error) {
          throw new Error(`Encountered invalid URL "${trimmed}" on ${target}: ${String(error)}`);
        }

        if (absoluteUrl.origin !== baseOrigin) {
          continue;
        }

        const absolute = absoluteUrl.toString();
        if (!checkedLinks.has(absolute)) {
          checkedLinks.add(absolute);
          const response = await request.get(absolute, { failOnStatusCode: false });
          expect.soft(
            response.status(),
            `Link ${trimmed} discovered on ${target} should return a success status code`,
          ).toBeLessThan(400);
        }

        if (shouldCrawl(absoluteUrl) && !visitedPages.has(absolute)) {
          queuedPages.push(absolute);
        }
      }
    }
  });
});
