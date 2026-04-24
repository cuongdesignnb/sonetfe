"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { stripHtml } from "@/lib/utils";
import { resolveAssetUrl } from "@/lib/asset-url";

type Category = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  courses_count?: number;
  image?: string | null;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "https://admin.phamanhchien.vn/api";

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`${apiUrl}/categories?flat=1`, {
          cache: "no-store",
        });
        const json = (await res.json()) as Category[];
        if (cancelled) return;
        setCategories(json || []);
      } catch {
        if (!cancelled) setCategories([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Danh mục</h1>
          <p className="text-muted-foreground">Duyệt theo danh mục khóa học</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/">Về trang chủ</Link>
        </Button>
      </div>

      {loading ? (
        <div className="mt-8 text-muted-foreground">Đang tải…</div>
      ) : categories.length === 0 ? (
        <div className="mt-8 text-muted-foreground">Chưa có danh mục nào.</div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/categories/${c.id}`}
              className="group overflow-hidden rounded-2xl border bg-card hover:border-orange-300 hover:shadow-lg transition"
            >
              <div className="relative aspect-[16/9] bg-muted overflow-hidden">
                <Image
                  src={
                    resolveAssetUrl(c.image) ||
                    "/images/category-placeholder.svg"
                  }
                  alt={c.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  unoptimized
                />
              </div>
              <div className="p-4">
                <div className="font-semibold text-lg line-clamp-1">
                  {c.name}
                </div>
                <div className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {stripHtml(c.description || "")}
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  {c.courses_count ?? 0} khóa học
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
