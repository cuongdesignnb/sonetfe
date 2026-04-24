"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Play,
  Users,
  Video,
  Award,
  TrendingUp,
  Heart,
  CheckCircle2,
  Star,
  ArrowRight,
  Sparkles,
  Zap,
  Target,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Types for About Page settings
type AboutPageSettings = {
  hero: {
    name: string;
    title: string;
    subtitle: string;
    avatar_url: string;
    cover_url: string;
    verified: boolean;
  };
  stats: {
    followers: string;
    students: string;
    courses: string;
    experience: string;
  };
  social: {
    tiktok: string;
    youtube: string;
    facebook: string;
    instagram: string;
  };
  about: {
    headline: string;
    bio: string;
    mission: string;
  };
  achievements: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
  skills: Array<{
    name: string;
    level: number;
  }>;
  testimonials: Array<{
    name: string;
    avatar: string;
    role: string;
    content: string;
    rating: number;
  }>;
  cta: {
    title: string;
    subtitle: string;
    button_text: string;
    button_url: string;
  };
};

const defaultSettings: AboutPageSettings = {
  hero: {
    name: "Phan Anh Chiến",
    title: "Chuyên gia TikTok Marketing & Nhà sáng lập Sonet",
    subtitle: "Đào tạo hơn 10,000+ học viên kiếm tiền từ TikTok",
    avatar_url: "/images/founder-avatar.jpg",
    cover_url: "/images/founder-cover.jpg",
    verified: true,
  },
  stats: {
    followers: "500K+",
    students: "10,000+",
    courses: "15+",
    experience: "5+ năm",
  },
  social: {
    tiktok: "https://tiktok.com/@phananhlien",
    youtube: "https://youtube.com/@phananhlien",
    facebook: "https://facebook.com/phananhlien",
    instagram: "https://instagram.com/phananhlien",
  },
  about: {
    headline: "Từ 0 follower đến Top Creator TikTok Việt Nam",
    bio: `Xin chào! Mình là Phan Anh Chiến - người sáng lập Sonet và là một trong những TikTok Creator hàng đầu Việt Nam.

Với hơn 5 năm kinh nghiệm trong lĩnh vực Marketing trên mạng xã hội, mình đã giúp hàng ngàn học viên xây dựng thương hiệu cá nhân và kiếm tiền bền vững từ TikTok.

Triết lý đào tạo của mình rất đơn giản: "Học đi đôi với hành" - Mỗi khóa học đều được thiết kế với những bài tập thực chiến, case study thực tế và hỗ trợ 1-1 để đảm bảo học viên có thể áp dụng ngay những gì đã học.`,
    mission:
      "Sứ mệnh của Sonet là giúp mọi người tận dụng sức mạnh của mạng xã hội để phát triển sự nghiệp và thu nhập thụ động.",
  },
  achievements: [
    {
      icon: "trophy",
      title: "Top 100 TikTok Creator",
      description: "Được TikTok Việt Nam công nhận năm 2023",
    },
    {
      icon: "users",
      title: "10,000+ Học viên",
      description: "Đã đào tạo thành công trên toàn quốc",
    },
    {
      icon: "trending",
      title: "500+ Triệu Views",
      description: "Tổng lượt xem video trên các nền tảng",
    },
    {
      icon: "award",
      title: "Diễn giả tại các sự kiện",
      description: "VietnamWeb Summit, TikTok Creator Day",
    },
  ],
  skills: [
    { name: "TikTok Marketing", level: 98 },
    { name: "Sáng tạo nội dung", level: 95 },
    { name: "Xây dựng thương hiệu cá nhân", level: 92 },
    { name: "Chỉnh sửa video", level: 88 },
    { name: "Tiếp thị liên kết", level: 90 },
  ],
  testimonials: [
    {
      name: "Nguyễn Thị Hồng",
      avatar: "/images/testimonials/1.jpg",
      role: "TikToker 200K người theo dõi",
      content:
        "Nhờ khóa học của anh Chiến, mình đã từ 0 lên 200K followers chỉ trong 3 tháng. Các kiến thức rất thực tế và dễ áp dụng!",
      rating: 5,
    },
    {
      name: "Trần Văn Minh",
      avatar: "/images/testimonials/2.jpg",
      role: "Chủ shop trên TikTok",
      content:
        "Doanh thu shop mình tăng 300% sau khi học xong khóa TikTok Shop của anh Chiến. Rất khuyến khích!",
      rating: 5,
    },
    {
      name: "Lê Thị Mai",
      avatar: "/images/testimonials/3.jpg",
      role: "Nhà sáng tạo nội dung",
      content:
        "Anh Chiến không chỉ dạy kiến thức mà còn truyền cảm hứng. Mình đã thay đổi hoàn toàn mindset về việc làm content.",
      rating: 5,
    },
  ],
  cta: {
    title: "Sẵn sàng bắt đầu hành trình?",
    subtitle: "Tham gia cùng 10,000+ học viên đã thành công với TikTok",
    button_text: "Xem các khóa học",
    button_url: "/courses",
  },
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://admin.phamanhchien.vn/api";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
};

// Social icon colors
const socialColors: Record<string, string> = {
  tiktok: "from-gray-900 to-gray-700",
  youtube: "from-red-600 to-red-500",
  facebook: "from-blue-600 to-blue-500",
  instagram: "from-pink-500 via-red-500 to-orange-500",
};

// Achievement icon mapping
function getAchievementIcon(icon: string) {
  switch (icon) {
    case "trophy":
      return <Award className="h-6 w-6" />;
    case "users":
      return <Users className="h-6 w-6" />;
    case "trending":
      return <TrendingUp className="h-6 w-6" />;
    case "award":
      return <Star className="h-6 w-6" />;
    default:
      return <Sparkles className="h-6 w-6" />;
  }
}

// TikTok-style stat card
function StatCard({
  value,
  label,
  icon: Icon,
  delay = 0,
}: {
  value: string;
  label: string;
  icon: React.ElementType;
  delay?: number;
}) {
  return (
    <motion.div
      variants={scaleIn}
      initial="hidden"
      animate="visible"
      transition={{ delay, duration: 0.4 }}
      className="relative group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100" />
      <div className="relative bg-white border border-gray-200 rounded-2xl p-4 text-center hover:shadow-lg hover:border-orange-200 transition-all shadow-sm">
        <Icon className="h-6 w-6 mx-auto mb-2 text-orange-500" />
        <div className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
          {value}
        </div>
        <div className="text-sm text-gray-600">{label}</div>
      </div>
    </motion.div>
  );
}

// Social button with hover effect
function SocialButton({ platform, url }: { platform: string; url: string }) {
  const icons: Record<string, React.ReactNode> = {
    tiktok: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
      </svg>
    ),
    youtube: <Play className="h-5 w-5" />,
    facebook: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    instagram: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  };

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.1, y: -2 }}
      whileTap={{ scale: 0.95 }}
      className={`flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br ${socialColors[platform] || "from-gray-600 to-gray-500"} text-white shadow-lg hover:shadow-xl transition-shadow`}
    >
      {icons[platform]}
    </motion.a>
  );
}

export default function AboutPage() {
  const [settings, setSettings] = useState<AboutPageSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch(`${API_BASE}/settings/about`, {
          cache: "no-store",
        });
        if (res.ok) {
          const json = await res.json();
          if (json.settings) {
            setSettings({ ...defaultSettings, ...json.settings });
          }
        }
      } catch {
        // Use defaults
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-gray-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-32 h-32 rounded-full bg-gray-200" />
          <div className="w-48 h-6 rounded bg-gray-200" />
          <div className="w-64 h-4 rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-gray-50 text-gray-900 overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-500/3 rounded-full blur-3xl" />
      </div>

      {/* Hero Section - TikTok Profile Style */}
      <section className="relative pt-0 pb-16">
        {/* Cover Image */}
        <div className="relative h-56 md:h-72 overflow-hidden">
          {settings.hero.cover_url ? (
            <Image
              src={settings.hero.cover_url}
              alt="Cover"
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-red-500/20 to-orange-400/20" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-orange-50" />
        </div>

        <div className="container relative z-10 -mt-20">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="flex flex-col items-center text-center"
          >
            {/* Avatar */}
            <motion.div variants={scaleIn} className="relative mb-5">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500 rounded-full blur-lg opacity-30" />
              <div className="relative w-36 h-36 rounded-full border-4 border-white overflow-hidden shadow-2xl">
                {settings.hero.avatar_url ? (
                  <Image
                    src={settings.hero.avatar_url}
                    alt={settings.hero.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-4xl font-bold text-white">
                    {settings.hero.name.charAt(0)}
                  </div>
                )}
              </div>
              {settings.hero.verified && (
                <div className="absolute -bottom-1 -right-1 bg-orange-500 rounded-full p-1.5 border-2 border-white shadow-lg">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
              )}
            </motion.div>

            {/* Name & Title */}
            <motion.h1
              variants={fadeInUp}
              className="text-3xl md:text-4xl font-bold mb-2 text-gray-900 flex items-center justify-center gap-3 flex-wrap"
            >
              <span>{settings.hero.name}</span>
              {settings.hero.verified && (
                <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/30 text-sm">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Đã xác minh
                </Badge>
              )}
            </motion.h1>

            <motion.div
              variants={fadeInUp}
              className="text-xl text-orange-600 font-medium mb-2"
              dangerouslySetInnerHTML={{ __html: settings.hero.title }}
            />

            <motion.div
              variants={fadeInUp}
              className="text-gray-600 max-w-xl mb-8"
              dangerouslySetInnerHTML={{ __html: settings.hero.subtitle }}
            />

            {/* Social Links */}
            <motion.div variants={fadeInUp} className="flex gap-4 mb-8">
              {settings.social.tiktok && (
                <SocialButton platform="tiktok" url={settings.social.tiktok} />
              )}
              {settings.social.youtube && (
                <SocialButton
                  platform="youtube"
                  url={settings.social.youtube}
                />
              )}
              {settings.social.facebook && (
                <SocialButton
                  platform="facebook"
                  url={settings.social.facebook}
                />
              )}
              {settings.social.instagram && (
                <SocialButton
                  platform="instagram"
                  url={settings.social.instagram}
                />
              )}
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl">
              <StatCard
                value={settings.stats.followers}
                label="Người theo dõi"
                icon={Users}
                delay={0}
              />
              <StatCard
                value={settings.stats.students}
                label="Học viên"
                icon={BookOpen}
                delay={0.1}
              />
              <StatCard
                value={settings.stats.courses}
                label="Khóa học"
                icon={Video}
                delay={0.2}
              />
              <StatCard
                value={settings.stats.experience}
                label="Kinh nghiệm"
                icon={Zap}
                delay={0.3}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 relative">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="max-w-4xl mx-auto"
          >
            <motion.div variants={fadeInUp} className="text-center mb-12">
              <Badge className="mb-4 bg-orange-500/10 text-orange-600 border-orange-500/30 px-4 py-1">
                <Sparkles className="h-3 w-3 mr-1" />
                Về tôi
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 bg-clip-text text-transparent">
                {settings.about.headline}
              </h2>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="bg-white border border-gray-200 rounded-3xl p-8 md:p-12 shadow-lg"
            >
              <div className="prose max-w-none">
                <div
                  className="text-gray-700 leading-relaxed [&>p]:mb-4"
                  dangerouslySetInnerHTML={{ __html: settings.about.bio }}
                />
              </div>

              <div className="mt-8 p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl border border-orange-100">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-orange-500/10 rounded-xl">
                    <Target className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Sứ mệnh
                    </h3>
                    <div
                      className="text-gray-700 [&>p]:mb-2"
                      dangerouslySetInnerHTML={{
                        __html: settings.about.mission,
                      }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-16 relative">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.div variants={fadeInUp} className="text-center mb-12">
              <Badge className="mb-4 bg-red-500/10 text-red-600 border-red-500/30 px-4 py-1">
                <Award className="h-3 w-3 mr-1" />
                Thành tựu
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Những cột mốc đáng nhớ
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {settings.achievements.map((achievement, idx) => (
                <motion.div
                  key={idx}
                  variants={scaleIn}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="bg-white border-gray-200 hover:border-orange-200 hover:shadow-lg transition-all group h-full">
                    <CardContent className="p-6 text-center">
                      <div className="inline-flex p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                        <div className="text-orange-500">
                          {getAchievementIcon(achievement.icon)}
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {achievement.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {achievement.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="py-16 relative">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="max-w-3xl mx-auto"
          >
            <motion.div variants={fadeInUp} className="text-center mb-12">
              <Badge className="mb-4 bg-orange-500/10 text-orange-600 border-orange-500/30 px-4 py-1">
                <Zap className="h-3 w-3 mr-1" />
                Chuyên môn
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Kỹ năng & Chuyên môn
              </h2>
            </motion.div>

            <div className="space-y-6">
              {settings.skills.map((skill, idx) => (
                <motion.div
                  key={idx}
                  variants={fadeInUp}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm"
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-medium text-gray-900">
                      {skill.name}
                    </span>
                    <span className="text-orange-500 font-bold">
                      {skill.level}%
                    </span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${skill.level}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: idx * 0.1 }}
                      className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 relative">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.div variants={fadeInUp} className="text-center mb-12">
              <Badge className="mb-4 bg-yellow-500/10 text-yellow-600 border-yellow-500/30 px-4 py-1">
                <Heart className="h-3 w-3 mr-1" />
                Đánh giá
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Học viên nói gì?
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {settings.testimonials.map((testimonial, idx) => (
                <motion.div
                  key={idx}
                  variants={scaleIn}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="bg-white border-gray-200 hover:border-orange-200 hover:shadow-lg transition-all h-full">
                    <CardContent className="p-6">
                      {/* Rating */}
                      <div className="flex gap-1 mb-4">
                        {Array.from({ length: testimonial.rating }).map(
                          (_, i) => (
                            <Star
                              key={i}
                              className="h-5 w-5 fill-orange-400 text-orange-400"
                            />
                          ),
                        )}
                      </div>

                      {/* Content */}
                      <p className="text-gray-700 mb-6 italic">
                        &ldquo;{testimonial.content}&rdquo;
                      </p>

                      {/* Author */}
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                          {testimonial.avatar ? (
                            <Image
                              src={testimonial.avatar}
                              alt={testimonial.name}
                              width={48}
                              height={48}
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <span className="text-lg font-bold text-white">
                              {testimonial.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {testimonial.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {testimonial.role}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-red-500/10 to-orange-500/10 rounded-3xl blur-2xl" />
            <div className="relative bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-3xl p-12 text-center shadow-lg">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                {settings.cta.title}
              </h2>
              <div
                className="text-gray-600 max-w-xl mx-auto mb-8 [&>p]:mb-2"
                dangerouslySetInnerHTML={{ __html: settings.cta.subtitle }}
              />
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 px-8 py-6 text-lg rounded-full shadow-xl hover:shadow-2xl transition-all"
              >
                <Link href={settings.cta.button_url} className="gap-2">
                  {settings.cta.button_text}
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
