"use client";

import { useState, useEffect } from "react";

type CocCocWindow = Window & {
  __coccocDetected?: boolean;
  coc_coc_browser?: unknown;
  CocCocBrowser?: unknown;
  __COCCOC__?: unknown;
  __coccoc_extension__?: unknown;
  ntp?: unknown;
  sidebar_manager?: unknown;
  savior_settings?: unknown;
  chrome?: {
    runtime?: {
      id?: string;
    };
  };
};

type UserAgentBrand = {
  brand: string;
  version?: string;
};

type UserAgentData = {
  brands?: UserAgentBrand[];
  fullVersionList?: UserAgentBrand[];
  getHighEntropyValues?: (hints: string[]) => Promise<UserAgentData>;
};

type NavigatorWithUserAgentData = Navigator & {
  userAgentData?: UserAgentData;
};

export interface BrowserSecurityResult {
  isBlocked: boolean;
  browserName: string | null;
  isLoading: boolean;
  errorCode: string | null;
  errorMessage: string | null;
}

const BLOCKED_BROWSERS = [
  { pattern: /CocCoc|coc_coc_browser|coccoc/i, name: "blocked" },
  { pattern: /FDM|Free Download Manager/i, name: "blocked" },
  {
    pattern: /IDM|Internet Download Manager/i,
    name: "blocked",
  },
];

const SECURITY_ERROR_MESSAGE = "Lỗi 6007: Security violation";

function detectCocCoc(): boolean {
  if (typeof window === "undefined") return false;
  const cocCocWindow = window as CocCocWindow;
  if (cocCocWindow.__coccocDetected) return true;
  const ua = navigator.userAgent;
  if (/CocCoc|coc_coc_browser/i.test(ua)) return true;
  if (cocCocWindow.coc_coc_browser || cocCocWindow.CocCocBrowser) return true;
  if (cocCocWindow.chrome?.runtime?.id === "pdiojgeafockkidgkfceefaeilcpnpjg")
    return true;
  if (navigator.plugins) {
    for (let i = 0; i < navigator.plugins.length; i++) {
      const plugin = navigator.plugins[i];
      if (
        /coc\s*coc|coccoc/i.test(plugin.name) ||
        /coc\s*coc|coccoc/i.test(plugin.description || "")
      )
        return true;
    }
  }
  const saviorElements = document.querySelectorAll(
    '[class*="savior"], [id*="savior"], [class*="coccoc"], [id*="coccoc"], .savior-widget, .--savior-tooltip-host, .--savior-overlay-z-index-top, [data-savior-token], #download-btn, #open-pip, #switch-light, #other-feature, #mobile-wrapper, .coccoc-savior-checkbox, .coccoc-savior-indicator',
  );
  if (saviorElements.length > 0) return true;
  const userAgentData = (navigator as NavigatorWithUserAgentData).userAgentData;
  if (userAgentData?.brands) {
    for (const brand of userAgentData.brands) {
      if (/CocCoc|coc_coc/i.test(brand.brand)) return true;
    }
  }
  const scripts = document.querySelectorAll("script[src]");
  for (let i = 0; i < scripts.length; i++) {
    const src = scripts[i].getAttribute("src") || "";
    if (/onboarding\.js|cleanup\.js|coccoc|savior|coccoc\.com/i.test(src))
      return true;
  }
  try {
    for (let i = 0; i < document.styleSheets.length; i++) {
      const sheet = document.styleSheets[i];
      const href = sheet.href?.toLowerCase() || "";
      if (href.includes("savior") || href.includes("coccoc")) return true;
      const ownerNode = sheet.ownerNode as HTMLElement;
      if (
        ownerNode?.getAttribute?.("data-savior") ||
        ownerNode?.id?.toLowerCase().includes("savior") ||
        ownerNode?.id?.toLowerCase().includes("coccoc") ||
        ownerNode?.className?.toLowerCase().includes("savior") ||
        ownerNode?.className?.toLowerCase().includes("coccoc")
      )
        return true;
    }
  } catch {
    // ignore
  }
  try {
    const resources = performance.getEntriesByType("resource");
    for (const resource of resources) {
      const name = String(resource.name || "").toLowerCase();
      if (/coccoc|savior|onboarding\.js|cleanup\.js/i.test(name)) return true;
    }
  } catch {
    // ignore
  }
  const linkElements = document.querySelectorAll('link[rel="stylesheet"]');
  for (let i = 0; i < linkElements.length; i++) {
    const href = (linkElements[i].getAttribute("href") || "").toLowerCase();
    if (href.includes("savior") || href.includes("coccoc")) return true;
  }
  const videoOverlays = Array.from(
    document.querySelectorAll(
      'div[style*="z-index"][style*="position: absolute"]',
    ),
  );
  for (const overlay of videoOverlays) {
    if (
      overlay.innerHTML.includes("Tải") ||
      overlay.innerHTML.includes("download")
    )
      return true;
  }
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && /coccoc|savior/i.test(key)) return true;
    }
  } catch {
    // ignore
  }
  const htmlAttrs = document.documentElement.getAttributeNames();
  for (const attr of htmlAttrs) {
    if (/coccoc|savior/i.test(attr)) return true;
  }
  if (
    cocCocWindow.ntp ||
    cocCocWindow.sidebar_manager ||
    cocCocWindow.savior_settings
  )
    return true;
  if (cocCocWindow.__COCCOC__ || cocCocWindow.__coccoc_extension__) return true;
  try {
    const root = document.documentElement;
    const styles = getComputedStyle(root);
    for (let i = 0; i < styles.length; i++) {
      const prop = styles[i];
      if (prop.includes("savior") || prop.includes("coccoc")) return true;
    }
  } catch {
    // ignore
  }
  const allElements = document.querySelectorAll("*");
  for (let i = 0; i < Math.min(allElements.length, 500); i++) {
    const el = allElements[i];
    if (el.shadowRoot) {
      try {
        const shadowHTML = el.shadowRoot.innerHTML?.toLowerCase() || "";
        if (
          shadowHTML.includes("savior") ||
          shadowHTML.includes("coccoc") ||
          shadowHTML.includes("tải")
        )
          return true;
      } catch {
        // ignore
      }
    }
  }
  const metas = document.querySelectorAll("meta");
  for (let i = 0; i < metas.length; i++) {
    const content = metas[i].getAttribute("content") || "";
    const name = metas[i].getAttribute("name") || "";
    if (/coccoc|savior/i.test(content) || /coccoc|savior/i.test(name))
      return true;
  }
  try {
    for (let i = 0; i < document.styleSheets.length; i++) {
      try {
        const sheet = document.styleSheets[i];
        const rules = sheet.cssRules || sheet.rules;
        if (rules) {
          for (let j = 0; j < Math.min(rules.length, 100); j++) {
            const ruleText = rules[j].cssText?.toLowerCase() || "";
            if (
              ruleText.includes("savior") ||
              ruleText.includes("coccoc") ||
              ruleText.includes("--savior")
            )
              return true;
          }
        }
      } catch {
        // ignore
      }
    }
  } catch {
    // ignore
  }
  const saviorContainers = document.querySelectorAll(
    '[class*="savior"], [id*="savior"], [class*="coccoc"], [id*="coccoc"]',
  );
  if (saviorContainers.length > 0) return true;
  return false;
}

function detectDownloadTools(): string | null {
  if (typeof window === "undefined") return null;
  const downloadSelectors = [
    '[class*="downloadhelper"]',
    '[class*="video-download"]',
    '[class*="savefrom"]',
    '[id*="downloadhelper"]',
    '[id*="video-download"]',
    '[id*="savefrom"]',
    'a[href*="savefrom.net"]',
    'a[href*="y2mate"]',
  ];
  for (const selector of downloadSelectors) {
    if (document.querySelector(selector)) return "blocked";
  }
  return null;
}

async function checkServerSideUA(): Promise<{
  isBlocked: boolean;
  browserName: string | null;
}> {
  return { isBlocked: false, browserName: null };
}

export function useBrowserSecurity(): BrowserSecurityResult {
  const [result, setResult] = useState<BrowserSecurityResult>({
    isBlocked: false,
    browserName: null,
    isLoading: true,
    errorCode: null,
    errorMessage: null,
  });

  useEffect(() => {
    async function detectBrowser() {
      let isBlocked = false;

      try {
        if (detectCocCoc()) {
          isBlocked = true;
        }

        if (!isBlocked) {
          const serverCheck = await checkServerSideUA();
          if (serverCheck.isBlocked) {
            isBlocked = true;
          }
        }

        if (
          !isBlocked &&
          "userAgentData" in navigator &&
          (navigator as NavigatorWithUserAgentData).userAgentData
        ) {
          try {
            const uaData = await (
              navigator as NavigatorWithUserAgentData
            ).userAgentData?.getHighEntropyValues?.([
              "brands",
              "fullVersionList",
            ]);
            if (!uaData) {
              // skip high-entropy checks if unavailable
            } else {
              for (const blockedBrowser of BLOCKED_BROWSERS) {
                const found =
                  uaData.brands?.some((b) =>
                    blockedBrowser.pattern.test(b.brand),
                  ) ||
                  uaData.fullVersionList?.some((b) =>
                    blockedBrowser.pattern.test(b.brand),
                  );

                if (found) {
                  isBlocked = true;
                  break;
                }
              }
            }
          } catch {
            // ignore
          }
        }

        if (!isBlocked) {
          const ua = navigator.userAgent;
          for (const blockedBrowser of BLOCKED_BROWSERS) {
            if (blockedBrowser.pattern.test(ua)) {
              isBlocked = true;
              break;
            }
          }
        }

        if (!isBlocked) {
          const downloadTool = detectDownloadTools();
          if (downloadTool) {
            isBlocked = true;
          }
        }
      } catch {
        // ignore
      }

      setResult({
        isBlocked,
        browserName: null, // Không tiết lộ
        isLoading: false,
        errorCode: isBlocked ? "6007" : null,
        errorMessage: isBlocked ? SECURITY_ERROR_MESSAGE : null,
      });
    }

    const checkExistingResources = (): boolean => {
      const links = document.querySelectorAll('link[rel="stylesheet"]');
      for (let i = 0; i < links.length; i++) {
        const href = (links[i].getAttribute("href") || "").toLowerCase();
        if (href.includes("savior") || href.includes("coccoc")) {
          return true;
        }
      }

      for (let i = 0; i < document.styleSheets.length; i++) {
        try {
          const sheet = document.styleSheets[i];
          const href = (sheet.href || "").toLowerCase();
          if (href.includes("savior") || href.includes("coccoc")) {
            return true;
          }
        } catch {
          // ignore
        }
      }

      return false;
    };

    let alreadyDetected = false;

    const markAsBlocked = () => {
      if (alreadyDetected) return;
      alreadyDetected = true;
      setResult({
        isBlocked: true,
        browserName: null,
        isLoading: false,
        errorCode: "6007",
        errorMessage: SECURITY_ERROR_MESSAGE,
      });
    };

    if (checkExistingResources()) {
      markAsBlocked();
    }

    detectBrowser();

    const recheckTimeout = setTimeout(() => {
      if (detectCocCoc()) {
        setResult({
          isBlocked: true,
          browserName: null,
          isLoading: false,
          errorCode: "6007",
          errorMessage: SECURITY_ERROR_MESSAGE,
        });
      }
    }, 1000);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of Array.from(mutations)) {
        if (mutation.type === "childList") {
          for (const node of Array.from(mutation.addedNodes)) {
            if (node instanceof HTMLScriptElement) {
              const src = (node.src || "").toLowerCase();
              if (/onboarding\.js|cleanup\.js|coccoc|savior/i.test(src)) {
                setResult({
                  isBlocked: true,
                  browserName: null,
                  isLoading: false,
                  errorCode: "6007",
                  errorMessage: SECURITY_ERROR_MESSAGE,
                });
                observer.disconnect();
                return;
              }
            }

            if (node instanceof HTMLLinkElement) {
              const href = (node.href || "").toLowerCase();
              if (href.includes("savior") || href.includes("coccoc")) {
                setResult({
                  isBlocked: true,
                  browserName: null,
                  isLoading: false,
                  errorCode: "6007",
                  errorMessage: SECURITY_ERROR_MESSAGE,
                });
                observer.disconnect();
                return;
              }
            }

            if (node instanceof HTMLStyleElement) {
              const content = node.textContent?.toLowerCase() || "";
              const id = node.id?.toLowerCase() || "";
              if (
                content.includes("savior") ||
                content.includes("coccoc") ||
                id.includes("savior") ||
                id.includes("coccoc")
              ) {
                setResult({
                  isBlocked: true,
                  browserName: null,
                  isLoading: false,
                  errorCode: "6007",
                  errorMessage: SECURITY_ERROR_MESSAGE,
                });
                observer.disconnect();
                return;
              }
            }

            if (node instanceof HTMLElement) {
              const html = node.outerHTML?.toLowerCase() || "";
              if (html.includes("savior") || html.includes("coccoc")) {
                setResult({
                  isBlocked: true,
                  browserName: null,
                  isLoading: false,
                  errorCode: "6007",
                  errorMessage: SECURITY_ERROR_MESSAGE,
                });
                observer.disconnect();
                return;
              }
            }
          }
        }
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });

    const intervalId = setInterval(() => {
      if (detectCocCoc()) {
        setResult({
          isBlocked: true,
          browserName: null,
          isLoading: false,
          errorCode: "6007",
          errorMessage: SECURITY_ERROR_MESSAGE,
        });
        clearInterval(intervalId);
        observer.disconnect();
        perfObserver?.disconnect();
      }
    }, 500);

    let perfObserver: PerformanceObserver | null = null;
    try {
      perfObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const name = (entry as PerformanceResourceTiming).name || "";
          const nameLower = name.toLowerCase();

          if (
            nameLower.includes("coccoc") ||
            nameLower.includes("savior") ||
            nameLower.includes("onboarding.js") ||
            nameLower.includes("cleanup.js")
          ) {
            setResult({
              isBlocked: true,
              browserName: null,
              isLoading: false,
              errorCode: "6007",
              errorMessage: SECURITY_ERROR_MESSAGE,
            });
            clearInterval(intervalId);
            observer.disconnect();
            perfObserver?.disconnect();
            return;
          }
        }
      });
      perfObserver.observe({ entryTypes: ["resource"] });
    } catch {
      // ignore
    }

    const errorHandler = (event: ErrorEvent) => {
      const filename = (event.filename || "").toLowerCase();
      const message = (event.message || "").toLowerCase();
      const stack = (event.error?.stack || "").toLowerCase();

      const isSecurityError =
        filename.includes("onboarding.js") ||
        filename.includes("savior") ||
        filename.includes("coccoc") ||
        message.includes("coccoc") ||
        stack.includes("onboarding") ||
        stack.includes("savior") ||
        stack.includes("coccoc");

      if (isSecurityError) {
        setResult({
          isBlocked: true,
          browserName: null,
          isLoading: false,
          errorCode: "6007",
          errorMessage: SECURITY_ERROR_MESSAGE,
        });
        clearInterval(intervalId);
        observer.disconnect();
      }
    };
    window.addEventListener("error", errorHandler, true);

    const unhandledRejectionHandler = (event: PromiseRejectionEvent) => {
      const reasonText = String(event.reason || "").toLowerCase();
      const reason = event.reason;
      const stackText =
        reason && typeof reason === "object" && "stack" in (reason as object)
          ? String((reason as { stack?: unknown }).stack || "")
          : "";
      const normalizedStackText = stackText.toLowerCase();

      const isSecurityRejection =
        reasonText.includes("onboarding") ||
        reasonText.includes("coccoc") ||
        reasonText.includes("savior") ||
        normalizedStackText.includes("onboarding") ||
        normalizedStackText.includes("coccoc") ||
        normalizedStackText.includes("savior");

      if (isSecurityRejection) {
        setResult({
          isBlocked: true,
          browserName: null,
          isLoading: false,
          errorCode: "6007",
          errorMessage: SECURITY_ERROR_MESSAGE,
        });
        clearInterval(intervalId);
        observer.disconnect();
      }
    };
    window.addEventListener(
      "unhandledrejection",
      unhandledRejectionHandler,
      true,
    );

    const detectedEventHandler = () => {
      setResult({
        isBlocked: true,
        browserName: null,
        isLoading: false,
        errorCode: "6007",
        errorMessage: SECURITY_ERROR_MESSAGE,
      });
    };
    window.addEventListener("coccoc-detected", detectedEventHandler);

    return () => {
      clearTimeout(recheckTimeout);
      clearInterval(intervalId);
      observer.disconnect();
      perfObserver?.disconnect();
      window.removeEventListener("error", errorHandler, true);
      window.removeEventListener(
        "unhandledrejection",
        unhandledRejectionHandler,
        true,
      );
      window.removeEventListener("coccoc-detected", detectedEventHandler);
    };
  }, []);

  return result;
}

export function isBlockedBrowserSync(): boolean {
  if (typeof window === "undefined") return false;
  return (
    detectCocCoc() ||
    BLOCKED_BROWSERS.some((browser) =>
      browser.pattern.test(navigator.userAgent),
    )
  );
}
