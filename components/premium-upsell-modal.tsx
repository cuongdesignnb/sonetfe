"use client";

import { X, Lock, BookOpen, Sparkles } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface PremiumUpsellModalProps {
  open: boolean;
  onClose: () => void;
  lessonTitle?: string;
  courseTitle?: string;
  coursePrice?: number;
  courseSlug?: string;
  courseId?: string | number;
  isLoggedIn?: boolean;
  totalLessons?: number;
  currentLessonIndex?: number;
}

export function PremiumUpsellModal({
  open,
  onClose,
  lessonTitle,
  coursePrice = 0,
  courseSlug,
  courseId,
  totalLessons,
  currentLessonIndex,
}: PremiumUpsellModalProps) {
  if (!open) return null;

  const courseUrl = `/courses/${courseSlug || courseId}`;
  const registrationUrl = `${courseUrl}#pricing`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-md animate-in fade-in zoom-in-95 duration-200 rounded-2xl bg-[#1a1a2e] text-white shadow-2xl overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full p-1.5 text-white/60 hover:bg-white/10 hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg shadow-orange-500/30">
              <Lock className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold">Mở khóa bài học Premium</h2>
          </div>
          <p className="text-sm text-white/60">
            Đăng ký khóa học để truy cập toàn bộ bài học premium, update liên
            tục + 1 buổi Zoom chữa bài.
          </p>
        </div>

        {/* Current lesson highlight */}
        {lessonTitle && (
          <div className="mx-6 mb-4 rounded-lg bg-orange-500/10 border border-orange-500/20 p-3">
            <p className="text-sm text-orange-300 leading-relaxed">
              &ldquo;{lessonTitle}&rdquo;
            </p>
            {totalLessons && currentLessonIndex != null && (
              <p className="text-xs text-orange-400/60 mt-1.5 flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                Bài {currentLessonIndex + 1}/{totalLessons} · Bài giảng:{" "}
                <span className="inline-flex items-center gap-0.5 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                  <Sparkles className="h-2.5 w-2.5" /> PREMIUM
                </span>
              </p>
            )}
          </div>
        )}

        {/* Benefits */}
        <div className="px-6 pb-4 space-y-2.5">
          <div className="flex items-start gap-2.5 text-sm text-white/80">
            <span className="text-green-400 mt-0.5">•</span>
            <span>Truy cập toàn bộ bài học &amp; update liên tục</span>
          </div>
          <div className="flex items-start gap-2.5 text-sm text-white/80">
            <span className="text-green-400 mt-0.5">•</span>
            <span>
              1000+ chatbot tạo prompt đủ ngành &amp; hỗ trợ tools mới nhất
            </span>
          </div>
          <div className="flex items-start gap-2.5 text-sm text-white/80">
            <span className="text-green-400 mt-0.5">•</span>
            <span>1 buổi Zoom chữa bài &amp; hướng dẫn làm Affiliate</span>
          </div>
        </div>

        {/* CTA */}
        <div className="px-6 pb-4">
          <a
            href={registrationUrl}
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-base bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/30 transition-all hover:shadow-orange-500/50 hover:scale-[1.02] active:scale-[0.98]"
          >
            🔥 Đăng ký ngay
            {coursePrice > 0 && <span>– Chỉ {formatPrice(coursePrice)}</span>}
          </a>
        </div>

        {/* Footer link */}
        <div className="px-6 pb-6 text-center">
          <button
            onClick={onClose}
            className="text-sm text-white/50 hover:text-white/80 transition"
          >
            Xem thêm bài miễn phí
          </button>
        </div>
      </div>
    </div>
  );
}
