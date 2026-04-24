"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Play, X, ChevronLeft, ChevronRight } from "lucide-react";
import { resolveAssetUrl } from "@/lib/asset-url";
import type { CourseData, VideoTestimonial } from "./types";

/* ────────── Types ────────── */

export type TestimonialsSectionProps = {
  course: CourseData;
};

/* ────────── Animation variants ────────── */

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

/* ────────── Video Testimonial Card ────────── */

function VideoCard({
  item,
  onClick,
}: {
  item: VideoTestimonial;
  onClick: () => void;
}) {
  return (
    <motion.div
      variants={fadeInUp}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-gray-900 transition-all hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/10"
      onClick={onClick}
    >
      <div className="relative aspect-video">
        <Image
          src={resolveAssetUrl(item.thumbnail)}
          alt={item.caption || "Testimonial"}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-500/90 shadow-lg shadow-orange-500/30 transition-transform duration-300 group-hover:scale-110">
            <Play className="h-6 w-6 text-white" fill="white" />
          </div>
        </div>

        {/* Captions */}
        {(item.caption || item.subcaption) && (
          <div className="absolute bottom-3 left-3 right-3">
            {item.caption && (
              <p className="text-sm font-bold leading-tight text-white drop-shadow-lg">
                {item.caption}
              </p>
            )}
            {item.subcaption && (
              <p className="mt-0.5 text-xs text-gray-300 drop-shadow-lg">
                {item.subcaption}
              </p>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ────────── Infinite Slow Slider ────────── */

function SlowSlider({
  images,
  onImageClick,
  speed = 30,
}: {
  images: string[];
  onImageClick: (index: number) => void;
  speed?: number;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  // Duplicate images for infinite scroll effect
  const doubled = [...images, ...images];

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let animId: number;
    let offset = 0;
    const halfWidth = track.scrollWidth / 2;

    function animate() {
      if (!paused) {
        offset += speed / 60; // px per frame at ~60fps
        if (offset >= halfWidth) offset = 0;
        if (track) track.style.transform = `translateX(-${offset}px)`;
      }
      animId = requestAnimationFrame(animate);
    }
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [paused, speed]);

  return (
    <div
      className="relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-gray-950 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-gray-950 to-transparent" />

      <div ref={trackRef} className="flex gap-3 will-change-transform">
        {doubled.map((src, i) => (
          <div
            key={`${src}-${i}`}
            className="group relative h-40 w-28 flex-shrink-0 cursor-pointer overflow-hidden rounded-xl border border-white/10 transition-all hover:border-orange-500/30 hover:shadow-md hover:shadow-orange-500/10 sm:h-48 sm:w-32"
            onClick={() => onImageClick(i % images.length)}
          >
            <Image
              src={resolveAssetUrl(src)}
              alt={`Screenshot ${(i % images.length) + 1}`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="128px"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ────────── Gallery Slow Slider (wider images) ────────── */

function GallerySlider({
  images,
  onImageClick,
  speed = 25,
}: {
  images: string[];
  onImageClick: (index: number) => void;
  speed?: number;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  const doubled = [...images, ...images];

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let animId: number;
    let offset = 0;
    const halfWidth = track.scrollWidth / 2;

    function animate() {
      if (!paused) {
        offset += speed / 60;
        if (offset >= halfWidth) offset = 0;
        if (track) track.style.transform = `translateX(-${offset}px)`;
      }
      animId = requestAnimationFrame(animate);
    }
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [paused, speed]);

  return (
    <div
      className="relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-gray-950 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-gray-950 to-transparent" />

      <div ref={trackRef} className="flex gap-3 will-change-transform">
        {doubled.map((src, i) => (
          <div
            key={`${src}-${i}`}
            className="group relative h-36 w-44 flex-shrink-0 cursor-pointer overflow-hidden rounded-xl border border-white/10 transition-all hover:border-orange-500/30 hover:shadow-md hover:shadow-orange-500/10 sm:h-44 sm:w-56"
            onClick={() => onImageClick(i % images.length)}
          >
            <Image
              src={resolveAssetUrl(src)}
              alt={`Gallery ${(i % images.length) + 1}`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="224px"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ────────── Image Lightbox Modal ────────── */

function ImageModal({
  images,
  currentIndex,
  onClose,
  onPrev,
  onNext,
}: {
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  // Close on Escape key
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, onPrev, onNext]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Previous */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
        className="absolute left-4 z-10 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      {/* Image */}
      <div
        className="relative max-h-[85vh] max-w-[90vw]"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={resolveAssetUrl(images[currentIndex])}
          alt={`Image ${currentIndex + 1}`}
          width={1200}
          height={800}
          className="max-h-[85vh] w-auto rounded-lg object-contain"
          priority
        />
        {/* Counter */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-1.5 text-sm text-white">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Next */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        className="absolute right-4 z-10 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
    </motion.div>
  );
}

/* ────────── Video Modal (YouTube / embed) ────────── */

function VideoModal({
  videoUrl,
  onClose,
}: {
  videoUrl: string;
  onClose: () => void;
}) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
      >
        <X className="h-6 w-6" />
      </button>

      <div
        className="relative aspect-video w-full max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        <iframe
          src={videoUrl}
          className="h-full w-full rounded-xl"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TestimonialsSection
   ══════════════════════════════════════════════════════════════ */

export function TestimonialsSection({ course }: TestimonialsSectionProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  /* ── Modal state (hooks must be before any early return) ── */
  const [modalImages, setModalImages] = useState<string[] | null>(null);
  const [modalIndex, setModalIndex] = useState(0);
  const [videoModal, setVideoModal] = useState<string | null>(null);

  const openImageModal = useCallback((images: string[], index: number) => {
    setModalImages(images);
    setModalIndex(index);
  }, []);

  const closeModal = useCallback(() => {
    setModalImages(null);
    setVideoModal(null);
  }, []);

  const prevImage = useCallback(() => {
    if (!modalImages) return;
    setModalIndex((i) => (i - 1 + modalImages.length) % modalImages.length);
  }, [modalImages]);

  const nextImage = useCallback(() => {
    if (!modalImages) return;
    setModalIndex((i) => (i + 1) % modalImages.length);
  }, [modalImages]);

  const testimonials = course.marketing?.testimonials;
  if (!testimonials?.enabled) return null;

  const videos = testimonials.videos ?? [];
  const feedbackImages = testimonials.feedback_images ?? [];
  const galleryImages = testimonials.gallery_images ?? [];

  const title = testimonials.title || "CẢM NHẬN HỌC VIÊN";
  const feedbackTitle = testimonials.feedback_title || "PHẢN HỒI TỪ CỘNG ĐỒNG";
  const galleryTitle =
    testimonials.gallery_title || "HÌNH ẢNH CÁC BUỔI ĐÀO TẠO";
  const ctaText = testimonials.cta_text || "";

  function handleVideoClick(video: VideoTestimonial) {
    if (video.video_url) {
      setVideoModal(video.video_url);
    } else {
      openImageModal([video.thumbnail], 0);
    }
  }

  const hasVideos = videos.length > 0;
  const hasFeedback = feedbackImages.length > 0;
  const hasGallery = galleryImages.length > 0;

  return (
    <>
      <section
        ref={ref}
        id="testimonials"
        className="relative overflow-x-clip bg-gray-950 py-20 sm:py-28"
      >
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-1/3 h-[500px] w-[600px] rounded-full bg-orange-500/5 blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 h-[400px] w-[500px] rounded-full bg-purple-500/5 blur-[120px]" />
        </div>

        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={stagger}
          className="relative"
        >
          {/* ═══ Video Testimonials Grid ═══ */}
          {hasVideos && (
            <div className="mx-auto mb-16 max-w-6xl px-4 sm:px-6">
              <motion.h2
                variants={fadeInUp}
                className="mb-10 text-center text-2xl font-black uppercase tracking-wider sm:text-3xl"
              >
                <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
                  {title}
                </span>
              </motion.h2>

              <motion.div
                variants={stagger}
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
              >
                {videos.map((video, i) => (
                  <VideoCard
                    key={i}
                    item={video}
                    onClick={() => handleVideoClick(video)}
                  />
                ))}
              </motion.div>
            </div>
          )}

          {/* ═══ Community Feedback Slider ═══ */}
          {hasFeedback && (
            <div className="mb-16">
              <motion.h3
                variants={fadeInUp}
                className="mb-8 text-center text-sm font-black uppercase tracking-[0.2em] text-gray-400 sm:text-base"
              >
                {feedbackTitle}
              </motion.h3>

              <motion.div variants={fadeInUp}>
                <SlowSlider
                  images={feedbackImages}
                  onImageClick={(index) =>
                    openImageModal(feedbackImages, index)
                  }
                  speed={30}
                />
              </motion.div>
            </div>
          )}

          {/* ═══ Training Gallery Slider ═══ */}
          {hasGallery && (
            <div>
              <motion.h3
                variants={fadeInUp}
                className="mb-8 text-center text-sm font-black uppercase tracking-[0.2em] text-gray-400 sm:text-base"
              >
                {galleryTitle}
              </motion.h3>

              <motion.div variants={fadeInUp}>
                <GallerySlider
                  images={galleryImages}
                  onImageClick={(index) => openImageModal(galleryImages, index)}
                  speed={25}
                />
              </motion.div>
            </div>
          )}

          {/* ═══ CTA Button ═══ */}
          {ctaText && (
            <motion.div
              variants={fadeInUp}
              className="mt-12 flex justify-center px-4"
            >
              <button
                onClick={() => {
                  const el = document.getElementById("registration");
                  if (el)
                    el.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-10 py-4 text-base font-bold uppercase tracking-wide text-white shadow-lg shadow-orange-500/30 transition-all hover:shadow-orange-500/50 hover:brightness-110 sm:px-14 sm:py-5 sm:text-lg"
              >
                {ctaText}
              </button>
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* ═══ Modals ═══ */}
      <AnimatePresence>
        {modalImages && (
          <ImageModal
            images={modalImages}
            currentIndex={modalIndex}
            onClose={closeModal}
            onPrev={prevImage}
            onNext={nextImage}
          />
        )}
        {videoModal && (
          <VideoModal videoUrl={videoModal} onClose={closeModal} />
        )}
      </AnimatePresence>
    </>
  );
}
