import { createHash, randomBytes } from "crypto";

import { prisma } from "@lib/db";

import { recordOrganizationActivity } from "./organizations";

type CreateApiKeyInput = {
  organizationId: string;
  actorMembershipId?: string | null;
  label: string;
};

type ApiKeyResult = {
  id: string;
  secret: string;
};

function generateSecret() {
  const bytes = randomBytes(24).toString("base64url");
  return `msa_${bytes}`;
}

function derivePrefix(secret: string) {
  return secret.slice(0, 8);
}

function hashSecret(secret: string) {
  return createHash("sha256").update(secret).digest("hex");
}

export async function createApiKey({ organizationId, actorMembershipId, label }: CreateApiKeyInput): Promise<ApiKeyResult> {
  const secret = generateSecret();
  const prefix = derivePrefix(secret);
  const key = await prisma.apiKey.create({
    data: {
      organizationId,
      name: label,
      createdById: actorMembershipId ?? undefined,
      prefix,
      keyHash: hashSecret(secret),
    },
  });

  await recordOrganizationActivity(organizationId, actorMembershipId ?? null, "api_key.created", `API key created: ${label}`);

  return {
    id: key.id,
    secret,
  };
}

export async function revokeApiKey(apiKeyId: string, actorMembershipId?: string | null) {
  const apiKey = await prisma.apiKey.update({
    where: { id: apiKeyId },
    data: {
      revokedAt: new Date(),
    },
  });

  await recordOrganizationActivity(apiKey.organizationId, actorMembershipId ?? null, "api_key.revoked", `API key revoked: ${apiKey.name}`);
}

export function listApiKeys(organizationId: string) {
  return prisma.apiKey.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
  });
}

export async function touchApiKeyUsage(prefix: string) {
  await prisma.apiKey.updateMany({
    where: {
      prefix,
      revokedAt: null,
    },
    data: {
      lastUsedAt: new Date(),
    },
  });
}
