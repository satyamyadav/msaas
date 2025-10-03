import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const featuresPath = path.join(rootDir, "config", "features.json");
const pricingPath = path.join(rootDir, "config", "pricing.json");
const integrationsPath = path.join(rootDir, "config", "integrations.json");

async function readJsonFile<T>(filePath: string): Promise<T> {
  const data = await readFile(filePath, "utf8");
  return JSON.parse(data) as T;
}

async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
  await writeFile(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
}

export type PricingPlan = {
  id: string;
  name: string;
  price: number;
  currency: string;
  features: string[];
};

export type PricingConfig = {
  plans: PricingPlan[];
};

export async function getPricingConfig(): Promise<PricingConfig> {
  return readJsonFile<PricingConfig>(pricingPath);
}

export async function updatePricingConfig(plans: PricingPlan[]): Promise<PricingConfig> {
  const nextConfig: PricingConfig = { plans };
  await writeJsonFile(pricingPath, nextConfig);
  return nextConfig;
}

export type FeatureFlagsConfig = {
  modules: Record<string, { enabled: boolean; displayName: string; description: string }>;
  billing: { provider: string };
};

export async function getFeatureFlagsConfig(): Promise<FeatureFlagsConfig> {
  return readJsonFile<FeatureFlagsConfig>(featuresPath);
}

export async function updateFeatureFlag(moduleKey: string, enabled: boolean): Promise<FeatureFlagsConfig> {
  const config = await getFeatureFlagsConfig();
  if (!config.modules[moduleKey]) {
    throw new Error(`MODULE_NOT_FOUND:${moduleKey}`);
  }
  config.modules[moduleKey].enabled = enabled;
  await writeJsonFile(featuresPath, config);
  return config;
}

export type IntegrationConfig = Record<string, Record<string, unknown>>;

export async function getIntegrationConfig(): Promise<IntegrationConfig> {
  return readJsonFile<IntegrationConfig>(integrationsPath);
}

export async function updateIntegrationConfig(provider: string, payload: Record<string, unknown>): Promise<IntegrationConfig> {
  const config = await getIntegrationConfig();
  if (!config[provider]) {
    throw new Error(`INTEGRATION_NOT_FOUND:${provider}`);
  }
  config[provider] = { ...config[provider], ...payload };
  await writeJsonFile(integrationsPath, config);
  return config;
}
