"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LandingNavItem } from "./types";

/* ─────────────────────────── Props ─────────────────────── */

export interface LandingHeaderProps {
  /** Course title – shown as logo text if no logo_url */
  courseTitle: string;
  /** Optional logo image URL */
  logoUrl?: string | null;
  /** Navigation items – each `id` must match a section element id on the page */
  navItems: LandingNavItem[];
  /** Primary CTA label (defaults to "HỌC THỬ NGAY") */
  ctaLabel?: string;
  /** What happens on CTA click – default scrolls to "pricing" */
  onCtaClick?: () => void;
  /** Link back to homepage */
  homeHref?: string;
}

/* ───────────────── Smooth-scroll helper ────────────────── */

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 80; // offset for header height
  window.scrollTo({ top, behavior: "smooth" });
}

/* ───────────────── Active-section observer ─────────────── */

function useActiveSection(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (ids.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the first intersecting entry with highest intersection ratio
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length > 0) {
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -40% 0px", threshold: [0, 0.25, 0.5] },
    );

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [ids]);

  return active;
}

/* ───────────────── Component ───────────────────────────── */

export function LandingHeader({
  courseTitle,
  logoUrl,
  navItems,
  ctaLabel = "HỌC THỬ NGAY",
  onCtaClick,
  homeHref = "/",
}: LandingHeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  // Track scroll for background blur
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Active section highlighting
  const sectionIds = navItems.map((n) => n.id);
  const activeSection = useActiveSection(sectionIds);

  const handleNavClick = useCallback(
    (id: string) => {
      scrollToSection(id);
      setMobileOpen(false);
    },
    [],
  );

  const handleCta = useCallback(() => {
    if (onCtaClick) {
      onCtaClick();
    } else {
      scrollToSection("pricing");
    }
    setMobileOpen(false);
  }, [onCtaClick]);

  return (
    <header
      ref={headerRef}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-gray-950/90 backdrop-blur-lg shadow-lg shadow-black/10 border-b border-white/5"
          : "bg-transparent",
      )}
    >
      <div className="container flex h-16 items-center justify-between gap-4 lg:h-[72px]">
        {/* Logo / Course name */}
        <Link href={homeHref} className="flex items-center gap-2 flex-shrink-0">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={courseTitle}
              width={120}
              height={40}
              className="h-8 w-auto object-contain lg:h-10"
              unoptimized
            />
          ) : (
            <span className="text-lg font-bold text-white tracking-tight lg:text-xl">
              {courseTitle}
            </span>
          )}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              className={cn(
                "relative px-4 py-2 text-sm font-medium transition-colors rounded-lg",
                activeSection === item.id
                  ? "text-white"
                  : "text-gray-400 hover:text-white",
              )}
            >
              {item.label}
              {activeSection === item.id && (
                <motion.div
                  layoutId="landing-nav-indicator"
                  className="absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full bg-orange-500"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          ))}
        </nav>

        {/* Desktop right */}
        <div className="hidden items-center gap-3 lg:flex">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 bg-transparent"
          >
            <Link href={homeHref}>Về trang chủ</Link>
          </Button>
          <Button
            size="sm"
            onClick={handleCta}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:brightness-110 border-0"
          >
            ✨ {ctaLabel}
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden rounded-lg p-2 text-gray-300 hover:text-white hover:bg-white/10"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden lg:hidden bg-gray-950/95 backdrop-blur-lg border-b border-white/5"
          >
            <nav className="container flex flex-col gap-1 py-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={cn(
                    "w-full text-left px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                    activeSection === item.id
                      ? "text-orange-400 bg-orange-500/10"
                      : "text-gray-300 hover:text-white hover:bg-white/5",
                  )}
                >
                  {item.label}
                </button>
              ))}
              <div className="mt-2 flex flex-col gap-2 px-4">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 bg-transparent w-full"
                >
                  <Link href={homeHref}>Về trang chủ</Link>
                </Button>
                <Button
                  size="sm"
                  onClick={handleCta}
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold w-full"
                >
                  ✨ {ctaLabel}
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
