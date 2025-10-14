import { test, type APIRequestContext } from "@playwright/test";

export const BASE_URL = process.env.E2E_BASE_URL ?? "http://127.0.0.1:3000";

export async function ensureApplicationIsReachable(
  request: APIRequestContext,
  contextLabel: string,
) {
  try {
    await request.get(BASE_URL, { timeout: 5_000, failOnStatusCode: false });
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    test.skip(true, `${contextLabel} requires a running application at ${BASE_URL}. ${reason}`);
  }
}
