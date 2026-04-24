"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  ArrowLeft,
  Download,
  FileText,
  CheckCircle2,
  User,
  ExternalLink,
  Tag,
} from "lucide-react";
import { useParams } from "next/navigation";
import { resolveAssetUrl } from "@/lib/asset-url";
import { useAuth } from "@/hooks/use-auth";

interface Ebook {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  thumbnail: string | null;
  author_name: string;
  file_url: string | null;
  preview_url: string | null;
  price: string | number;
  original_price: string | number | null;
  total_pages: number | null;
  download_count: number;
  type: string;
  status: string;
  features: string[] | null;
  tags: string[] | null;
  category: { id: number; name: string } | null;
}

export default function EbookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { user } = useAuth();
  const [ebook, setEbook] = useState<Ebook | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [hasPurchased, setHasPurchased] = useState(false);

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "https://admin.phamanhchien.vn/api";

  useEffect(() => {
    if (!slug) return;
    const token = localStorage.getItem("token");
    fetch(`${apiUrl}/ebooks/${encodeURIComponent(slug)}`, {
      cache: "no-store",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
      .then((res) => {
        if (!res.ok) throw new Error("not found");
        return res.json();
      })
      .then((json) => {
        setEbook(json.ebook || json.data || json);
        setHasPurchased(!!json.has_purchased);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug, apiUrl, user]);

  async function handleCheckout() {
    if (!ebook) return;
    setCheckoutError(null);
    if (!user) {
      router.push(`/auth/login?redirect=/ebooks/${slug}`);
      return;
    }
    setCheckoutLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${apiUrl}/ebooks/${ebook.id}/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setCheckoutError(json?.message || "Không thể tạo thanh toán.");
        return;
      }
      if (json?.purchased && json?.file_url) {
        // Free ebook or already purchased - open Drive link
        setHasPurchased(true);
        setEbook((prev) =>
          prev ? { ...prev, file_url: json.file_url } : prev,
        );
        window.open(json.file_url, "_blank");
        return;
      }
      if (json?.purchased) {
        setHasPurchased(true);
        return;
      }
      if (json?.payment) {
        // Redirect to dedicated payment page
        router.push(`/checkout/${json.payment.id}?type=ebook&slug=${slug}`);
      }
    } catch {
      setCheckoutError("Không thể tạo thanh toán.");
    } finally {
      setCheckoutLoading(false);
    }
  }

  function formatPrice(price: string | number) {
    const n = Number(price);
    if (!n) return "Miễn phí";
    return n.toLocaleString("vi-VN") + "₫";
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FEF7ED] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !ebook) {
    return (
      <div className="min-h-screen bg-[#FEF7ED] flex flex-col items-center justify-center">
        <BookOpen className="w-20 h-20 text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-700 mb-2">
          Không tìm thấy ebook
        </h1>
        <p className="text-gray-500 mb-6">
          Ebook này không tồn tại hoặc đã bị xóa.
        </p>
        <Link
          href="/ebooks"
          className="rounded-full border-2 border-orange-500 bg-orange-500 px-6 py-2 text-white font-bold hover:bg-orange-600"
        >
          ← Quay về danh sách
        </Link>
      </div>
    );
  }

  const isFree = !Number(ebook.price);
  const hasDiscount =
    ebook.original_price && Number(ebook.original_price) > Number(ebook.price);
  const priceLabel = isFree ? "MIỄN PHÍ" : formatPrice(ebook.price);

  return (
    <div className="min-h-screen bg-[#FEF7ED]">
      {/* Back link */}
      <div className="container mx-auto px-4 pt-6">
        <Link
          href="/ebooks"
          className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách ebook
        </Link>
      </div>

      {/* Banner / Thumbnail */}
      <div className="container mx-auto px-4 mt-4">
        <div className="rounded-xl overflow-hidden shadow-lg">
          {ebook.thumbnail ? (
            <img
              src={resolveAssetUrl(ebook.thumbnail)}
              alt={ebook.title}
              className="w-full h-auto object-contain"
            />
          ) : (
            <div className="w-full h-[320px] bg-gradient-to-r from-orange-700 via-orange-600 to-yellow-600 flex items-center justify-center">
              <div className="text-center text-white">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-xl font-bold opacity-80">{ebook.title}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Title + Meta */}
      <div className="container mx-auto px-4 mt-8">
        <div className="flex gap-2 mb-3 flex-wrap">
          <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-semibold capitalize">
            <BookOpen className="w-3 h-3" />
            {ebook.type}
          </span>
          {ebook.category && (
            <span className="inline-flex items-center bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-semibold">
              {ebook.category.name}
            </span>
          )}
          {ebook.status === "coming_soon" && (
            <span className="inline-flex items-center bg-yellow-400 text-white px-3 py-1 rounded-full text-xs font-semibold">
              Sắp ra mắt
            </span>
          )}
        </div>

        <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 leading-tight">
          {ebook.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 mt-4 text-gray-600 text-sm">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            <span>{ebook.author_name}</span>
          </div>
          {ebook.total_pages && (
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-400" />
              <span>{ebook.total_pages} trang</span>
            </div>
          )}
        </div>
      </div>

      {/* Two column layout */}
      <div className="container mx-auto px-4 mt-8 pb-16">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left: Features + Description */}
          <div className="lg:col-span-3 space-y-6">
            {/* Features / Benefits */}
            {ebook.features && ebook.features.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-orange-500">🎁</span>
                  Bạn sẽ nhận được gì?
                </h2>
                <ul className="space-y-3">
                  {ebook.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 leading-relaxed">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Description */}
            {ebook.description && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-800 mb-4">
                  Giới thiệu
                </h2>
                <div
                  className="prose prose-gray max-w-none leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: /<[a-z][\s\S]*>/i.test(ebook.description)
                      ? ebook.description
                      : ebook.description.replace(/\r\n|\r|\n/g, "<br />"),
                  }}
                />
              </div>
            )}

            {/* Tags */}
            {ebook.tags && ebook.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {ebook.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 bg-white border border-gray-200 text-gray-600 px-3 py-1 rounded-full text-sm"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Right: Price + CTA */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 space-y-4">
              {/* Price Badge */}
              <div className="bg-gradient-to-r from-green-400 to-green-500 rounded-xl p-4 text-center shadow-md">
                <div className="flex items-center justify-center gap-2 text-white">
                  <Tag className="w-5 h-5" />
                  <span className="text-xl font-extrabold tracking-wide">
                    {priceLabel}
                  </span>
                  {hasDiscount && (
                    <span className="text-sm line-through opacity-70 ml-1">
                      {formatPrice(ebook.original_price!)}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-6">
                <div className="space-y-4">
                  {/* Book Cover in sidebar */}
                  <div className="w-full rounded-lg overflow-hidden shadow-md">
                    {ebook.thumbnail ? (
                      <img
                        src={resolveAssetUrl(ebook.thumbnail)}
                        alt={ebook.title}
                        className="w-full h-auto object-contain"
                      />
                    ) : (
                      <div className="w-full aspect-video bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                        <FileText className="w-10 h-10 text-white/40" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="text-center space-y-1 text-sm text-gray-500">
                    <p className="font-medium text-gray-700">
                      {ebook.author_name}
                    </p>
                    {ebook.total_pages && <p>{ebook.total_pages} trang</p>}
                    <p className="capitalize">{ebook.type}</p>
                  </div>

                  {/* CTA Buttons */}
                  {ebook.status !== "coming_soon" ? (
                    <div className="space-y-3">
                      {checkoutError && (
                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-200">
                          {checkoutError}
                        </div>
                      )}

                      {hasPurchased && ebook.file_url ? (
                        <>
                          <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg border border-green-200 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                            <span>
                              {isFree
                                ? "Ebook miễn phí — nhấn nút bên dưới để nhận!"
                                : "Bạn đã thanh toán thành công!"}
                            </span>
                          </div>
                          <a
                            href={ebook.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Nhận Ebook
                          </a>
                        </>
                      ) : hasPurchased ? (
                        <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg border border-green-200 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                          <span>Bạn đã sở hữu ebook này</span>
                        </div>
                      ) : (
                        <button
                          onClick={handleCheckout}
                          disabled={checkoutLoading}
                          className="w-full bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {isFree ? (
                            <Download className="w-4 h-4" />
                          ) : (
                            <Tag className="w-4 h-4" />
                          )}
                          {checkoutLoading
                            ? "Đang xử lý..."
                            : isFree
                              ? "Tải miễn phí"
                              : `Mua ngay — ${formatPrice(ebook.price)}`}
                        </button>
                      )}

                      {ebook.preview_url && (
                        <a
                          href={ebook.preview_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full border-2 border-orange-400 text-orange-600 hover:bg-orange-50 font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Xem trước
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-orange-600 font-semibold">
                        Sắp ra mắt
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Ebook sẽ sớm được phát hành
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
