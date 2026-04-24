"use client";

import { useRef, useState, useMemo, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  PlayCircle,
  ChevronDown,
  Lock,
  Eye,
  Video,
  Clock,
} from "lucide-react";
import { resolveAssetUrl } from "@/lib/asset-url";
import type { CourseData, Section, Lesson } from "./types";

/* ────────── helpers ────────── */

function formatDurationRange(seconds: number | null): string {
  if (!seconds) return "15-30p";
  const m = Math.floor(seconds / 60);
  if (m <= 5) return "1-5p";
  if (m <= 15) return "5-15p";
  if (m <= 30) return "15-30p";
  if (m <= 60) return "30-60p";
  return "60p+";
}

/** Generate a total view count for a section (visual only, from lesson count). */
function sectionViewCount(lessons: Lesson[]): string {
  const base = lessons.length * 247;
  return base.toLocaleString("vi-VN");
}

/* ────────── Animation variants ────────── */

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

/* ────────── Lesson Card ────────── */

function LessonCard({
  lesson,
  index,
  instructorName,
  instructorAvatar,
  onWatch,
  onLockedClick,
}: {
  lesson: Lesson;
  index: number;
  instructorName?: string;
  instructorAvatar?: string;
  onWatch?: (lesson: Lesson) => void;
  onLockedClick?: () => void;
}) {
  const isFree = lesson.is_preview;
  const thumb = lesson.thumbnail ? resolveAssetUrl(lesson.thumbnail) : null;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-white/[0.07] bg-gray-900/60 transition-all duration-300 hover:border-orange-500/30 hover:bg-gray-900/80 hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-500/[0.08] cursor-pointer">
      {/* Thumbnail area */}
      <div className="relative aspect-video w-full overflow-hidden bg-gray-800">
        {thumb ? (
          <Image
            src={thumb}
            alt={lesson.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 transition-all duration-500 group-hover:from-gray-700 group-hover:to-gray-800">
            <Video className="h-8 w-8 text-gray-600 transition-all duration-300 group-hover:text-orange-500/60 group-hover:scale-110" />
          </div>
        )}

        {/* Lock icon for premium (no dark overlay) */}
        {!isFree && (
          <button
            onClick={onLockedClick}
            className="absolute inset-0 z-10 flex items-center justify-center"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 ring-1 ring-white/20 transition-all duration-300 group-hover:ring-orange-500/40 group-hover:scale-110">
              <Lock className="h-4 w-4 text-white/80 transition-colors duration-300 group-hover:text-orange-400" />
            </div>
          </button>
        )}

        {/* Free / Premium badge */}
        <div className="absolute top-2 left-2">
          {isFree ? (
            <span className="inline-flex items-center gap-1 rounded bg-green-500/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow">
              <Eye className="h-3 w-3" /> Miễn phí
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded bg-orange-500/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow">
              <Lock className="h-2.5 w-2.5" /> Premium
            </span>
          )}
        </div>

        {/* Lesson number badge */}
        <div className="absolute top-2 right-2">
          <span className="rounded bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white/90 backdrop-blur-sm">
            Bài {index}
          </span>
        </div>

        {/* Instructor avatar */}
        {instructorAvatar && (
          <div className="absolute bottom-2 right-2">
            <div className="h-8 w-8 overflow-hidden rounded-full border-2 border-white/20">
              <Image
                src={resolveAssetUrl(instructorAvatar)}
                alt={instructorName || ""}
                width={32}
                height={32}
                className="object-cover"
                unoptimized
              />
            </div>
          </div>
        )}

        {/* Play button for free lessons */}
        {isFree && (
          <button
            onClick={() => onWatch?.(lesson)}
            className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/90 shadow-lg shadow-orange-500/30">
              <PlayCircle className="h-6 w-6 text-white" />
            </div>
          </button>
        )}
      </div>

      {/* Info area */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        <h4 className="line-clamp-2 text-sm font-medium leading-snug text-gray-200 transition-colors duration-300 group-hover:text-white">
          {lesson.title}
        </h4>
        <div className="mt-auto flex items-center gap-3 text-[11px] text-gray-500">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDurationRange(lesson.duration)}
          </span>
          <span className="flex items-center gap-1">
            <PlayCircle className="h-3 w-3" />
            Video
          </span>
          <span className="ml-auto">
            {isFree ? (
              <button
                onClick={() => onWatch?.(lesson)}
                className="font-semibold text-orange-400 hover:text-orange-300 transition-colors"
              >
                Xem ngay
              </button>
            ) : (
              <button
                onClick={onLockedClick}
                className="flex items-center gap-1 text-gray-600 hover:text-orange-400 transition-colors"
              >
                <Lock className="h-3 w-3" /> Mở khóa
              </button>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ────────── Section Accordion ────────── */

function SectionAccordion({
  section,
  index,
  isExpanded,
  onToggle,
  instructorName,
  instructorAvatar,
  onWatchLesson,
  onLockedClick,
}: {
  section: Section;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  instructorName?: string;
  instructorAvatar?: string;
  onWatchLesson?: (lesson: Lesson) => void;
  onLockedClick?: () => void;
}) {
  const lessons = section.lessons || [];
  const videoCount = lessons.length;
  const viewCount = sectionViewCount(lessons);

  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.07] bg-gray-900/40 transition-all duration-300 hover:border-white/[0.12] hover:shadow-md hover:shadow-black/20">
      {/* Header */}
      <button
        onClick={onToggle}
        className="group/hdr flex w-full items-center gap-4 p-4 sm:p-5 text-left transition-colors duration-300 hover:bg-white/[0.02]"
      >
        {/* Number circle */}
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-base font-bold text-white shadow-md shadow-orange-500/20 transition-all duration-300 group-hover/hdr:shadow-lg group-hover/hdr:shadow-orange-500/40 group-hover/hdr:scale-110">
          {index}
        </div>

        {/* Title & meta */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-base font-semibold text-white leading-snug line-clamp-2">
            {section.title}
          </h3>
          <p className="mt-0.5 text-xs text-gray-500">
            {videoCount} video • {viewCount} lượt xem
          </p>
        </div>

        {/* Right side: lesson count + toggle */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="hidden sm:inline text-sm text-orange-400 font-medium">
            {videoCount} bài học
          </span>
          <ChevronDown
            className={`h-4 w-4 text-gray-500 transition-transform duration-300 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Expanded lessons */}
      <AnimatePresence>
        {isExpanded && lessons.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/[0.05] p-4 sm:p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {lessons.map((lesson, li) => (
                  <LessonCard
                    key={lesson.id}
                    lesson={lesson}
                    index={li + 1}
                    instructorName={instructorName}
                    instructorAvatar={instructorAvatar}
                    onWatch={onWatchLesson}
                    onLockedClick={onLockedClick}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   CurriculumSection – main export
   ══════════════════════════════════════════════════════════ */

export interface CurriculumSectionProps {
  course: CourseData;
  onCtaClick?: () => void;
}

export function CurriculumSection({
  course,
  onCtaClick,
}: CurriculumSectionProps) {
  const sections = useMemo(() => course.sections || [], [course.sections]);
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const router = useRouter();

  // All sections expanded by default
  const [expandedIds, setExpandedIds] = useState<number[]>(() =>
    sections.map((s) => s.id),
  );

  const toggleSection = (id: number) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  // Navigate to learn page with the lesson (works without login for preview lessons)
  const handleWatchLesson = useCallback(
    (lesson: Lesson) => {
      router.push(
        `/courses/${course.slug || course.id}/learn?lesson=${lesson.id}`,
      );
    },
    [router, course.slug, course.id],
  );

  // Computed stats
  const stats = useMemo(() => {
    let totalLessons = 0;
    let freeLessons = 0;
    for (const s of sections) {
      for (const l of s.lessons || []) {
        totalLessons++;
        if (l.is_preview) freeLessons++;
      }
    }
    return {
      modules: sections.length,
      lessons: totalLessons,
      free: freeLessons,
    };
  }, [sections]);

  if (sections.length === 0) return null;

  const instructorName = course.instructor?.name;
  const instructorAvatar = course.instructor?.avatar;

  // Marketing subtitle override
  const mkt = course.marketing as Record<string, unknown> | undefined;
  const curriculumCfg = mkt?.curriculum as { subtitle?: string } | undefined;
  const subtitle =
    curriculumCfg?.subtitle ||
    "Lộ trình học từ A-Z để làm video marketing chuyên nghiệp";

  return (
    <section
      ref={ref}
      id="curriculum"
      className="relative overflow-x-clip bg-gray-950 py-16 lg:py-24"
    >
      <div className="container relative">
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={stagger}
        >
          {/* ── Title ── */}
          <motion.div
            variants={fadeInUp}
            className="text-center mb-10 lg:mb-14"
          >
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold py-1"
              style={{ lineHeight: 1.8 }}
            >
              <span className="bg-gradient-to-r from-orange-400 via-red-400 to-purple-500 bg-clip-text text-transparent">
                Nội dung khóa học
              </span>
            </h2>
            <p className="mt-4 text-base text-gray-400 max-w-xl mx-auto">
              {subtitle}
            </p>
          </motion.div>

          {/* ── Stats badges ── */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-10 lg:mb-14"
          >
            <div className="flex items-center gap-2 rounded-full border border-white/[0.10] bg-gray-900/60 px-4 py-2 text-sm text-gray-300">
              <BookOpen className="h-4 w-4 text-gray-400" />
              <span className="font-semibold text-white">
                {stats.modules}
              </span>{" "}
              module
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/[0.10] bg-gray-900/60 px-4 py-2 text-sm text-gray-300">
              <Video className="h-4 w-4 text-gray-400" />
              <span className="font-semibold text-white">
                {stats.lessons}
              </span>{" "}
              bài học
            </div>
            {stats.free > 0 && (
              <div className="flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-sm text-orange-300">
                <PlayCircle className="h-4 w-4 text-orange-400" />
                <span className="font-semibold text-orange-400">
                  {stats.free}
                </span>{" "}
                bài học miễn phí
              </div>
            )}
          </motion.div>

          {/* ── Section Accordions ── */}
          <div className="max-w-5xl mx-auto space-y-3">
            {sections.map((section, idx) => (
              <motion.div key={section.id} variants={fadeInUp}>
                <SectionAccordion
                  section={section}
                  index={idx + 1}
                  isExpanded={expandedIds.includes(section.id)}
                  onToggle={() => toggleSection(section.id)}
                  instructorName={instructorName}
                  instructorAvatar={instructorAvatar}
                  onWatchLesson={handleWatchLesson}
                  onLockedClick={onCtaClick}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
