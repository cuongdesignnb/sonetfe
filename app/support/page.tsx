import { PageContent } from "@/components/page-content";
import { fetchPagesSettings } from "@/lib/page-settings";

export default async function SupportPage() {
  const pages = await fetchPagesSettings();
  const page = pages.support;

  return (
    <PageContent
      title={page.title}
      subtitle={page.subtitle}
      content={page.content}
    />
  );
}
