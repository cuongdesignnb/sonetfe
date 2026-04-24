"use client";

import { useEffect } from "react";

const DETECTED_FLAG = "__coccocDetected";
const DETECT_EVENT = "coccoc-detected";

type CocCocWindow = Window & {
  __coccocDetected?: boolean;
};

function markDetected(reason: string) {
  if (typeof window === "undefined") return;
  (window as CocCocWindow)[DETECTED_FLAG] = true;
  window.dispatchEvent(
    new CustomEvent(DETECT_EVENT, {
      detail: { reason, ts: Date.now() },
    }),
  );
}

export function BrowserSecurityGuard() {
  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      const filename = event.filename || "";
      const message = event.message || "";
      if (
        filename.includes("onboarding.js") ||
        filename.includes("content-script.js") ||
        /coccoc/i.test(message)
      ) {
        markDetected("error-event");
      }
    };

    const unhandledRejectionHandler = (event: PromiseRejectionEvent) => {
      const reasonText = String(event.reason || "");
      const reason = event.reason;
      const stackText =
        reason && typeof reason === "object" && "stack" in (reason as object)
          ? String((reason as { stack?: unknown }).stack || "")
          : "";
      if (
        /onboarding\.js/i.test(reasonText) ||
        /coccoc/i.test(reasonText) ||
        /onboarding\.js/i.test(stackText) ||
        /content-script\.js/i.test(stackText)
      ) {
        markDetected("unhandledrejection");
      }
    };

    window.addEventListener("error", errorHandler);
    window.addEventListener("unhandledrejection", unhandledRejectionHandler);

    return () => {
      window.removeEventListener("error", errorHandler);
      window.removeEventListener(
        "unhandledrejection",
        unhandledRejectionHandler,
      );
    };
  }, []);

  return null;
}
