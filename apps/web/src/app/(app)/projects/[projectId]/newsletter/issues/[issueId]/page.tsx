import { notFound } from "next/navigation";
import type { SearchParams } from "nuqs/server";
import { NewsletterIssueEditor } from "@/app/projects/[projectId]/newsletter/issues/issue-editor";
import { loadIssueEditorSearchParams } from "@/app/projects/[projectId]/newsletter/issues/search-params";
import { CoreApiRequestError } from "@/lib/clients/core.client";
import { newsletterService } from "@/lib/services/newsletter.service";

export const instant = false;

export default async function NewsletterIssuePage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string; issueId: string }>;
  searchParams: Promise<SearchParams>;
}) {
  if (!(await newsletterService.isEnabled())) notFound();
  const { projectId, issueId } = await params;
  const { draftedBySokoBot } = await loadIssueEditorSearchParams(searchParams);
  const [issue, subscribers, newsletter] = await Promise.all([
    newsletterService.getIssue(projectId, issueId),
    newsletterService.listSubscribers(projectId, {
      limit: 1,
      status: "ACTIVE",
    }),
    newsletterService.getSettings(projectId),
  ]);
  if (!issue || !newsletter) notFound();
  const analytics =
    issue.status === "SENT"
      ? await newsletterService
          .getIssueAnalytics(projectId, issueId)
          .catch((error: unknown) => {
            if (error instanceof CoreApiRequestError && error.status === 404)
              notFound();
            throw error;
          })
      : null;
  return (
    <NewsletterIssueEditor
      key={issue.id}
      issue={issue}
      projectId={projectId}
      activeSubscribers={subscribers.data.counts.ACTIVE}
      newsletterSlug={newsletter.publicSlug}
      analytics={analytics}
      draftedBySokoBot={draftedBySokoBot}
    />
  );
}
