"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  Rocket,
  Shield,
  Headphones,
  Eye,
  EyeOff,
  Zap,
  Star,
  AlertTriangle,
  Lock,
  CheckCircle2,
  Pencil,
  Clock,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { formatPrice } from "@/lib/utils";
import type { CourseData, MarketingUrgency } from "./types";

/* ────────── Types ────────── */

export type RegistrationSectionProps = {
  course: CourseData;
  isEnrolled?: boolean;
  onRegisterSuccess?: () => void;
  onLearnClick?: () => void;
  voucherCode?: string;
  onVoucherCodeChange?: (code: string) => void;
  appliedVoucher?: {
    id: number;
    code: string;
    name: string;
    discount_type: "fixed" | "percent";
    discount_value: number;
    discount_amount: number;
    final_amount: number;
  } | null;
  onApplyVoucher?: () => void;
  onRemoveVoucher?: () => void;
  voucherLoading?: boolean;
  voucherError?: string | null;
};

type NoticeCard = {
  icon: "star" | "warning";
  color: "amber" | "red";
  title: string;
  text: string;
  badge?: string;
};

/* ────────── Animation variants ────────── */

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

/* ────────── Trust Badge ────────── */

function TrustBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300">
      {icon}
      <span>{label}</span>
    </div>
  );
}

/* ────────── Notice Card ────────── */

function NoticeCardItem({ card }: { card: NoticeCard }) {
  const borderColor =
    card.color === "amber"
      ? "border-amber-500/30 hover:border-amber-500/50"
      : "border-red-500/30 hover:border-red-500/50";
  const iconBg =
    card.color === "amber"
      ? "bg-amber-500/10 text-amber-400"
      : "bg-red-500/10 text-red-400";
  const Icon = card.icon === "star" ? Star : AlertTriangle;

  return (
    <motion.div
      variants={fadeInUp}
      className={`rounded-2xl border ${borderColor} bg-gray-900/60 p-5 backdrop-blur-sm transition-colors`}
    >
      <div className="mb-3 flex items-center gap-3">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconBg}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <h4 className="font-bold text-white">{card.title}</h4>
      </div>
      <p className="text-sm leading-relaxed text-gray-400">{card.text}</p>
      {card.badge && (
        <div className="mt-3">
          <span className="inline-block rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-1.5 text-xs font-bold text-white">
            {card.badge}
          </span>
        </div>
      )}
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   RegistrationSection
   ══════════════════════════════════════════════════════════════ */

export function RegistrationSection({
  course,
  isEnrolled,
  onRegisterSuccess,
  onLearnClick,
  voucherCode = "",
  onVoucherCodeChange,
  appliedVoucher,
  onApplyVoucher,
  onRemoveVoucher,
  voucherLoading,
  voucherError,
}: RegistrationSectionProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.15 });

  const { user, register } = useAuth();

  /* ── form state ── */
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [cccd, setCccd] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const price = Number(course.price) || 0;
  const marketing = course.marketing;
  const urgency: MarketingUrgency | undefined = marketing?.urgency;

  const title = "Đăng ký ngay để nhận ưu đãi";
  const subtitle = `Chỉ còn ${urgency?.remaining_spots ?? 20} suất cuối với giá ưu đãi ${formatPrice(price)}`;

  /* ── Notices ── */
  const notices: NoticeCard[] = [
    {
      icon: "star",
      color: "amber",
      title: "Lưu ý 1",
      text: `Giá Early Bird là giá ưu đãi dành cho ${urgency?.remaining_spots ?? 20} học viên đăng ký sớm nhất. Sau khi hết suất ưu đãi, giá sẽ tăng lên mức chính thức.`,
    },
    {
      icon: "warning",
      color: "red",
      title: "Lưu ý 2",
      text: "Chương trình ưu đãi có thể kết thúc bất cứ lúc nào mà không báo trước. Đăng ký ngay để đảm bảo bạn nhận được mức giá tốt nhất!",
      badge: `Số lượng còn lại: ${urgency?.remaining_spots ?? 20}/${urgency?.total_spots ?? 1000} suất`,
    },
  ];

  /* ── Submit registration ── */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError("Vui lòng điền họ tên, email và số điện thoại.");
      return;
    }
    if (password.length < 6) {
      setError("Mật khẩu tối thiểu 6 ký tự.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setSubmitting(true);
    try {
      await register(
        { name, email, password, confirmPassword, phone, cccd, referralCode },
        { redirectTo: null },
      );
      onRegisterSuccess?.();
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Đăng ký thất bại. Vui lòng thử lại.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  /* ── Enrolled / Logged in state ── */
  const isLoggedIn = !!user;

  return (
    <section
      ref={ref}
      id="pricing"
      className="relative overflow-x-clip bg-gray-950 py-20 sm:py-28"
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-orange-500/5 blur-[120px]" />
      </div>

      <motion.div
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={stagger}
        className="relative mx-auto max-w-2xl px-4 sm:px-6"
      >
        {/* ═══ Header ═══ */}
        <motion.div variants={fadeInUp} className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-2 text-sm font-medium text-orange-400">
            <Rocket className="h-4 w-4" />
            <span>Ưu đãi đặc biệt</span>
          </div>

          <h2
            className="mb-3 text-3xl font-extrabold py-1 sm:text-4xl"
            style={{ lineHeight: 1.8 }}
          >
            <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
              {title}
            </span>
          </h2>

          <p className="mx-auto mb-6 max-w-xl text-base text-gray-400 sm:text-lg">
            {subtitle}
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <TrustBadge
              icon={<Shield className="h-4 w-4 text-green-400" />}
              label="Bảo mật thông tin"
            />
            <TrustBadge
              icon={<Headphones className="h-4 w-4 text-blue-400" />}
              label="Hỗ trợ 24/7"
            />
          </div>
        </motion.div>

        {/* ═══ Form Card ═══ */}
        <motion.div
          variants={fadeInUp}
          className="relative rounded-3xl border border-purple-500/30 bg-gradient-to-b from-gray-900 to-gray-900/80 p-6 shadow-2xl shadow-purple-500/5 backdrop-blur-sm sm:p-8"
        >
          {/* Purple glow ring */}
          <div className="pointer-events-none absolute -inset-px rounded-3xl bg-gradient-to-b from-purple-500/20 via-transparent to-orange-500/20 opacity-60" />

          <div className="relative">
            {/* Course title */}
            <p className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-gray-400">
              {course.title}
            </p>

            {/* Price */}
            <div className="mb-1 text-center">
              <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-300 bg-clip-text text-4xl font-black text-transparent sm:text-5xl">
                {formatPrice(price)}
              </span>
            </div>

            {/* "Today only" badge */}
            <div className="mb-6 flex justify-center">
              <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-bold text-red-400 ring-1 ring-red-500/20">
                ⏰ Chỉ hôm nay
              </span>
            </div>

            {course.status === "coming_soon" ? (
              /* ── Coming Soon view ── */
              <div className="space-y-4 text-center">
                <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-6">
                  <Clock className="mx-auto mb-3 h-10 w-10 text-blue-400" />
                  <p className="text-xl font-bold text-blue-400">Sắp diễn ra</p>
                  <p className="mt-2 text-sm text-gray-400">
                    Khóa học đang được chuẩn bị. Vui lòng quay lại sau!
                  </p>
                </div>
                <button
                  type="button"
                  disabled
                  className="w-full cursor-not-allowed rounded-2xl border-2 border-blue-400/50 bg-blue-500/10 px-6 py-4 text-lg font-extrabold uppercase tracking-wide text-blue-400 opacity-80"
                >
                  SẮP DIỄN RA
                </button>
              </div>
            ) : isEnrolled ? (
              /* ── Already enrolled view ── */
              <div className="space-y-4 text-center">
                <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
                  <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-green-400" />
                  <p className="font-semibold text-green-400">
                    Bạn đã đăng ký khóa học thành công!
                  </p>
                  <p className="mt-1 text-sm text-gray-400">
                    Nhấn nút bên dưới để bắt đầu học ngay.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onLearnClick?.()}
                  className="w-full rounded-2xl bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 px-6 py-4 text-lg font-extrabold uppercase tracking-wide text-white shadow-lg shadow-green-500/25 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-green-500/30 active:scale-[0.98]"
                >
                  <Zap className="mr-2 inline-block h-5 w-5" />
                  VÀO HỌC NGAY
                </button>
              </div>
            ) : isLoggedIn ? (
              /* ── Already logged-in view: confirm info & checkout ── */
              <div className="space-y-4">
                {/* Status badge */}
                <div className="flex justify-center">
                  <span className="inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-4 py-2 text-sm font-medium text-green-400">
                    <CheckCircle2 className="h-4 w-4" />
                    Đã đăng nhập
                  </span>
                </div>

                <p className="text-center text-sm text-gray-400">
                  Xác nhận thông tin bên dưới để tiếp tục thanh toán
                </p>

                {/* User info card */}
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="mb-4 flex items-center justify-center gap-2">
                    <Lock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-300">
                      Thông tin của bạn
                    </span>
                    <a
                      href="/profile"
                      className="text-gray-500 transition-colors hover:text-orange-400"
                      title="Chỉnh sửa hồ sơ"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </a>
                  </div>

                  <div className="divide-y divide-white/5">
                    <div className="flex items-center justify-between py-3">
                      <span className="text-sm text-gray-500">Họ tên:</span>
                      <span className="text-sm font-medium text-white">
                        {user.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <span className="text-sm text-gray-500">Email:</span>
                      <span className="text-sm font-medium text-white">
                        {user.email}
                      </span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center justify-between py-3">
                        <span className="text-sm text-gray-500">
                          Số điện thoại Zalo:
                        </span>
                        <span className="text-sm font-medium text-white">
                          {user.phone}
                        </span>
                      </div>
                    )}
                    {user.cccd && (
                      <div className="flex items-center justify-between py-3">
                        <span className="text-sm text-gray-500">Số CCCD:</span>
                        <span className="text-sm font-medium text-white">
                          {user.cccd}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Voucher input */}
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <label className="mb-2 block text-xs font-semibold text-gray-400">
                    Mã giảm giá / Voucher
                  </label>
                  {appliedVoucher ? (
                    <div className="flex items-center justify-between rounded-lg border border-green-500/20 bg-green-500/5 px-4 py-3">
                      <div>
                        <span className="text-sm font-bold text-green-400">
                          {appliedVoucher.code}
                        </span>
                        <span className="ml-2 text-xs text-gray-400">
                          −
                          {appliedVoucher.discount_type === "percent"
                            ? `${appliedVoucher.discount_value}%`
                            : formatPrice(appliedVoucher.discount_amount)}
                        </span>
                        <div className="mt-1 text-xs text-gray-500">
                          Giá sau giảm:{" "}
                          <span className="font-bold text-orange-400">
                            {formatPrice(appliedVoucher.final_amount)}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveVoucher?.()}
                        className="text-xs font-medium text-red-400 hover:text-red-300"
                      >
                        Xóa
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={voucherCode}
                        onChange={(e) =>
                          onVoucherCodeChange?.(e.target.value.toUpperCase())
                        }
                        placeholder="Nhập mã giảm giá"
                        className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/30"
                      />
                      <button
                        type="button"
                        disabled={!voucherCode.trim() || voucherLoading}
                        onClick={() => onApplyVoucher?.()}
                        className="rounded-xl bg-orange-500/20 px-4 py-3 text-sm font-semibold text-orange-400 transition-colors hover:bg-orange-500/30 disabled:opacity-50"
                      >
                        {voucherLoading ? "..." : "Áp dụng"}
                      </button>
                    </div>
                  )}
                  {voucherError && (
                    <p className="mt-2 text-xs text-red-400">{voucherError}</p>
                  )}
                </div>

                {/* Checkout button */}
                <button
                  type="button"
                  onClick={() => onRegisterSuccess?.()}
                  className="w-full rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 px-6 py-4 text-lg font-extrabold uppercase tracking-wide text-white shadow-lg shadow-orange-500/25 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-orange-500/30 active:scale-[0.98]"
                >
                  <Zap className="mr-2 inline-block h-5 w-5" />
                  XÁC NHẬN & THANH TOÁN
                </button>

                {/* Terms */}
                <p className="flex items-center justify-center gap-1.5 text-center text-xs text-gray-500">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  Bằng cách tiếp tục, bạn đồng ý với{" "}
                  <a
                    href="/terms"
                    className="text-orange-400 underline hover:text-orange-300"
                  >
                    điều khoản sử dụng
                  </a>{" "}
                  của chúng tôi
                </p>
              </div>
            ) : (
              /* ── Registration form ── */
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name + Phone row */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-400">
                      Họ và tên <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/30"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-400">
                      Số điện thoại Zalo <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0912 345 678"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/30"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-400">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/30"
                  />
                </div>

                {/* CCCD */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-400">
                    Số CCCD / CMND
                  </label>
                  <input
                    type="text"
                    value={cccd}
                    onChange={(e) => setCccd(e.target.value)}
                    placeholder="Nhập số căn cước công dân"
                    maxLength={20}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/30"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-400">
                    Mật khẩu <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-11 text-sm text-white placeholder:text-gray-500 focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                      tabIndex={-1}
                    >
                      {showPw ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-400">
                    Xác nhận mật khẩu <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPw ? "text" : "password"}
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-11 text-sm text-white placeholder:text-gray-500 focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPw(!showConfirmPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                      tabIndex={-1}
                    >
                      {showConfirmPw ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Referral Code */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-400">
                    Mã giới thiệu
                  </label>
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    placeholder="Nhập mã giới thiệu (nếu có)"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/30"
                  />
                </div>

                {/* Login link row */}
                <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
                  <span className="text-sm text-gray-400">
                    Đã có tài khoản?
                  </span>
                  <a
                    href={`/auth/login?redirect=${encodeURIComponent(`/courses/${course.slug || course.id}?checkout=true`)}`}
                    className="text-sm font-semibold text-orange-400 transition-colors hover:text-orange-300"
                  >
                    Đăng nhập tại đây →
                  </a>
                </div>

                {/* Error */}
                {error && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
                    {error}
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 px-6 py-4 text-lg font-extrabold uppercase tracking-wide text-white shadow-lg shadow-orange-500/25 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-orange-500/30 active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100"
                >
                  {submitting ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Đang đăng ký...
                    </span>
                  ) : (
                    <>
                      <Zap className="mr-2 inline-block h-5 w-5" />
                      ĐĂNG KÝ NGAY
                    </>
                  )}
                </button>

                {/* Security note */}
                <p className="flex items-center justify-center gap-1.5 text-center text-xs text-gray-600">
                  <Lock className="h-3 w-3" />
                  Thông tin của bạn được bảo mật 100%
                </p>
              </form>
            )}
          </div>
        </motion.div>

        {/* ═══ Notice Cards ═══ */}
        <motion.div
          variants={stagger}
          className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          {notices.map((card, i) => (
            <NoticeCardItem key={i} card={card} />
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
