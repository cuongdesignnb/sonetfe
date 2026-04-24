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

interface VideoPlayerProps {
  url: string;
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
  const isEmbed =
    Boolean(embedHtml) ||
    forceEmbed ||
    /mediadelivery\.net\/embed\/|video\.bunnycdn\.com\/embed\/|\/embed\//i.test(
      url,
    );
  const playerRef = useRef<ReactPlayer>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [duration, setDuration] = useState(0);
  const [played, setPlayed] = useState(0);
  const [loaded, setLoaded] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

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

  const handleProgress = (state: ProgressState) => {
    setPlayed(state.played);
    setLoaded(state.loaded);
    onProgress?.(state);
  };

  const handleDuration = (dur: number) => {
    setDuration(dur);
    onDuration?.(dur);
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
        url={url}
        embedHtml={embedHtml}
        className={className}
        containerRef={containerRef}
        onProgress={onProgress}
        onDuration={onDuration}
        onEnded={onEnded}
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
        ref={playerRef}
        url={url}
        width="100%"
        height="100%"
        playing={playing}
        muted={muted}
        volume={volume}
        playbackRate={playbackRate}
        onProgress={handleProgress}
        onDuration={handleDuration}
        onEnded={onEnded}
        poster={poster}
        config={{
          file: {
            attributes: {
              crossOrigin: undefined,
            },
            forceVideo: true,
          },
        }}
      />

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
  className,
  containerRef,
  onProgress,
  onDuration,
  onEnded,
}: {
  url: string;
  embedHtml: string | null;
  className?: string;
  containerRef: React.RefObject<HTMLDivElement>;
  onProgress?: VideoPlayerProps["onProgress"];
  onDuration?: VideoPlayerProps["onDuration"];
  onEnded?: VideoPlayerProps["onEnded"];
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [embedDuration, setEmbedDuration] = useState(0);

  // Ensure embed URL includes responsive + autoplay params for Bunny
  const enhancedUrl = useMemo(() => {
    if (!url) return url;
    try {
      const u = new URL(url);
      // Add Bunny player API params if it's a Bunny embed
      if (
        u.hostname.includes("mediadelivery.net") ||
        u.hostname.includes("bunnycdn.com")
      ) {
        if (!u.searchParams.has("responsive")) {
          u.searchParams.set("responsive", "true");
        }
      }
      return u.toString();
    } catch {
      return url;
    }
  }, [url]);

  // Listen for Bunny CDN player postMessage events
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Bunny CDN sends messages from iframe.mediadelivery.net
      if (typeof event.data !== "object" || !event.data) return;

      const { event: eventName, data } = event.data;

      switch (eventName) {
        case "videoProgress": {
          // Bunny sends { currentTime, duration }
          const currentTime = data?.currentTime ?? 0;
          const dur = data?.duration ?? embedDuration;
          if (dur > 0) {
            setEmbedDuration(dur);
            onProgress?.({
              played: currentTime / dur,
              playedSeconds: currentTime,
              loaded: 1,
              loadedSeconds: dur,
            });
          }
          break;
        }
        case "videoDuration": {
          const dur = data?.duration ?? 0;
          if (dur > 0) {
            setEmbedDuration(dur);
            onDuration?.(dur);
          }
          break;
        }
        case "videoEnded": {
          // Fire final progress at 100%
          if (embedDuration > 0) {
            onProgress?.({
              played: 1,
              playedSeconds: embedDuration,
              loaded: 1,
              loadedSeconds: embedDuration,
            });
          }
          onEnded?.();
          break;
        }
        case "videoPlaying": {
          const dur = data?.duration ?? 0;
          if (dur > 0 && embedDuration === 0) {
            setEmbedDuration(dur);
            onDuration?.(dur);
          }
          break;
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onProgress, onDuration, onEnded, embedDuration]);

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
          />
        )}
      </div>
    </div>
  );
}
