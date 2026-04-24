"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { CourseData } from "./types";

/* ────────── Types ────────── */

export type FloatingBarProps = {
  course: CourseData;
  isEnrolled?: boolean;
  onCtaClick?: () => void;
  onLearnClick?: () => void;
};

/* ══════════════════════════════════════════════════════════════
   FloatingBar — sticky bottom bar
   ══════════════════════════════════════════════════════════════ */

export function FloatingBar({
  course,
  isEnrolled,
  onCtaClick,
  onLearnClick,
}: FloatingBarProps) {
  const [visible, setVisible] = useState(false);

  const bar = course.marketing?.floating_bar;
  const urgency = course.marketing?.urgency;
  const price = Number(course.price) || 0;
  const viewerCount = bar?.viewer_count ?? 102;
  const enrolledCount = urgency?.total_spots ?? 1000;

  // Show the bar after scrolling past the hero (e.g. 600px)
  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 600);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-gray-950/95 backdrop-blur-md"
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
            {/* Left: viewer count */}
            <div className="hidden items-center gap-2 sm:flex">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
              </span>
              <span className="text-sm text-gray-300">
                <strong className="text-white">{viewerCount}</strong> người đang
                xem
              </span>
            </div>

            {/* Center: price + enrolled */}
            <div className="flex flex-1 items-center justify-center gap-3 sm:gap-4">
              {/* Strikethrough price */}
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(price)}
              </span>
              {/* Current price */}
              <span className="text-lg font-black text-white sm:text-xl">
                {formatPrice(price)}
              </span>
              {/* Enrolled count */}
              <span className="hidden text-sm text-gray-400 lg:inline">
                {enrolledCount.toLocaleString("vi-VN")}+ học viên đã đăng ký
              </span>
            </div>

            {/* Right: CTA button */}
            {course.status === "coming_soon" ? (
              <button
                type="button"
                disabled
                className="flex-shrink-0 cursor-not-allowed rounded-full border-2 border-blue-400/50 bg-blue-500/10 px-5 py-2.5 text-sm font-extrabold uppercase tracking-wide text-blue-300 opacity-80 sm:px-7 sm:py-3 sm:text-base"
              >
                SẮP DIỄN RA
              </button>
            ) : (
              <button
                type="button"
                onClick={isEnrolled ? onLearnClick : onCtaClick}
                className={`flex-shrink-0 rounded-full px-5 py-2.5 text-sm font-extrabold uppercase tracking-wide text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-[0.98] sm:px-7 sm:py-3 sm:text-base ${
                  isEnrolled
                    ? "bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 shadow-green-500/25 hover:shadow-green-500/30"
                    : "bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 shadow-orange-500/25 hover:shadow-orange-500/30"
                }`}
              >
                <Zap className="mr-1.5 inline-block h-4 w-4" />
                {isEnrolled ? "VÀO HỌC NGAY" : "ĐĂNG KÝ NGAY"}
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
