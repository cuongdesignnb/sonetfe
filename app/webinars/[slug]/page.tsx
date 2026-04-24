"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { resolveAssetUrl } from "@/lib/asset-url";
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  Video,
  CheckCircle2,
  Tag,
  Eye,
  EyeOff,
  Copy,
  Check,
  Info,
  PlayCircle,
  Mail,
} from "lucide-react";

interface Speaker {
  name: string;
  role: string;
  avatar: string | null;
}

interface Webinar {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  thumbnail: string | null;
  instructor_name: string;
  instructor_avatar: string | null;
  zoom_link: string | null;
  replay_url: string | null;
  replay_bunny_id: string | null;
  replay_bunny_library_id: string | null;
  scheduled_at: string;
  duration_minutes: number | null;
  views_count: number;
  status: string;
  is_free: boolean;
  price: string | number;
  tags: string[] | null;
  benefits: string[] | null;
  speakers: Speaker[] | null;
  max_attendees: number | null;
  registrations_count?: number;
}

export default function WebinarDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { user, login, register: authRegister } = useAuth();

  const [webinar, setWebinar] = useState<Webinar | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  // Login form state
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [copied, setCopied] = useState(false);
  const [guestEmail, setGuestEmail] = useState("");
  const [guestRegistering, setGuestRegistering] = useState(false);
  const [guestSuccess, setGuestSuccess] = useState(false);
  const [guestError, setGuestError] = useState("");

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "https://admin.phamanhchien.vn/api";

  useEffect(() => {
    if (!slug) return;
    const headers: Record<string, string> = {};
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) headers["Authorization"] = `Bearer ${token}`;

    fetch(`${apiUrl}/webinars/${encodeURIComponent(slug)}`, {
      cache: "no-store",
      headers,
    })
      .then((res) => {
        if (!res.ok) throw new Error("not found");
        return res.json();
      })
      .then((json) => {
        setWebinar(json.webinar || json.data || json);
        setIsRegistered(json.is_registered || false);
        setHasPaid(json.has_paid || false);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug, apiUrl]);

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function copyShareLink() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function handleGuestRegister(e: React.FormEvent) {
    e.preventDefault();
    setGuestRegistering(true);
    setGuestError("");
    try {
      const res = await fetch(
        `${apiUrl}/webinars/${encodeURIComponent(slug)}/guest-register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: guestEmail }),
        },
      );
      const data = await res.json();
      if (res.ok) {
        setGuestSuccess(true);
      } else {
        setGuestError(data.message || "Đăng ký thất bại");
      }
    } catch {
      setGuestError("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setGuestRegistering(false);
    }
  }

  async function handleCheckout() {
    if (!user || !webinar) return;
    setCheckingOut(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${apiUrl}/webinars/${encodeURIComponent(slug)}/checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await res.json();
      if (data.paid) {
        // Already paid
        setHasPaid(true);
        window.location.reload();
      } else if (data.payment?.id) {
        router.push(`/checkout/${data.payment.id}?type=webinar&slug=${slug}`);
      } else {
        alert(data.message || "Không thể tạo thanh toán");
      }
    } catch {
      alert("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setCheckingOut(false);
    }
  }

  async function handleRegister() {
    if (!user) return;
    setRegistering(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${apiUrl}/webinars/${encodeURIComponent(slug)}/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await res.json();
      if (res.ok) {
        setIsRegistered(true);
      } else {
        alert(data.message || "Đăng ký thất bại");
      }
    } catch {
      alert("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setRegistering(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    try {
      await login(email, password, { redirectTo: null });
      // Stay on page - reload to refresh webinar data with auth
      window.location.reload();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setAuthError(
        e?.response?.data?.message || "Email hoặc mật khẩu không đúng",
      );
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleRegisterAccount(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setAuthError("Mật khẩu xác nhận không khớp");
      return;
    }
    setAuthLoading(true);
    setAuthError("");
    try {
      await authRegister(
        { name, email, password, confirmPassword },
        { redirectTo: null },
      );
      // Stay on page - reload to refresh webinar data with auth
      window.location.reload();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setAuthError(e?.response?.data?.message || "Đăng ký thất bại");
    } finally {
      setAuthLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FEF7ED] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !webinar) {
    return (
      <div className="min-h-screen bg-[#FEF7ED] flex flex-col items-center justify-center">
        <Video className="w-20 h-20 text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-700 mb-2">
          Không tìm thấy webinar
        </h1>
        <p className="text-gray-500 mb-6">
          Webinar này không tồn tại hoặc đã bị xóa.
        </p>
        <Link
          href="/webinars"
          className="rounded-full border-2 border-orange-500 bg-orange-500 px-6 py-2 text-white font-bold hover:bg-orange-600"
        >
          ← Quay về danh sách
        </Link>
      </div>
    );
  }

  const isUpcoming = webinar.status === "upcoming";
  const isCompleted = webinar.status === "completed";
  const hasReplay =
    isCompleted && (webinar.replay_bunny_id || webinar.replay_url);
  const bunnyEmbedUrl =
    webinar.replay_bunny_id && webinar.replay_bunny_library_id
      ? `https://iframe.mediadelivery.net/embed/${webinar.replay_bunny_library_id}/${webinar.replay_bunny_id}?autoplay=false&responsive=true`
      : null;
  const isPaid = !webinar.is_free && Number(webinar.price) > 0;
  const priceLabel = webinar.is_free
    ? "Miễn phí"
    : `${Number(webinar.price).toLocaleString("vi-VN")}₫`;
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  // For paid webinars: user must be logged in + paid to access content
  const canAccessContent = !isPaid || hasPaid;

  return (
    <div className="min-h-screen bg-[#FEF7ED]">
      {/* Back link */}
      <div className="container mx-auto px-4 pt-6">
        <Link
          href="/webinars"
          className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách webinar
        </Link>
      </div>

      {/* Banner / Thumbnail */}
      <div className="container mx-auto px-4 mt-4">
        <div className="rounded-xl overflow-hidden shadow-lg">
          {webinar.thumbnail ? (
            <img
              src={resolveAssetUrl(webinar.thumbnail)}
              alt={webinar.title}
              className="w-full h-auto object-contain"
            />
          ) : (
            <div className="w-full h-[320px] bg-gradient-to-r from-red-800 via-red-700 to-red-900 flex items-center justify-center">
              <div className="text-center text-white">
                <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-xl font-bold opacity-80">{webinar.title}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Title + Meta */}
      <div className="container mx-auto px-4 mt-8">
        <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 leading-tight">
          {webinar.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 mt-4 text-gray-600 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>{formatDate(webinar.scheduled_at)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>{formatTime(webinar.scheduled_at)}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            <span>{webinar.instructor_name}</span>
          </div>
          {webinar.duration_minutes && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>{webinar.duration_minutes} phút</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-gray-400" />
            <span
              className={`font-bold ${webinar.is_free ? "text-green-600" : "text-orange-600"}`}
            >
              {priceLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Two column layout */}
      <div className="container mx-auto px-4 mt-8 pb-16">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-3 space-y-6">
            {/* Benefits */}
            {webinar.benefits && webinar.benefits.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-orange-500">🎁</span>
                  Bạn sẽ nhận được gì?
                </h2>
                <ul className="space-y-3">
                  {webinar.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 leading-relaxed">
                        {benefit}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Description */}
            {webinar.description && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-800 mb-4">
                  Nội dung khóa học
                </h2>
                <div
                  className="prose prose-gray max-w-none leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: /<[a-z][\s\S]*>/i.test(webinar.description)
                      ? webinar.description
                      : webinar.description.replace(/\r\n|\r|\n/g, "<br />")
                  }}
                />
              </div>
            )}

            {/* Speakers */}
            {webinar.speakers && webinar.speakers.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-800 mb-4">
                  Diễn giả
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {webinar.speakers.map((speaker, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 rounded-lg bg-gray-50"
                    >
                      {speaker.avatar ? (
                        <img
                          src={resolveAssetUrl(speaker.avatar)}
                          alt={speaker.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                          <User className="w-6 h-6 text-orange-500" />
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-gray-800">
                          {speaker.name}
                        </p>
                        {speaker.role && (
                          <p className="text-sm text-gray-500">
                            {speaker.role}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {webinar.tags && webinar.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {webinar.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 bg-white border border-gray-200 text-gray-600 px-3 py-1 rounded-full text-sm"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Status + Registration */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 space-y-4">
              {/* ── Completed Webinar Card ── */}
              {isCompleted && (
                <div className="bg-green-50 rounded-xl border border-green-200 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <h3 className="text-lg font-bold text-green-800">
                        Chương trình đã kết thúc
                      </h3>
                    </div>

                    {isPaid && !canAccessContent ? (
                      /* Paid webinar - user needs to pay to watch replay */
                      <div className="space-y-4">
                        <p className="text-sm text-green-700">
                          Buổi Zoom đã kết thúc. Thanh toán để xem lại bản ghi
                          video.
                        </p>

                        {/* Price */}
                        <div className="bg-white rounded-lg p-3 text-center border border-green-200">
                          <span className="text-2xl font-extrabold text-orange-600">
                            {priceLabel}
                          </span>
                        </div>

                        {user ? (
                          <button
                            onClick={handleCheckout}
                            disabled={checkingOut}
                            className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
                          >
                            {checkingOut
                              ? "Đang xử lý..."
                              : "THANH TOÁN ĐỂ XEM LẠI"}
                          </button>
                        ) : (
                          <div className="space-y-3">
                            <p className="text-sm text-gray-600 text-center">
                              Đăng nhập để thanh toán và xem lại bản ghi
                            </p>
                            {/* Login/Register tabs for paid completed */}
                            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                              <div className="flex border-b border-gray-100">
                                <button
                                  onClick={() => {
                                    setAuthTab("login");
                                    setAuthError("");
                                  }}
                                  className={`flex-1 py-2.5 text-sm font-bold transition ${
                                    authTab === "login"
                                      ? "text-gray-800 border-b-2 border-orange-500"
                                      : "text-gray-400 hover:text-gray-600"
                                  }`}
                                >
                                  Đăng nhập
                                </button>
                                <button
                                  onClick={() => {
                                    setAuthTab("register");
                                    setAuthError("");
                                  }}
                                  className={`flex-1 py-2.5 text-sm font-bold transition ${
                                    authTab === "register"
                                      ? "text-orange-600 border-b-2 border-orange-500"
                                      : "text-gray-400 hover:text-gray-600"
                                  }`}
                                >
                                  Tạo tài khoản
                                </button>
                              </div>
                              <div className="p-4">
                                {authError && (
                                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-2 rounded-lg mb-3">
                                    {authError}
                                  </div>
                                )}
                                {authTab === "login" ? (
                                  <form
                                    onSubmit={handleLogin}
                                    className="space-y-3"
                                  >
                                    <input
                                      type="email"
                                      value={email}
                                      onChange={(e) => setEmail(e.target.value)}
                                      placeholder="Email"
                                      required
                                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:border-orange-400 focus:outline-none text-sm"
                                    />
                                    <div className="relative">
                                      <input
                                        type={
                                          showPassword ? "text" : "password"
                                        }
                                        value={password}
                                        onChange={(e) =>
                                          setPassword(e.target.value)
                                        }
                                        placeholder="Mật khẩu"
                                        required
                                        className="w-full px-3 pr-10 py-2.5 border border-gray-200 rounded-lg focus:border-orange-400 focus:outline-none text-sm"
                                      />
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setShowPassword(!showPassword)
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                      >
                                        {showPassword ? (
                                          <EyeOff className="w-4 h-4" />
                                        ) : (
                                          <Eye className="w-4 h-4" />
                                        )}
                                      </button>
                                    </div>
                                    <button
                                      type="submit"
                                      disabled={authLoading}
                                      className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-2.5 rounded-lg transition disabled:opacity-50 text-sm"
                                    >
                                      {authLoading
                                        ? "Đang xử lý..."
                                        : "Đăng nhập"}
                                    </button>
                                  </form>
                                ) : (
                                  <form
                                    onSubmit={handleRegisterAccount}
                                    className="space-y-3"
                                  >
                                    <input
                                      type="text"
                                      value={name}
                                      onChange={(e) => setName(e.target.value)}
                                      placeholder="Họ và tên"
                                      required
                                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:border-orange-400 focus:outline-none text-sm"
                                    />
                                    <input
                                      type="email"
                                      value={email}
                                      onChange={(e) => setEmail(e.target.value)}
                                      placeholder="Email"
                                      required
                                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:border-orange-400 focus:outline-none text-sm"
                                    />
                                    <input
                                      type="password"
                                      value={password}
                                      onChange={(e) =>
                                        setPassword(e.target.value)
                                      }
                                      placeholder="Mật khẩu"
                                      required
                                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:border-orange-400 focus:outline-none text-sm"
                                    />
                                    <input
                                      type="password"
                                      value={confirmPassword}
                                      onChange={(e) =>
                                        setConfirmPassword(e.target.value)
                                      }
                                      placeholder="Xác nhận mật khẩu"
                                      required
                                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:border-orange-400 focus:outline-none text-sm"
                                    />
                                    <button
                                      type="submit"
                                      disabled={authLoading}
                                      className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-2.5 rounded-lg transition disabled:opacity-50 text-sm"
                                    >
                                      {authLoading
                                        ? "Đang xử lý..."
                                        : "Đăng ký tài khoản"}
                                    </button>
                                  </form>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Free webinar or already paid */
                      <>
                        <p className="text-sm text-green-700 mb-4">
                          Buổi Zoom đã kết thúc. Bạn có thể xem lại bản ghi
                          video bên dưới.
                        </p>

                        {/* Hướng dẫn xem lại */}
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                          <div className="flex items-start gap-2 mb-2">
                            <Info className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm font-semibold text-orange-700">
                              Hướng dẫn xem lại
                            </span>
                          </div>
                          <ul className="text-sm text-orange-700 space-y-1 ml-6 list-disc">
                            <li>
                              Nhấn vào video bài học ở bên trái hoặc nút bên
                              dưới để xem.
                            </li>
                            <li>
                              Video có thể xem lại nhiều lần, không giới hạn.
                            </li>
                            <li>
                              Nếu gặp sự cố phát video, vui lòng thử tải lại
                              trang.
                            </li>
                          </ul>
                        </div>

                        {/* Replay Video / Button */}
                        {hasReplay && bunnyEmbedUrl && (
                          <div className="w-full">
                            <div
                              className="relative w-full"
                              style={{ paddingTop: "56.25%" }}
                            >
                              <iframe
                                src={bunnyEmbedUrl}
                                className="absolute inset-0 w-full h-full rounded-lg"
                                frameBorder="0"
                                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            </div>
                          </div>
                        )}
                        {hasReplay && !bunnyEmbedUrl && webinar.replay_url && (
                          <a
                            href={webinar.replay_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition"
                          >
                            <PlayCircle className="w-5 h-5" />
                            Xem lại bản ghi
                          </a>
                        )}
                        {!hasReplay && (
                          <div className="text-center py-3 text-sm text-gray-500 bg-gray-100 rounded-lg">
                            Bản ghi chưa được cập nhật
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Share Link */}
                  <div className="border-t border-green-200 p-4 bg-white">
                    <p className="text-sm text-gray-600 mb-2 font-medium">
                      Link chia sẻ chương trình này của bạn:
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={shareUrl}
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 bg-gray-50 truncate"
                      />
                      <button
                        onClick={copyShareLink}
                        className="flex-shrink-0 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                        title="Copy link"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Upcoming Webinar Card ── */}
              {isUpcoming && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Price badge for paid webinars */}
                  {isPaid && (
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 text-center">
                      <span className="text-white text-xl font-extrabold">
                        {priceLabel}
                      </span>
                    </div>
                  )}

                  {user ? (
                    <div className="p-6">
                      {isPaid && !hasPaid ? (
                        /* Paid webinar - needs payment first */
                        <div className="text-center space-y-4">
                          <h3 className="text-lg font-bold text-gray-800">
                            Thanh toán để tham gia
                          </h3>
                          <p className="text-gray-600 text-sm">
                            Xin chào,{" "}
                            <span className="font-bold text-gray-800">
                              {user.name}
                            </span>
                          </p>
                          <button
                            onClick={handleCheckout}
                            disabled={checkingOut}
                            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
                          >
                            {checkingOut ? "Đang xử lý..." : "THANH TOÁN NGAY"}
                          </button>
                          <p className="text-xs text-gray-400">
                            Sau khi thanh toán, link webinar sẽ được gửi qua
                            email
                          </p>
                        </div>
                      ) : isRegistered ? (
                        <div className="text-center space-y-4">
                          <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-8 h-8 text-green-500" />
                          </div>
                          <p className="font-bold text-green-700">
                            Bạn đã đăng ký thành công!
                          </p>
                          <p className="text-sm text-gray-500">
                            Link tham gia sẽ được gửi qua email của bạn.
                          </p>
                          {webinar.zoom_link && (
                            <a
                              href={webinar.zoom_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg text-center transition"
                            >
                              🔗 Tham gia Zoom
                            </a>
                          )}
                        </div>
                      ) : (
                        <div className="text-center space-y-4">
                          <h3 className="text-lg font-bold text-gray-800">
                            Đăng ký tham gia
                          </h3>
                          <p className="text-gray-600 text-sm">
                            Xin chào,{" "}
                            <span className="font-bold text-gray-800">
                              {user.name}
                            </span>
                          </p>
                          <button
                            onClick={handleRegister}
                            disabled={registering}
                            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
                          >
                            {registering ? "Đang đăng ký..." : "ĐĂNG KÝ NGAY"}
                          </button>
                          <p className="text-xs text-gray-400">
                            Link webinar sẽ được gửi qua email sau khi đăng ký
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Not logged in */
                    <div>
                      <div className="p-5 border-b border-gray-100 text-center">
                        <h3 className="text-lg font-bold text-gray-800">
                          {isPaid
                            ? "Thanh toán để tham gia"
                            : "Đăng ký tham gia"}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {isPaid
                            ? "Đăng nhập để thanh toán và nhận link webinar"
                            : "Nhập email để nhận link webinar"}
                        </p>
                      </div>

                      <div className="p-5 space-y-4">
                        {/* Quick email registration - only for FREE webinars */}
                        {!isPaid && (
                          <>
                            {guestSuccess ? (
                              <div className="text-center space-y-3 py-2">
                                <div className="w-14 h-14 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                                  <Mail className="w-7 h-7 text-green-500" />
                                </div>
                                <p className="font-bold text-green-700">
                                  Đăng ký thành công!
                                </p>
                                <p className="text-sm text-gray-500">
                                  Link tham gia webinar đã được gửi đến email{" "}
                                  <span className="font-medium text-gray-700">
                                    {guestEmail}
                                  </span>
                                </p>
                              </div>
                            ) : (
                              <form
                                onSubmit={handleGuestRegister}
                                className="space-y-3"
                              >
                                {guestError && (
                                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-2 rounded-lg">
                                    {guestError}
                                  </div>
                                )}
                                <div className="relative">
                                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                  <input
                                    type="email"
                                    value={guestEmail}
                                    onChange={(e) =>
                                      setGuestEmail(e.target.value)
                                    }
                                    placeholder="Nhập email của bạn"
                                    required
                                    className="w-full pl-10 pr-4 py-3 border-2 border-orange-200 rounded-lg focus:border-orange-400 focus:outline-none text-sm"
                                  />
                                </div>
                                <button
                                  type="submit"
                                  disabled={guestRegistering}
                                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
                                >
                                  {guestRegistering
                                    ? "Đang xử lý..."
                                    : "ĐĂNG KÝ NHẬN LINK"}
                                </button>
                              </form>
                            )}

                            {/* Divider */}
                            <div className="relative">
                              <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200" />
                              </div>
                              <div className="relative flex justify-center">
                                <span className="px-3 text-xs text-gray-400 bg-white">
                                  hoặc đăng nhập tài khoản
                                </span>
                              </div>
                            </div>
                          </>
                        )}

                        {/* Login/Register tabs */}
                        <div className="border border-gray-100 rounded-lg overflow-hidden">
                          <div className="flex border-b border-gray-100">
                            <button
                              onClick={() => {
                                setAuthTab("login");
                                setAuthError("");
                              }}
                              className={`flex-1 py-2.5 text-sm font-bold transition ${
                                authTab === "login"
                                  ? "text-gray-800 border-b-2 border-orange-500"
                                  : "text-gray-400 hover:text-gray-600"
                              }`}
                            >
                              Đăng nhập
                            </button>
                            <button
                              onClick={() => {
                                setAuthTab("register");
                                setAuthError("");
                              }}
                              className={`flex-1 py-2.5 text-sm font-bold transition ${
                                authTab === "register"
                                  ? "text-orange-600 border-b-2 border-orange-500"
                                  : "text-gray-400 hover:text-gray-600"
                              }`}
                            >
                              Tạo tài khoản
                            </button>
                          </div>

                          <div className="p-4">
                            {authError && (
                              <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-2 rounded-lg mb-3">
                                {authError}
                              </div>
                            )}

                            {authTab === "login" ? (
                              <form
                                onSubmit={handleLogin}
                                className="space-y-3"
                              >
                                <input
                                  type="email"
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                  placeholder="Email"
                                  required
                                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:border-orange-400 focus:outline-none text-sm"
                                />
                                <div className="relative">
                                  <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) =>
                                      setPassword(e.target.value)
                                    }
                                    placeholder="Mật khẩu"
                                    required
                                    className="w-full px-3 pr-10 py-2.5 border border-gray-200 rounded-lg focus:border-orange-400 focus:outline-none text-sm"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setShowPassword(!showPassword)
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                  >
                                    {showPassword ? (
                                      <EyeOff className="w-4 h-4" />
                                    ) : (
                                      <Eye className="w-4 h-4" />
                                    )}
                                  </button>
                                </div>
                                <button
                                  type="submit"
                                  disabled={authLoading}
                                  className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-2.5 rounded-lg transition disabled:opacity-50 text-sm"
                                >
                                  {authLoading ? "Đang xử lý..." : "Đăng nhập"}
                                </button>
                              </form>
                            ) : (
                              <form
                                onSubmit={handleRegisterAccount}
                                className="space-y-3"
                              >
                                <input
                                  type="text"
                                  value={name}
                                  onChange={(e) => setName(e.target.value)}
                                  placeholder="Họ và tên"
                                  required
                                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:border-orange-400 focus:outline-none text-sm"
                                />
                                <input
                                  type="email"
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                  placeholder="Email"
                                  required
                                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:border-orange-400 focus:outline-none text-sm"
                                />
                                <input
                                  type="password"
                                  value={password}
                                  onChange={(e) => setPassword(e.target.value)}
                                  placeholder="Mật khẩu"
                                  required
                                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:border-orange-400 focus:outline-none text-sm"
                                />
                                <input
                                  type="password"
                                  value={confirmPassword}
                                  onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                  }
                                  placeholder="Xác nhận mật khẩu"
                                  required
                                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:border-orange-400 focus:outline-none text-sm"
                                />
                                <button
                                  type="submit"
                                  disabled={authLoading}
                                  className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-2.5 rounded-lg transition disabled:opacity-50 text-sm"
                                >
                                  {authLoading
                                    ? "Đang xử lý..."
                                    : "Đăng ký tài khoản"}
                                </button>
                              </form>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Share Link */}
                  <div className="border-t border-gray-100 p-4">
                    <p className="text-sm text-gray-600 mb-2 font-medium">
                      Link chia sẻ chương trình này của bạn:
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={shareUrl}
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 bg-gray-50 truncate"
                      />
                      <button
                        onClick={copyShareLink}
                        className="flex-shrink-0 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                        title="Copy link"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Other statuses (live, cancelled) ── */}
              {!isUpcoming && !isCompleted && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
                  <p className="text-gray-500">
                    {webinar.status === "live"
                      ? "Webinar đang diễn ra"
                      : "Webinar đã bị hủy"}
                  </p>
                  {webinar.status === "live" && webinar.zoom_link && (
                    <a
                      href={webinar.zoom_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg text-center transition"
                    >
                      🔗 Tham gia Zoom ngay
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
