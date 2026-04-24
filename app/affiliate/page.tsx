import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chương trình Affiliate - Sonnet Academy",
  description:
    "Chương trình cộng tác viên Affiliate sắp ra mắt. Đăng ký nhận thông báo sớm nhất!",
};

export default function AffiliatePage() {
  return (
    <div className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Animated background blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-orange-500/10 blur-[120px] animate-pulse" />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-[120px] animate-pulse [animation-delay:1s]" />
        <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/5 blur-[100px] animate-pulse [animation-delay:2s]" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-2xl px-6 py-20 text-center">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-5 py-2 text-sm font-medium text-orange-400">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500" />
          </span>
          Sắp ra mắt
        </div>

        {/* Heading */}
        <h1 className="mb-4 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl">
          <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
            Affiliate Program
          </span>
        </h1>

        <p className="mx-auto mb-8 max-w-lg text-lg leading-relaxed text-gray-400 sm:text-xl">
          Chương trình cộng tác viên của{" "}
          <span className="font-semibold text-white">Sonnet Academy</span> đang
          được xây dựng. Hãy quay lại sớm để nhận cơ hội kiếm thu nhập hấp dẫn!
        </p>

        {/* Feature pills */}
        <div className="mb-10 flex flex-wrap items-center justify-center gap-3">
          {[
            "Hoa hồng hấp dẫn",
            "Thanh toán tự động",
            "Dashboard riêng",
            "Hỗ trợ 24/7",
          ].map((feature) => (
            <span
              key={feature}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300"
            >
              {feature}
            </span>
          ))}
        </div>

        {/* Rocket icon */}
        <div className="mb-10 flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-white/10 bg-gradient-to-br from-orange-500/20 to-amber-500/10 shadow-lg shadow-orange-500/10">
            <svg
              className="h-12 w-12 text-orange-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.63 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.841m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
              />
            </svg>
          </div>
        </div>

        {/* CTA */}
        <Button asChild size="lg" className="rounded-full px-8 text-base">
          <Link href="/">← Về trang chủ</Link>
        </Button>
      </div>
    </div>
  );
}
