"use client";

import { useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import { useSiteSettings } from "@/hooks/use-site-settings";

export default function NavbarClient() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const settings = useSiteSettings();
  const dynamicMenus =
    settings.menus && settings.menus.length > 0 ? settings.menus : null;

  return (
    <>
      <ThemeToggle />

      {user ? (
        <details className="relative hidden md:block">
          <summary className="list-none cursor-pointer select-none rounded-md px-3 py-2 text-sm font-medium text-red-50 hover:bg-white/10">
            {user.name || user.email || "Tài khoản"}
          </summary>
          <div className="absolute right-0 mt-2 w-48 rounded-md border bg-background shadow-sm">
            <div className="py-1">
              <Link
                href="/dashboard"
                className="block px-3 py-2 text-sm hover:bg-accent"
              >
                Bảng điều khiển
              </Link>
              <Link
                href="/profile"
                className="block px-3 py-2 text-sm hover:bg-accent"
              >
                Hồ sơ
              </Link>
              <button
                type="button"
                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-accent"
                onClick={async () => {
                  await logout();
                }}
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </details>
      ) : (
        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/auth/login"
            className="rounded-full border-2 border-red-500 bg-orange-500 px-5 py-2 text-sm font-bold text-white hover:bg-orange-600 transition-colors"
          >
            Đăng nhập
          </Link>
        </div>
      )}

      <button
        type="button"
        className="md:hidden rounded-md px-3 py-2 text-sm font-medium text-red-50 hover:bg-white/10"
        onClick={() => setMobileOpen((v) => !v)}
        aria-expanded={mobileOpen}
        aria-controls="mobile-nav"
      >
        Menu
      </button>

      {mobileOpen && (
        <div
          id="mobile-nav"
          className="absolute left-0 top-16 w-full border-b border-[#6F1515] bg-[#8B1A1A] md:hidden"
        >
          <div className="container py-3 space-y-1">
            {dynamicMenus ? (
              /* Dynamic menus from admin */
              dynamicMenus.map((item) => (
                <div key={item.id}>
                  <Link
                    href={item.url}
                    target={item.target === "_blank" ? "_blank" : undefined}
                    rel={
                      item.target === "_blank"
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className="block rounded-md px-3 py-2 text-sm font-medium text-red-50 hover:bg-white/10"
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.title}
                  </Link>
                  {item.children?.map((child) => (
                    <Link
                      key={child.id}
                      href={child.url}
                      target={child.target === "_blank" ? "_blank" : undefined}
                      rel={
                        child.target === "_blank"
                          ? "noopener noreferrer"
                          : undefined
                      }
                      className="block rounded-md px-6 py-1.5 text-sm text-red-200 hover:bg-white/10"
                      onClick={() => setMobileOpen(false)}
                    >
                      {child.title}
                    </Link>
                  ))}
                </div>
              ))
            ) : (
              /* Fallback static links */
              <>
                <Link
                  href="/courses"
                  className="block rounded-md px-3 py-2 text-sm font-medium text-red-50 hover:bg-white/10"
                  onClick={() => setMobileOpen(false)}
                >
                  Khóa học
                </Link>
                <Link
                  href="/categories"
                  className="block rounded-md px-3 py-2 text-sm font-medium text-red-50 hover:bg-white/10"
                  onClick={() => setMobileOpen(false)}
                >
                  Danh mục
                </Link>
              </>
            )}
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="block rounded-md px-3 py-2 text-sm font-medium text-red-50 hover:bg-white/10"
                  onClick={() => setMobileOpen(false)}
                >
                  Bảng điều khiển
                </Link>
                <button
                  type="button"
                  className="w-full text-left rounded-md px-3 py-2 text-sm font-medium text-red-300 hover:bg-white/10"
                  onClick={async () => {
                    await logout();
                    setMobileOpen(false);
                  }}
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="block rounded-md px-3 py-2 text-sm font-medium text-red-50 hover:bg-white/10"
                  onClick={() => setMobileOpen(false)}
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/auth/register"
                  className="block rounded-md px-3 py-2 text-sm font-medium text-red-50 hover:bg-white/10"
                  onClick={() => setMobileOpen(false)}
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
