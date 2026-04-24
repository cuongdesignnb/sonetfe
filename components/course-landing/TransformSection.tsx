"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  Play,
  CheckCircle2,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { resolveAssetUrl } from "@/lib/asset-url";
import type {
  CourseData,
  CourseMarketing,
  InstructorAchievement,
} from "./types";

/* ────────── Animation variants ────────── */

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

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
  visible: { transition: { staggerChildren: 0.12 } },
};

/* ══════════════════════════════════════════════════════════
   Part 1 – Before / After Comparison
   ══════════════════════════════════════════════════════════ */

function BeforeAfterBlock({
  before,
  after,
  bottomNote,
}: {
  before: { title: string; items: string[] };
  after: { title: string; items: string[]; badge?: string };
  bottomNote?: string;
}) {
  return (
    <div className="relative">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-0">
        {/* Before column */}
        <motion.div
          variants={fadeInLeft}
          className="rounded-2xl md:rounded-r-none border border-white/[0.07] bg-gray-900/70 p-6 sm:p-8"
        >
          <div className="flex items-center gap-2 mb-5">
            <ChevronDown className="h-5 w-5 text-red-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-red-400">
              {before.title}
            </h3>
          </div>
          <ol className="space-y-3">
            {before.items.map((item, i) => (
              <li
                key={i}
                className="flex gap-3 text-sm text-gray-400 leading-relaxed"
              >
                <span className="flex-shrink-0 text-gray-600 font-medium">
                  {i + 1}.
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </motion.div>

        {/* After column */}
        <motion.div
          variants={fadeInRight}
          className="relative rounded-2xl md:rounded-l-none border border-green-500/20 bg-gradient-to-br from-gray-900/90 to-green-950/20 p-6 sm:p-8"
        >
          {/* Recommended badge */}
          {after.badge && (
            <div className="absolute -top-3 right-4 sm:right-6">
              <span className="bg-green-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-lg shadow-green-500/30">
                {after.badge}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 mb-5">
            <ChevronUp className="h-5 w-5 text-green-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-green-400">
              {after.title}
            </h3>
          </div>
          <ol className="space-y-3">
            {after.items.map((item, i) => (
              <li
                key={i}
                className="flex gap-3 text-sm text-gray-300 leading-relaxed"
              >
                <span className="flex-shrink-0 text-green-500/70 font-medium">
                  {i + 1}.
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </motion.div>

        {/* VS badge */}
        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="w-12 h-12 rounded-full bg-gray-800 border-2 border-white/10 flex items-center justify-center shadow-xl">
            <span className="text-xs font-bold text-white">VS</span>
          </div>
        </div>
      </div>

      {/* Bottom note */}
      {bottomNote && (
        <motion.p
          variants={fadeInUp}
          className="mt-5 text-sm text-green-400 italic text-center md:text-left"
        >
          *{bottomNote}
        </motion.p>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Part 2 – Instructor Profile
   ══════════════════════════════════════════════════════════ */

function InstructorBlock({
  badge,
  label,
  title,
  image,
  bio,
  expertise,
  closingQuote,
  achievements,
  ctaText,
  videoCta,
  onCtaClick,
  videoIntro,
}: {
  badge?: string;
  label?: string;
  title: string;
  image: string;
  bio?: string;
  expertise?: string[];
  closingQuote?: string;
  achievements?: InstructorAchievement[];
  ctaText?: string;
  videoCta?: string;
  onCtaClick?: () => void;
  videoIntro?: string;
}) {
  return (
    <div>
      {/* Top badge & label */}
      <motion.div variants={fadeInUp} className="text-center mb-8">
        {badge && (
          <span className="inline-flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full mb-3">
            <Award className="h-3.5 w-3.5" />
            {badge}
          </span>
        )}
        {label && (
          <p className="text-sm text-gray-500 uppercase tracking-widest mt-2">
            {label}
          </p>
        )}
        {title && (
          <h3 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">
            {title}
          </h3>
        )}
      </motion.div>

      {/* Photo + Bio row */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:gap-10 xl:gap-14">
        {/* Photo */}
        {image && (
          <motion.div
            variants={fadeInLeft}
            className="flex-shrink-0 mx-auto lg:mx-0 mb-8 lg:mb-0"
          >
            <div className="relative w-56 h-56 sm:w-64 sm:h-64 lg:w-72 lg:h-72 rounded-2xl overflow-hidden border-2 border-amber-500/30 shadow-xl shadow-amber-500/10">
              <Image
                src={resolveAssetUrl(image)}
                alt={title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 224px, 288px"
                unoptimized
              />
            </div>
          </motion.div>
        )}

        {/* Bio content */}
        <motion.div variants={fadeInRight} className="flex-1 min-w-0">
          {bio && (
            <p className="text-base text-gray-300 leading-relaxed italic mb-5">
              {bio}
            </p>
          )}

          {/* Expertise bullets */}
          {expertise && expertise.length > 0 && (
            <ul className="space-y-2.5 mb-6">
              {expertise.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-sm text-gray-300"
                >
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5 text-orange-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Closing quote */}
          {closingQuote && (
            <p className="text-sm text-gray-400 leading-relaxed italic border-l-2 border-orange-500/30 pl-4 mb-6">
              {closingQuote}
            </p>
          )}
        </motion.div>
      </div>

      {/* Stats row */}
      {achievements && achievements.length > 0 && (
        <motion.div
          variants={fadeInUp}
          className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-2xl mx-auto"
        >
          {achievements.map((a, i) => (
            <div
              key={i}
              className="rounded-xl border border-white/[0.08] bg-gray-900/60 p-4 text-center"
            >
              <p className="text-2xl sm:text-3xl font-extrabold text-white">
                {a.value}
              </p>
              <p className="mt-1 text-xs sm:text-sm text-gray-500">{a.label}</p>
            </div>
          ))}
        </motion.div>
      )}

      {/* CTA buttons */}
      <motion.div
        variants={fadeInUp}
        className="mt-8 flex flex-wrap justify-center gap-4"
      >
        {ctaText && (
          <Button
            size="lg"
            onClick={onCtaClick}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-base px-8 py-6 rounded-full shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:brightness-110 border-0"
          >
            {ctaText}
          </Button>
        )}
        {videoCta && videoIntro && (
          <Button
            size="lg"
            variant="outline"
            onClick={() => window.open(videoIntro, "_blank")}
            className="border-white/20 text-gray-300 hover:text-white hover:bg-white/5 rounded-full px-8 py-6"
          >
            <Play className="mr-2 h-4 w-4 text-orange-400" />
            {videoCta}
          </Button>
        )}
      </motion.div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   TransformSection – combined export
   ══════════════════════════════════════════════════════════ */

export interface TransformSectionProps {
  course: CourseData;
  onCtaClick?: () => void;
}

export function TransformSection({
  course,
  onCtaClick,
}: TransformSectionProps) {
  const marketing: CourseMarketing = course.marketing || {};
  const ba = marketing.before_after;
  const inst = marketing.instructor_extra;

  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const hasBa = ba?.enabled && ba.before && ba.after;
  const hasInst = inst?.enabled;

  if (!hasBa && !hasInst) return null;

  // Instructor image: marketing override → course instructor avatar
  const instructorImage = inst?.image || course.instructor?.avatar || "";
  const instructorTitle =
    inst?.title || `${course.instructor?.name || "Giảng viên"}`;

  return (
    <section
      ref={ref}
      id="transform"
      className="relative overflow-x-clip bg-gray-950 py-16 lg:py-24"
    >
      <div className="container relative">
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={stagger}
        >
          {/* ──── Before / After ──── */}
          {hasBa && (
            <>
              {/* Title */}
              <motion.div
                variants={fadeInUp}
                className="text-center max-w-3xl mx-auto mb-10 lg:mb-14"
              >
                {ba.title && (
                  <h2
                    className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white uppercase py-1"
                    style={{ lineHeight: 1.8 }}
                  >
                    {ba.title}
                  </h2>
                )}
                {ba.subtitle && (
                  <p className="mt-4 text-base text-gray-400">{ba.subtitle}</p>
                )}
              </motion.div>

              <div className="max-w-5xl mx-auto">
                <BeforeAfterBlock
                  before={{
                    title: ba.before!.title || "TRƯỚC KHI THAM GIA",
                    items: ba.before!.items,
                  }}
                  after={{
                    title: ba.after!.title || "SAU KHÓA HỌC",
                    items: ba.after!.items,
                    badge: ba.after!.recommended_badge,
                  }}
                  bottomNote={ba.bottom_note}
                />
              </div>
            </>
          )}

          {/* ──── Divider ──── */}
          {hasBa && hasInst && (
            <div className="my-16 lg:my-20 border-t border-white/[0.05]" />
          )}

          {/* ──── Instructor ──── */}
          {hasInst && (
            <div id="instructor" className="max-w-4xl mx-auto">
              <InstructorBlock
                badge={inst.badge}
                label={inst.label}
                title={instructorTitle}
                image={instructorImage}
                bio={inst.bio_extended}
                expertise={inst.expertise}
                closingQuote={inst.closing_quote}
                achievements={inst.achievements}
                ctaText={inst.cta_text}
                videoCta={inst.video_cta_text}
                videoIntro={inst.video_intro}
                onCtaClick={onCtaClick}
              />
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
