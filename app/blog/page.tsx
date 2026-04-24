import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const isServer = typeof window === "undefined";
const API_BASE = isServer
  ? process.env.INTERNAL_API_URL?.replace(/\/$/, "") ||
    "https://admin.phamanhchien.vn/api"
  : process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
    "https://admin.phamanhchien.vn/api";

type BlogCategory = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  posts_count?: number;
};

type BlogPost = {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  featured_image?: string | null;
  published_at?: string | null;
  category?: { id: number; name: string; slug: string } | null;
};

async function getCategories() {
  try {
    const res = await fetch(`${API_BASE}/blog/categories`, {
      cache: "no-store",
    });
    if (!res.ok) return [] as BlogCategory[];
    const json = await res.json();
    return (json?.data || []) as BlogCategory[];
  } catch {
    return [] as BlogCategory[];
  }
}

async function getPosts(category?: string) {
  try {
    const qs = new URLSearchParams();
    if (category) qs.set("category", category);
    const url = qs.toString()
      ? `${API_BASE}/blog?${qs.toString()}`
      : `${API_BASE}/blog`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [] as BlogPost[];
    const json = await res.json();
    return (json?.data || []) as BlogPost[];
  } catch {
    return [] as BlogPost[];
  }
}

export const dynamic = "force-dynamic";

export default async function BlogPage({
  searchParams,
}: {
  searchParams?: { category?: string };
}) {
  const category = searchParams?.category;
  const [categories, posts] = await Promise.all([
    getCategories(),
    getPosts(category),
  ]);

  return (
    <div className="container py-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tin tức & Blog</h1>
          <p className="text-muted-foreground">
            Cập nhật kiến thức, hướng dẫn và xu hướng mới nhất
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/">Về trang chủ</Link>
        </Button>
      </div>

      {categories.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/blog">
            <Badge variant={!category ? "default" : "outline"}>Tất cả</Badge>
          </Link>
          {categories.map((c) => (
            <Link key={c.id} href={`/blog?category=${c.slug}`}>
              <Badge variant={category === c.slug ? "default" : "outline"}>
                {c.name}
              </Badge>
            </Link>
          ))}
        </div>
      )}

      {posts.length === 0 ? (
        <div className="mt-8 text-muted-foreground">Chưa có bài viết nào.</div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <Card key={p.id} className="overflow-hidden">
              {p.featured_image && (
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  <Image
                    src={p.featured_image}
                    alt={p.title}
                    width={800}
                    height={600}
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle className="line-clamp-2">
                  <Link href={`/blog/${p.slug}`} className="hover:underline">
                    {p.title}
                  </Link>
                </CardTitle>
                {p.category?.name && (
                  <div className="text-xs text-muted-foreground">
                    {p.category.name}
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {p.excerpt || ""}
                </p>
                <div className="mt-4">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/blog/${p.slug}`}>Đọc tiếp</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
