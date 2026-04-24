"use client";

import { useEffect, useState, type ElementType } from "react";
import { useAuth } from "@/hooks/use-auth";
import { resolveAssetUrl } from "@/lib/asset-url";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Clock,
  Trophy,
  Users,
  Play,
  GraduationCap,
  Target,
  Sparkles,
  ChevronRight,
  Calendar,
  TrendingUp,
  Award,
  Flame,
  User,
  Settings,
} from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { motion } from "framer-motion";
import Image from "next/image";

interface DashboardStats {
  enrolled_courses?: number;
  completed_courses?: number;
  total_learning_time?: number;
  total_courses?: number;
  total_students?: number;
  total_revenue?: number;
}

interface Enrollment {
  id: number;
  course: {
    id: number;
    slug?: string;
    title: string;
    thumbnail: string;
    instructor: {
      name: string;
    };
  };
  progress: number;
  enrolled_at: string;
  total_lessons?: number;
  completed_lessons?: number;
  watched_duration?: number;
}

const MotionCard = motion(Card);

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({});
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, enrollmentsResponse] = await Promise.all([
        axios.get("/dashboard/stats"),
        axios.get("/my-enrollments"),
      ]);

      setStats(statsResponse.data);
      const raw = enrollmentsResponse.data.data || [];
      setEnrollments(raw.filter((e: Enrollment) => e.course));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds?: number) => {
    const total = Math.max(0, seconds || 0);
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes} phút`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  const needsProfileUpdate = !user?.phone || !user?.avatar || !user?.bio;
  const profileCompleteness =
    [user?.name, user?.email, user?.phone, user?.avatar, user?.bio].filter(
      Boolean,
    ).length * 20;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <div className="container py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-32 bg-gradient-to-r from-gray-200 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-28 bg-gray-200 dark:bg-gray-800 rounded-xl"
                ></div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-80 bg-gray-200 dark:bg-gray-800 rounded-xl"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <motion.div
        className="container py-8 space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Welcome Section */}
        <motion.div variants={itemVariants}>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 p-8 text-white shadow-2xl">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>

            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-white/80">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-sm font-medium">{getGreeting()}</span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                  {user?.name} 👋
                </h1>
                <p className="text-white/80 max-w-md">
                  Chào mừng bạn quay lại! Hãy tiếp tục hành trình học tập của
                  mình nhé.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-orange-700 hover:bg-white/90 shadow-lg"
                >
                  <Link href="/courses">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Khám phá khóa học
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
                >
                  <Link href="/profile">
                    <Settings className="mr-2 h-4 w-4" />
                    Cài đặt
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Profile Completion Banner */}
        {needsProfileUpdate && (
          <motion.div variants={itemVariants}>
            <Card className="border-0 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 shadow-lg">
              <CardContent className="flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50">
                    <User className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-amber-900 dark:text-amber-100">
                      Hoàn thiện hồ sơ của bạn
                    </div>
                    <div className="text-sm text-amber-700 dark:text-amber-300">
                      Hồ sơ đã hoàn thành {profileCompleteness}% • Cập nhật để
                      nhận trải nghiệm tốt hơn
                    </div>
                  </div>
                </div>
                <Button
                  asChild
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <Link href="/profile">
                    Cập nhật ngay
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Quick Stats Grid */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {user?.role === "instructor" ? (
              <>
                <StatsCard
                  icon={BookOpen}
                  label="Tổng khóa học"
                  value={stats.total_courses || 0}
                  color="blue"
                />
                <StatsCard
                  icon={Users}
                  label="Học viên"
                  value={stats.total_students || 0}
                  color="green"
                />
                <StatsCard
                  icon={TrendingUp}
                  label="Doanh thu"
                  value={new Intl.NumberFormat("vi-VN").format(
                    stats.total_revenue || 0,
                  )}
                  suffix="₫"
                  color="purple"
                />
                <StatsCard
                  icon={Award}
                  label="Đánh giá TB"
                  value="4.8"
                  color="amber"
                />
              </>
            ) : (
              <>
                <StatsCard
                  icon={BookOpen}
                  label="Đang học"
                  value={stats.enrolled_courses || 0}
                  suffix="khóa"
                  color="blue"
                />
                <StatsCard
                  icon={Trophy}
                  label="Hoàn thành"
                  value={stats.completed_courses || 0}
                  suffix="khóa"
                  color="green"
                />
                <StatsCard
                  icon={Clock}
                  label="Thời gian học"
                  value={Math.floor((stats.total_learning_time || 0) / 3600)}
                  suffix="giờ"
                  color="purple"
                />
                <StatsCard
                  icon={Flame}
                  label="Chuỗi ngày"
                  value={7}
                  suffix="ngày"
                  color="orange"
                />
              </>
            )}
          </div>
        </motion.div>

        {/* Continue Learning Section */}
        {user?.role !== "instructor" && enrollments.length > 0 && (
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  Tiếp tục học
                </h2>
                <p className="text-muted-foreground">
                  Tiếp tục từ nơi bạn đã dừng lại
                </p>
              </div>
              <Button variant="ghost" asChild className="gap-1">
                <Link href="/my-courses">
                  Xem tất cả
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.slice(0, 6).map((enrollment) => (
                <MotionCard
                  key={enrollment.id}
                  variants={itemVariants}
                  whileHover={{ y: -4, scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="group overflow-hidden border-0 shadow-lg hover:shadow-xl bg-white dark:bg-slate-900"
                >
                  <div className="relative aspect-video overflow-hidden">
                    {enrollment.course.thumbnail ? (
                      <Image
                        src={resolveAssetUrl(enrollment.course.thumbnail)}
                        alt={enrollment.course.title}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        unoptimized
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-orange-500 to-red-600" />
                    )}

                    {/* Overlay with play button */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="h-14 w-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
                        <Play className="h-6 w-6 text-orange-600 ml-1" />
                      </div>
                    </div>

                    {/* Progress indicator */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                      <div
                        className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all"
                        style={{ width: `${enrollment.progress}%` }}
                      />
                    </div>

                    {/* Badge */}
                    {enrollment.progress === 100 ? (
                      <Badge className="absolute top-3 right-3 bg-green-500 text-white border-0">
                        <Trophy className="h-3 w-3 mr-1" />
                        Hoàn thành
                      </Badge>
                    ) : enrollment.progress > 0 ? (
                      <Badge className="absolute top-3 right-3 bg-orange-500 text-white border-0">
                        {enrollment.progress}%
                      </Badge>
                    ) : null}
                  </div>

                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold line-clamp-2 group-hover:text-orange-600 transition-colors">
                      {enrollment.course.title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <GraduationCap className="h-3.5 w-3.5" />
                      {enrollment.course.instructor?.name || "Giảng viên"}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Progress bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Tiến độ hoàn thành</span>
                        <span className="font-medium text-foreground">
                          {enrollment.completed_lessons || 0}/
                          {enrollment.total_lessons || 0} bài học
                        </span>
                      </div>
                      <Progress value={enrollment.progress} className="h-2" />
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        <span>
                          {formatDuration(enrollment.watched_duration)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>
                          {new Date(enrollment.enrolled_at).toLocaleDateString(
                            "vi-VN",
                          )}
                        </span>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <Button asChild className="w-full group/btn">
                      <Link
                        href={`/courses/${enrollment.course.slug || enrollment.course.id}/learn`}
                      >
                        <Play className="mr-2 h-4 w-4 group-hover/btn:animate-pulse" />
                        {enrollment.progress > 0
                          ? "Tiếp tục học"
                          : "Bắt đầu học"}
                      </Link>
                    </Button>
                  </CardContent>
                </MotionCard>
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {user?.role !== "instructor" && enrollments.length === 0 && (
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-lg">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="relative mb-6">
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 flex items-center justify-center">
                    <BookOpen className="h-12 w-12 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-amber-400 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-2">
                  Bắt đầu hành trình học tập!
                </h3>
                <p className="text-muted-foreground text-center mb-6 max-w-md">
                  Khám phá hàng trăm khóa học chất lượng cao từ các chuyên gia
                  hàng đầu. Đăng ký ngay để nâng cao kỹ năng của bạn!
                </p>

                <div className="flex gap-3">
                  <Button asChild size="lg" className="gap-2">
                    <Link href="/courses">
                      <Target className="h-4 w-4" />
                      Khám phá khóa học
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="gap-2">
                    <Link href="/blog">
                      <BookOpen className="h-4 w-4" />
                      Đọc blog
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-lg bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-700 text-white">
            <CardContent className="py-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      Cần hỗ trợ học tập?
                    </h3>
                    <p className="text-white/70 text-sm">
                      Đội ngũ hỗ trợ luôn sẵn sàng giúp đỡ bạn 24/7
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    className="bg-white/10 hover:bg-white/20 text-white border-0"
                  >
                    Xem FAQ
                  </Button>
                  <Button className="bg-white text-slate-900 hover:bg-white/90">
                    Liên hệ hỗ trợ
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}

// Stats Card Component
function StatsCard({
  icon: Icon,
  label,
  value,
  suffix,
  color,
}: {
  icon: ElementType;
  label: string;
  value: number | string;
  suffix?: string;
  color: "blue" | "green" | "purple" | "orange" | "amber";
}) {
  const colorClasses = {
    blue: "from-blue-500 to-cyan-500 bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400",
    green:
      "from-green-500 to-emerald-500 bg-green-50 text-green-600 dark:bg-green-950/50 dark:text-green-400",
    purple:
      "from-purple-500 to-indigo-500 bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400",
    orange:
      "from-orange-500 to-red-500 bg-orange-50 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400",
    amber:
      "from-amber-500 to-yellow-500 bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400",
  };

  const iconBg = colorClasses[color].split(" ").slice(2).join(" ");

  return (
    <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-white dark:bg-slate-900">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div
            className={`h-10 w-10 rounded-xl flex items-center justify-center ${iconBg}`}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground truncate">{label}</p>
            <p className="text-xl font-bold tracking-tight">
              {value}
              {suffix && (
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  {suffix}
                </span>
              )}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
