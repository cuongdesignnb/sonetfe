"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CourseData, CourseMarketing, PainPointBadge } from "./types";

/* ────────── Animation variants ────────── */

const fadeInLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

const fadeInRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

/* ────────── Floating badge positions ────────── */

const BADGE_POSITIONS: Record<string, string> = {
  "top-left": "top-2 left-2 sm:top-4 sm:left-4",
  "top-right": "top-2 right-2 sm:top-4 sm:right-4",
  "bottom-left": "bottom-2 left-2 sm:bottom-4 sm:left-4",
  "bottom-right": "bottom-2 right-2 sm:bottom-4 sm:right-4",
};

const BADGE_COLORS = [
  "from-orange-500 to-red-500",
  "from-purple-500 to-pink-500",
  "from-green-500 to-emerald-500",
  "from-yellow-500 to-orange-500",
];

/* ────────── Floating Badge ────────── */

function FloatingBadge({
  badge,
  index,
}: {
  badge: PainPointBadge;
  index: number;
}) {
  const pos =
    badge.position ||
    (["top-left", "top-right", "bottom-left", "bottom-right"] as const)[
      index % 4
    ];
  const color = BADGE_COLORS[index % BADGE_COLORS.length];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.4 + index * 0.15, duration: 0.5, ease: "easeOut" }}
      className={`absolute ${BADGE_POSITIONS[pos] || BADGE_POSITIONS["top-left"]} z-10`}
    >
      <div
        className={`bg-gradient-to-r ${color} px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-lg whitespace-nowrap`}
      >
        {badge.text}
      </div>
    </motion.div>
  );
}

/* ────────── YouTube embed helper ────────── */

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

/* ────────── Highlight text helper ────────── */

function HighlightedTitle({
  text,
  highlight,
}: {
  text: string;
  highlight?: string;
}) {
  if (!highlight || !text.includes(highlight)) {
    return <span>{text}</span>;
  }
  const idx = text.indexOf(highlight);
  const before = text.slice(0, idx);
  const after = text.slice(idx + highlight.length);

  return (
    <>
      {before && <span>{before}</span>}
      <span
        className="inline-block my-1 px-1 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400"
        style={{
          textDecorationLine: "underline",
          textDecorationColor: "#fb923c",
          textDecorationThickness: "4px",
          textUnderlineOffset: "6px",
        }}
      >
        &ldquo;{highlight}&rdquo;
      </span>
      {after && <span>{after}</span>}
    </>
  );
}

/* ══════════════════════════════════════════════════════════
   PainPointSection – main export
   ══════════════════════════════════════════════════════════ */

export interface PainPointSectionProps {
  course: CourseData;
  onCtaClick?: () => void;
}

export function PainPointSection({
  course,
  onCtaClick,
}: PainPointSectionProps) {
  const marketing: CourseMarketing = course.marketing || {};
  const pp = marketing.pain_point;

  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  // Don't render if not enabled or no data
  if (!pp?.enabled) return null;

  const title = pp.title || "";
  const highlight = pp.highlight || "";
  const description = pp.description || "";
  const calloutTitle = pp.callout_title || "Sự thật là";
  const calloutText = pp.callout_text || "";
  const videoUrl = pp.video_url || course.preview_video || "";
  const badges: PainPointBadge[] = Array.isArray(pp.badges) ? pp.badges : [];
  const ctaText = pp.cta_text || "YES! TÔI MUỐN HỌC THỬ NGAY";
  const communityNote = pp.community_note || "";

  const youtubeId = videoUrl ? extractYouTubeId(videoUrl) : null;
  const isDirectVideo = !youtubeId && !!videoUrl;

  // Strip the highlight quotes from title if already present
  const cleanTitle = title
    .replace(`"${highlight}"`, highlight)
    .replace(`"${highlight}"`, highlight);

  return (
    <section
      ref={ref}
      id="about"
      className="relative overflow-x-clip bg-gray-950 py-16 lg:py-24"
    >
      {/* Subtle background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container relative">
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={stagger}
          className="flex flex-col lg:flex-row lg:items-center lg:gap-12 xl:gap-16"
        >
          {/* ──── Left: Video with floating badges ──── */}
          <motion.div
            variants={fadeInLeft}
            className="relative w-full lg:w-[55%] flex-shrink-0"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/50 bg-gray-900 aspect-video border-2 border-white/10 ring-1 ring-orange-500/20">
              {youtubeId ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0`}
                  title="Video giới thiệu"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                  loading="lazy"
                />
              ) : isDirectVideo ? (
                <video
                  src={videoUrl}
                  controls
                  playsInline
                  preload="metadata"
                  className="absolute inset-0 w-full h-full object-contain bg-black"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-600">
                  <span className="text-lg">Video Preview</span>
                </div>
              )}
            </div>

            {/* Floating badges */}
            {badges.map((badge, i) => (
              <FloatingBadge key={i} badge={badge} index={i} />
            ))}
          </motion.div>

          {/* ──── Right: Content ──── */}
          <motion.div
            variants={fadeInRight}
            className="mt-10 lg:mt-0 flex-1 min-w-0"
          >
            {/* Headline */}
            {cleanTitle && (
              <h2
                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white italic"
                style={{ lineHeight: 1.6 }}
              >
                <HighlightedTitle text={cleanTitle} highlight={highlight} />
              </h2>
            )}

            {/* Description */}
            {description && (
              <p className="mt-6 text-base sm:text-lg text-gray-300 leading-relaxed">
                {description}
              </p>
            )}

            {/* Callout card */}
            {calloutText && (
              <div className="mt-8 rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-950/40 to-gray-900/60 p-5 sm:p-6 backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-9 h-9 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <Lightbulb className="h-5 w-5 text-amber-400" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-amber-300">
                      {calloutTitle}
                    </h3>
                    <p className="mt-1.5 text-sm sm:text-base text-gray-300 leading-relaxed">
                      {calloutText}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="mt-8">
              <Button
                size="lg"
                onClick={onCtaClick}
                className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-base px-10 py-6 rounded-full shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:brightness-110 border-0 uppercase tracking-wide"
              >
                {ctaText}
              </Button>
            </div>

            {/* Community note */}
            {communityNote && (
              <div className="mt-4 px-4 py-2.5 rounded-lg border border-amber-500/20 bg-amber-950/20">
                <p className="text-sm text-amber-200/70 text-center sm:text-left">
                  {communityNote}
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
