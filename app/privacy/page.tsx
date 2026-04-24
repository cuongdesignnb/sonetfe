import { PageContent } from "@/components/page-content";
import { fetchPagesSettings } from "@/lib/page-settings";

export default async function PrivacyPage() {
  const pages = await fetchPagesSettings();
  const page = pages.privacy;

  return (
    <PageContent
      title={page.title}
      subtitle={page.subtitle}
      content={page.content}
    />
  );
}
