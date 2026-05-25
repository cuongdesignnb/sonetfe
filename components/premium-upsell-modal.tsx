"use client";

import { X, Lock, BookOpen, Sparkles, Zap, GraduationCap } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface PremiumUpsellModalProps {
  open: boolean;
  onClose: () => void;
  lessonTitle?: string;
  courseTitle?: string;
  coursePrice?: number;
  priceRange?: [number, number];
  courseSlug?: string;
  courseId?: string | number;
  isLoggedIn?: boolean;
  totalLessons?: number;
  currentLessonIndex?: number;
  section?: {
    id: number;
    title: string;
    price?: string | number | null;
    original_price?: string | number | null;
    is_sellable?: boolean;
  } | null;
}

export function PremiumUpsellModal({
  open,
  onClose,
  lessonTitle,
  courseTitle,
  coursePrice = 0,
  priceRange,
  courseSlug,
  courseId,
  totalLessons,
  currentLessonIndex,
  section,
}: PremiumUpsellModalProps) {
  if (!open) return null;

  const courseUrl = `/courses/${courseSlug || courseId}`;
  const fullCourseRegistrationUrl = `${courseUrl}#pricing`;
  const chapterRegistrationUrl = section ? `${courseUrl}?section_id=${section.id}#pricing` : fullCourseRegistrationUrl;

  const isChapterSellable = section && section.is_sellable && section.price;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg animate-in fade-in zoom-in-95 duration-200 rounded-2xl bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1b] text-white shadow-2xl border border-white/10 overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full p-1.5 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg shadow-orange-500/30">
              <Lock className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-extrabold tracking-tight">Mở khóa nội dung bài học</h2>
          </div>
          <p className="text-sm text-gray-400">
            Nội dung này thuộc lộ trình đào tạo nâng cao. Vui lòng chọn gói học phù hợp để tiếp tục.
          </p>
        </div>

        {/* Current lesson highlight */}
        {lessonTitle && (
          <div className="mx-6 mb-4 rounded-xl bg-orange-500/5 border border-orange-500/20 p-3">
            <p className="text-sm text-orange-200 font-medium leading-relaxed">
              &ldquo;{lessonTitle}&rdquo;
            </p>
            {totalLessons && currentLessonIndex != null && (
              <p className="text-xs text-orange-400/60 mt-1.5 flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" />
                Bài {currentLessonIndex + 1}/{totalLessons} · Bài giảng:{" "}
                <span className="inline-flex items-center gap-0.5 bg-orange-500 px-1.5 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wider">
                  <Sparkles className="h-2.5 w-2.5" /> Premium
                </span>
              </p>
            )}
          </div>
        )}

        {/* Pricing Options */}
        <div className="px-6 pb-4 space-y-4">
          {isChapterSellable ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option A: Chapter Only */}
              <div className="flex flex-col justify-between rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-all hover:border-orange-500/30 hover:bg-white/[0.04]">
                <div>
                  <span className="rounded bg-orange-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-400">
                    Mua lẻ chương
                  </span>
                  <h3 className="mt-2 text-sm font-bold text-white line-clamp-2">
                    {section.title}
                  </h3>
                  <p className="mt-1 text-xs text-gray-400">
                    Sở hữu vĩnh viễn và học riêng nội dung của chương học này.
                  </p>
                </div>
                <div className="mt-4">
                  {section.original_price && Number(section.original_price) > Number(section.price) && (
                    <span className="text-xs text-gray-500 line-through block">
                      {formatPrice(Number(section.original_price))}
                    </span>
                  )}
                  <span className="text-xl font-extrabold text-orange-400">
                    {formatPrice(Number(section.price))}
                  </span>
                  <a
                    href={chapterRegistrationUrl}
                    onClick={onClose}
                    className="mt-3 flex items-center justify-center gap-1.5 w-full py-2.5 rounded-lg font-bold text-xs bg-orange-500 hover:bg-orange-600 text-white shadow transition-all active:scale-95"
                  >
                    <Zap className="h-3 w-3" /> Mua lẻ chương này
                  </a>
                </div>
              </div>

              {/* Option B: Full Course */}
              <div className="flex flex-col justify-between rounded-xl border-2 border-orange-500 bg-orange-500/5 p-4 transition-all hover:bg-orange-500/10 relative">
                <span className="absolute -top-2.5 right-4 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white shadow">
                  Khuyên dùng
                </span>
                <div>
                  <span className="rounded bg-orange-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    Trọn bộ khóa học
                  </span>
                  <h3 className="mt-2 text-sm font-bold text-white line-clamp-2">
                    {courseTitle || "Toàn bộ khóa học"}
                  </h3>
                  <p className="mt-1 text-xs text-gray-400">
                    Truy cập tất cả các chương, tài liệu và các cập nhật trọn đời.
                  </p>
                </div>
                <div className="mt-4">
                  {priceRange && priceRange[0] !== priceRange[1] ? (
                    <span className="text-xl font-extrabold text-orange-400">
                      Từ {formatPrice(priceRange[0])}
                    </span>
                  ) : coursePrice > 0 ? (
                    <span className="text-xl font-extrabold text-orange-400">
                      {formatPrice(coursePrice)}
                    </span>
                  ) : (
                    <span className="text-xl font-extrabold text-orange-400">Liên hệ</span>
                  )}
                  <a
                    href={fullCourseRegistrationUrl}
                    onClick={onClose}
                    className="mt-3 flex items-center justify-center gap-1.5 w-full py-2.5 rounded-lg font-bold text-xs bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md transition-all active:scale-95"
                  >
                    <GraduationCap className="h-3.5 w-3.5" /> Mua trọn gói
                  </a>
                </div>
              </div>
            </div>
          ) : (
            /* Single Option: Full Course registration */
            <div>
              <a
                href={fullCourseRegistrationUrl}
                onClick={onClose}
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-base bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/30 transition-all hover:shadow-orange-500/50 hover:scale-[1.02] active:scale-[0.98]"
              >
                🔥 Đăng ký trọn gói
                {priceRange && priceRange[0] !== priceRange[1] ? (
                  <span>– Từ {formatPrice(priceRange[0])}</span>
                ) : coursePrice > 0 ? (
                  <span>– Chỉ {formatPrice(coursePrice)}</span>
                ) : null}
              </a>
            </div>
          )}
        </div>

        {/* Benefits list (displayed if sellable chapter is available to show what full course gets, or general benefits) */}
        <div className="px-6 pb-4 border-t border-white/[0.05] pt-4 mt-2">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2.5">Quyền lợi khi đăng ký trọn gói:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>Truy cập toàn bộ bài học nâng cao</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>1000+ chatbot tạo prompt độc quyền</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>1 buổi Zoom hướng dẫn &amp; chữa bài</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>Hỗ trợ hỏi đáp 24/7 trực tiếp</span>
            </div>
          </div>
        </div>

        {/* Footer link */}
        <div className="px-6 pb-6 text-center border-t border-white/[0.05] pt-4">
          <button
            onClick={onClose}
            className="text-xs text-gray-500 hover:text-white transition-colors"
          >
            Quay lại và xem các bài miễn phí
          </button>
        </div>
      </div>
    </div>
  );
}

