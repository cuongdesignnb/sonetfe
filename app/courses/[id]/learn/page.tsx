"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Lock,
  Menu,
  PlayCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { VideoPlayer } from "@/components/video-player";
import { VideoSecurityError } from "@/components/video-security-error";
import toast from "react-hot-toast";
import { resolveAssetUrl } from "@/lib/asset-url";
import Image from "next/image";
import { PremiumUpsellModal } from "@/components/premium-upsell-modal";

type CocCocWindow = Window & {
  __coccocDetected?: boolean;
};

type Lesson = {
  id: number;
  title: string;
  duration: number | null;
  is_preview: boolean;
  order: number;
  thumbnail?: string | null;
  video_url?: string | null;
  video_bunny_id?: string | null;
  video_local_path?: string | null;
  embed_url?: string | null;
};

type Section = {
  id: number;
  title: string;
  order: number;
  lessons?: Lesson[];
  price?: string | number | null;
  original_price?: string | number | null;
  is_sellable?: boolean;
  is_enrolled?: boolean;
};

type CourseDetailResponse = {
  course: {
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
    sections?: Section[];
    lessons?: Lesson[];
  };
  is_enrolled: boolean;
};

type LessonProgress = {
  lesson_id: number;
  title: string;
  completed: boolean;
  completion_percentage: number;
  watched_duration: number;
};

type CourseProgressResponse = {
  course: CourseDetailResponse["course"];
  lessons_progress: LessonProgress[];
  total_progress: number;
};

function formatDuration(seconds?: number | null) {
  if (!seconds || seconds <= 0) return "--:--";
  const minutes = Math.floor(seconds / 60);
  const remain = Math.floor(seconds % 60);
  return `${minutes}:${String(remain).padStart(2, "0")}`;
}

function normalizeEmbedUrl(value?: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const iframeMatch = trimmed.match(/<iframe[^>]+src=["']([^"']+)["']/i);
  if (iframeMatch?.[1]) return iframeMatch[1];
  return trimmed;
}

export default function CourseLearnPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedLessonId = searchParams.get("lesson");
  const { user, loading: authLoading } = useAuth();
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "https://admin.phamanhchien.vn/api";

  const [course, setCourse] = useState<CourseDetailResponse["course"] | null>(
    null,
  );
  const [progress, setProgress] = useState<CourseProgressResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoIsEmbed, setVideoIsEmbed] = useState(false);
  const [videoEmbedHtml, setVideoEmbedHtml] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [blockedByGuard, setBlockedByGuard] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(
    new Set(),
  );
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [premiumLessonTitle, setPremiumLessonTitle] = useState("");
  const [premiumLessonIndex, setPremiumLessonIndex] = useState<number | null>(
    null,
  );
  const [premiumSection, setPremiumSection] = useState<Section | null>(null);

  // Video progress tracking
  const [videoDuration, setVideoDuration] = useState(0);
  const videoPlayedSecondsRef = useRef(0);
  const progressSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedPercentRef = useRef(0);

  // Save progress to backend
  const saveProgress = useCallback(
    async (lessonId: number, playedSeconds: number, totalDuration: number) => {
      if (!totalDuration || totalDuration <= 0) return;
      const token = localStorage.getItem("token");
      if (!token) return;

      const completionPercentage = Math.min(
        100,
        Math.round((playedSeconds / totalDuration) * 100),
      );

      // Don't save if percentage hasn't changed meaningfully (avoid spam)
      if (
        Math.abs(completionPercentage - lastSavedPercentRef.current) < 2 &&
        completionPercentage < 95
      ) {
        return;
      }

      lastSavedPercentRef.current = completionPercentage;

      try {
        const res = await fetch(`${apiUrl}/lessons/${lessonId}/progress`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            completion_percentage: completionPercentage,
            watched_duration: Math.round(playedSeconds),
          }),
        });

        if (res.ok) {
          const data = await res.json();
          // Update local progress state
          setProgress((prev) => {
            if (!prev) return prev;
            const updatedLessons = prev.lessons_progress.map((lp) =>
              lp.lesson_id === lessonId
                ? {
                    ...lp,
                    completion_percentage: completionPercentage,
                    watched_duration: Math.round(playedSeconds),
                    completed: completionPercentage >= 80,
                  }
                : lp,
            );
            // Add if not exists
            if (!updatedLessons.find((lp) => lp.lesson_id === lessonId)) {
              updatedLessons.push({
                lesson_id: lessonId,
                title: activeLesson?.title || "",
                completion_percentage: completionPercentage,
                watched_duration: Math.round(playedSeconds),
                completed: completionPercentage >= 80,
              });
            }
            return {
              ...prev,
              lessons_progress: updatedLessons,
              total_progress: data.course_progress ?? prev.total_progress,
            };
          });
        }
      } catch (err) {
        console.warn("Failed to save progress:", err);
      }
    },
    [apiUrl, activeLesson?.title],
  );

  // Start periodic progress saving (every 10s while playing)
  const startProgressTimer = useCallback(
    (lessonId: number, totalDuration: number) => {
      // Clear any existing timer
      if (progressSaveTimerRef.current) {
        clearInterval(progressSaveTimerRef.current);
      }
      progressSaveTimerRef.current = setInterval(() => {
        saveProgress(lessonId, videoPlayedSecondsRef.current, totalDuration);
      }, 10000); // Save every 10 seconds
    },
    [saveProgress],
  );

  const stopProgressTimer = useCallback(() => {
    if (progressSaveTimerRef.current) {
      clearInterval(progressSaveTimerRef.current);
      progressSaveTimerRef.current = null;
    }
  }, []);

  // Cleanup timer on unmount or lesson change
  useEffect(() => {
    return () => {
      stopProgressTimer();
    };
  }, [stopProgressTimer]);

  // Video event handlers
  const handleVideoProgress = useCallback(
    (state: {
      played: number;
      playedSeconds: number;
      loaded: number;
      loadedSeconds: number;
    }) => {
      videoPlayedSecondsRef.current = state.playedSeconds;
    },
    [],
  );

  const handleVideoDuration = useCallback(
    (dur: number) => {
      setVideoDuration(dur);
      // Also update lesson duration in DB if missing
      if (
        activeLesson &&
        dur > 0 &&
        (!activeLesson.duration || activeLesson.duration <= 0)
      ) {
        const token = localStorage.getItem("token");
        if (token) {
          // Update lesson duration on backend (fire and forget)
          fetch(`${apiUrl}/lessons/${activeLesson.id}/duration`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ duration: Math.round(dur) }),
          }).catch(() => {});

          // Update local state so sidebar shows correct duration
          activeLesson.duration = Math.round(dur);
        }
      }
      if (activeLesson && dur > 0) {
        startProgressTimer(activeLesson.id, dur);
      }
    },
    [activeLesson, apiUrl, startProgressTimer],
  );

  const handleVideoEnded = useCallback(() => {
    if (activeLesson && videoDuration > 0) {
      // Save 100% progress
      saveProgress(activeLesson.id, videoDuration, videoDuration);
      stopProgressTimer();
      toast.success("Đã hoàn thành bài học!");
    }
  }, [activeLesson, videoDuration, saveProgress, stopProgressTimer]);

  // Save progress when leaving page (tab close / navigate away)
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (
        activeLesson &&
        videoDuration > 0 &&
        videoPlayedSecondsRef.current > 0
      ) {
        const token = localStorage.getItem("token");
        if (!token) return;
        const pct = Math.min(
          100,
          Math.round((videoPlayedSecondsRef.current / videoDuration) * 100),
        );
        // Use fetch with keepalive for reliability during page unload
        fetch(`${apiUrl}/lessons/${activeLesson.id}/progress`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            completion_percentage: pct,
            watched_duration: Math.round(videoPlayedSecondsRef.current),
          }),
          keepalive: true,
        }).catch(() => {});
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [activeLesson, videoDuration, apiUrl]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");
        const courseRes = await fetch(`${apiUrl}/courses/${params.id}`, {
          cache: "no-store",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!courseRes.ok) {
          setError("Không tìm thấy khóa học.");
          return;
        }
        const courseJson = (await courseRes.json()) as CourseDetailResponse;
        if (cancelled) return;
        setCourse(courseJson.course);
        setIsEnrolled(courseJson.is_enrolled);

        if (!user) {
          return;
        }

        const progressRes = await fetch(
          `${apiUrl}/courses/${params.id}/progress`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            cache: "no-store",
          },
        );

        if (progressRes.status === 401) {
          router.push("/auth/login");
          return;
        }

        if (progressRes.status === 403) {
          // Not enrolled → don't show hard error, just mark as not enrolled
          // The premium upsell will show when user clicks locked lessons
          setIsEnrolled(false);
          return;
        }

        if (progressRes.ok) {
          const progressJson =
            (await progressRes.json()) as CourseProgressResponse;
          if (cancelled) return;
          setProgress(progressJson);
        }
      } catch {
        if (!cancelled) setError("Không thể tải dữ liệu khóa học.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (!authLoading) {
      load();
    }

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, user, authLoading, router]);

  const progressMap = useMemo(() => {
    const map = new Map<number, LessonProgress>();
    progress?.lessons_progress?.forEach((item) => {
      map.set(item.lesson_id, item);
    });
    return map;
  }, [progress]);

  const totalProgress = Math.min(
    100,
    Math.max(0, Math.round(progress?.total_progress ?? 0)),
  );

  const sections = useMemo<Section[]>(() => {
    if (course?.sections?.length) return course.sections;
    if (course?.lessons?.length) {
      return [
        {
          id: 0,
          title: "Danh sách bài học",
          order: 0,
          lessons: course.lessons,
        },
      ];
    }
    return [];
  }, [course?.sections, course?.lessons]);

  // Flatten all lessons for navigation
  const allLessons = useMemo(() => {
    return sections.flatMap((s) => s.lessons || []);
  }, [sections]);

  // Auto-expand all sections on load
  useEffect(() => {
    if (sections.length > 0 && expandedSections.size === 0) {
      setExpandedSections(new Set(sections.map((s) => s.id)));
    }
  }, [sections, expandedSections.size]);

  // Auto-open requested lesson from URL query param (?lesson=ID)
  const autoOpenedRef = useRef(false);
  useEffect(() => {
    if (autoOpenedRef.current || !requestedLessonId || allLessons.length === 0)
      return;
    const lesson = allLessons.find((l) => String(l.id) === requestedLessonId);
    if (lesson) {
      autoOpenedRef.current = true;
      openLesson(lesson);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allLessons, requestedLessonId]);

  useEffect(() => {
    const syncBlockedState = () => {
      if (
        typeof window !== "undefined" &&
        (window as CocCocWindow).__coccocDetected
      ) {
        setBlockedByGuard(true);
      }
    };

    syncBlockedState();

    const handler = () => {
      setBlockedByGuard(true);
      setVideoError(
        "BLOCKED_BROWSER: Trình duyệt có tính năng tải video không được hỗ trợ",
      );
      setVideoUrl(null);
      setVideoEmbedHtml(null);
      setVideoIsEmbed(false);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("coccoc-detected", handler);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("coccoc-detected", handler);
      }
    };
  }, []);

  function toggleSection(sectionId: number) {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  }

  // Get current lesson index for prev/next navigation
  const currentLessonIndex = useMemo(() => {
    if (!activeLesson) return -1;
    return allLessons.findIndex((l) => l.id === activeLesson.id);
  }, [activeLesson, allLessons]);

  const prevLesson =
    currentLessonIndex > 0 ? allLessons[currentLessonIndex - 1] : null;
  const nextLesson =
    currentLessonIndex >= 0 && currentLessonIndex < allLessons.length - 1
      ? allLessons[currentLessonIndex + 1]
      : null;

  async function openLesson(lesson: Lesson) {
    // Save progress of current lesson before switching
    if (activeLesson && videoDuration > 0) {
      await saveProgress(
        activeLesson.id,
        videoPlayedSecondsRef.current,
        videoDuration,
      );
      stopProgressTimer();
    }

    // Reset progress tracking for new lesson
    videoPlayedSecondsRef.current = 0;
    lastSavedPercentRef.current = 0;
    setVideoDuration(0);

    if (
      typeof window !== "undefined" &&
      (window as CocCocWindow).__coccocDetected
    ) {
      setBlockedByGuard(true);
      setVideoError(
        "BLOCKED_BROWSER: Trình duyệt có tính năng tải video không được hỗ trợ",
      );
      return;
    }

    setActiveLesson(lesson);
    setVideoUrl(null);
    setVideoIsEmbed(false);
    setVideoEmbedHtml(null);
    setVideoError(null);

    // Find parent section and check section access
    const parentSection = sections.find((s) =>
      s.lessons?.some((l) => l.id === lesson.id)
    );
    const sectionIsEnrolled = parentSection?.is_enrolled ?? false;
    const isLessonAccessible =
      lesson.is_preview ||
      isEnrolled ||
      sectionIsEnrolled ||
      user?.role === "admin";

    // Non-enrolled user trying to watch premium lesson → show upsell
    if (!isLessonAccessible) {
      const lessonIdx = allLessons.findIndex((l) => l.id === lesson.id);
      setPremiumLessonTitle(lesson.title);
      setPremiumLessonIndex(lessonIdx >= 0 ? lessonIdx : null);
      setPremiumSection(parentSection || null);
      setShowPremiumModal(true);
      return;
    }

    // Check if lesson has video
    if (
      !lesson.embed_url &&
      !lesson.video_bunny_id &&
      !lesson.video_local_path &&
      !lesson.video_url
    ) {
      setVideoError("Bài học này chưa có video.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token && !lesson.is_preview) {
      toast.error("Vui lòng đăng nhập để xem video.");
      return;
    }

    setVideoLoading(true);
    try {
      // Use preview endpoint for preview lessons (no auth required), regular endpoint otherwise
      const videoEndpoint = lesson.is_preview
        ? `${apiUrl}/lessons/${lesson.id}/preview-video`
        : `${apiUrl}/lessons/${lesson.id}/video`;
      const headers: Record<string, string> = {};
      if (token && !lesson.is_preview) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // Call backend to get video URL (handles both local and Bunny)
      const res = await fetch(videoEndpoint, {
        headers,
        cache: "no-store",
      });

      const contentType = res.headers.get("content-type") || "";
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));

        // 🛡️ SECURITY: Check if blocked browser
        if (errorData?.error_code === "6007" || errorData?.type === "blocked") {
          setVideoError(
            "BLOCKED_BROWSER:" +
              (errorData?.message || "Trình duyệt không được hỗ trợ"),
          );
          return;
        }

        setVideoError(errorData?.message || "Không thể tải video bài học.");
        return;
      }

      if (contentType.includes("application/json")) {
        const json = await res.json();

        // 🛡️ Check for blocked response even on 200
        if (json?.error_code === "6007" || json?.type === "blocked") {
          setVideoError(
            "BLOCKED_BROWSER:" +
              (json?.message || "Trình duyệt không được hỗ trợ"),
          );
          return;
        }

        const rawEmbedHtml = json?.embed_html || null;
        const rawEmbed = json?.embed_url || null;
        const directUrl = json?.video_url || null;
        let embedValue: string | null = null;
        if (rawEmbedHtml && /<iframe|<script/i.test(rawEmbedHtml)) {
          setVideoEmbedHtml(rawEmbedHtml);
          setVideoIsEmbed(true);
          setVideoUrl(null);
        } else if (rawEmbed && /<iframe|<script/i.test(rawEmbed)) {
          setVideoEmbedHtml(rawEmbed);
          setVideoIsEmbed(true);
          setVideoUrl(null);
        } else {
          embedValue = normalizeEmbedUrl(rawEmbed);
          setVideoUrl(directUrl || embedValue);
          setVideoIsEmbed(Boolean(embedValue));
        }
        if (!directUrl && !embedValue && !rawEmbed && !rawEmbedHtml) {
          setVideoError("Video chưa sẵn sàng.");
        }
      } else {
        // Backend returned video stream directly - use the URL
        setVideoUrl(videoEndpoint);
        setVideoIsEmbed(false);
      }
    } catch {
      setVideoError("Không thể tải video bài học.");
    } finally {
      setVideoLoading(false);
    }
  }

  if (loading || authLoading) {
    return (
      <div className="container py-12">
        <div className="space-y-4">
          <div className="h-6 w-48 animate-pulse rounded bg-muted" />
          <div className="h-10 w-2/3 animate-pulse rounded bg-muted" />
          <div className="h-24 w-full animate-pulse rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container py-12 text-center">
        <div className="mx-auto max-w-md space-y-4">
          <div className="text-5xl">😕</div>
          <h2 className="text-2xl font-bold">Không tìm thấy khóa học</h2>
          <p className="text-muted-foreground">
            {error || "Khóa học này có thể đã bị xóa hoặc không tồn tại."}
          </p>
          <Button asChild>
            <Link href="/courses">
              <ChevronRight className="mr-2 h-4 w-4 rotate-180" />
              Quay lại danh sách
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (error && !requestedLessonId) {
    return (
      <div className="container py-12">
        <Card className="mx-auto max-w-xl border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Không thể truy cập khóa học</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button asChild>
              <Link href={`/courses/${course.slug || course.id}`}>
                Xem chi tiết khóa học
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Top Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b bg-white px-4 dark:bg-gray-900">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
          <Link
            href={`/courses/${course.slug || course.id}`}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Quay lại</span>
          </Link>
          <span className="text-muted-foreground">/</span>
          <h1 className="truncate text-sm font-medium">{course.title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 text-sm sm:flex">
            <span className="text-muted-foreground">Tiến độ:</span>
            <span className="font-semibold text-primary">{totalProgress}%</span>
          </div>
          <Progress
            value={totalProgress}
            className="hidden h-2 w-24 sm:block"
          />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Lesson List */}
        <aside
          className={cn(
            "absolute inset-y-14 left-0 z-40 w-80 transform border-r bg-white transition-transform duration-200 dark:bg-gray-900 lg:relative lg:inset-y-0 lg:z-0 lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex h-full flex-col">
            {/* Sidebar Header */}
            <div className="border-b p-4">
              <h2 className="font-semibold">Nội dung khóa học</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {allLessons.length} bài học •{" "}
                {progress?.lessons_progress?.filter((l) => l.completed)
                  .length ?? 0}{" "}
                hoàn thành
              </p>
            </div>

            {/* Lesson List */}
            <div className="flex-1 overflow-y-auto">
              {sections.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Chưa có nội dung bài học.
                </div>
              ) : (
                sections.map((section) => {
                  const isExpanded = expandedSections.has(section.id);
                  const sectionLessons = section.lessons || [];
                  const completedCount = sectionLessons.filter(
                    (l) => progressMap.get(l.id)?.completed,
                  ).length;

                  return (
                    <div key={section.id} className="border-b last:border-b-0">
                      {/* Section Header */}
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/50"
                      >
                        <div className="flex-1">
                          <div className="font-medium">{section.title}</div>
                          <div className="mt-0.5 text-xs text-muted-foreground">
                            {completedCount}/{sectionLessons.length} bài học
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>

                      {/* Lessons in Section */}
                      {isExpanded && (
                        <div className="pb-2">
                          {sectionLessons.map((lesson, idx) => {
                            const lp = progressMap.get(lesson.id);
                            const completed = lp?.completed ?? false;
                            const percent = Math.round(
                              lp?.completion_percentage ?? 0,
                            );
                            const isActive = activeLesson?.id === lesson.id;
                            const hasVideo =
                              lesson.embed_url ||
                              lesson.video_bunny_id ||
                              lesson.video_url;

                            const canAccess = lesson.is_preview || !!user;

                            const parentSectionForLesson = sections.find((s) =>
                              s.lessons?.some((l) => l.id === lesson.id)
                            );
                            const sectionIsEnrolledForLesson = parentSectionForLesson?.is_enrolled ?? false;
                            const isLessonAccessible =
                              lesson.is_preview ||
                              isEnrolled ||
                              sectionIsEnrolledForLesson ||
                              user?.role === "admin";

                            const handleLessonClick = () => {
                              if (canAccess) {
                                if (!isLessonAccessible) {
                                  // User is logged in but has no access to this lesson → show premium modal
                                  const lessonIdx = allLessons.findIndex(
                                    (l) => l.id === lesson.id,
                                  );
                                  setPremiumLessonTitle(lesson.title);
                                  setPremiumLessonIndex(
                                    lessonIdx >= 0 ? lessonIdx : null,
                                  );
                                  setPremiumSection(parentSectionForLesson || null);
                                  setShowPremiumModal(true);
                                  return;
                                }
                                openLesson(lesson);
                              } else {
                                // Not logged in → show premium modal instead of redirect
                                const lessonIdx = allLessons.findIndex(
                                  (l) => l.id === lesson.id,
                                );
                                setPremiumLessonTitle(lesson.title);
                                setPremiumLessonIndex(
                                  lessonIdx >= 0 ? lessonIdx : null,
                                );
                                setPremiumSection(parentSectionForLesson || null);
                                setShowPremiumModal(true);
                              }
                            };

                            return (
                              <button
                                key={lesson.id}
                                onClick={handleLessonClick}
                                className={cn(
                                  "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50",
                                  isActive &&
                                    "bg-primary/10 hover:bg-primary/10",
                                )}
                              >
                                {/* Status Icon */}
                                <div className="mt-0.5 shrink-0">
                                  {completed ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                  ) : isActive ? (
                                    <PlayCircle className="h-5 w-5 text-primary" />
                                  ) : (
                                    <div
                                      className={cn(
                                        "flex h-5 w-5 items-center justify-center rounded-full border-2 text-xs font-medium",
                                        percent > 0
                                          ? "border-primary text-primary"
                                          : "border-muted-foreground/30 text-muted-foreground",
                                      )}
                                    >
                                      {idx + 1}
                                    </div>
                                  )}
                                </div>

                                {/* Thumbnail if present */}
                                {lesson.thumbnail && (
                                  <div className="mt-0.5 shrink-0">
                                    <Image
                                      src={resolveAssetUrl(lesson.thumbnail)}
                                      alt={lesson.title}
                                      width={48}
                                      height={32}
                                      className="h-8 w-12 rounded object-cover shadow-sm"
                                      unoptimized
                                    />
                                  </div>
                                )}

                                {/* Lesson Info */}
                                <div className="min-w-0 flex-1">
                                  <div
                                    className={cn(
                                      "truncate text-sm",
                                      isActive && "font-medium text-primary",
                                      !hasVideo && "text-muted-foreground",
                                    )}
                                  >
                                    {lesson.title}
                                  </div>
                                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    <span>
                                      {formatDuration(lesson.duration)}
                                    </span>
                                    {!hasVideo && (
                                      <Badge
                                        variant="outline"
                                        className="h-4 text-[10px]"
                                      >
                                        Chưa có video
                                      </Badge>
                                    )}
                                    {lesson.is_preview && (
                                      <Badge
                                        variant="secondary"
                                        className="h-4 text-[10px] bg-green-500/20 text-green-400 border-green-500/30"
                                      >
                                        FREE
                                      </Badge>
                                    )}
                                    {!lesson.is_preview && (
                                      <Badge
                                        variant="secondary"
                                        className={cn(
                                          "h-4 text-[10px]",
                                          isLessonAccessible
                                            ? "bg-green-500/20 text-green-400 border-green-500/30"
                                            : "bg-orange-500/20 text-orange-400 border-orange-500/30"
                                        )}
                                      >
                                        {isLessonAccessible ? (
                                          "PREMIUM"
                                        ) : (
                                          <span className="flex items-center gap-0.5">
                                            <Lock className="h-2.5 w-2.5" />{" "}
                                            LOCKED
                                          </span>
                                        )}
                                      </Badge>
                                    )}
                                  </div>
                                  {percent > 0 && !completed && (
                                    <Progress
                                      value={percent}
                                      className="mt-2 h-1"
                                    />
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </aside>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content - Video Player */}
        <main className="flex flex-1 min-h-0 flex-col overflow-hidden">
          {/* Video Area */}
          <div className="flex-1 min-h-0 bg-black">
            <div className="flex h-full items-center justify-center p-4 sm:p-6 lg:p-8">
              <div
                className="w-full max-w-6xl"
                style={{
                  width: "min(100%, calc((100vh - 14rem) * 16 / 9))",
                  maxHeight: "calc(100vh - 14rem)",
                }}
              >
                <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-lg ring-1 ring-white/10">
                  {videoLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white" />
                    </div>
                  ) : blockedByGuard ||
                    videoError?.startsWith("BLOCKED_BROWSER:") ? (
                    // 🛡️ SECURITY: Show blocked browser error
                    <VideoSecurityError
                      errorCode="6007"
                      browserName="Trình duyệt có tính năng tải video"
                      className="h-full w-full"
                    />
                  ) : videoUrl || videoEmbedHtml ? (
                    <VideoPlayer
                      url={videoUrl ?? ""}
                      className="h-full w-full"
                      forceEmbed={videoIsEmbed}
                      embedHtml={videoEmbedHtml}
                      onProgress={handleVideoProgress}
                      onDuration={handleVideoDuration}
                      onEnded={handleVideoEnded}
                    />
                  ) : activeLesson &&
                    !(
                      activeLesson.is_preview ||
                      isEnrolled ||
                      (sections.find((s) => s.lessons?.some((l) => l.id === activeLesson.id))?.is_enrolled ?? false)
                    ) ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
                      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 mb-4 shadow-lg shadow-orange-500/30">
                        <Lock className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">
                        Nội dung Premium
                      </h3>
                      <p className="text-white/60 text-center text-sm mb-4 max-w-sm">
                        Kỹ thuật nâng cao dành cho học viên đã đăng ký.
                      </p>
                      <button
                        onClick={() => {
                          const lessonIdx = allLessons.findIndex(
                            (l) => l.id === activeLesson.id,
                          );
                          setPremiumLessonTitle(activeLesson.title);
                          setPremiumLessonIndex(
                            lessonIdx >= 0 ? lessonIdx : null,
                          );
                          const parentSect = sections.find((s) =>
                            s.lessons?.some((l) => l.id === activeLesson.id)
                          );
                          setPremiumSection(parentSect || null);
                          setShowPremiumModal(true);
                        }}
                        className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/30 transition-all hover:scale-105"
                      >
                        Nâng cấp Premium
                      </button>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white/70">
                      <PlayCircle className="mb-4 h-16 w-16" />
                      <p className="text-center text-lg">
                        {videoError ||
                          "Chọn bài học từ danh sách bên trái để bắt đầu"}
                      </p>
                      {activeLesson && !videoError && (
                        <p className="mt-2 text-sm text-white/50">
                          Đang xem: {activeLesson.title}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Info Bar */}
          <div className="shrink-0 border-t bg-white p-4 dark:bg-gray-900">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Current Lesson Info */}
              <div className="min-w-0 flex-1">
                {activeLesson ? (
                  <>
                    <h3 className="truncate font-semibold">
                      {activeLesson.title}
                    </h3>
                    <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDuration(
                          videoDuration > 0
                            ? videoDuration
                            : activeLesson.duration,
                        )}
                      </span>
                      {progressMap.get(activeLesson.id)?.completed && (
                        <Badge className="bg-green-500 text-white">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Hoàn thành
                        </Badge>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground">
                    Chọn bài học để bắt đầu
                  </p>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!prevLesson}
                  onClick={() => prevLesson && openLesson(prevLesson)}
                >
                  <ChevronRight className="mr-1 h-4 w-4 rotate-180" />
                  Bài trước
                </Button>
                <Button
                  size="sm"
                  disabled={!nextLesson}
                  onClick={() => nextLesson && openLesson(nextLesson)}
                >
                  Bài tiếp
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Progress for current lesson */}
            {activeLesson && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Tiến độ bài học</span>
                  <span>
                    {Math.round(
                      progressMap.get(activeLesson.id)?.completion_percentage ??
                        0,
                    )}
                    %
                  </span>
                </div>
                <Progress
                  value={
                    progressMap.get(activeLesson.id)?.completion_percentage ?? 0
                  }
                  className="mt-1.5 h-1.5"
                />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Premium Upsell Modal */}
      <PremiumUpsellModal
        open={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        lessonTitle={premiumLessonTitle}
        courseTitle={course?.title}
        coursePrice={Number(course?.price) || 0}
        courseSlug={course?.slug}
        courseId={params.id}
        isLoggedIn={!!user}
        totalLessons={allLessons.length}
        currentLessonIndex={premiumLessonIndex ?? undefined}
        section={premiumSection}
      />
    </div>
  );
}
