"use client";

import { useEffect } from "react";

interface CustomScriptsProps {
  headScripts?: string;
  bodyStartScripts?: string;
  bodyEndScripts?: string;
  customCss?: string;
}

/**
 * Component to inject custom scripts and CSS from admin settings.
 * Handles raw HTML content containing script tags.
 */
export function CustomScripts({
  headScripts,
  bodyStartScripts,
  bodyEndScripts,
  customCss,
}: CustomScriptsProps) {
  useEffect(() => {
    // Inject custom CSS
    if (customCss) {
      injectCustomCss(customCss);
    }

    // Inject head scripts
    if (headScripts) {
      injectScripts(headScripts, "head");
    }

    // Inject body start scripts
    if (bodyStartScripts) {
      injectScripts(bodyStartScripts, "body-start");
    }

    // Inject body end scripts
    if (bodyEndScripts) {
      injectScripts(bodyEndScripts, "body-end");
    }
  }, [headScripts, bodyStartScripts, bodyEndScripts, customCss]);

  return null;
}

function injectCustomCss(css: string) {
  const markerId = "custom-admin-css";
  if (document.getElementById(markerId)) {
    return;
  }

  const style = document.createElement("style");
  style.id = markerId;
  style.textContent = css;
  document.head.appendChild(style);
}

function injectScripts(content: string, location: "head" | "body-start" | "body-end") {
  // Check if already injected
  const markerId = `custom-scripts-${location}`;
  if (document.getElementById(markerId)) {
    return;
  }

  // Create a marker to prevent duplicate injection
  const marker = document.createElement("div");
  marker.id = markerId;
  marker.style.display = "none";
  document.body.appendChild(marker);

  // Create a temporary container to parse the HTML
  const container = document.createElement("div");
  container.innerHTML = content;

  // Process all child nodes
  const nodes = Array.from(container.childNodes);

  nodes.forEach((node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;

      if (element.tagName === "SCRIPT") {
        // Handle script elements specially
        const script = document.createElement("script");

        // Copy all attributes
        Array.from(element.attributes).forEach((attr) => {
          script.setAttribute(attr.name, attr.value);
        });

        // Set the content or src
        if (element.hasAttribute("src")) {
          script.src = element.getAttribute("src")!;
        } else {
          script.textContent = element.textContent;
        }

        // Append to the appropriate location
        if (location === "head") {
          document.head.appendChild(script);
        } else {
          document.body.appendChild(script);
        }
      } else if (element.tagName === "NOSCRIPT") {
        // Handle noscript elements
        const noscript = document.createElement("noscript");
        noscript.innerHTML = element.innerHTML;
        
        if (location === "head") {
          document.head.appendChild(noscript);
        } else if (location === "body-start") {
          document.body.insertBefore(noscript, document.body.firstChild);
        } else {
          document.body.appendChild(noscript);
        }
      } else if (element.tagName === "LINK" || element.tagName === "META") {
        // Handle link and meta elements (should go to head)
        const cloned = element.cloneNode(true) as HTMLElement;
        document.head.appendChild(cloned);
      } else {
        // Handle other elements
        const cloned = element.cloneNode(true) as HTMLElement;
        if (location === "body-start") {
          document.body.insertBefore(cloned, document.body.firstChild);
        } else {
          document.body.appendChild(cloned);
        }
      }
    } else if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
      // Handle text nodes (might be inline script content without tags)
      // Skip whitespace-only text nodes
    }
  });
}
