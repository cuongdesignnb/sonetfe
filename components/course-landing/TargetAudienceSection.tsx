"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Building2,
  Baby,
  Briefcase,
  Lightbulb,
  Store,
  Users,
  Smartphone,
  Rocket,
  Heart,
  BookOpen,
  Sparkles,
  Target,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CourseData, CourseMarketing, PersonaItem } from "./types";

/* ────────── Icon registry ────────── */

const ICON_MAP: Record<string, LucideIcon> = {
  building2: Building2,
  building: Building2,
  baby: Baby,
  briefcase: Briefcase,
  lightbulb: Lightbulb,
  store: Store,
  users: Users,
  smartphone: Smartphone,
  rocket: Rocket,
  heart: Heart,
  "book-open": BookOpen,
  bookopen: BookOpen,
  sparkles: Sparkles,
  target: Target,
};

/* ────────── Color presets ────────── */

const COLOR_PRESETS: Record<
  string,
  { iconBg: string; iconText: string; glow: string }
> = {
  blue: {
    iconBg: "bg-blue-500/20",
    iconText: "text-blue-400",
    glow: "shadow-blue-500/10",
  },
  green: {
    iconBg: "bg-green-500/20",
    iconText: "text-green-400",
    glow: "shadow-green-500/10",
  },
  purple: {
    iconBg: "bg-purple-500/20",
    iconText: "text-purple-400",
    glow: "shadow-purple-500/10",
  },
  amber: {
    iconBg: "bg-amber-500/20",
    iconText: "text-amber-400",
    glow: "shadow-amber-500/10",
  },
  pink: {
    iconBg: "bg-pink-500/20",
    iconText: "text-pink-400",
    glow: "shadow-pink-500/10",
  },
  orange: {
    iconBg: "bg-orange-500/20",
    iconText: "text-orange-400",
    glow: "shadow-orange-500/10",
  },
  red: {
    iconBg: "bg-red-500/20",
    iconText: "text-red-400",
    glow: "shadow-red-500/10",
  },
};

const COLOR_ORDER = [
  "blue",
  "green",
  "purple",
  "amber",
  "pink",
  "orange",
  "red",
];

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
  hidden: { opacity: 0, y: 35, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

/* ────────── Persona Card ────────── */

function PersonaCard({ item, index }: { item: PersonaItem; index: number }) {
  const colorKey = item.color || COLOR_ORDER[index % COLOR_ORDER.length];
  const colors = COLOR_PRESETS[colorKey] || COLOR_PRESETS.blue;
  const IconComp = ICON_MAP[(item.icon || "").toLowerCase()] || Sparkles;

  return (
    <motion.div
      variants={cardVariant}
      className={cn(
        "rounded-2xl border border-white/[0.07] bg-gray-900/60 backdrop-blur-sm p-6 sm:p-7 shadow-lg hover:bg-gray-900/80 transition-colors duration-300",
        colors.glow,
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "w-11 h-11 rounded-xl flex items-center justify-center mb-4",
          colors.iconBg,
        )}
      >
        <IconComp className={cn("h-5 w-5", colors.iconText)} />
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>

      {/* Description */}
      <p className="text-sm text-gray-400 leading-relaxed">
        {item.description}
      </p>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════
   TargetAudienceSection – main export
   ══════════════════════════════════════════════════════════ */

export interface TargetAudienceSectionProps {
  course: CourseData;
  onCtaClick?: () => void;
}

export function TargetAudienceSection({
  course,
  onCtaClick,
}: TargetAudienceSectionProps) {
  const marketing: CourseMarketing = course.marketing || {};
  const cfg = marketing.target_audience;

  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  if (!cfg?.enabled) return null;

  const title = cfg.title || "";
  const highlight = cfg.highlight || "";
  const subtitle = cfg.subtitle || "";
  const personas: PersonaItem[] = Array.isArray(cfg.personas)
    ? cfg.personas
    : [];
  const closingQuote = cfg.closing_quote || "";
  const ctaText = cfg.cta_text || "Bắt đầu ngay";

  if (personas.length === 0 && !closingQuote) return null;

  // Build highlighted title
  const renderTitle = () => {
    if (!highlight || !title.includes(highlight)) {
      return <span>{title}</span>;
    }
    const idx = title.indexOf(highlight);
    return (
      <>
        <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent italic">
          {title.slice(0, idx + highlight.length)}
        </span>
        {title.slice(idx + highlight.length)}
      </>
    );
  };

  return (
    <section
      ref={ref}
      id="target-audience"
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
                {renderTitle()}
              </h2>
            )}
            {subtitle && (
              <p className="mt-4 text-base sm:text-lg text-gray-400 leading-relaxed">
                {subtitle}
              </p>
            )}
          </motion.div>

          {/* ── Persona cards grid: 3 cols top, rest below ── */}
          {personas.length > 0 && (
            <motion.div
              variants={stagger}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6 max-w-5xl mx-auto"
            >
              {personas.map((item, i) => (
                <PersonaCard key={i} item={item} index={i} />
              ))}
            </motion.div>
          )}

          {/* ── Closing quote ── */}
          {closingQuote && (
            <motion.div
              variants={fadeInUp}
              className="mt-12 lg:mt-16 max-w-3xl mx-auto"
            >
              <div className="rounded-2xl border border-orange-500/20 bg-gradient-to-b from-gray-900/80 to-gray-950 p-8 sm:p-10 text-center">
                <p className="text-base sm:text-lg text-gray-300 leading-relaxed italic">
                  &ldquo;{closingQuote}&rdquo;
                </p>

                <div className="mt-6">
                  <Button
                    size="lg"
                    onClick={onCtaClick}
                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-base px-10 py-6 rounded-full shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:brightness-110 border-0"
                  >
                    {ctaText}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
