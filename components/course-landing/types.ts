/**
 * Types for Course Landing Page sections
 * Extends existing CourseMarketing with new landing-page sections.
 * All new keys are optional – if absent the section simply won't render,
 * keeping full backward compatibility with existing course data.
 */

/* ── Existing types (re-exported for co-location) ────────── */

export type Lesson = {
  id: number;
  title: string;
  duration: number | null;
  is_preview: boolean;
  order: number;
  thumbnail?: string | null;
  video_url?: string | null;
  embed_url?: string | null;
};

export type Section = {
  id: number;
  title: string;
  order: number;
  lessons?: Lesson[];
};

export type CourseFaq = {
  id: number;
  course_id: number;
  question: string;
  answer: string;
  order: number;
  is_active: boolean;
};

export type CourseReview = {
  id: number;
  course_id: number;
  user_id: number | null;
  reviewer_name?: string | null;
  rating: number;
  comment: string;
  is_approved: boolean;
  created_at?: string;
  user?: { id: number; name: string } | null;
};

/* ── Marketing sub-types ─────────────────────────────────── */

export type MarketingPromo = {
  enabled?: boolean;
  text?: string;
};

export type HeroCard = {
  image: string; // card screenshot / image URL
  caption?: string; // optional overlay caption
  highlight?: boolean; // yellow/gold border highlight
};

export type MarketingHero = {
  headline?: string;
  subheadline?: string;
  bullets?: string[];
  images?: string[]; // carousel images (backward-compat)
  cards?: HeroCard[]; // flipbook collage card items
  background_image?: string; // instructor photo / hero background
  cta_primary?: string; // primary CTA button text
  cta_secondary?: string; // secondary CTA button text
  fake_students?: string; // e.g. "1,000+"
  fake_rating?: number | string; // e.g. 4.9
};

export type MarketingStat = {
  value?: string | number;
  label?: string;
};

export type WorkflowStep = {
  title: string;
  desc: string;
  tag?: string;
};

export type MarketingWorkflow = {
  enabled?: boolean;
  badge?: string;
  title?: string;
  subtitle?: string;
  steps?: WorkflowStep[];
  album?: string[];
};

/* ── NEW: Landing-page section configs ───────────────────── */

export type PainPointBadge = {
  text: string;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
};

export type MarketingPainPoint = {
  enabled?: boolean;
  title?: string; // e.g. 'Khi cả thế giới đang "Tiêu thụ" video...'
  highlight?: string; // word/phrase to highlight in title, e.g. "Tiêu thụ"
  description?: string; // paragraph text below title
  callout_title?: string; // "Sự thật là"
  callout_text?: string; // callout body text
  video_url?: string; // YouTube embed URL
  badges?: PainPointBadge[]; // floating badges around video
  cta_text?: string; // button text
  community_note?: string; // note below CTA
};

export type BenefitItem = {
  icon?: string; // lucide icon name
  color?: string; // theme color: purple, green, blue, pink, orange, etc.
  title: string;
  description: string;
};

export type MarketingBenefits = {
  enabled?: boolean;
  badge?: string;
  title?: string; // e.g. "2026 Không thiếu cơ hội"
  highlight?: string; // highlighted sub-headline
  subtitle?: string; // paragraph below titles
  items?: BenefitItem[];
  cta_text?: string;
};

export type PersonaItem = {
  icon?: string;
  color?: string; // theme color for icon/border glow
  title: string;
  description: string;
};

export type MarketingTargetAudience = {
  enabled?: boolean;
  title?: string; // e.g. "{name} phù hợp dành cho ai?"
  highlight?: string; // word/phrase to highlight in title
  subtitle?: string;
  personas?: PersonaItem[];
  closing_quote?: string;
  cta_text?: string;
};

export type MarketingBeforeAfter = {
  enabled?: boolean;
  title?: string; // "BẠN SẼ TRỞ THÀNH PHIÊN BẢN NÀO?"
  subtitle?: string;
  before?: { title?: string; items: string[] };
  after?: { title?: string; items: string[]; recommended_badge?: string };
  bottom_note?: string; // green highlight note at bottom
};

export type InstructorAchievement = {
  value: string;
  label: string;
};

export type MarketingInstructorExtra = {
  enabled?: boolean;
  badge?: string; // "TRAINER #1"
  label?: string; // "GIẢNG VIÊN"
  title?: string; // "Name – Role"
  bio_extended?: string; // main bio paragraph
  expertise?: string[]; // bullet list of expertise
  closing_quote?: string; // italic quote below expertise
  achievements?: InstructorAchievement[];
  image?: string;
  video_intro?: string;
  cta_text?: string;
  video_cta_text?: string;
};

export type TeamMember = {
  name: string;
  role: string;
  avatar: string;
};

export type MarketingTeam = {
  enabled?: boolean;
  title?: string;
  members?: TeamMember[];
};

export type VideoTestimonial = {
  thumbnail: string; // video thumbnail image URL
  video_url?: string; // YouTube / embed URL (optional – can be image-only)
  caption?: string; // overlay caption text e.g. "Khởi Đầu Không Thuận Lợi"
  subcaption?: string; // second line of caption
};

export type MarketingTestimonials = {
  enabled?: boolean;
  title?: string; // "CẢM NHẬN HỌC VIÊN"
  videos?: VideoTestimonial[]; // video testimonial cards  (grid)
  feedback_title?: string; // "PHẢN HỒI TỪ CỘNG ĐỒNG"
  feedback_images?: string[]; // screenshot images (slow carousel)
  gallery_title?: string; // "HÌNH ẢNH CÁC BUỔI ĐÀO TẠO"
  gallery_images?: string[]; // training session photos (slow carousel)
  cta_text?: string; // CTA button text
};

export type MarketingFinalCTA = {
  enabled?: boolean;
  title?: string;
  subtitle?: string;
  cta_text?: string;
  social_proof?: string;
};

export type MarketingUrgency = {
  enabled?: boolean;
  total_spots?: number;
  remaining_spots?: number;
  countdown_to?: string;
};

export type MarketingFloatingBar = {
  enabled?: boolean;
  viewer_count?: number;
};

/* ── Landing-page nav item ───────────────────────────────── */

export type LandingNavItem = {
  id: string; // must match the section element's id attribute
  label: string;
};

export type MarketingLandingNav = {
  enabled?: boolean;
  logo_url?: string;
  items?: LandingNavItem[];
};

/* ── Full marketing shape ────────────────────────────────── */

export type CourseMarketing = {
  // Existing
  promo?: MarketingPromo;
  hero?: MarketingHero;
  stats?: MarketingStat[];
  workflow?: MarketingWorkflow;
  what_you_learn?: string[];

  // New landing sections
  landing_nav?: MarketingLandingNav;
  pain_point?: MarketingPainPoint;
  benefits?: MarketingBenefits;
  target_audience?: MarketingTargetAudience;
  before_after?: MarketingBeforeAfter;
  instructor_extra?: MarketingInstructorExtra;
  team?: MarketingTeam;
  testimonials?: MarketingTestimonials;
  final_cta?: MarketingFinalCTA;
  urgency?: MarketingUrgency;
  floating_bar?: MarketingFloatingBar;
  ticker_texts?: string[];
};

/* ── Course detail API response ──────────────────────────── */

export type CourseData = {
  id: number;
  slug?: string;
  title: string;
  description: string;
  price: string | number;
  level: string;
  status: string;
  thumbnail: string | null;
  preview_video: string | null;
  category: { id: number; name: string; slug: string };
  instructor: { id: number; name: string; avatar?: string; bio?: string };
  average_rating?: number | null;
  total_enrollments?: number | null;
  total_duration?: number | null;
  sections?: Section[];
  lessons?: Lesson[];
  faqs?: CourseFaq[];
  reviews?: CourseReview[];
  marketing?: CourseMarketing;
};

export type CourseDetailResponse = {
  course: CourseData;
  is_enrolled: boolean;
};

/* ── Default nav items (auto-detected from rendered sections) */

export const DEFAULT_NAV_ITEMS: LandingNavItem[] = [
  { id: "about", label: "Về chương trình" },
  { id: "curriculum", label: "Lộ trình" },
  { id: "instructor", label: "Giảng viên" },
  { id: "pricing", label: "Đăng ký" },
];
