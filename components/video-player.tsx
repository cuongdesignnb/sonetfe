"use client";

import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import ReactPlayer from "react-player";
import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  Maximize,
  Minimize,
  Settings,
  Loader2,
  SkipBack,
  SkipForward,
  PictureInPicture2,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useBrowserSecurity } from "@/hooks/use-browser-security";
import { VideoSecurityError } from "@/components/video-security-error";

export type PlaybackSource = {
  type: "bunny_embed" | "hls_proxy" | "direct";
  url: string;
  origin?: string;
};

export type PlaybackEventPayload = {
  event:
    | "video_primary_requested"
    | "video_primary_ready"
    | "video_primary_timeout"
    | "video_primary_error"
    | "video_fallback_requested"
    | "video_fallback_ready"
    | "video_fallback_error";
  provider: "bunny_embed" | "hls_proxy" | "direct";
  elapsedMs: number;
  errorCategory?: string;
};

type PlaybackPhase =
  | "IDLE"
  | "PRIMARY_LOADING"
  | "PRIMARY_READY"
  | "PRIMARY_FAILED"
  | "FALLBACK_LOADING"
  | "FALLBACK_READY"
  | "FALLBACK_FAILED";

type PlayerJsInstance = {
  on: (event: string, callback: (value?: unknown) => void) => void;
  off?: (event: string, callback?: (value?: unknown) => void) => void;
};

type PlayerJsConstructor = new (iframe: HTMLIFrameElement) => PlayerJsInstance;

declare global {
  interface Window {
    playerjs?: { Player: PlayerJsConstructor };
  }
}

let bunnyPlayerJsLoad: Promise<boolean> | null = null;

function loadBunnyPlayerJs(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.playerjs?.Player) return Promise.resolve(true);
  if (bunnyPlayerJsLoad) return bunnyPlayerJsLoad;

  bunnyPlayerJsLoad = new Promise((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-sonet-bunny-playerjs="true"]',
    );
    const script = existing ?? document.createElement("script");
    let settled = false;
    const finish = (loaded: boolean) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      resolve(loaded && Boolean(window.playerjs?.Player));
    };
    const timeout = window.setTimeout(() => finish(false), 3000);
    script.addEventListener("load", () => finish(true), { once: true });
    script.addEventListener("error", () => finish(false), { once: true });
    if (!existing) {
      script.src = "https://assets.mediadelivery.net/playerjs/player-0.1.0.min.js";
      script.async = true;
      script.dataset.sonetBunnyPlayerjs = "true";
      document.head.appendChild(script);
    }
  });

  return bunnyPlayerJsLoad;
}

interface VideoPlayerProps {
  url: string;
  primary?: PlaybackSource;
  fallback?: PlaybackSource | null;
  failoverTimeoutMs?: number;
  onPlaybackEvent?: (event: PlaybackEventPayload) => void;
  initialPlaybackSeconds?: number;
  forceEmbed?: boolean;
  embedHtml?: string | null;
  poster?: string;
  onProgress?: (progress: {
    played: number;
    playedSeconds: number;
    loaded: number;
    loadedSeconds: number;
  }) => void;
  onDuration?: (duration: number) => void;
  onEnded?: () => void;
  className?: string;
  autoplay?: boolean;
  controls?: boolean;
}

type ProgressState = {
  played: number;
  playedSeconds: number;
  loaded: number;
  loadedSeconds: number;
};

interface HlsLevel {
  height: number;
  width: number;
  bitrate: number;
  name?: string;
}

const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
const SKIP_SECONDS = 10;

export function VideoPlayer({
  url,
  primary,
  fallback = null,
  failoverTimeoutMs = 10000,
  onPlaybackEvent,
  initialPlaybackSeconds = 0,
  forceEmbed = false,
  embedHtml = null,
  poster,
  onProgress,
  onDuration,
  onEnded,
  className,
  autoplay = false,
  controls = true,
}: VideoPlayerProps) {
  const primarySource = useMemo<PlaybackSource>(
    () => primary ?? { type: forceEmbed ? "bunny_embed" : "direct", url },
    [forceEmbed, primary, url],
  );
  const initialMode = primarySource.type === "hls_proxy" ? "fallback" : "primary";
  const [sourceMode, setSourceMode] = useState<"primary" | "fallback">(
    initialMode,
  );
  const activeSource =
    sourceMode === "fallback" && fallback ? fallback : primarySource;
  const activeUrl = activeSource.url || url;
  const activeEmbedHtml = sourceMode === "primary" ? embedHtml : null;
  const isEmbed =
    Boolean(activeEmbedHtml) ||
    activeSource.type === "bunny_embed" ||
    (sourceMode === "primary" && forceEmbed) ||
    /mediadelivery\.net\/embed\/|video\.bunnycdn\.com\/embed\/|\/embed\//i.test(
      activeUrl,
    );
  const playerRef = useRef<ReactPlayer>(null);
  const [playing, setPlaying] = useState(initialMode === "fallback" || autoplay);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [duration, setDuration] = useState(0);
  const [played, setPlayed] = useState(0);
  const [loaded, setLoaded] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playbackPhase, setPlaybackPhase] = useState<PlaybackPhase>(
    initialMode === "fallback" ? "FALLBACK_LOADING" : "PRIMARY_LOADING",
  );
  const playbackPhaseRef = useRef<PlaybackPhase>(
    initialMode === "fallback" ? "FALLBACK_LOADING" : "PRIMARY_LOADING",
  );
  const fallbackAttemptedRef = useRef(initialMode === "fallback");
  const primaryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playbackStartedAtRef = useRef(Date.now());
  const lastKnownTimeRef = useRef(Math.max(0, initialPlaybackSeconds));
  const endedReportedRef = useRef(false);
  const [playerRetryKey, setPlayerRetryKey] = useState(0);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const transitionPhase = useCallback((phase: PlaybackPhase) => {
    playbackPhaseRef.current = phase;
    setPlaybackPhase(phase);
  }, []);

  const emitPlaybackEvent = useCallback(
    (
      event: PlaybackEventPayload["event"],
      provider: PlaybackEventPayload["provider"],
      errorCategory?: string,
    ) => {
      onPlaybackEvent?.({
        event,
        provider,
        elapsedMs: Math.max(0, Date.now() - playbackStartedAtRef.current),
        ...(errorCategory ? { errorCategory } : {}),
      });
    },
    [onPlaybackEvent],
  );

  const switchToFallback = useCallback(
    (reason?: "PRIMARY_TIMEOUT" | "PRIMARY_IFRAME_ERROR") => {
      if (!fallback || fallbackAttemptedRef.current) return;
      fallbackAttemptedRef.current = true;
      if (primaryTimeoutRef.current) {
        clearTimeout(primaryTimeoutRef.current);
        primaryTimeoutRef.current = null;
      }
      if (reason === "PRIMARY_TIMEOUT") {
        transitionPhase("PRIMARY_FAILED");
        emitPlaybackEvent("video_primary_timeout", "bunny_embed", reason);
      } else if (reason === "PRIMARY_IFRAME_ERROR") {
        transitionPhase("PRIMARY_FAILED");
        emitPlaybackEvent("video_primary_error", "bunny_embed", reason);
      }
      emitPlaybackEvent("video_fallback_requested", "hls_proxy", reason);
      transitionPhase("FALLBACK_LOADING");
      setSourceMode("fallback");
      setPlaying(true);
    },
    [emitPlaybackEvent, fallback, transitionPhase],
  );

  const markPrimaryReady = useCallback(() => {
    if (playbackPhaseRef.current === "PRIMARY_READY") return;
    if (primaryTimeoutRef.current) {
      clearTimeout(primaryTimeoutRef.current);
      primaryTimeoutRef.current = null;
    }
    transitionPhase("PRIMARY_READY");
    emitPlaybackEvent("video_primary_ready", "bunny_embed");
  }, [emitPlaybackEvent, transitionPhase]);

  const markFallbackReady = useCallback(() => {
    if (playbackPhaseRef.current === "FALLBACK_READY") return;
    const isForcedRelay = primarySource.type === "hls_proxy";
    transitionPhase(isForcedRelay ? "PRIMARY_READY" : "FALLBACK_READY");
    emitPlaybackEvent(
      isForcedRelay ? "video_primary_ready" : "video_fallback_ready",
      "hls_proxy",
    );
  }, [emitPlaybackEvent, primarySource.type, transitionPhase]);

  const markFallbackFailed = useCallback(() => {
    if (
      playbackPhaseRef.current === "FALLBACK_FAILED" ||
      playbackPhaseRef.current === "PRIMARY_FAILED"
    ) {
      return;
    }
    const isForcedRelay = primarySource.type === "hls_proxy";
    transitionPhase(isForcedRelay ? "PRIMARY_FAILED" : "FALLBACK_FAILED");
    emitPlaybackEvent(
      isForcedRelay ? "video_primary_error" : "video_fallback_error",
      "hls_proxy",
      "FALLBACK_UPSTREAM_ERROR",
    );
  }, [emitPlaybackEvent, primarySource.type, transitionPhase]);

  useEffect(() => {
    playbackStartedAtRef.current = Date.now();
    emitPlaybackEvent("video_primary_requested", primarySource.type);
    if (primarySource.type === "hls_proxy") {
      return;
    }

    if (primarySource.type === "bunny_embed" && fallback) {
      transitionPhase("PRIMARY_LOADING");
      primaryTimeoutRef.current = setTimeout(() => {
        if (playbackPhaseRef.current !== "PRIMARY_READY") {
          switchToFallback("PRIMARY_TIMEOUT");
        }
      }, Math.max(1000, Math.min(30000, failoverTimeoutMs)));
    }

    return () => {
      if (primaryTimeoutRef.current) {
        clearTimeout(primaryTimeoutRef.current);
        primaryTimeoutRef.current = null;
      }
    };
  }, [
    emitPlaybackEvent,
    failoverTimeoutMs,
    fallback,
    primarySource.type,
    switchToFallback,
    transitionPhase,
  ]);

  // Playback speed
  const [playbackRate, setPlaybackRate] = useState(1);

  // Quality levels (HLS)
  const [qualityLevels, setQualityLevels] = useState<HlsLevel[]>([]);
  const [currentQuality, setCurrentQuality] = useState(-1); // -1 = Auto

  // Settings menu
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [settingsSubMenu, setSettingsSubMenu] = useState<
    "main" | "speed" | "quality" | null
  >(null);

  // Hover time preview
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState(0);

  // 🛡️ BROWSER SECURITY CHECK
  const { isBlocked, browserName, isLoading, errorCode } = useBrowserSecurity();

  useEffect(() => {
    console.log("VideoPlayer Mounted. Security State:", {
      isBlocked,
      browserName,
      isLoading,
    });
  }, [isBlocked, browserName, isLoading]);

  useEffect(() => {
    if (autoplay) {
      setPlaying(true);
    }
  }, [autoplay]);

  // Auto-hide controls
  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    if (playing) {
      controlsTimeoutRef.current = setTimeout(() => {
        if (!showSettingsMenu) {
          setShowControls(false);
        }
      }, 3000);
    }
  }, [playing, showSettingsMenu]);

  useEffect(() => {
    resetControlsTimeout();
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [playing, resetControlsTimeout]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Extract HLS quality levels
  useEffect(() => {
    const checkHls = setInterval(() => {
      if (playerRef.current) {
        const internal = playerRef.current.getInternalPlayer("hls");
        if (internal && internal.levels && internal.levels.length > 0) {
          const levels: HlsLevel[] = internal.levels.map((level: HlsLevel) => ({
            height: level.height,
            width: level.width,
            bitrate: level.bitrate,
          }));
          setQualityLevels(levels);
          clearInterval(checkHls);
        }
      }
    }, 1000);

    return () => clearInterval(checkHls);
  }, [url]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture if typing in input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          e.preventDefault();
          setPlaying((p) => !p);
          resetControlsTimeout();
          break;
        case "arrowleft":
        case "j":
          e.preventDefault();
          handleSkip(-SKIP_SECONDS);
          break;
        case "arrowright":
        case "l":
          e.preventDefault();
          handleSkip(SKIP_SECONDS);
          break;
        case "arrowup":
          e.preventDefault();
          setVolume((v) => Math.min(1, v + 0.1));
          setMuted(false);
          resetControlsTimeout();
          break;
        case "arrowdown":
          e.preventDefault();
          setVolume((v) => Math.max(0, v - 0.1));
          resetControlsTimeout();
          break;
        case "f":
          e.preventDefault();
          handleFullscreen();
          break;
        case "m":
          e.preventDefault();
          setMuted((m) => !m);
          resetControlsTimeout();
          break;
        case "escape":
          setShowSettingsMenu(false);
          setSettingsSubMenu(null);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, resetControlsTimeout]);

  const handlePlayPause = () => {
    setPlaying(!playing);
  };

  const handleMute = () => {
    setMuted(!muted);
  };

  const handleSkip = (seconds: number) => {
    if (playerRef.current && duration > 0) {
      const currentTime = playerRef.current.getCurrentTime();
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
      playerRef.current.seekTo(newTime, "seconds");
      setPlayed(newTime / duration);
      resetControlsTimeout();
    }
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressBarRef.current && duration > 0) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const fraction = Math.max(
        0,
        Math.min(1, (e.clientX - rect.left) / rect.width),
      );
      setPlayed(fraction);
      playerRef.current?.seekTo(fraction);
    }
  };

  const handleProgressBarHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressBarRef.current && duration > 0) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const fraction = Math.max(
        0,
        Math.min(1, (e.clientX - rect.left) / rect.width),
      );
      setHoverTime(fraction * duration);
      setHoverPosition(((e.clientX - rect.left) / rect.width) * 100);
    }
  };

  const handleProgress = useCallback(
    (state: ProgressState) => {
      lastKnownTimeRef.current = Math.max(0, state.playedSeconds);
      setPlayed(state.played);
      setLoaded(state.loaded);
      if (
        sourceMode === "primary" &&
        primarySource.type === "bunny_embed" &&
        state.playedSeconds > 0
      ) {
        markPrimaryReady();
      } else if (sourceMode === "fallback" && state.playedSeconds > 0) {
        markFallbackReady();
      }
      onProgress?.(state);
    },
    [markFallbackReady, markPrimaryReady, onProgress, primarySource.type, sourceMode],
  );

  const handleDuration = useCallback(
    (dur: number) => {
      setDuration(dur);
      onDuration?.(dur);
    },
    [onDuration],
  );

  const handleReactPlayerPlay = useCallback(() => {
    if (sourceMode === "fallback") {
      markFallbackReady();
    }
  }, [markFallbackReady, sourceMode]);

  const handlePrimaryError = useCallback(
    () => switchToFallback("PRIMARY_IFRAME_ERROR"),
    [switchToFallback],
  );

  const handleEnded = useCallback(() => {
    if (endedReportedRef.current) return;
    endedReportedRef.current = true;
    onEnded?.();
  }, [onEnded]);

  const handleReactPlayerReady = () => {
    if (sourceMode !== "fallback") return;
    const resumeAt = lastKnownTimeRef.current > 0
      ? lastKnownTimeRef.current
      : Math.max(0, initialPlaybackSeconds);
    if (resumeAt <= 0) return;
    window.setTimeout(() => {
      playerRef.current?.seekTo(resumeAt, "seconds");
    }, 0);
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handlePictureInPicture = async () => {
    try {
      const video = playerRef.current?.getInternalPlayer() as HTMLVideoElement;
      if (video) {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await video.requestPictureInPicture();
        }
      }
    } catch (err) {
      console.warn("PiP not supported:", err);
    }
  };

  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate);
    setSettingsSubMenu(null);
    setShowSettingsMenu(false);
  };

  const handleQualityChange = (levelIndex: number) => {
    setCurrentQuality(levelIndex);
    const internal = playerRef.current?.getInternalPlayer("hls");
    if (internal) {
      internal.currentLevel = levelIndex; // -1 = auto
    }
    setSettingsSubMenu(null);
    setShowSettingsMenu(false);
  };

  const toggleSettingsMenu = () => {
    setShowSettingsMenu(!showSettingsMenu);
    setSettingsSubMenu(showSettingsMenu ? null : "main");
  };

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds) || seconds < 0) return "0:00";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getQualityLabel = (level: HlsLevel) => {
    return `${level.height}p`;
  };

  const getCurrentQualityLabel = () => {
    if (currentQuality === -1) return "Tự động";
    if (qualityLevels[currentQuality]) {
      return `${qualityLevels[currentQuality].height}p`;
    }
    return "Tự động";
  };

  const getVolumeIcon = () => {
    if (muted || volume === 0) return <VolumeX className="h-4 w-4" />;
    if (volume < 0.5) return <Volume1 className="h-4 w-4" />;
    return <Volume2 className="h-4 w-4" />;
  };

  // 🛡️ SECURITY: Loading
  if (isLoading) {
    return (
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-lg bg-black",
          className,
        )}
      >
        <div className="aspect-video flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-gray-400">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="text-sm">Đang kiểm tra bảo mật...</span>
          </div>
        </div>
      </div>
    );
  }

  // 🛡️ SECURITY: Block
  if (isBlocked) {
    return (
      <VideoSecurityError
        errorCode={errorCode || "6007"}
        browserName={browserName}
        className={className}
      />
    );
  }

  if (isEmbed) {
    return (
      <EmbedPlayer
        url={activeUrl}
        embedHtml={activeEmbedHtml}
        enableBunnyPlayerApi={activeSource.type === "bunny_embed"}
        trustedMessageOrigin={activeSource.origin}
        className={className}
        containerRef={containerRef}
        canFallback={Boolean(fallback) && sourceMode === "primary"}
        isPrimaryHealthy={playbackPhase === "PRIMARY_READY"}
        onManualFallback={() => switchToFallback()}
        onPrimaryError={handlePrimaryError}
        onPrimaryReady={markPrimaryReady}
        onPrimaryProgress={handleProgress}
        onDuration={handleDuration}
        onEnded={handleEnded}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative bg-black rounded-lg overflow-hidden group select-none",
        className,
      )}
      onMouseMove={resetControlsTimeout}
      onMouseLeave={() => {
        if (playing && !showSettingsMenu) setShowControls(false);
      }}
      onDoubleClick={(e) => {
        // Double click on center = fullscreen, avoid buttons
        if ((e.target as HTMLElement).closest("button")) return;
        handleFullscreen();
      }}
      tabIndex={0}
    >
      <ReactPlayer
        key={`${activeUrl}:${playerRetryKey}`}
        ref={playerRef}
        url={activeUrl}
        width="100%"
        height="100%"
        playing={playing}
        muted={muted}
        volume={volume}
        playbackRate={playbackRate}
        onProgress={handleProgress}
        onDuration={handleDuration}
        onEnded={handleEnded}
        onPlay={handleReactPlayerPlay}
        onReady={handleReactPlayerReady}
        onError={sourceMode === "fallback" ? markFallbackFailed : undefined}
        poster={poster}
        config={{
          file: {
            attributes: {
              crossOrigin: undefined,
            },
            // The same-site relay URL intentionally does not expose a .m3u8
            // suffix. Force ReactPlayer to use hls.js for relay playback;
            // otherwise Chrome treats the endpoint as a plain video URL and
            // fails immediately even when the backend returns a valid HLS
            // manifest.
            forceHLS: activeSource.type === "hls_proxy",
            forceVideo: true,
          },
        }}
      />

      {playbackPhase === "FALLBACK_FAILED" ||
      playbackPhase === "PRIMARY_FAILED" ? (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/80 px-6 text-center text-white">
          <p>Không thể tải video dự phòng lúc này.</p>
          <button
            type="button"
            className="rounded-md bg-white/15 px-4 py-2 text-sm hover:bg-white/25"
            onClick={() => {
              transitionPhase("FALLBACK_LOADING");
              setPlaying(true);
              setPlayerRetryKey((key) => key + 1);
            }}
          >
            Thử lại video dự phòng
          </button>
        </div>
      ) : null}

      {controls && (
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent transition-opacity duration-300",
            showControls ? "opacity-100" : "opacity-0 pointer-events-none",
          )}
          onClick={(e) => {
            // Click on overlay (not buttons) = toggle play
            if (e.target === e.currentTarget) handlePlayPause();
          }}
        >
          {/* Center play/pause + skip overlay */}
          <div className="absolute inset-0 flex items-center justify-center gap-8 pointer-events-none">
            {/* Skip backward */}
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 text-white/80 hover:text-white hover:bg-white/10 rounded-full pointer-events-auto transition-transform active:scale-90"
              onClick={() => handleSkip(-SKIP_SECONDS)}
              title={`Tua lại ${SKIP_SECONDS}s (J)`}
            >
              <div className="relative">
                <SkipBack className="h-6 w-6" />
                <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-bold">
                  {SKIP_SECONDS}
                </span>
              </div>
            </Button>

            {/* Play/Pause */}
            <Button
              variant="ghost"
              size="icon"
              className="h-16 w-16 text-white hover:bg-white/20 rounded-full pointer-events-auto transition-transform active:scale-90"
              onClick={handlePlayPause}
              title={playing ? "Tạm dừng (K)" : "Phát (K)"}
            >
              {playing ? (
                <Pause className="h-8 w-8" />
              ) : (
                <Play className="h-8 w-8 ml-1" />
              )}
            </Button>

            {/* Skip forward */}
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 text-white/80 hover:text-white hover:bg-white/10 rounded-full pointer-events-auto transition-transform active:scale-90"
              onClick={() => handleSkip(SKIP_SECONDS)}
              title={`Tua tới ${SKIP_SECONDS}s (L)`}
            >
              <div className="relative">
                <SkipForward className="h-6 w-6" />
                <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-bold">
                  {SKIP_SECONDS}
                </span>
              </div>
            </Button>
          </div>

          {/* Bottom controls */}
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-3 pt-8">
            {/* Progress bar */}
            <div
              ref={progressBarRef}
              className="group/progress relative mb-2 h-1.5 cursor-pointer rounded-full bg-white/20 transition-all hover:h-3"
              onClick={handleProgressBarClick}
              onMouseMove={handleProgressBarHover}
              onMouseLeave={() => setHoverTime(null)}
            >
              {/* Buffered */}
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-white/30"
                style={{ width: `${loaded * 100}%` }}
              />
              {/* Played */}
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-blue-500"
                style={{ width: `${played * 100}%` }}
              />
              {/* Seek handle */}
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-4 w-4 rounded-full bg-blue-500 shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity"
                style={{ left: `${played * 100}%` }}
              />
              {/* Hover time tooltip */}
              {hoverTime !== null && (
                <div
                  className="absolute -top-9 -translate-x-1/2 rounded bg-black/90 px-2 py-1 text-xs text-white font-mono whitespace-nowrap"
                  style={{ left: `${hoverPosition}%` }}
                >
                  {formatTime(hoverTime)}
                </div>
              )}
            </div>

            {/* Control buttons */}
            <div className="flex items-center justify-between text-white">
              {/* Left controls */}
              <div className="flex items-center space-x-1">
                {/* Play/Pause */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-white hover:bg-white/20"
                  onClick={handlePlayPause}
                  title={playing ? "Tạm dừng (K)" : "Phát (K)"}
                >
                  {playing ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5" />
                  )}
                </Button>

                {/* Skip back */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-white hover:bg-white/20"
                  onClick={() => handleSkip(-SKIP_SECONDS)}
                  title={`Tua lại ${SKIP_SECONDS}s (J)`}
                >
                  <SkipBack className="h-4 w-4" />
                </Button>

                {/* Skip forward */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-white hover:bg-white/20"
                  onClick={() => handleSkip(SKIP_SECONDS)}
                  title={`Tua tới ${SKIP_SECONDS}s (L)`}
                >
                  <SkipForward className="h-4 w-4" />
                </Button>

                {/* Volume */}
                <div className="flex items-center group/vol">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-white hover:bg-white/20"
                    onClick={handleMute}
                    title={muted ? "Bật tiếng (M)" : "Tắt tiếng (M)"}
                  >
                    {getVolumeIcon()}
                  </Button>
                  <div className="w-0 overflow-hidden transition-all duration-200 group-hover/vol:w-20">
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={muted ? 0 : volume}
                      onChange={(e) => {
                        setVolume(parseFloat(e.target.value));
                        if (parseFloat(e.target.value) > 0) setMuted(false);
                      }}
                      className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>
                </div>

                {/* Time */}
                <span className="text-xs font-mono text-white/80 ml-2">
                  {formatTime(played * duration)} / {formatTime(duration)}
                </span>
              </div>

              {/* Right controls */}
              <div className="flex items-center space-x-1 relative">
                {/* Playback speed badge (quick access) */}
                {playbackRate !== 1 && (
                  <button
                    className="h-7 px-2 rounded text-xs font-bold text-white bg-white/15 hover:bg-white/25 transition-colors"
                    onClick={() => {
                      setShowSettingsMenu(true);
                      setSettingsSubMenu("speed");
                    }}
                    title="Tốc độ phát"
                  >
                    {playbackRate}x
                  </button>
                )}

                {/* PiP */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-white hover:bg-white/20"
                  onClick={handlePictureInPicture}
                  title="Ảnh trong ảnh"
                >
                  <PictureInPicture2 className="h-4 w-4" />
                </Button>

                {/* Settings */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-9 w-9 text-white hover:bg-white/20 transition-transform duration-300",
                      showSettingsMenu && "rotate-45",
                    )}
                    onClick={toggleSettingsMenu}
                    title="Cài đặt"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>

                  {/* Settings popup */}
                  {showSettingsMenu && (
                    <div className="absolute bottom-full right-0 mb-2 min-w-[200px] rounded-lg bg-gray-900/95 backdrop-blur-sm border border-white/10 shadow-2xl overflow-hidden z-50">
                      {settingsSubMenu === "main" && (
                        <div className="py-1">
                          {/* Speed option */}
                          <button
                            className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-white hover:bg-white/10 transition-colors"
                            onClick={() => setSettingsSubMenu("speed")}
                          >
                            <span>Tốc độ phát</span>
                            <span className="text-white/60 text-xs">
                              {playbackRate === 1
                                ? "Bình thường"
                                : `${playbackRate}x`}
                            </span>
                          </button>
                          {/* Quality option */}
                          {qualityLevels.length > 0 && (
                            <button
                              className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-white hover:bg-white/10 transition-colors"
                              onClick={() => setSettingsSubMenu("quality")}
                            >
                              <span>Chất lượng</span>
                              <span className="text-white/60 text-xs">
                                {getCurrentQualityLabel()}
                              </span>
                            </button>
                          )}
                        </div>
                      )}

                      {settingsSubMenu === "speed" && (
                        <div className="py-1">
                          <button
                            className="w-full flex items-center px-4 py-2 text-sm text-white/60 hover:bg-white/10"
                            onClick={() => setSettingsSubMenu("main")}
                          >
                            <ChevronUp className="h-3 w-3 mr-2 -rotate-90" />
                            Tốc độ phát
                          </button>
                          <div className="border-t border-white/10 my-1" />
                          {PLAYBACK_RATES.map((rate) => (
                            <button
                              key={rate}
                              className={cn(
                                "w-full flex items-center justify-between px-4 py-2 text-sm transition-colors",
                                rate === playbackRate
                                  ? "text-blue-400 bg-blue-500/10"
                                  : "text-white hover:bg-white/10",
                              )}
                              onClick={() => handlePlaybackRateChange(rate)}
                            >
                              <span>
                                {rate === 1 ? "Bình thường" : `${rate}x`}
                              </span>
                              {rate === playbackRate && (
                                <span className="text-blue-400">✓</span>
                              )}
                            </button>
                          ))}
                        </div>
                      )}

                      {settingsSubMenu === "quality" && (
                        <div className="py-1">
                          <button
                            className="w-full flex items-center px-4 py-2 text-sm text-white/60 hover:bg-white/10"
                            onClick={() => setSettingsSubMenu("main")}
                          >
                            <ChevronUp className="h-3 w-3 mr-2 -rotate-90" />
                            Chất lượng
                          </button>
                          <div className="border-t border-white/10 my-1" />
                          {/* Auto option */}
                          <button
                            className={cn(
                              "w-full flex items-center justify-between px-4 py-2 text-sm transition-colors",
                              currentQuality === -1
                                ? "text-blue-400 bg-blue-500/10"
                                : "text-white hover:bg-white/10",
                            )}
                            onClick={() => handleQualityChange(-1)}
                          >
                            <span>Tự động</span>
                            {currentQuality === -1 && (
                              <span className="text-blue-400">✓</span>
                            )}
                          </button>
                          {/* Quality levels (highest first) */}
                          {[...qualityLevels]
                            .sort((a, b) => b.height - a.height)
                            .map((level) => {
                              const originalIdx = qualityLevels.findIndex(
                                (l) =>
                                  l.height === level.height &&
                                  l.bitrate === level.bitrate,
                              );
                              return (
                                <button
                                  key={originalIdx}
                                  className={cn(
                                    "w-full flex items-center justify-between px-4 py-2 text-sm transition-colors",
                                    currentQuality === originalIdx
                                      ? "text-blue-400 bg-blue-500/10"
                                      : "text-white hover:bg-white/10",
                                  )}
                                  onClick={() =>
                                    handleQualityChange(originalIdx)
                                  }
                                >
                                  <span>{getQualityLabel(level)}</span>
                                  {currentQuality === originalIdx && (
                                    <span className="text-blue-400">✓</span>
                                  )}
                                </button>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Fullscreen */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-white hover:bg-white/20"
                  onClick={handleFullscreen}
                  title={
                    isFullscreen
                      ? "Thoát toàn màn hình (F)"
                      : "Toàn màn hình (F)"
                  }
                >
                  {isFullscreen ? (
                    <Minimize className="h-4 w-4" />
                  ) : (
                    <Maximize className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Keyboard shortcut hint (shown briefly) */}
        </div>
      )}

      {/* Close settings when clicking outside */}
      {showSettingsMenu && (
        <div
          className="absolute inset-0 z-40"
          onClick={() => {
            setShowSettingsMenu(false);
            setSettingsSubMenu(null);
          }}
        />
      )}

      <style jsx>{`
        .accent-blue-500::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
        }

        .accent-blue-500::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}

/**
 * EmbedPlayer - Handles iframe embeds (Bunny CDN) with postMessage progress tracking
 */
function EmbedPlayer({
  url,
  embedHtml,
  enableBunnyPlayerApi,
  trustedMessageOrigin,
  canFallback,
  isPrimaryHealthy,
  onManualFallback,
  onPrimaryError,
  onPrimaryReady,
  onPrimaryProgress,
  onDuration,
  onEnded,
  className,
  containerRef,
}: {
  url: string;
  embedHtml: string | null;
  enableBunnyPlayerApi: boolean;
  trustedMessageOrigin?: string;
  canFallback: boolean;
  isPrimaryHealthy: boolean;
  onManualFallback: () => void;
  onPrimaryError: () => void;
  onPrimaryReady: () => void;
  onPrimaryProgress: (progress: ProgressState) => void;
  onDuration?: VideoPlayerProps["onDuration"];
  onEnded?: VideoPlayerProps["onEnded"];
  className?: string;
  containerRef: React.RefObject<HTMLDivElement>;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const embedDurationRef = useRef(0);
  const [playerJsLoaded, setPlayerJsLoaded] = useState(false);
  const [playerJsResolved, setPlayerJsResolved] = useState(!enableBunnyPlayerApi);
  const endedHandledRef = useRef(false);

  const enhancedUrl = useMemo(() => {
    if (!url) return url;
    try {
      const parsed = new URL(url);
      if (
        parsed.hostname === "iframe.mediadelivery.net" ||
        parsed.hostname.endsWith(".mediadelivery.net")
      ) {
        if (!parsed.searchParams.has("responsive")) {
          parsed.searchParams.set("responsive", "true");
        }
      }
      return parsed.toString();
    } catch {
      return url;
    }
  }, [url]);

  const allowedOrigins = useMemo(() => {
    const origins = new Set<string>(["https://iframe.mediadelivery.net"]);
    if (trustedMessageOrigin) {
      try {
        const trusted = new URL(trustedMessageOrigin);
        if (trusted.protocol === "https:") origins.add(trusted.origin);
      } catch {
        // Invalid origins are ignored; the standard Bunny player origin remains.
      }
    }
    return origins;
  }, [trustedMessageOrigin]);

  useEffect(() => {
    if (!enableBunnyPlayerApi || embedHtml) return;
    let cancelled = false;
    loadBunnyPlayerJs().then((loaded) => {
      if (!cancelled) {
        setPlayerJsLoaded(loaded);
        setPlayerJsResolved(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [enableBunnyPlayerApi, embedHtml]);

  useEffect(() => {
    if (!enableBunnyPlayerApi || embedHtml || !playerJsLoaded) return;
    const iframe = iframeRef.current;
    const Player = window.playerjs?.Player;
    if (!iframe || !Player) return;

    try {
      const player = new Player(iframe);
      const eventNames = ["ready", "play", "timeupdate", "ended"] as const;
      const eventCallbacks = new Map<string, (value?: unknown) => void>();
      // Player.js subscriptions cause Bunny to send only the events we use below.
      for (const eventName of eventNames) {
        const callback = () => {};
        eventCallbacks.set(eventName, callback);
        player.on(eventName, callback);
      }
      return () => {
        for (const eventName of eventNames) {
          const callback = eventCallbacks.get(eventName);
          if (!callback) continue;
          try {
            player.off?.(eventName, callback);
          } catch {
            // Bunny's Player.js may lose its iframe target while React tears it down.
          }
        }
      };
    } catch {
      onPrimaryError();
    }
  }, [enableBunnyPlayerApi, embedHtml, onPrimaryError, playerJsLoaded, enhancedUrl]);

  useEffect(() => {
    if (!enableBunnyPlayerApi || embedHtml) return;

    const handleMessage = (event: MessageEvent) => {
      const iframe = iframeRef.current;
      if (!iframe?.contentWindow || event.source !== iframe.contentWindow) return;
      if (!allowedOrigins.has(event.origin)) return;
      if (!event.data || typeof event.data !== "object" || Array.isArray(event.data)) return;

      const message = event.data as Record<string, unknown>;
      if (
        message.context !== "player.js" ||
        (typeof message.version !== "string" && typeof message.version !== "number") ||
        typeof message.event !== "string" ||
        !["ready", "play", "pause", "timeupdate", "ended"].includes(message.event)
      ) {
        return;
      }

      if (message.event === "play") {
        onPrimaryReady();
        return;
      }
      if (message.event === "timeupdate") {
        let value: unknown = message.value;
        if (typeof value === "string") {
          try {
            value = JSON.parse(value);
          } catch {
            return;
          }
        }
        if (!value || typeof value !== "object" || Array.isArray(value)) return;
        const timing = value as Record<string, unknown>;
        const seconds = Number(timing.seconds);
        const duration = Number(timing.duration);
        if (
          !Number.isFinite(seconds) ||
          !Number.isFinite(duration) ||
          seconds < 0 ||
          duration <= 0 ||
          seconds > duration + 1
        ) {
          return;
        }

        embedDurationRef.current = duration;
        onDuration?.(duration);
        onPrimaryProgress({
          played: Math.min(1, seconds / duration),
          playedSeconds: seconds,
          loaded: 1,
          loadedSeconds: duration,
        });
        return;
      }
      if (message.event === "ended" && !endedHandledRef.current) {
        endedHandledRef.current = true;
        if (embedDurationRef.current > 0) {
          onPrimaryProgress({
            played: 1,
            playedSeconds: embedDurationRef.current,
            loaded: 1,
            loadedSeconds: embedDurationRef.current,
          });
        }
        onEnded?.();
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [
    allowedOrigins,
    embedHtml,
    enableBunnyPlayerApi,
    onDuration,
    onEnded,
    onPrimaryError,
    onPrimaryReady,
    onPrimaryProgress,
  ]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full overflow-hidden rounded-lg bg-black",
        className,
      )}
    >
      <div className="aspect-video">
        {embedHtml ? (
          <div
            className="h-full w-full"
            dangerouslySetInnerHTML={{ __html: embedHtml }}
          />
        ) : enableBunnyPlayerApi && !playerJsResolved ? (
          <div className="h-full w-full bg-black" aria-label="Đang tải trình phát video" />
        ) : (
          <iframe
            ref={iframeRef}
            src={enhancedUrl || url}
            className="h-full w-full"
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            allowFullScreen
            loading="lazy"
            title="Trình phát video"
            referrerPolicy="origin"
            onError={() => {
              if (enableBunnyPlayerApi && canFallback) onPrimaryError();
            }}
          />
        )}
      </div>
      {canFallback && !isPrimaryHealthy ? (
        <button
          type="button"
          className="absolute bottom-3 right-3 z-10 rounded-md bg-black/80 px-3 py-2 text-sm text-white shadow-lg ring-1 ring-white/20 hover:bg-black"
          onClick={onManualFallback}
        >
          Video không phát? Chuyển máy chủ dự phòng
        </button>
      ) : null}
    </div>
  );
}
