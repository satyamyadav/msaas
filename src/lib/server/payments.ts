import { prisma } from "@/lib/db";
import { getPricingConfig } from "./platform-settings";

export type PaymentRecord = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: Date;
  customer?: string;
  description?: string;
};

export type PaymentsOverview = {
  transactions: PaymentRecord[];
  invoices: PaymentRecord[];
  refunds: PaymentRecord[];
};

const STRIPE_API_BASE = "https://api.stripe.com/v1";

async function fetchStripe(endpoint: string, apiKey: string) {
  const response = await fetch(`${STRIPE_API_BASE}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Stripe API error: ${response.status}`);
  }

  return (await response.json()) as { data?: StripeResource[] };
}

type StripeResource = {
  id: string;
  amount?: number;
  amount_paid?: number;
  amount_refunded?: number;
  currency?: string;
  status?: string;
  created?: number;
  customer?: string;
  description?: string;
};

function convertStripeRecords(records: StripeResource[] | undefined): PaymentRecord[] {
  if (!records) {
    return [];
  }
  return records.map((record) => ({
    id: record.id,
    amount: (record.amount_paid ?? record.amount ?? record.amount_refunded ?? 0) / 100,
    currency: (record.currency ?? "usd").toUpperCase(),
    status: record.status ?? "unknown",
    createdAt: new Date((record.created ?? 0) * 1000),
    customer: record.customer,
    description: record.description,
  }));
}

async function buildFallbackPayments(): Promise<PaymentsOverview> {
  const [pricingConfig, subscriptions] = await Promise.all([
    getPricingConfig(),
    prisma.billingSubscription.findMany({
      include: { organization: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  const planPriceMap = new Map<string, { amount: number; currency: string }>();
  pricingConfig.plans.forEach((plan) => {
    planPriceMap.set(plan.id.toUpperCase(), { amount: plan.price, currency: plan.currency });
  });

  const transactions = subscriptions.map((subscription) => {
    const plan = planPriceMap.get(subscription.planTier.toString()) ?? { amount: 0, currency: "USD" };
    return {
      id: subscription.id,
      amount: plan.amount,
      currency: plan.currency,
      status: subscription.status,
      createdAt: subscription.createdAt,
      customer: subscription.customerId,
      description: `${subscription.organization.name} • ${subscription.planTier} plan`,
    } satisfies PaymentRecord;
  });

  return {
    transactions,
    invoices: transactions,
    refunds: [],
  };
}

export async function getPaymentsOverview(): Promise<PaymentsOverview> {
  const stripeApiKey = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_API_KEY;
  if (!stripeApiKey) {
    return buildFallbackPayments();
  }

  try {
    const [charges, invoices, refunds] = await Promise.all([
      fetchStripe("/payment_intents?limit=10", stripeApiKey),
      fetchStripe("/invoices?limit=10", stripeApiKey),
      fetchStripe("/refunds?limit=10", stripeApiKey),
    ]);

    const overview: PaymentsOverview = {
      transactions: convertStripeRecords(charges.data),
      invoices: convertStripeRecords(invoices.data),
      refunds: convertStripeRecords(refunds.data),
    };

    if (overview.transactions.length === 0 && overview.invoices.length === 0 && overview.refunds.length === 0) {
      return buildFallbackPayments();
    }

    return overview;
  } catch (error) {
    console.error("Failed to fetch Stripe data", error);
    return buildFallbackPayments();
  }
}
