import { notFound } from "next/navigation";
import { NewsletterIssueEditor } from "@/app/projects/[projectId]/newsletter/issues/issue-editor";
import { newsletterService } from "@/lib/services/newsletter.service";

export const instant = false;

export default async function NewsletterIssuePage({
  params,
}: {
  params: Promise<{ projectId: string; issueId: string }>;
}) {
  if (!(await newsletterService.isEnabled())) notFound();
  const { projectId, issueId } = await params;
  const issue = await newsletterService.getIssue(projectId, issueId);
  if (!issue) notFound();
  // After the issue check, so a missing project shows not found, not an error.
  const [subscribers, newsletter] = await Promise.all([
    newsletterService.listSubscribers(projectId, {
      limit: 1,
      status: "ACTIVE",
    }),
    newsletterService.getSettings(projectId),
  ]);
  if (!newsletter) notFound();
  return (
    <NewsletterIssueEditor
      key={issue.id}
      issue={issue}
      projectId={projectId}
      activeSubscribers={subscribers.data.counts.ACTIVE}
      newsletterSlug={newsletter.publicSlug}
    />
  );
}
