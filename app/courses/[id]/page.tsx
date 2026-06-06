"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { ChevronRight } from "lucide-react";
import {
  LandingHeader,
  HeroSection,
  PainPointSection,
  BenefitsSection,
  TargetAudienceSection,
  TransformSection,
  CurriculumSection,
  RegistrationSection,
  TestimonialsSection,
  FinalCTASection,
  FloatingBar,
  DEFAULT_NAV_ITEMS,
} from "@/components/course-landing";
import type {
  LandingNavItem,
  CourseMarketing as LandingMarketing,
  CourseData,
  CourseDetailResponse,
} from "@/components/course-landing";

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-950">
      <div className="h-16 animate-pulse bg-gray-900" />
      <div className="container py-16">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="h-[60vh] animate-pulse rounded-2xl bg-gray-800/50" />
          <div className="grid gap-6 md:grid-cols-2">
            <div className="h-48 animate-pulse rounded-xl bg-gray-800/50" />
            <div className="h-48 animate-pulse rounded-xl bg-gray-800/50" />
          </div>
          <div className="h-96 animate-pulse rounded-xl bg-gray-800/50" />
        </div>
      </div>
    </div>
  );
}

export default function CourseDetailPage() {
  const params = useParams<{ id: string }>();
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "https://admin.phamanhchien.vn/api";
  const [data, setData] = useState<CourseDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Landing mode detection
  const isLandingMode = useMemo(() => {
    if (searchParams.get("landing") === "true") return !!data;
    if (!data) return false;
    const m = data.course.marketing as LandingMarketing | undefined;
    if (!m) return false;
    return !!(
      m.landing_nav?.enabled ||
      m.hero?.images?.length ||
      m.ticker_texts?.length ||
      m.pain_point?.enabled ||
      m.benefits?.enabled ||
      m.target_audience?.enabled ||
      m.before_after?.enabled
    );
  }, [data, searchParams]);

  // Hide global navbar in landing mode
  useEffect(() => {
    if (!isLandingMode) return;
    const navbar = document.querySelector(
      "[data-navbar-wrapper]",
    ) as HTMLElement | null;
    if (navbar) navbar.style.display = "none";
    return () => {
      if (navbar) navbar.style.display = "";
    };
  }, [isLandingMode]);

  // Resolve landing nav items
  const landingNavItems = useMemo<LandingNavItem[]>(() => {
    if (!data) return DEFAULT_NAV_ITEMS;
    const nav = (data.course.marketing as LandingMarketing | undefined)
      ?.landing_nav;
    if (nav?.items && nav.items.length > 0) return nav.items;
    return DEFAULT_NAV_ITEMS;
  }, [data]);

  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Voucher state
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [appliedVoucher, setAppliedVoucher] = useState<{
    id: number;
    code: string;
    name: string;
    discount_type: "fixed" | "percent";
    discount_value: number;
    discount_amount: number;
    final_amount: number;
  } | null>(null);

  // Selected duration tier
  const [selectedTierId, setSelectedTierId] = useState<number | null>(null);

  // Selected section for chapter checkout
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);

  // Parse section_id from URL search params
  useEffect(() => {
    const sectIdParam = searchParams.get("section_id");
    if (sectIdParam) {
      const parsed = parseInt(sectIdParam, 10);
      if (!isNaN(parsed)) {
        setSelectedSectionId(parsed);
        // Scroll to pricing after a brief delay
        setTimeout(() => {
          const el = document.getElementById("pricing");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }, 500);
      }
    }
  }, [searchParams]);

  // Reset voucher when section changes
  useEffect(() => {
    handleRemoveVoucher();
  }, [selectedSectionId]);

  // Fetch course data
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${apiUrl}/courses/${params.id}`, {
          cache: "no-store",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const json = (await res.json()) as CourseDetailResponse;
        if (cancelled) return;
        setData(json);
      } catch {
        if (!cancelled) setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, apiUrl, user?.id]);

  // Auto-checkout when returning from login with ?checkout=true
  const [autoCheckoutDone, setAutoCheckoutDone] = useState(false);
  useEffect(() => {
    if (
      searchParams.get("checkout") === "true" &&
      user &&
      data &&
      !data.is_enrolled &&
      !autoCheckoutDone
    ) {
      setAutoCheckoutDone(true);
      // Clean URL then trigger checkout
      window.history.replaceState({}, "", `/courses/${c.slug || params.id}`);
      // Scroll to pricing section then auto-checkout
      setTimeout(() => {
        const el = document.getElementById("pricing");
        if (el) el.scrollIntoView({ behavior: "smooth" });
        handleCheckout();
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, data, searchParams, autoCheckoutDone]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!data) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container py-20 text-center"
      >
        <div className="mx-auto max-w-md">
          <div className="mb-6 text-6xl">😕</div>
          <h2 className="mb-2 text-2xl font-bold">Không tìm thấy khóa học</h2>
          <p className="mb-6 text-muted-foreground">
            Khóa học này có thể đã bị xóa hoặc không tồn tại.
          </p>
          <Button asChild>
            <Link href="/courses">
              <ChevronRight className="mr-2 h-4 w-4 rotate-180" />
              Quay lại danh sách
            </Link>
          </Button>
        </div>
      </motion.div>
    );
  }

  const c = data.course;
  const landingLogoUrl =
    (c.marketing as LandingMarketing | undefined)?.landing_nav?.logo_url ||
    null;

  function scrollToPricing(sectionId?: number) {
    if (sectionId) {
      setSelectedSectionId(sectionId);
    }
    if (data?.is_enrolled) {
      router.push(`/courses/${c.slug || params.id}/learn`);
      return;
    }
    const el = document.getElementById("pricing");
    if (el) el.scrollIntoView({ behavior: "smooth" });
    else if (user) handleCheckout();
    else {
      const el2 = document.getElementById("pricing");
      if (el2) el2.scrollIntoView({ behavior: "smooth" });
    }
  }

  async function handleApplyVoucher() {
    if (!voucherCode.trim() || !data) return;
    setVoucherLoading(true);
    setVoucherError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${apiUrl}/vouchers/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          code: voucherCode.trim(),
          course_id: data.course.id,
          section_id: selectedSectionId || null,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setVoucherError(json?.message || "Mã giảm giá không hợp lệ");
        return;
      }
      setAppliedVoucher({
        id: json.voucher.id,
        code: json.voucher.code,
        name: json.voucher.name,
        discount_type: json.voucher.discount_type,
        discount_value: json.voucher.discount_value,
        discount_amount: json.discount_amount,
        final_amount: json.final_amount,
      });
    } catch {
      setVoucherError("Không thể kiểm tra mã giảm giá");
    } finally {
      setVoucherLoading(false);
    }
  }

  function handleRemoveVoucher() {
    setAppliedVoucher(null);
    setVoucherCode("");
    setVoucherError(null);
  }

  async function handleCheckout() {
    setCheckoutError(null);
    if (!user) {
      router.push(`/auth/login?redirect=/courses/${c.slug || params.id}`);
      return;
    }
    setCheckoutLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${apiUrl}/courses/${params.id}/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          voucher_code: appliedVoucher?.code || null,
          duration_tier_id: selectedSectionId ? null : (selectedTierId || null),
          section_id: selectedSectionId || null,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setCheckoutError(json?.message || "Không thể tạo thanh toán.");
        return;
      }
      if (
        json?.enrollment ||
        json?.message?.toLowerCase().includes("enrolled")
      ) {
        // If a specific section was purchased, redirect to learning page instead of setting is_enrolled = true for the whole course
        if (selectedSectionId) {
          toast.success("Đăng ký chương lẻ thành công!");
          router.push(`/courses/${c.slug || params.id}/learn`);
          return;
        }

        setData((prev) => (prev ? { ...prev, is_enrolled: true } : prev));
        toast.success(
          json?.discount_applied
            ? "Đã đăng ký thành công với mã giảm giá!"
            : "Đã đăng ký khóa học thành công!",
        );
        setAppliedVoucher(null);
        setVoucherCode("");
        return;
      }
      if (json?.payment) {
        // Redirect to dedicated payment page
        router.push(`/checkout/${json.payment.id}`);
      }
    } catch {
      setCheckoutError("Không thể tạo thanh toán.");
    } finally {
      setCheckoutLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 pb-20">
      <LandingHeader
        courseTitle={c.title}
        logoUrl={landingLogoUrl}
        navItems={landingNavItems}
        ctaLabel={data.is_enrolled ? "VÀO HỌC NGAY" : "HỌC THỬ NGAY"}
        onCtaClick={scrollToPricing}
      />

      <HeroSection
        course={c as CourseData}
        isEnrolled={data.is_enrolled}
        onEnrollClick={scrollToPricing}
        onLearnClick={() =>
          router.push(`/courses/${c.slug || params.id}/learn`)
        }
      />

      <PainPointSection course={c as CourseData} onCtaClick={scrollToPricing} />

      <BenefitsSection
        course={c as CourseData}
        onCtaClick={() => {
          const el = document.getElementById("curriculum");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }}
      />

      <TargetAudienceSection
        course={c as CourseData}
        onCtaClick={scrollToPricing}
      />

      <TransformSection course={c as CourseData} onCtaClick={scrollToPricing} />

      <CurriculumSection
        course={c as CourseData}
        onCtaClick={scrollToPricing}
      />

      <RegistrationSection
        course={c as CourseData}
        isEnrolled={data.is_enrolled}
        onRegisterSuccess={(tierId) => {
          if (tierId) setSelectedTierId(tierId);
          handleCheckout();
        }}
        onLearnClick={() =>
          router.push(`/courses/${c.slug || params.id}/learn`)
        }
        voucherCode={voucherCode}
        onVoucherCodeChange={setVoucherCode}
        appliedVoucher={appliedVoucher}
        onApplyVoucher={handleApplyVoucher}
        onRemoveVoucher={handleRemoveVoucher}
        voucherLoading={voucherLoading}
        voucherError={voucherError}
        selectedTierId={selectedTierId}
        onTierSelect={setSelectedTierId}
        selectedSectionId={selectedSectionId}
        onSectionSelect={setSelectedSectionId}
        checkoutError={checkoutError}
        checkoutLoading={checkoutLoading}
      />

      <TestimonialsSection course={c as CourseData} />

      <FinalCTASection
        course={c as CourseData}
        isEnrolled={data.is_enrolled}
        onCtaClick={scrollToPricing}
        onLearnClick={() =>
          router.push(`/courses/${c.slug || params.id}/learn`)
        }
      />

      <FloatingBar
        course={c as CourseData}
        isEnrolled={data.is_enrolled}
        onCtaClick={scrollToPricing}
        onLearnClick={() =>
          router.push(`/courses/${c.slug || params.id}/learn`)
        }
      />
    </div>
  );
}
