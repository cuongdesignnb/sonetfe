"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import type { CourseData } from "./types";

/* ────────── Types ────────── */

export type FinalCTASectionProps = {
  course: CourseData;
  isEnrolled?: boolean;
  onCtaClick?: () => void;
  onLearnClick?: () => void;
};

/* ────────── Animation variants ────────── */

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

/* ══════════════════════════════════════════════════════════════
   FinalCTASection
   ══════════════════════════════════════════════════════════════ */

export function FinalCTASection({
  course,
  isEnrolled,
  onCtaClick,
  onLearnClick,
}: FinalCTASectionProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const cta = course.marketing?.final_cta;
  const title = cta?.title || `Sẵn sàng bắt đầu hành trình`;
  const highlight = course.title || "Video Marketing";
  const subtitle =
    cta?.subtitle ||
    `Tham gia cộng đồng 1,000+ người đang xây dựng thu nhập từ video mỗi ngày`;
  const ctaText = cta?.cta_text || "Bắt đầu miễn phí";
  const socialProof =
    cta?.social_proof ||
    "Không cần credit card • Miễn phí mãi mãi • Hỗ trợ 24/7";

  return (
    <section
      ref={ref}
      className="relative overflow-x-clip bg-gray-950 py-24 sm:py-32"
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/5 blur-[150px]" />
      </div>

      <motion.div
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={stagger}
        className="relative mx-auto max-w-3xl px-4 text-center sm:px-6"
      >
        {/* Title */}
        <motion.h2
          variants={fadeInUp}
          className="mb-4 text-3xl font-black py-1 sm:text-4xl lg:text-5xl"
          style={{ lineHeight: 1.8 }}
        >
          <span className="text-white">{title} </span>
          <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
            {highlight}?
          </span>
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          variants={fadeInUp}
          className="mx-auto mb-10 max-w-xl text-base text-gray-400 sm:text-lg"
        >
          {subtitle}
        </motion.p>

        {/* Buttons */}
        <motion.div
          variants={fadeInUp}
          className="mb-6 flex flex-wrap items-center justify-center gap-4"
        >
          <button
            type="button"
            onClick={isEnrolled ? onLearnClick : onCtaClick}
            className={`group inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-[0.98] sm:text-lg ${
              isEnrolled
                ? "bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 shadow-green-500/25 hover:shadow-green-500/30"
                : "bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 shadow-orange-500/25 hover:shadow-orange-500/30"
            }`}
          >
            <Sparkles className="h-5 w-5" />
            {isEnrolled ? "VÀO HỌC NGAY" : ctaText}
          </button>
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById("curriculum");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-4 text-base font-medium text-white transition-all hover:border-white/40 hover:bg-white/10 sm:text-lg"
          >
            Tìm hiểu thêm
            <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>

        {/* Social proof note */}
        <motion.p variants={fadeInUp} className="text-sm text-gray-500">
          {socialProof}
        </motion.p>
      </motion.div>
    </section>
  );
}
