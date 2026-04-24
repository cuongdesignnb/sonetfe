"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { PlayCircle, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { resolveAssetUrl } from "@/lib/asset-url";
import type { CourseData, CourseMarketing, HeroCard } from "./types";

/* ────────── Animation variants ────────── */

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

/* ────────── Ticker (rolling text band) ────────── */

function Ticker({ texts }: { texts: string[] }) {
  if (texts.length === 0) return null;
  const items = [...texts, ...texts];
  return (
    <div className="overflow-hidden whitespace-nowrap py-3 border-y border-white/10">
      <motion.div
        className="inline-flex gap-8"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        {items.map((t, i) => (
          <span
            key={i}
            className="text-sm font-semibold uppercase tracking-wider text-gray-400"
          >
            {t}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ────────── 3D Coverflow Slider ────────── */

function CoverflowSlider({ cards }: { cards: HeroCard[] }) {
  const [active, setActive] = useState(Math.floor(cards.length / 2));
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const total = cards.length;

  // Auto-advance
  useEffect(() => {
    if (total <= 1) return;
    timerRef.current = setInterval(() => {
      setActive((p) => (p + 1) % total);
    }, 3500);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [total]);

  const goTo = (idx: number) => {
    setActive(idx);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(
      () => setActive((p) => (p + 1) % total),
      3500,
    );
  };

  const prev = () => goTo((active - 1 + total) % total);
  const next = () => goTo((active + 1) % total);

  return (
    <div className="relative w-full">
      {/* 3D perspective container */}
      <div
        className="relative mx-auto flex items-center justify-center"
        style={{ perspective: "900px", height: "380px" }}
      >
        {cards.map((card, i) => {
          const isCenter = i === active;
          const isHighlight = card.highlight;

          return (
            <motion.div
              key={i}
              animate={{
                x: (i - active) * 150,
                z: -Math.abs(i - active) * 100,
                rotateY: i > active ? -45 : i < active ? 45 : 0,
                scale: isCenter
                  ? 1
                  : Math.max(0.7, 1 - Math.abs(i - active) * 0.15),
                opacity:
                  Math.abs(i - active) > 3
                    ? 0
                    : isCenter
                      ? 1
                      : Math.max(0.4, 1 - Math.abs(i - active) * 0.25),
              }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              onClick={() => goTo(i)}
              className="absolute cursor-pointer"
              style={{
                transformStyle: "preserve-3d",
                zIndex: 30 - Math.abs(i - active) * 10,
                width: "200px",
              }}
            >
              <div
                className={cn(
                  "rounded-2xl overflow-hidden shadow-2xl transition-shadow duration-300",
                  isCenter && isHighlight
                    ? "ring-2 ring-yellow-400 shadow-yellow-500/20"
                    : isCenter
                      ? "ring-2 ring-orange-500/50 shadow-orange-500/20"
                      : "ring-1 ring-white/10 shadow-black/60",
                )}
              >
                <div className="relative aspect-[3/4] bg-gray-800">
                  <Image
                    src={resolveAssetUrl(card.image)}
                    alt={card.caption || `Slide ${i + 1}`}
                    fill
                    sizes="200px"
                    className="object-cover"
                    unoptimized
                  />
                  {/* Darken non-active */}
                  {!isCenter && (
                    <div className="absolute inset-0 bg-black/30" />
                  )}
                </div>
                {card.caption && (
                  <div
                    className={cn(
                      "px-3 py-2.5 text-sm font-medium truncate",
                      isCenter && isHighlight
                        ? "bg-yellow-400/10 text-yellow-300 border-t border-yellow-400/20"
                        : isCenter
                          ? "bg-gray-900 text-white border-t border-white/10"
                          : "bg-gray-900/80 text-gray-400 border-t border-white/5",
                    )}
                  >
                    {card.caption}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Navigation arrows */}
      {total > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-40 rounded-full bg-black/50 backdrop-blur-sm p-2.5 text-white hover:bg-black/70 transition-colors"
            aria-label="Previous"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-40 rounded-full bg-black/50 backdrop-blur-sm p-2.5 text-white hover:bg-black/70 transition-colors"
            aria-label="Next"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </>
      )}

      {/* Dot indicators */}
      {total > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {cards.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                i === active
                  ? "w-7 bg-orange-500"
                  : "w-2 bg-white/30 hover:bg-white/60",
              )}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ────────── Star rating row ────────── */

function StarRow({
  rating,
  className,
}: {
  rating: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn(
            "h-4 w-4",
            s <= Math.round(rating)
              ? "fill-yellow-400 text-yellow-400"
              : "fill-gray-600 text-gray-600",
          )}
        />
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   HeroSection – the main export
   ════════════════════════════════════════════════════════════ */

export interface HeroSectionProps {
  course: CourseData;
  isEnrolled: boolean;
  onEnrollClick?: () => void;
  onLearnClick?: () => void;
}

export function HeroSection({
  course,
  isEnrolled,
  onEnrollClick,
  onLearnClick,
}: HeroSectionProps) {
  const c = course;
  const marketing: CourseMarketing = c.marketing || {};
  const rating = Number(c.average_rating) || 0;
  const enrollments = Number(c.total_enrollments) || 0;

  // Fake/override values from marketing
  const fakeStudents = String(marketing.hero?.fake_students || "").trim();
  const fakeRating = Number(marketing.hero?.fake_rating) || 0;

  // Display values (fake overrides real)
  const displayStudents =
    fakeStudents ||
    (enrollments > 0 ? `${enrollments.toLocaleString("vi-VN")}+` : "1,000+");
  const displayRating = fakeRating > 0 ? fakeRating : rating > 0 ? rating : 4.9;

  // Resolve content
  const promoEnabled = !!marketing.promo?.enabled;
  const promoText = String(marketing.promo?.text || "").trim();
  const heroHeadline = String(marketing.hero?.headline || "").trim() || c.title;
  const heroSubheadline =
    String(marketing.hero?.subheadline || "").trim() ||
    "Học ngay – lộ trình rõ ràng, thực hành dự án thật";

  // Background image — instructor photo / course representative image
  const backgroundImage = marketing.hero?.background_image || c.thumbnail || "";

  // Flipbook cards
  const heroCards: HeroCard[] = (() => {
    const cards = marketing.hero?.cards;
    if (Array.isArray(cards) && cards.length > 0)
      return cards.filter((cd) => cd.image);
    const imgs = marketing.hero?.images;
    if (Array.isArray(imgs) && imgs.length > 0)
      return imgs.filter(Boolean).map((img) => ({ image: img }));
    return [];
  })();

  // Ticker texts
  const tickerTexts: string[] = Array.isArray(marketing.ticker_texts)
    ? marketing.ticker_texts.filter(Boolean)
    : [];

  const handlePrimaryCTA = () => {
    if (isEnrolled && onLearnClick) {
      onLearnClick();
    } else if (onEnrollClick) {
      onEnrollClick();
    }
  };

  return (
    <section
      id="hero"
      className="relative overflow-x-clip bg-gray-950 pt-20 lg:pt-[72px]"
    >
      {/* ──── Full background: instructor photo ──── */}
      {backgroundImage && (
        <div className="absolute inset-0">
          <Image
            src={resolveAssetUrl(backgroundImage)}
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-top"
            priority
            unoptimized
          />
          {/* Dark gradient overlays for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/80 to-gray-950/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-gray-950/60" />
        </div>
      )}

      {/* Fallback: decorative blobs when no bg image */}
      {!backgroundImage && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.15, 1], rotate: [0, 4, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-orange-500/15 to-red-500/10 blur-3xl"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, -3, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 blur-3xl"
          />
        </div>
      )}

      {/* ──── Main content layer ──── */}
      <div className="relative min-h-[600px] lg:min-h-[700px]">
        <div className="container relative py-16 lg:py-24">
          <div className="flex flex-col lg:flex-row lg:items-center lg:gap-8">
            {/* Left: text content */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="relative z-10 max-w-xl lg:max-w-[45%] flex-shrink-0"
            >
              {/* Promo badge */}
              {promoEnabled && promoText && (
                <motion.div variants={fadeInUp} className="mb-5">
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="inline-flex items-center rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 px-4 py-1.5 text-sm font-medium text-orange-400 backdrop-blur-sm"
                  >
                    🔥 {promoText}
                  </motion.div>
                </motion.div>
              )}

              {/* Headline */}
              <motion.h1
                variants={fadeInUp}
                className="text-4xl font-extrabold text-white lg:text-5xl xl:text-6xl drop-shadow-lg py-1"
                style={{ lineHeight: 1.8 }}
              >
                {heroHeadline.split(/(\*[^*]+\*)/).map((part, i) => {
                  if (part.startsWith("*") && part.endsWith("*")) {
                    return (
                      <span
                        key={i}
                        className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500"
                      >
                        {part.slice(1, -1)}
                      </span>
                    );
                  }
                  return <span key={i}>{part}</span>;
                })}
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                variants={fadeInUp}
                className="mt-5 text-lg text-gray-300 lg:text-xl leading-relaxed max-w-xl drop-shadow-md"
              >
                {heroSubheadline}
              </motion.p>

              {/* CTA buttons */}
              <motion.div
                variants={fadeInUp}
                className="mt-8 flex flex-wrap items-center gap-4"
              >
                <Button
                  size="lg"
                  onClick={handlePrimaryCTA}
                  disabled={course.status === "coming_soon"}
                  className={
                    course.status === "coming_soon"
                      ? "border-2 border-blue-400/50 bg-blue-500/10 text-blue-300 font-semibold text-base px-8 py-6 rounded-full cursor-not-allowed opacity-80"
                      : "bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold text-base px-8 py-6 rounded-full shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:brightness-110 border-0"
                  }
                >
                  {course.status === "coming_soon"
                    ? "SẮP DIỄN RA"
                    : isEnrolled
                      ? "VÀO HỌC NGAY"
                      : marketing.hero?.cta_primary || "BẮT ĐẦU HÀNH TRÌNH"}
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  onClick={() => {
                    const el = document.getElementById("about");
                    if (el)
                      el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="text-gray-200 hover:text-white hover:bg-white/10 rounded-full backdrop-blur-sm border border-white/40 shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.5)] transition-shadow duration-300"
                >
                  <PlayCircle className="mr-2 h-5 w-5" />
                  {marketing.hero?.cta_secondary || "Giới thiệu khóa học"}
                </Button>
              </motion.div>

              {/* Social proof row */}
              <motion.div
                variants={fadeInUp}
                className="mt-8 flex flex-wrap items-center gap-4"
              >
                {/* Students count */}
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-300">
                    {displayStudents} học viên
                  </span>
                </div>
                {/* Star rating */}
                <div className="flex items-center gap-1.5">
                  <StarRow rating={displayRating} />
                  <span className="text-sm text-gray-300">
                    {displayRating.toFixed(1)}/5
                  </span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right: 3D Coverflow card slider */}
            {heroCards.length > 0 && (
              <div className="relative z-10 mt-10 lg:mt-0 flex-1 min-w-0">
                <CoverflowSlider cards={heroCards} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ticker band */}
      {tickerTexts.length > 0 && (
        <div className="relative z-10">
          <Ticker texts={tickerTexts} />
        </div>
      )}
    </section>
  );
}
