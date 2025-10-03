"use server";

import { revalidatePath } from "next/cache";

import { requireAdminUser } from "@/lib/server/admin-auth";
import {
  getFeatureFlagsConfig,
  getIntegrationConfig,
  getPricingConfig,
  updateFeatureFlag,
  updateIntegrationConfig,
  updatePricingConfig,
} from "@/lib/server/platform-settings";

export async function updatePlanAction(formData: FormData) {
  await requireAdminUser();
  const planId = formData.get("planId");
  const name = formData.get("name");
  const priceValue = formData.get("price");
  const currency = formData.get("currency");

  if (typeof planId !== "string" || !planId) {
    throw new Error("PLAN_ID_REQUIRED");
  }

  if (typeof name !== "string" || !name) {
    throw new Error("PLAN_NAME_REQUIRED");
  }

  const price = Number(priceValue);
  if (!Number.isFinite(price) || price < 0) {
    throw new Error("INVALID_PRICE");
  }

  const pricing = await getPricingConfig();
  const plans = pricing.plans.map((plan) =>
    plan.id === planId
      ? {
          ...plan,
          name,
          price,
          currency:
            typeof currency === "string" && currency ? currency.toUpperCase() : plan.currency,
        }
      : plan
  );
  await updatePricingConfig(plans);
  revalidatePath("/admin/settings");
}

export async function toggleModuleAction(formData: FormData) {
  await requireAdminUser();
  const moduleKey = formData.get("moduleKey");
  const enabledValue = formData.get("enabled");
  if (typeof moduleKey !== "string" || !moduleKey) {
    throw new Error("MODULE_KEY_REQUIRED");
  }
  const enabled = enabledValue === "true";
  await updateFeatureFlag(moduleKey, enabled);
  revalidatePath("/admin/settings");
}

export async function updateIntegrationAction(formData: FormData) {
  await requireAdminUser();
  const provider = formData.get("provider");
  if (typeof provider !== "string" || !provider) {
    throw new Error("PROVIDER_REQUIRED");
  }

  const payload: Record<string, unknown> = {};
  formData.forEach((value, key) => {
    if (key === "provider") {
      return;
    }
    payload[key] = typeof value === "string" ? value : value.toString();
  });

  await updateIntegrationConfig(provider, payload);
  revalidatePath("/admin/settings");
}

export async function refreshSettingsCache() {
  await requireAdminUser();
  await Promise.all([getFeatureFlagsConfig(), getPricingConfig(), getIntegrationConfig()]);
  revalidatePath("/admin/settings");
}
