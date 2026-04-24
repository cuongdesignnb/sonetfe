"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/use-auth";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { siteConfig } from "@/config/site";
import { formatPrice } from "@/lib/utils";
import {
  QrCode,
  Building2,
  Copy,
  Check,
  ChevronLeft,
  Shield,
  User,
  Mail,
  Phone,
  Zap,
  Smartphone,
  CreditCard,
  CheckCircle2,
  Clock,
  Headphones,
  FileText,
} from "lucide-react";

/* ─── Bank code to name mapping ─── */
const BANK_NAMES: Record<string, string> = {
  VPB: "VPBank",
  VPBANK: "VPBank",
  VCB: "Vietcombank",
  VIETCOMBANK: "Vietcombank",
  TCB: "Techcombank",
  TECHCOMBANK: "Techcombank",
  MB: "MBBank",
  MBB: "MBBank",
  MBBANK: "MBBank",
  ACB: "ACB",
  BIDV: "BIDV",
  TPB: "TPBank",
  TPBANK: "TPBank",
  STB: "Sacombank",
  SACOMBANK: "Sacombank",
  HDB: "HDBank",
  HDBANK: "HDBank",
  AGR: "Agribank",
  AGRIBANK: "Agribank",
  CTG: "VietinBank",
  VIETINBANK: "VietinBank",
  SHB: "SHB",
  MSB: "MSB",
  OCB: "OCB",
  VIB: "VIB",
  SCB: "SCB",
  LPB: "LienVietPostBank",
  EIB: "Eximbank",
  SEAB: "SeABank",
  SEABANK: "SeABank",
};

function resolveBankName(code: string | null): string {
  if (!code) return "--";
  return BANK_NAMES[code.toUpperCase()] || code;
}

/* ─── Types ─── */
type PaymentData = {
  id: number;
  status: string;
  amount: number;
  original_amount?: number;
  discount_amount?: number;
  order_code: string;
  transfer_content: string;
  qr_url: string | null;
  bank_code: string | null;
  bank_account_number: string | null;
  bank_account_name: string | null;
  voucher?: { code: string; name: string } | null;
  course?: {
    id: number;
    title: string;
    description?: string;
    thumbnail?: string;
    price?: number;
    slug?: string;
  };
};

type InvoiceRequestData = {
  id: number;
  status: "pending" | "processing" | "completed" | "rejected";
  company_name: string;
  tax_code: string;
  company_address: string;
  invoice_email: string;
  invoice_number?: string | null;
  invoice_series?: string | null;
  provider_status?: string | null;
  last_error?: string | null;
};

/* ─── Copy Button ─── */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="ml-2 inline-flex items-center gap-1 rounded-lg bg-orange-500/10 px-2 py-1 text-xs font-medium text-orange-400 transition-colors hover:bg-orange-500/20"
    >
      {copied ? (
        <Check className="h-3 w-3 text-green-400" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
    </button>
  );
}

/* ─── Pulse Dot ─── */
function PulseDot({ color = "green" }: { color?: string }) {
  const bg = color === "green" ? "bg-green-500" : "bg-orange-500";
  return (
    <span className="relative mr-2 flex h-2.5 w-2.5">
      <span
        className={`absolute inline-flex h-full w-full animate-ping rounded-full ${bg} opacity-75`}
      />
      <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${bg}`} />
    </span>
  );
}

export default function CheckoutPage() {
  const params = useParams<{ paymentId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const settings = useSiteSettings();
  const searchParams = useSearchParams();
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "https://admin.phamanhchien.vn/api";

  const productType = searchParams.get("type") || "course";
  const statusEndpoint =
    productType === "ebook"
      ? `${apiUrl}/ebook-payments/${params.paymentId}/status`
      : productType === "webinar"
        ? `${apiUrl}/webinar-payments/${params.paymentId}/status`
        : `${apiUrl}/payments/${params.paymentId}/status`;

  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paid, setPaid] = useState(false);

  /* ─── Invoice request state ─── */
  const [wantInvoice, setWantInvoice] = useState(false);
  const [invoiceSubmitting, setInvoiceSubmitting] = useState(false);
  const [invoiceRequest, setInvoiceRequest] =
    useState<InvoiceRequestData | null>(null);
  const [invoiceForm, setInvoiceForm] = useState({
    company_name: "",
    tax_code: "",
    company_address: "",
    invoice_email: "",
  });

  const siteName = settings?.site?.name || siteConfig.name;
  const logoUrl = settings?.site?.logo_url || siteConfig.logo.src;
  const contactPhone =
    settings?.site?.contact?.phone || siteConfig.contact.phone || "";
  const contactEmail =
    settings?.site?.contact?.email || siteConfig.contact.email || "";

  const hydrateInvoiceState = useCallback((nextInvoiceRequest?: InvoiceRequestData | null) => {
    if (!nextInvoiceRequest) {
      return;
    }

    setInvoiceRequest(nextInvoiceRequest);
    setWantInvoice(true);
    setInvoiceForm({
      company_name: nextInvoiceRequest.company_name || "",
      tax_code: nextInvoiceRequest.tax_code || "",
      company_address: nextInvoiceRequest.company_address || "",
      invoice_email: nextInvoiceRequest.invoice_email || "",
    });
  }, []);

  /* ─── Fetch payment info ─── */
  const fetchPayment = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(statusEndpoint, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        cache: "no-store",
      });
      if (!res.ok) {
        setError("Không tìm thấy thông tin thanh toán.");
        return null;
      }
      const json = await res.json();
      hydrateInvoiceState(json?.invoice_request);
      return json;
    } catch {
      setError("Không thể tải thông tin thanh toán.");
      return null;
    }
  }, [hydrateInvoiceState, statusEndpoint]);

  /* ─── Initial load ─── */
  useEffect(() => {
    async function load() {
      setLoading(true);
      const json = await fetchPayment();
      if (json?.payment) {
        setPayment(json.payment);
        if (json.payment.status === "paid") {
          setPaid(true);
        }
      }
      setLoading(false);
    }
    load();
  }, [fetchPayment]);

  /* ─── Polling ─── */
  useEffect(() => {
    if (!payment || paid) return;
    let active = true;
    const interval = setInterval(async () => {
      if (!active) return;
      const json = await fetchPayment();
      const status = json?.payment?.status;
      if (status === "paid") {
        setPaid(true);
        setPayment((prev) => (prev ? { ...prev, status: "paid" } : prev));
        toast.success(
          json?.invoice_request
            ? "Thanh toán thành công! Hệ thống đang xử lý hóa đơn của bạn."
            : "Thanh toán thành công! Đang chuyển đến trang học...",
        );
        clearInterval(interval);
        const courseId = json?.payment?.course?.id || payment?.course?.id;
        setTimeout(() => {
          if (productType === "webinar") {
            // Redirect back to webinar page where user will see content
            const webinarSlug = searchParams.get("slug");
            if (webinarSlug) {
              router.push(`/webinars/${webinarSlug}`);
            } else {
              router.push("/webinars");
            }
          } else if (productType === "ebook") {
            const ebookSlug =
              searchParams.get("slug") || json?.payment?.course?.slug;
            if (ebookSlug) {
              router.push(`/ebooks/${ebookSlug}`);
            } else {
              router.push("/ebooks");
            }
          } else if (courseId) {
            router.push(`/courses/${courseId}/learn`);
          } else {
            router.push("/dashboard");
          }
        }, 1500);
      }
    }, 3000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [payment, paid, fetchPayment, productType, router, searchParams]);

  const invoiceLocked =
    invoiceRequest?.status === "processing" ||
    invoiceRequest?.status === "completed";

  const invoiceStatusTone =
    invoiceRequest?.status === "completed"
      ? "text-green-400 bg-green-500/10"
      : invoiceRequest?.status === "processing"
        ? "text-amber-400 bg-amber-500/10"
        : invoiceRequest?.status === "rejected"
          ? "text-red-400 bg-red-500/10"
          : "text-blue-400 bg-blue-500/10";

  const invoiceStatusMessage =
    invoiceRequest?.status === "completed"
      ? `Hóa đơn đã phát hành${invoiceRequest.invoice_series && invoiceRequest.invoice_number ? `: ${invoiceRequest.invoice_series} - ${invoiceRequest.invoice_number}` : "."}`
      : invoiceRequest?.status === "processing"
        ? "Yêu cầu hóa đơn đang được đẩy sang Minvoice."
        : invoiceRequest?.status === "rejected"
          ? invoiceRequest.last_error ||
            "Phát hành hóa đơn chưa thành công. Bạn có thể cập nhật và gửi lại."
          : invoiceRequest
            ? payment?.status === "paid"
              ? "Yêu cầu hóa đơn đã được lưu và đang chờ hệ thống phát hành."
              : "Yêu cầu hóa đơn đã được lưu. Hóa đơn sẽ được phát hành sau khi thanh toán thành công."
            : null;

  /* ─── Loading ─── */
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-orange-500/30 border-t-orange-500" />
          <p className="text-sm text-gray-400">
            Đang tải thông tin thanh toán...
          </p>
        </div>
      </div>
    );
  }

  /* ─── Error ─── */
  if (error || !payment) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="mb-4 text-5xl">😕</div>
          <h2 className="mb-2 text-xl font-bold text-white">
            {error || "Không tìm thấy thanh toán"}
          </h2>
          <Link
            href="/"
            className="mt-4 inline-flex items-center gap-2 text-sm text-orange-400 hover:text-orange-300"
          >
            <ChevronLeft className="h-4 w-4" /> Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  /* ─── Paid success ─── */
  if (paid) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="text-center">
          <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-400" />
          <h2 className="mb-2 text-2xl font-bold text-white">
            Thanh toán thành công!
          </h2>
          <p className="mb-6 text-gray-400">Đang chuyển bạn đến trang học...</p>
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-green-500/30 border-t-green-500" />
        </div>
      </div>
    );
  }

  const transferContent = payment.transfer_content || payment.order_code;

  return (
    <div className="min-h-screen bg-gray-950">
      {/* ═══ Header ═══ */}
      <header className="border-b border-white/5 bg-gray-900/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Image
              src={logoUrl}
              alt={siteName}
              width={36}
              height={36}
              className="rounded-lg"
            />
            <div>
              <h1 className="text-sm font-bold text-white">{siteName}</h1>
              <p className="flex items-center gap-1 text-xs text-green-400">
                <Shield className="h-3 w-3" />
                THANH TOÁN AN TOÀN
              </p>
            </div>
          </div>
          <Link
            href="/"
            className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-400 transition-colors hover:border-white/20 hover:text-white"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Về trang chủ
          </Link>
        </div>
      </header>

      {/* ═══ Course Info Bar ═══ */}
      {payment.course && (
        <div className="border-b border-white/5 bg-gradient-to-r from-purple-900/20 via-gray-900 to-orange-900/20">
          <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4">
            {payment.course.thumbnail && (
              <Image
                src={payment.course.thumbnail}
                alt={payment.course.title}
                width={80}
                height={50}
                className="rounded-lg object-cover"
                unoptimized
              />
            )}
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-sm font-bold uppercase text-white sm:text-base">
                {payment.course.title}
              </h2>
              {payment.course.description && (
                <p className="mt-0.5 truncate text-xs text-gray-400">
                  {payment.course.description.replace(/<[^>]*>/g, "")}
                </p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-bold text-green-400 ring-1 ring-green-500/20">
                💰 {formatPrice(payment.amount)}
              </span>
              <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs font-bold text-purple-400 ring-1 ring-purple-500/20">
                📋 Mã ĐH: #{payment.order_code}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Main Content ═══ */}
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* ─── Left: QR Payment ─── */}
          <div className="space-y-6">
            {/* QR Card */}
            <div className="rounded-2xl border border-white/10 bg-gray-900/80 p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                  <QrCode className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Smart Payment</h3>
                  <p className="flex items-center text-xs text-green-400">
                    <PulseDot />
                    Tự động xác nhận trong 30s
                  </p>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex justify-center">
                <div className="relative rounded-2xl bg-white p-4">
                  {payment.qr_url ? (
                    <Image
                      src={payment.qr_url}
                      alt="QR thanh toán"
                      width={240}
                      height={240}
                      className="rounded-lg"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-60 w-60 items-center justify-center text-sm text-gray-500">
                      QR chưa sẵn sàng
                    </div>
                  )}
                  {/* Active badge */}
                  <div className="absolute -right-2 -top-2 rounded-lg bg-green-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-lg shadow-green-500/30">
                    AI Active
                  </div>
                </div>
              </div>

              <p className="mt-4 text-center text-xs text-gray-500">
                🔒 Mã hoá đầu cuối an toàn
              </p>
            </div>

            {/* Buyer Info Card */}
            {user && (
              <div className="rounded-2xl border border-white/10 bg-gray-900/80 p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20">
                    <User className="h-5 w-5 text-orange-400" />
                  </div>
                  <h3 className="font-bold text-white">Thông tin người mua</h3>
                </div>

                <div className="divide-y divide-white/5">
                  <div className="flex items-center gap-3 py-3">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="w-20 text-sm text-gray-500">Họ tên:</span>
                    <span className="text-sm font-medium text-white">
                      {user.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 py-3">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="w-20 text-sm text-gray-500">Email:</span>
                    <span className="text-sm font-medium text-white">
                      {user.email}
                    </span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-3 py-3">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="w-20 text-sm text-gray-500">Zalo:</span>
                      <span className="text-sm font-medium text-white">
                        {user.phone}
                      </span>
                    </div>
                  )}
                  {user.cccd && (
                    <div className="flex items-center gap-3 py-3">
                      <Shield className="h-4 w-4 text-gray-500" />
                      <span className="w-20 text-sm text-gray-500">CCCD:</span>
                      <span className="text-sm font-medium text-white">
                        {user.cccd}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ─── Invoice Request ─── */}
            {user && payment && (
              <div className="rounded-2xl border border-white/10 bg-gray-900/80 p-6">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={wantInvoice}
                    onChange={(e) => setWantInvoice(e.target.checked)}
                    disabled={invoiceLocked}
                    className="h-4 w-4 rounded border-white/20 bg-white/5 text-orange-500 focus:ring-orange-500/30"
                  />
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-orange-400" />
                    <span className="text-sm font-semibold text-white">
                      Tôi muốn xuất hóa đơn
                    </span>
                  </div>
                </label>

                {invoiceStatusMessage && (
                  <div
                    className={`mt-3 rounded-xl p-3 text-sm ${invoiceStatusTone}`}
                  >
                    {invoiceStatusMessage}
                  </div>
                )}

                {wantInvoice && !invoiceLocked && (
                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="mb-1 block text-xs text-gray-400">
                        Tên công ty <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={invoiceForm.company_name}
                        onChange={(e) =>
                          setInvoiceForm((f) => ({
                            ...f,
                            company_name: e.target.value,
                          }))
                        }
                        placeholder="Công ty TNHH ABC"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/30"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-gray-400">
                        Mã số thuế <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={invoiceForm.tax_code}
                        onChange={(e) =>
                          setInvoiceForm((f) => ({
                            ...f,
                            tax_code: e.target.value,
                          }))
                        }
                        placeholder="0123456789"
                        maxLength={20}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/30"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-gray-400">
                        Địa chỉ công ty <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={invoiceForm.company_address}
                        onChange={(e) =>
                          setInvoiceForm((f) => ({
                            ...f,
                            company_address: e.target.value,
                          }))
                        }
                        placeholder="123 Nguyễn Huệ, Quận 1, TP.HCM"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/30"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-gray-400">
                        Email nhận hóa đơn{" "}
                        <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="email"
                        value={invoiceForm.invoice_email}
                        onChange={(e) =>
                          setInvoiceForm((f) => ({
                            ...f,
                            invoice_email: e.target.value,
                          }))
                        }
                        placeholder="ketoan@congty.vn"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/30"
                      />
                    </div>
                    <button
                      type="button"
                      disabled={invoiceSubmitting}
                      onClick={async () => {
                        if (
                          !invoiceForm.company_name ||
                          !invoiceForm.tax_code ||
                          !invoiceForm.company_address ||
                          !invoiceForm.invoice_email
                        ) {
                          toast.error("Vui lòng điền đầy đủ thông tin hóa đơn");
                          return;
                        }
                        setInvoiceSubmitting(true);
                        try {
                          const token = localStorage.getItem("token");
                          const res = await fetch(
                            `${apiUrl}/invoice-requests`,
                            {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                                ...(token
                                  ? { Authorization: `Bearer ${token}` }
                                  : {}),
                              },
                              body: JSON.stringify({
                                payment_id: payment.id,
                                ...invoiceForm,
                              }),
                            },
                          );
                          const data = await res.json();
                          if (res.ok) {
                            hydrateInvoiceState(data.invoice_request || null);
                            toast.success(
                              data.message ||
                                "Yêu cầu xuất hóa đơn đã được lưu thành công!",
                            );
                          } else {
                            if (data?.invoice_request) {
                              hydrateInvoiceState(data.invoice_request);
                            }
                            toast.error(
                              data.message ||
                                "Không thể gửi yêu cầu. Vui lòng thử lại.",
                            );
                          }
                        } catch {
                          toast.error("Lỗi kết nối. Vui lòng thử lại.");
                        } finally {
                          setInvoiceSubmitting(false);
                        }
                      }}
                      className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2.5 text-sm font-bold text-white transition-all hover:from-orange-600 hover:to-amber-600 disabled:opacity-50"
                    >
                      {invoiceSubmitting
                        ? "Đang gửi..."
                        : "Gửi yêu cầu xuất hóa đơn"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ─── Right: Bank Transfer Info ─── */}
          <div className="space-y-6">
            {/* Bank Details Card */}
            <div className="rounded-2xl border border-white/10 bg-gray-900/80 p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                  <Building2 className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Bank Transfer Info</h3>
                  <p className="text-xs text-blue-400">
                    ⚡ Smart banking details
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Account name */}
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                  <p className="mb-1 text-xs text-gray-500">
                    Tên chủ tài khoản
                  </p>
                  <p className="font-bold uppercase text-white">
                    {payment.bank_account_name || "--"}
                  </p>
                </div>

                {/* Bank name */}
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                  <p className="mb-1 text-xs text-gray-500">🏦 Ngân hàng</p>
                  <p className="font-semibold text-white">
                    {resolveBankName(payment.bank_code)}
                  </p>
                </div>

                {/* Account number */}
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                  <p className="mb-1 text-xs text-gray-500">Số tài khoản</p>
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-lg font-bold text-white">
                      {payment.bank_account_number || "--"}
                    </p>
                    {payment.bank_account_number && (
                      <CopyButton text={payment.bank_account_number} />
                    )}
                  </div>
                </div>

                {/* Amount */}
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                  <p className="mb-1 text-xs text-gray-500">💰 Số tiền</p>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-black text-orange-400">
                      {formatPrice(payment.amount)}
                    </p>
                    <CopyButton text={String(payment.amount)} />
                  </div>
                </div>

                {/* Transfer content */}
                <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-3">
                  <p className="mb-1 text-xs text-gray-500">
                    ✏️ Nội dung chuyển khoản
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="font-mono font-bold text-orange-400">
                      {transferContent}
                    </p>
                    <CopyButton text={transferContent} />
                  </div>
                </div>
              </div>

              <p className="mt-4 text-xs text-gray-500">
                Vui lòng chuyển khoản bằng mã QR code (Có thể tải điện thoại để
                chuyển)
              </p>
            </div>

            {/* Payment Guide Card */}
            <div className="rounded-2xl border border-white/10 bg-gray-900/80 p-6">
              <h4 className="mb-4 font-bold text-white">AI Payment Guide:</h4>
              <div className="space-y-3">
                <Step
                  num="1"
                  icon={<Smartphone className="h-4 w-4" />}
                  text="Mở app ngân hàng và chọn quét mã QR"
                />
                <Step
                  num="2"
                  icon={<CreditCard className="h-4 w-4" />}
                  text="AI tự động điền thông tin chuyển khoản"
                />
                <Step
                  num="3"
                  icon={<CheckCircle2 className="h-4 w-4" />}
                  text="Kiểm tra và xác nhận giao dịch"
                />
                <Step
                  num="4"
                  icon={<Zap className="h-4 w-4" />}
                  text="AI xử lý thanh toán và thông báo kết quả"
                />
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-start gap-2 rounded-xl bg-purple-500/5 p-3 text-xs text-purple-300">
                  <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-400" />
                  <span>
                    Hệ thống sẽ tự động phát hiện thanh toán và kích hoạt khóa
                    học trong 30-60 giây
                  </span>
                </div>
                <div className="flex items-start gap-2 rounded-xl bg-orange-500/5 p-3 text-xs text-orange-300">
                  <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-400" />
                  <span>
                    Bạn sẽ nhận được email/Zalo thông báo khi thanh toán được
                    xác nhận
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ Footer: Support ═══ */}
        <div className="mt-8 rounded-2xl border border-white/10 bg-gray-900/80 p-4">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
                <Headphones className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h4 className="font-bold text-white">Hỗ trợ khách hàng</h4>
                <p className="text-xs text-gray-400">
                  Liên hệ khi cần hỗ trợ thanh toán hoặc kích hoạt khóa học
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {contactPhone && (
                <a
                  href={`tel:${contactPhone}`}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm text-white transition-colors hover:border-white/20"
                >
                  <Phone className="h-4 w-4" />
                  Hotline: {contactPhone}
                </a>
              )}
              {contactEmail && (
                <a
                  href={`mailto:${contactEmail}`}
                  className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
                >
                  <Mail className="h-4 w-4" />
                  Email CSKH
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <p className="mt-6 text-center text-xs text-gray-600">
          Secure Payment Gateway © {new Date().getFullYear()} {siteName}. All
          rights reserved.
        </p>
      </main>
    </div>
  );
}

/* ─── Step Component ─── */
function Step({
  num,
  icon,
  text,
}: {
  num: string;
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white/5 text-xs font-bold text-gray-400">
        {num}
      </div>
      <span className="text-gray-500">{icon}</span>
      <span className="text-sm text-gray-300">{text}</span>
    </div>
  );
}
