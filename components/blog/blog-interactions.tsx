"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import toast from "react-hot-toast";

type BlogComment = {
  id: number;
  comment: string;
  created_at?: string;
  user?: {
    id: number;
    name: string;
  } | null;
};

type Props = {
  slug: string;
  title: string;
  initialComments?: BlogComment[];
};

export function BlogInteractions({ slug, title, initialComments }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "https://admin.phamanhchien.vn/api";
  const [comments, setComments] = useState<BlogComment[]>(
    initialComments || [],
  );
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setShareUrl(window.location.href);
    }
  }, []);

  const formattedComments = useMemo(() => {
    return comments.map((c) => ({
      ...c,
      createdLabel: c.created_at ? new Date(c.created_at).toLocaleString() : "",
    }));
  }, [comments]);

  const handleShareCopy = async () => {
    const url =
      shareUrl || (typeof window !== "undefined" ? window.location.href : "");
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Đã sao chép liên kết bài viết");
    } catch {
      toast.error("Không thể sao chép liên kết");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = comment.trim();
    if (!value) {
      toast.error("Vui lòng nhập nội dung bình luận");
      return;
    }

    if (!user) {
      router.push("/auth/login");
      return;
    }

    setSubmitting(true);
    try {
      const token =
        typeof window !== "undefined"
          ? window.localStorage.getItem("token")
          : null;

      const res = await fetch(`${apiUrl}/blog/${slug}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ comment: value }),
      });

      if (res.status === 401) {
        router.push("/auth/login");
        return;
      }

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        const message =
          (json && (json.message as string)) ||
          "Không thể gửi bình luận, vui lòng thử lại";
        toast.error(message);
        return;
      }

      const json = await res.json();
      const created = json?.comment as BlogComment | undefined;
      if (created) {
        setComments((prev) => [created, ...prev]);
      }
      setComment("");
      toast.success("Đã gửi bình luận");
    } catch {
      toast.error("Không thể gửi bình luận, vui lòng thử lại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-10 space-y-8">
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Chia sẻ bài viết</h2>
        <p className="text-sm text-muted-foreground">
          Gửi bài viết này cho bạn bè hoặc chia sẻ lên mạng xã hội.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleShareCopy}
          >
            Sao chép liên kết
          </Button>
          {shareUrl && (
            <>
              <Button type="button" variant="outline" size="sm" asChild>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                    shareUrl,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Chia sẻ Facebook
                </a>
              </Button>
              <Button type="button" variant="outline" size="sm" asChild>
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                    shareUrl,
                  )}&text=${encodeURIComponent(title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Chia sẻ Twitter
                </a>
              </Button>
            </>
          )}
        </div>
      </div>

      <Separator />

      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Bình luận</h2>
          <p className="text-sm text-muted-foreground">
            {user
              ? "Hãy chia sẻ ý kiến hoặc câu hỏi của bạn về bài viết này."
              : "Đăng nhập tài khoản học viên để để lại bình luận."}
          </p>
        </div>

        {user ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Nhập bình luận của bạn..."
            />
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs text-muted-foreground">
                Đăng nhập với tài khoản: {user.name}
              </div>
              <Button type="submit" size="sm" disabled={submitting}>
                {submitting ? "Đang gửi..." : "Gửi bình luận"}
              </Button>
            </div>
          </form>
        ) : (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => router.push("/auth/login")}
          >
            Đăng nhập để bình luận
          </Button>
        )}

        <div className="space-y-4">
          {formattedComments.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              Chưa có bình luận nào. Hãy là người đầu tiên.
            </div>
          ) : (
            formattedComments.map((c) => (
              <div
                key={c.id}
                className="rounded-lg border bg-card px-4 py-3 shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-medium">
                    {c.user?.name || "Ẩn danh"}
                  </div>
                  {c.createdLabel && (
                    <div className="text-xs text-muted-foreground">
                      {c.createdLabel}
                    </div>
                  )}
                </div>
                <div className="mt-2 text-sm whitespace-pre-wrap">
                  {c.comment}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
