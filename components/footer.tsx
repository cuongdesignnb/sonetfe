"use client";

import Link from "next/link";
import { Mail, MapPin, Facebook, Youtube } from "lucide-react";
import { siteConfig } from "@/config/site";
import { useSiteSettings } from "@/hooks/use-site-settings";

export function Footer() {
  const settings = useSiteSettings();
  const brandName = settings.site.name || siteConfig.name;
  const contact = settings.site.contact || siteConfig.contact;
  const social = settings.site.social || siteConfig.social;
  const footer = settings.footer;
  const dynamicMenus =
    settings.menus && settings.menus.length > 0 ? settings.menus : null;

  const footerLinks = footer?.links || siteConfig.navigation.footer;
  const courseLinks =
    footerLinks.courses || siteConfig.navigation.footer.courses;
  const supportLinks =
    footerLinks.support || siteConfig.navigation.footer.support;
  const legalLinks = footerLinks.legal || siteConfig.navigation.footer.legal;

  const pageLinks = dynamicMenus
    ? dynamicMenus.map((m) => ({ name: m.title, href: m.url }))
    : siteConfig.navigation.main;

  const description =
    footer?.description ||
    "Cung cấp các khóa học chất lượng cao với công nghệ streaming video tiên tiến.";
  const tagline = footer?.tagline || "";

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800">
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Column 1: Pages */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-sm">
              Trang
            </h3>
            <ul className="space-y-2.5 text-sm">
              {pageLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Courses / Products */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-sm">
              Sản phẩm
            </h3>
            <ul className="space-y-2.5 text-sm">
              {courseLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Support */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-sm">
              Hỗ trợ
            </h3>
            <ul className="space-y-2.5 text-sm">
              {supportLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
              <li>
                <span className="text-gray-500 dark:text-gray-400">
                  Hotline: {contact.phone}
                </span>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-sm">
              Pháp lý
            </h3>
            <ul className="space-y-2.5 text-sm">
              {legalLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social Icons */}
        {footer?.show_social_links !== false && (
          <div className="flex justify-center gap-4 mt-10 mb-6">
            {social.facebook && (
              <a
                href={social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-gray-100 dark:bg-slate-800 hover:bg-red-100 dark:hover:bg-red-900/30 flex items-center justify-center text-gray-500 hover:text-red-600 transition-colors"
              >
                <Facebook className="h-4 w-4" />
              </a>
            )}
            {social.youtube && (
              <a
                href={social.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-gray-100 dark:bg-slate-800 hover:bg-red-100 dark:hover:bg-red-900/30 flex items-center justify-center text-gray-500 hover:text-red-600 transition-colors"
              >
                <Youtube className="h-4 w-4" />
              </a>
            )}
            {social.tiktok && (
              <a
                href={social.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-gray-100 dark:bg-slate-800 hover:bg-red-100 dark:hover:bg-red-900/30 flex items-center justify-center text-gray-500 hover:text-red-600 transition-colors"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.6a8.21 8.21 0 0 0 4.76 1.51v-3.4a4.85 4.85 0 0 1-1-.02z" />
                </svg>
              </a>
            )}
            <a
              href={`mailto:${contact.email}`}
              className="w-9 h-9 rounded-full bg-gray-100 dark:bg-slate-800 hover:bg-red-100 dark:hover:bg-red-900/30 flex items-center justify-center text-gray-500 hover:text-red-600 transition-colors"
            >
              <Mail className="h-4 w-4" />
            </a>
          </div>
        )}

        {/* Company Info */}
        <div className="text-center space-y-1.5 text-xs text-gray-400 dark:text-gray-500 border-t border-gray-200 dark:border-slate-800 pt-6">
          <p className="font-semibold text-gray-600 dark:text-gray-300 text-sm">
            {brandName.toUpperCase()}
          </p>
          {description && (
            <p className="text-gray-500 dark:text-gray-400">{description}</p>
          )}
          <p>
            <MapPin className="w-3 h-3 inline mr-1" />
            {contact.address}
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <p>
              {footer?.copyright_text ||
                `© ${new Date().getFullYear()} ${brandName}. Tất cả quyền được bảo lưu.`}
            </p>
            {tagline && <p>{tagline}</p>}
          </div>
        </div>
      </div>
    </footer>
  );
}
