"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Users,
  Smartphone,
  Rocket,
  Heart,
  BookOpen,
  Sparkles,
  Target,
  Zap,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CourseData, CourseMarketing, BenefitItem } from "./types";

/* ────────── Icon registry ────────── */

const ICON_MAP: Record<string, LucideIcon> = {
  users: Users,
  smartphone: Smartphone,
  rocket: Rocket,
  heart: Heart,
  "book-open": BookOpen,
  bookopen: BookOpen,
  sparkles: Sparkles,
  target: Target,
  zap: Zap,
  "trending-up": TrendingUp,
  trendingup: TrendingUp,
};

/* ────────── Color presets ────────── */

const COLOR_PRESETS: Record<
  string,
  {
    border: string;
    iconBg: string;
    iconText: string;
    number: string;
    glow: string;
  }
> = {
  purple: {
    border: "border-purple-500/40",
    iconBg: "bg-purple-500/20",
    iconText: "text-purple-400",
    number: "text-purple-500/15",
    glow: "shadow-purple-500/10",
  },
  green: {
    border: "border-green-500/40",
    iconBg: "bg-green-500/20",
    iconText: "text-green-400",
    number: "text-green-500/15",
    glow: "shadow-green-500/10",
  },
  blue: {
    border: "border-blue-500/40",
    iconBg: "bg-blue-500/20",
    iconText: "text-blue-400",
    number: "text-blue-500/15",
    glow: "shadow-blue-500/10",
  },
  pink: {
    border: "border-pink-500/40",
    iconBg: "bg-pink-500/20",
    iconText: "text-pink-400",
    number: "text-pink-500/15",
    glow: "shadow-pink-500/10",
  },
  orange: {
    border: "border-orange-500/40",
    iconBg: "bg-orange-500/20",
    iconText: "text-orange-400",
    number: "text-orange-500/15",
    glow: "shadow-orange-500/10",
  },
  amber: {
    border: "border-amber-500/40",
    iconBg: "bg-amber-500/20",
    iconText: "text-amber-400",
    number: "text-amber-500/15",
    glow: "shadow-amber-500/10",
  },
};

const COLOR_ORDER = ["purple", "green", "blue", "pink", "orange", "amber"];

/* ────────── Animation variants ────────── */

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

/* ────────── Single Benefit Card ────────── */

function BenefitCard({
  item,
  index,
  isWide,
}: {
  item: BenefitItem;
  index: number;
  isWide: boolean;
}) {
  const colorKey = item.color || COLOR_ORDER[index % COLOR_ORDER.length];
  const colors = COLOR_PRESETS[colorKey] || COLOR_PRESETS.purple;
  const IconComp = ICON_MAP[(item.icon || "").toLowerCase()] || Sparkles;
  const num = String(index + 1).padStart(2, "0");

  return (
    <motion.div
      variants={cardVariant}
      className={cn(
        "relative rounded-2xl border bg-gray-900/60 backdrop-blur-sm p-6 sm:p-8 overflow-hidden group hover:bg-gray-900/80 transition-colors duration-300",
        colors.border,
        colors.glow,
        "shadow-lg",
        isWide ? "col-span-1 sm:col-span-2" : "col-span-1",
      )}
    >
      {/* Large faded number */}
      <span
        className={cn(
          "absolute top-3 right-5 text-7xl sm:text-8xl font-extrabold select-none pointer-events-none",
          colors.number,
        )}
      >
        {num}
      </span>

      {/* Icon */}
      <div
        className={cn(
          "relative z-10 w-10 h-10 rounded-xl flex items-center justify-center mb-4",
          colors.iconBg,
        )}
      >
        <IconComp className={cn("h-5 w-5", colors.iconText)} />
      </div>

      {/* Title */}
      <h3 className="relative z-10 text-lg sm:text-xl font-bold text-white mb-2">
        {item.title}
      </h3>

      {/* Description */}
      <p className="relative z-10 text-sm sm:text-base text-gray-400 leading-relaxed">
        {item.description}
      </p>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════
   BenefitsSection – main export
   ══════════════════════════════════════════════════════════ */

export interface BenefitsSectionProps {
  course: CourseData;
  onCtaClick?: () => void;
}

export function BenefitsSection({ course, onCtaClick }: BenefitsSectionProps) {
  const marketing: CourseMarketing = course.marketing || {};
  const cfg = marketing.benefits;

  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  if (!cfg?.enabled) return null;

  const title = cfg.title || "";
  const highlight = cfg.highlight || "";
  const subtitle = cfg.subtitle || "";
  const items: BenefitItem[] = Array.isArray(cfg.items) ? cfg.items : [];
  const ctaText = cfg.cta_text || "Nhận lộ trình chi tiết";

  if (items.length === 0) return null;

  // Is the last item a "wide" card? (odd total → last one spans full width)
  const isOddTotal = items.length % 2 !== 0;

  return (
    <section
      ref={ref}
      id="benefits"
      className="relative overflow-x-clip bg-gray-950 py-16 lg:py-24"
    >
      <div className="container relative">
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={stagger}
        >
          {/* ── Header ── */}
          <motion.div
            variants={fadeInUp}
            className="text-center max-w-3xl mx-auto mb-12 lg:mb-16"
          >
            {title && (
              <h2
                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white py-1"
                style={{ lineHeight: 1.8 }}
              >
                {title}
              </h2>
            )}
            {highlight && (
              <p
                className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-extrabold uppercase tracking-wide py-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent italic"
                style={{ lineHeight: 1.8 }}
              >
                {highlight}
              </p>
            )}
            {subtitle && (
              <p className="mt-5 text-base sm:text-lg text-gray-400 leading-relaxed">
                {subtitle}
              </p>
            )}
          </motion.div>

          {/* ── Cards grid ── */}
          <motion.div
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-6 max-w-4xl mx-auto"
          >
            {items.map((item, i) => {
              const isLast = i === items.length - 1;
              const isWide = isOddTotal && isLast;
              return (
                <BenefitCard key={i} item={item} index={i} isWide={isWide} />
              );
            })}
          </motion.div>

          {/* ── CTA ── */}
          <motion.div variants={fadeInUp} className="mt-12 text-center">
            <Button
              size="lg"
              onClick={onCtaClick}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-base px-10 py-6 rounded-full shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:brightness-110 border-0"
            >
              {ctaText}
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
