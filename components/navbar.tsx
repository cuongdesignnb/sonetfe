"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import NavbarClient from "./navbar-client";
import { siteConfig } from "@/config/site";
import { useSiteSettings } from "@/hooks/use-site-settings";
import type { MenuItem } from "@/lib/site-settings";

/* Small flower icon used before each nav item */
function NavFlower() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className="w-3.5 h-3.5 mr-1.5 flex-shrink-0"
    >
      <circle cx="10" cy="10" r="2" fill="#e74c3c" />
      {[0, 72, 144, 216, 288].map((deg) => (
        <ellipse
          key={deg}
          cx="10"
          cy="4.5"
          rx="2.5"
          ry="4"
          fill="#f59e0b"
          opacity="0.85"
          transform={`rotate(${deg} 10 10)`}
        />
      ))}
    </svg>
  );
}

const defaultNavLinks = [
  { name: "Trang chủ", href: "/" },
  { name: "Khóa học", href: "/courses", hasDropdown: true },
  { name: "Webinar", href: "/webinars" },
  { name: "Ebook", href: "/ebooks" },
];

/* Dropdown wrapper for menu items with children */
function NavDropdown({ item }: { item: MenuItem }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className="text-sm font-medium text-red-50 hover:text-white transition-colors px-3 py-2 rounded-md hover:bg-white/10 flex items-center"
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
      >
        <NavFlower />
        {item.title}
        <svg
          className="w-3.5 h-3.5 ml-1 opacity-70"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {open && (
        <div
          className="absolute left-0 top-full mt-1 w-52 rounded-lg bg-white shadow-lg ring-1 ring-black/5 py-1 z-50"
          onMouseLeave={() => setOpen(false)}
        >
          {item.children?.map((child) => (
            <Link
              key={child.id}
              href={child.url}
              target={child.target === "_blank" ? "_blank" : undefined}
              rel={
                child.target === "_blank" ? "noopener noreferrer" : undefined
              }
              className="block px-4 py-2 text-sm text-gray-600 hover:bg-orange-50 hover:text-red-600"
              onClick={() => setOpen(false)}
            >
              {child.title}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function Navbar() {
  const settings = useSiteSettings();
  const logoSrc = settings.site.logo_url || siteConfig.logo.src;
  const logoAlt = siteConfig.logo.alt;
  const brandName = settings.site.name || siteConfig.name;
  const logoBrandName = brandName.split(" ")[0]?.toUpperCase() || "SOLOBIZ";
  const isExternalLogo = /^https?:\/\//i.test(logoSrc);

  const dynamicMenus =
    settings.menus && settings.menus.length > 0 ? settings.menus : null;

  return (
    <nav
      data-navbar-wrapper="v1"
      className="relative sticky top-0 z-50 w-full border-b border-[#6F1515]"
      style={{ background: "#8B1A1A" }}
    >
      <div className="container flex h-16 items-center gap-6">
        <Link href="/" className="flex items-center space-x-2">
          <div className="relative w-8 h-8">
            {isExternalLogo ? (
              <img
                src={logoSrc}
                alt={logoAlt}
                className="h-8 w-8 object-contain"
              />
            ) : (
              <Image
                src={logoSrc}
                alt={logoAlt}
                fill
                className="object-contain"
                priority
              />
            )}
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-extrabold text-lg tracking-tight text-white">
              {logoBrandName}
            </span>
            <span className="text-[9px] tracking-[0.25em] text-red-100/80 uppercase -mt-0.5">
              Academy
            </span>
          </div>
        </Link>

        <div className="hidden md:flex md:items-center md:space-x-1 mx-auto">
          {dynamicMenus
            ? dynamicMenus.map((item) =>
                item.children && item.children.length > 0 ? (
                  <NavDropdown key={item.id} item={item} />
                ) : (
                  <Link
                    key={item.id}
                    href={item.url}
                    target={item.target === "_blank" ? "_blank" : undefined}
                    rel={
                      item.target === "_blank"
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className="text-sm font-medium text-red-50 hover:text-white transition-colors px-3 py-2 rounded-md hover:bg-white/10 flex items-center"
                  >
                    <NavFlower />
                    {item.title}
                  </Link>
                ),
              )
            : defaultNavLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-red-50 hover:text-white transition-colors px-3 py-2 rounded-md hover:bg-white/10 flex items-center"
                >
                  <NavFlower />
                  {item.name}
                  {item.hasDropdown && (
                    <svg
                      className="w-3.5 h-3.5 ml-1 opacity-70"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  )}
                </Link>
              ))}
        </div>

        <div className="ml-auto flex items-center gap-3">
          <NavbarClient />
        </div>
      </div>
    </nav>
  );
}
