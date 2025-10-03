import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  getFeatureFlagsConfig,
  getIntegrationConfig,
  getPricingConfig,
} from "@/lib/server/platform-settings";
import { refreshSettingsCache, toggleModuleAction, updateIntegrationAction, updatePlanAction } from "./actions";

export default async function AdminSettingsPage() {
  const [pricingConfig, featureConfig, integrations] = await Promise.all([
    getPricingConfig(),
    getFeatureFlagsConfig(),
    getIntegrationConfig(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Platform settings</h1>
        <p className="text-sm text-muted-foreground">
          Configure pricing, feature flags, and payment integrations for the entire SaaS platform.
        </p>
      </header>
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle>Pricing plans</CardTitle>
            <CardDescription>Update how plans are presented and billed.</CardDescription>
          </div>
          <form action={refreshSettingsCache}>
            <Button type="submit" variant="outline" size="sm">
              Refresh
            </Button>
          </form>
        </CardHeader>
        <CardContent className="space-y-6">
          {pricingConfig.plans.map((plan) => (
            <form key={plan.id} action={updatePlanAction} className="grid gap-4 rounded-lg border p-4 sm:grid-cols-5">
              <input type="hidden" name="planId" value={plan.id} />
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Name
                </label>
                <Input name="name" defaultValue={plan.name} required />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Price
                </label>
                <Input name="price" type="number" min="0" step="0.01" defaultValue={plan.price} required />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Currency
                </label>
                <Input name="currency" defaultValue={plan.currency} required />
              </div>
              <div className="flex items-end justify-end">
                <Button type="submit">Save</Button>
              </div>
              <div className="sm:col-span-5 text-xs text-muted-foreground">
                Features: {plan.features.join(", ")}
              </div>
            </form>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Feature flags</CardTitle>
          <CardDescription>Toggle modules on or off globally.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(featureConfig.modules).map(([moduleKey, module]) => (
            <form key={moduleKey} action={toggleModuleAction} className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">{module.displayName}</h3>
                <p className="text-xs text-muted-foreground">{module.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <input type="hidden" name="moduleKey" value={moduleKey} />
                <input type="hidden" name="enabled" value={(!module.enabled).toString()} />
                <Button type="submit" variant={module.enabled ? "destructive" : "secondary"}>
                  {module.enabled ? "Disable" : "Enable"}
                </Button>
              </div>
            </form>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
          <CardDescription>Manage credentials for billing providers.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(integrations).map(([provider, settings]) => (
            <form key={provider} action={updateIntegrationAction} className="space-y-4 rounded-lg border p-4">
              <input type="hidden" name="provider" value={provider} />
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">{provider}</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {Object.entries(settings).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground" htmlFor={`${provider}-${key}`}>
                      {key}
                    </label>
                    <Input id={`${provider}-${key}`} name={key} defaultValue={typeof value === "string" ? value : String(value ?? "")} />
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <Button type="submit">Save integration</Button>
              </div>
            </form>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
