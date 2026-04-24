"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { siteConfig } from "@/config/site";
import { useSiteSettings } from "@/hooks/use-site-settings";
import axios from "axios";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const settings = useSiteSettings();
  const logoSrc = settings.site.logo_url || siteConfig.logo.src;
  const isExternalLogo = /^https?:\/\//i.test(logoSrc);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      await axios.post("/auth/forgot-password", { email });
      setSent(true);
    } catch {
      // Always show success to prevent email enumeration
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="pt-8 pb-4 text-center">
            <div className="flex justify-center mb-3">
              {isExternalLogo ? (
                <img
                  src={logoSrc}
                  alt={siteConfig.logo.alt}
                  className="h-12 w-12 object-contain"
                />
              ) : (
                <Image
                  src={logoSrc}
                  alt={siteConfig.logo.alt}
                  width={48}
                  height={48}
                  className="object-contain"
                />
              )}
            </div>
            <h1 className="text-xl font-bold text-gray-900">Quên mật khẩu</h1>
            <p className="text-sm text-gray-500 mt-1">
              Nhập email để nhận hướng dẫn đặt lại mật khẩu
            </p>
          </div>

          <div className="p-6">
            {sent ? (
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <CheckCircle className="h-12 w-12 text-green-500" />
                </div>
                <p className="text-gray-700">
                  Nếu email <strong>{email}</strong> tồn tại trong hệ thống, bạn
                  sẽ nhận được hướng dẫn đặt lại mật khẩu.
                </p>
                <p className="text-sm text-gray-500">
                  Vui lòng kiểm tra hộp thư (bao gồm cả thư rác).
                </p>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium text-sm"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Quay lại đăng nhập
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Nhập email của bạn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>

                {errorMessage && (
                  <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                    {errorMessage}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-2.5 rounded-lg"
                  disabled={loading}
                >
                  {loading ? "Đang gửi..." : "Gửi yêu cầu"}
                </Button>

                <div className="text-center">
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại đăng nhập
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
