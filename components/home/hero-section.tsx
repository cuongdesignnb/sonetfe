"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion, useInView } from "framer-motion";
import { useSiteSettings } from "@/hooks/use-site-settings";

/* ── Animated counter ──────────────────────────────────── */
function AnimatedNumber({
  value,
  suffix = "",
  duration = 2000,
}: {
  value: number;
  suffix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const startTime = Date.now();
    let frame: number;
    const update = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(ease * value));
      if (progress < 1) frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [value, duration, inView]);

  return (
    <span ref={ref}>
      {count.toLocaleString("vi-VN")}
      {suffix}
    </span>
  );
}

/* ── Small cherry-blossom SVG (reused as decoration) ───── */
function CherryBlossom({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      <circle cx="16" cy="16" r="3" fill="#e74c3c" />
      {[0, 72, 144, 216, 288].map((deg) => (
        <ellipse
          key={deg}
          cx="16"
          cy="6"
          rx="4"
          ry="7"
          fill="#f9a8d4"
          transform={`rotate(${deg} 16 16)`}
        />
      ))}
    </svg>
  );
}

/* ── Small flag SVG ──────────────────────────────────────── */
function SmallFlag({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 32" className={className}>
      <rect x="2" y="0" width="2" height="32" fill="#c0392b" rx="1" />
      <polygon points="4,2 22,8 4,14" fill="#e74c3c" />
    </svg>
  );
}

export function HeroSection() {
  const settings = useSiteSettings();
  const hero = settings.home.hero;
  const stats = settings.home.stats;

  const statItems = [
    { value: stats.students, label: stats.label_students || "Học viên" },
    { value: stats.courses, label: stats.label_courses || "Khóa học" },
    { value: stats.certificates, label: stats.label_certificates || "Ebooks" },
    { value: stats.countries, label: stats.label_countries || "Sách xuất bản" },
  ];

  return (
    <section
      className="relative pt-10 pb-16 overflow-hidden"
      style={{ background: "#FEF7ED" }}
    >
      {/* ── Decorative layer ──────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none hidden sm:block">
        {/* Cherry-blossom branches top-left */}
        <CherryBlossom className="absolute -top-2 left-4 w-14 h-14 opacity-70" />
        <CherryBlossom className="absolute top-12 left-10 w-8 h-8 opacity-50 rotate-45" />
        <CherryBlossom className="absolute top-28 left-2 w-6 h-6 opacity-40 -rotate-12" />

        {/* Cherry-blossom branches top-right */}
        <CherryBlossom className="absolute -top-1 right-6 w-12 h-12 opacity-60 rotate-12" />
        <CherryBlossom className="absolute top-16 right-12 w-7 h-7 opacity-40 rotate-90" />

        {/* Flags */}
        <SmallFlag className="absolute top-1 left-1 w-5 h-7 opacity-60" />
        <SmallFlag className="absolute top-6 right-2 w-4 h-6 opacity-50" />

        {/* Scattered petals / dots */}
        <div className="absolute top-20 left-[15%] w-2 h-2 bg-pink-300 rounded-full opacity-50" />
        <div className="absolute top-36 left-[25%] w-1.5 h-1.5 bg-pink-400 rounded-full opacity-40" />
        <div className="absolute top-10 right-[30%] w-2 h-2 bg-pink-300 rounded-full opacity-40" />
        <div className="absolute top-44 right-[18%] w-1.5 h-1.5 bg-yellow-400 rounded-full opacity-50" />
        <div className="absolute top-52 left-[40%] w-1 h-1 bg-orange-300 rounded-full opacity-40" />

        {/* More flowers mid-left & mid-right */}
        <CherryBlossom className="absolute top-[55%] left-6 w-10 h-10 opacity-40 rotate-[30deg]" />
        <CherryBlossom className="absolute top-[60%] right-8 w-8 h-8 opacity-35 -rotate-[20deg]" />

        {/* Star confetti */}
        <svg
          className="absolute top-8 left-[48%] w-3 h-3 text-yellow-400 opacity-60"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        <svg
          className="absolute top-4 right-[38%] w-2.5 h-2.5 text-orange-400 opacity-50"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </div>

      {/* ── Content ───────────────────────────────────── */}
      <div className="container relative z-10">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Main Heading — all red, bold */}
          <h1 className="font-bold mb-8 uppercase" style={{ fontSize: 'clamp(1.2rem, 4.8vw, 3.5rem)', lineHeight: 1.25, letterSpacing: '0.02em' }}>
            <span className="text-red-600 block mb-1 md:mb-3">
              {hero.title_prefix || "Học Affiliate Thực Chiến"}
            </span>
            <span className="text-red-600 block">
              {hero.title_suffix || "Từ Chuyên Gia Hàng Đầu"}
            </span>
          </h1>

          {/* Subtitle — gray, render HTML */}
          <div
            className="text-base md:text-lg text-gray-500 mb-10 max-w-2xl mx-auto"
            dangerouslySetInnerHTML={{
              __html:
                hero.subtitle ||
                "Khóa học & Sách từ những người đã làm được, không chỉ lý thuyết suông",
            }}
          />

          {/* CTA Buttons with small flower accents */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center items-stretch sm:items-center mb-14 px-2 sm:px-0"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="relative inline-flex items-center">
              <CherryBlossom className="absolute -top-3 -right-3 w-5 h-5 opacity-70 hidden sm:block" />
              <Button
                size="lg"
                className="w-full sm:w-auto text-base px-8 py-6 bg-gradient-to-r from-red-700 to-red-500 hover:from-red-800 hover:to-red-600 border-0 shadow-lg shadow-red-500/25 text-white rounded-full"
                asChild
              >
                <Link href="/courses">
                  {hero.primary_cta || "Khám phá khóa học"}
                </Link>
              </Button>
            </span>

            <span className="relative inline-flex items-center">
              <CherryBlossom className="absolute -top-3 -right-3 w-5 h-5 opacity-70 hidden sm:block" />
              <Button
                size="lg"
                className="w-full sm:w-auto text-base px-8 py-6 bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 border-0 shadow-lg shadow-orange-400/20 text-white rounded-full"
                asChild
              >
                <Link href="/webinars">
                  {hero.secondary_cta || "Webinar miễn phí"}
                </Link>
              </Button>
            </span>
          </motion.div>

          {/* Stats Cards — dark red bg, yellow/gold border, white text */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {statItems.map((stat, index) => (
              <div
                key={index}
                className="relative rounded-2xl text-center"
                style={{
                  background: "#8B1A1A",
                  border: "3px solid #E8B730",
                  padding: "1.25rem 1rem",
                }}
              >
                <div className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white mb-1">
                  <AnimatedNumber value={stat.value} />
                </div>
                <div className="text-sm text-white/80">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
