/**
 * Site Configuration
 * Centralized settings for the entire application
 */

export const siteConfig = {
  // Basic Info
  name: "Sonnet",
  description: "Nền tảng học online hàng đầu Việt Nam",
  url: "https://sonnet.vn",

  // Logo
  logo: {
    src: "/logo.svg",
    alt: "Sonnet Logo",
    width: 40,
    height: 40,
  },

  // Favicon
  favicon: "/favicon.svg",

  // Colors - Orange to Red gradient theme
  colors: {
    primary: {
      50: "#FFF7ED",
      100: "#FFEDD5",
      200: "#FED7AA",
      300: "#FDBA74",
      400: "#FB923C",
      500: "#F97316", // Main orange
      600: "#EA580C",
      700: "#C2410C",
      800: "#9A3412",
      900: "#7C2D12",
    },
    secondary: {
      50: "#FEF2F2",
      100: "#FEE2E2",
      200: "#FECACA",
      300: "#FCA5A5",
      400: "#F87171",
      500: "#EF4444", // Main red
      600: "#DC2626",
      700: "#B91C1C",
      800: "#991B1B",
      900: "#7F1D1D",
    },
    // Gradient definitions
    gradients: {
      primary: "from-orange-500 to-red-500",
      primaryHover: "from-orange-400 to-red-400",
      primaryDark: "from-orange-600 to-red-600",
      hero: "from-slate-950 via-orange-950 to-slate-950",
      text: "from-orange-400 via-red-400 to-orange-500",
      button: "from-orange-500 to-red-500",
      buttonHover: "from-orange-400 to-red-400",
    },
  },

  // Contact Information
  contact: {
    email: "support@sonnet.vn",
    phone: "+84 123 456 789",
    address: "123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh",
    workingHours: "Thứ 2 - Thứ 6: 8:00 - 18:00",
  },

  // Social Media Links
  social: {
    facebook: "https://facebook.com/sonnetvn",
    youtube: "https://youtube.com/@sonnetvn",
    tiktok: "https://tiktok.com/@sonnetvn",
    linkedin: "https://linkedin.com/company/sonnetvn",
    twitter: "https://twitter.com/sonnetvn",
    instagram: "https://instagram.com/sonnetvn",
  },

  // Stats (can be updated from API later)
  stats: {
    courses: 1000,
    students: 50000,
    certificates: 25000,
    countries: 40,
    rating: 4.9,
  },

  // SEO defaults
  seo: {
    titleTemplate: "%s | Sonnet",
    defaultTitle: "Sonnet - Học Online Chất Lượng Cao",
    defaultDescription:
      "Khám phá hàng ngàn khóa học chất lượng cao từ các chuyên gia hàng đầu. Video HD, học mọi lúc mọi nơi, chứng chỉ được công nhận.",
    keywords: [
      "học online",
      "khóa học",
      "e-learning",
      "sonnet",
      "học trực tuyến",
    ],
  },

  // Features toggles
  features: {
    darkMode: true,
    newsletter: true,
    reviews: true,
    blog: true,
    certificates: true,
    offlineDownload: true,
  },

  // Navigation links
  navigation: {
    main: [
      { name: "Trang chủ", href: "/" },
      { name: "Khóa học", href: "/courses" },
      { name: "Webinar", href: "/webinars" },
      { name: "Ebook", href: "/ebooks" },
    ],
    footer: {
      courses: [
        { name: "Lập trình Web", href: "/categories/1" },
        { name: "Mobile App", href: "/categories/2" },
        { name: "UI/UX Design", href: "/categories/3" },
        { name: "Data Science", href: "/categories/4" },
      ],
      support: [
        { name: "Trung tâm hỗ trợ", href: "/support" },
        { name: "FAQ", href: "/faq" },
        { name: "Liên hệ", href: "/contact" },
        { name: "Góp ý", href: "/feedback" },
      ],
      legal: [
        { name: "Điều khoản sử dụng", href: "/terms" },
        { name: "Chính sách bảo mật", href: "/privacy" },
        { name: "Chính sách hoàn tiền", href: "/refund" },
      ],
    },
  },

  // Payment settings
  payment: {
    currency: "VND",
    currencySymbol: "₫",
    methods: ["bank_transfer", "momo", "vnpay", "zalopay"],
  },
};

// CSS class helpers for consistent styling
export const themeClasses = {
  // Gradients
  gradientPrimary: "bg-gradient-to-r from-orange-500 to-red-500",
  gradientPrimaryHover: "hover:from-orange-400 hover:to-red-400",
  gradientText:
    "bg-gradient-to-r from-orange-400 via-red-400 to-orange-500 bg-clip-text text-transparent",
  gradientHero: "bg-gradient-to-br from-slate-950 via-orange-950 to-slate-950",

  // Buttons
  buttonPrimary:
    "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white shadow-lg shadow-orange-500/25",
  buttonSecondary:
    "bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:hover:bg-orange-900/50",
  buttonOutline:
    "border-orange-500 text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/20",

  // Text colors
  textPrimary: "text-orange-600 dark:text-orange-400",
  textAccent: "text-red-500 dark:text-red-400",

  // Backgrounds
  bgPrimary: "bg-orange-500",
  bgLight: "bg-orange-50 dark:bg-orange-950/30",
  bgAccent: "bg-red-500",

  // Borders
  borderPrimary: "border-orange-500",
  borderLight: "border-orange-200 dark:border-orange-800",

  // Focus states
  focusRing: "focus:ring-orange-500 focus:border-orange-500",

  // Badges
  badgePrimary:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  badgeAccent: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export type SiteConfig = typeof siteConfig;
export type ThemeClasses = typeof themeClasses;
