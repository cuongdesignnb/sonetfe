"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, X, Mail, Lock, User } from "lucide-react";
import { siteConfig } from "@/config/site";
import { useSiteSettings } from "@/hooks/use-site-settings";

type Tab = "login" | "register";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<Tab>("login");
  const router = useRouter();
  const searchParams = useSearchParams();
  const settings = useSiteSettings();
  const logoSrc = settings.site.logo_url || siteConfig.logo.src;
  const isExternalLogo = /^https?:\/\//i.test(logoSrc);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "register") setActiveTab("register");

    // Save redirect URL for after login/register
    const redirect = searchParams.get("redirect");
    if (redirect) {
      localStorage.setItem("auth_redirect", redirect);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Close button */}
          <button
            type="button"
            onClick={() => router.push("/")}
            className="absolute right-4 top-4 z-10 rounded-full p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>

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
            <h1 className="text-xl font-bold text-gray-900">
              {settings.site.name || siteConfig.name}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Chào mừng bạn đến với nền tảng học tập
            </p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mx-6">
            <button
              type="button"
              className={`flex-1 py-3 text-sm font-semibold transition-colors relative ${
                activeTab === "login"
                  ? "text-orange-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
              onClick={() => setActiveTab("login")}
            >
              Đăng nhập
              {activeTab === "login" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
              )}
            </button>
            <button
              type="button"
              className={`flex-1 py-3 text-sm font-semibold transition-colors relative ${
                activeTab === "register"
                  ? "text-orange-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
              onClick={() => setActiveTab("register")}
            >
              Đăng ký
              {activeTab === "register" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
              )}
            </button>
          </div>

          {/* Form content */}
          <div className="p-6">
            {activeTab === "login" ? <LoginForm /> : <RegisterForm />}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Login Form ─── */
function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      await login(email, password);
      if (rememberMe) {
        localStorage.setItem("remember_email", email);
      } else {
        localStorage.removeItem("remember_email");
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Đăng nhập thất bại";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email */}
      <div className="space-y-1.5">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="login-email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="pl-10"
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="login-password"
            type={showPassword ? "text" : "password"}
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="pl-10 pr-10"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Remember me + Forgot password */}
      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="rounded border-gray-300 text-orange-500 focus:ring-orange-500 h-4 w-4"
          />
          <span className="text-gray-600">Ghi nhớ đăng nhập</span>
        </label>
        <Link
          href="/auth/forgot-password"
          className="text-orange-600 hover:text-orange-700 font-medium hover:underline"
        >
          Quên mật khẩu?
        </Link>
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
        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
      </Button>
    </form>
  );
}

/* ─── Register Form ─── */
function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 8) {
      setErrorMessage("Mật khẩu phải có ít nhất 8 ký tự.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);

    try {
      await register({ name, email, password, confirmPassword });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Đăng ký thất bại";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div className="relative">
        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          id="reg-name"
          type="text"
          placeholder="Họ và tên"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="pl-10"
        />
      </div>

      {/* Email */}
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          id="reg-email"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="pl-10"
        />
      </div>

      {/* Password */}
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          id="reg-password"
          type={showPassword ? "text" : "password"}
          placeholder="Mật khẩu (ít nhất 8 ký tự)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className="pl-10 pr-10"
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Confirm Password */}
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          id="reg-confirm-password"
          type="password"
          placeholder="Nhập lại mật khẩu"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={8}
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
        {loading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
      </Button>
    </form>
  );
}
