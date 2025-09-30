import features from "@config/features.json";

export type FeatureConfig = {
  modules: Record<
    string,
    {
      enabled: boolean;
      displayName: string;
      description: string;
    }
  >;
  billing: {
    provider: string;
  };
};

const FEATURE_CONFIG: FeatureConfig = features;

export { FEATURE_CONFIG };
export type ModuleKey = keyof FeatureConfig["modules"];

export function isFeatureEnabled(module: ModuleKey): boolean {
  return Boolean(FEATURE_CONFIG.modules[module]?.enabled);
}

export function getEnabledModules() {
  return (Object.keys(FEATURE_CONFIG.modules) as ModuleKey[]).filter((key) =>
    isFeatureEnabled(key),
  );
}

export function getModuleCopy(module: ModuleKey) {
  const data = FEATURE_CONFIG.modules[module];
  if (!data) {
    throw new Error(`Unknown module: ${module}`);
  }
  return data;
}

export function getBillingProvider(): string {
  return FEATURE_CONFIG.billing.provider;
}
