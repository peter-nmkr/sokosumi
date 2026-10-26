import { SOCIAL_BETA_ORGANIZATION_SLUG } from "@sokosumi/utils";

import { getEnv } from "@/config/env";
import { notFound } from "@/helpers/error";
import prisma from "@/lib/db/prisma";

export const NEWSLETTER_BETA_WORKSPACE_WHERE = {
  organization: { slug: SOCIAL_BETA_ORGANIZATION_SLUG },
};

export function isNewsletterEnabled(): boolean {
  return getEnv().NEWSLETTER_ENABLED;
}

export async function isNewsletterWorkspaceEnabled(
  workspaceId: string | null | undefined,
): Promise<boolean> {
  if (!isNewsletterEnabled() || !workspaceId) return false;
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { organization: { select: { slug: true } } },
  });
  return (
    workspace?.organization?.slug ===
    NEWSLETTER_BETA_WORKSPACE_WHERE.organization.slug
  );
}

export async function assertNewsletterWorkspaceEnabled(
  workspaceId: string | null | undefined,
): Promise<void> {
  if (!(await isNewsletterWorkspaceEnabled(workspaceId))) {
    throw notFound("Newsletter is not enabled");
  }
}

export function assertNewsletterEnabled(): void {
  if (!isNewsletterEnabled()) {
    throw notFound("Newsletter is not enabled");
  }
}
