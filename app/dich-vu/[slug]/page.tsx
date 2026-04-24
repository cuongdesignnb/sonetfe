import Link from "next/link";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { resolveAssetUrl } from "@/lib/asset-url";
import Image from "next/image";

const isServer = typeof window === "undefined";
const API_BASE = isServer
  ? process.env.INTERNAL_API_URL || "https://admin.phamanhchien.vn/api"
  : process.env.NEXT_PUBLIC_API_URL || "https://admin.phamanhchien.vn/api";

type ServiceCategory = {
  id: number;
  name: string;
  slug: string;
};

type ServicePost = {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  featured_image?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string | null;
  published_at?: string | null;
  category?: ServiceCategory | null;
};

type ServiceDetailResponse = {
  post: ServicePost;
  related?: ServicePost[];
};

async function getPost(slug: string): Promise<ServiceDetailResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/services/${slug}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as ServiceDetailResponse;
    if (!json?.post) return null;
    return {
      post: json.post,
      related: Array.isArray(json.related) ? json.related : [],
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const detail = await getPost(params.slug);
  const post = detail?.post;
  if (!post) return { title: "Dịch vụ" };

  return {
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt || post.title,
    keywords: post.meta_keywords || undefined,
  };
}

export const dynamic = "force-dynamic";

export default async function ServiceDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const detail = await getPost(params.slug);
  const post = detail?.post;
  const related = detail?.related || [];

  if (!post) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold">Không tìm thấy dịch vụ</h1>
        <div className="mt-4">
          <Button asChild variant="outline">
            <Link href="/dich-vu">Quay lại Dịch vụ</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,2.5fr)_minmax(0,1fr)]">
        <div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Link
                href="/dich-vu"
                className="text-sm text-muted-foreground hover:underline"
              >
                Dịch vụ
              </Link>
              <span className="text-sm text-muted-foreground">/</span>
              <span className="text-sm text-muted-foreground">
                {post.title}
              </span>
            </div>
            <h1 className="text-3xl font-bold">{post.title}</h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              {post.category?.name && (
                <Badge variant="outline">{post.category.name}</Badge>
              )}
              {post.published_at && (
                <span>{new Date(post.published_at).toLocaleDateString()}</span>
              )}
            </div>
          </div>

          {post.featured_image && (
            <div className="mt-6 overflow-hidden rounded-xl border bg-muted">
              <Image
                src={resolveAssetUrl(post.featured_image)}
                alt={post.title}
                width={1200}
                height={630}
                sizes="100vw"
                className="h-auto w-full object-cover"
                unoptimized
              />
            </div>
          )}

          <Separator className="my-8" />

          <article
            className="prose max-w-none dark:prose-invert rich-text"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <Separator className="my-8" />

          <Button asChild variant="outline">
            <Link href="/dich-vu">Quay lại Dịch vụ</Link>
          </Button>
        </div>

        <aside className="space-y-4">
          <h2 className="text-lg font-semibold">Dịch vụ cùng danh mục</h2>
          {related.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              Chưa có dịch vụ nào khác trong danh mục này.
            </div>
          ) : (
            <div className="space-y-3">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/dich-vu/${item.slug}`}
                  className="block rounded-lg border bg-card p-3 text-sm hover:border-primary hover:shadow-sm transition"
                >
                  <div className="font-medium line-clamp-2">{item.title}</div>
                  {item.published_at && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      {new Date(item.published_at).toLocaleDateString()}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
