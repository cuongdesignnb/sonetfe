/**
 * 🔍 DEBUG SCRIPT - Chạy trong Console của Cốc Cốc để test detection
 * Copy toàn bộ code này và paste vào Console (F12)
 */

console.log("=== CỐC CỐC DETECTION DEBUG ===");

// 1. User Agent
console.log("1. User Agent:", navigator.userAgent);
console.log(
  "   Contains CocCoc:",
  /CocCoc|coc_coc_browser/i.test(navigator.userAgent),
);

// 2. userAgentData (Client Hints)
if (navigator.userAgentData) {
  console.log("2. userAgentData brands:", navigator.userAgentData.brands);
  navigator.userAgentData
    .getHighEntropyValues(["brands", "fullVersionList"])
    .then((data) => {
      console.log("   High entropy brands:", data.brands);
      console.log("   Full version list:", data.fullVersionList);
    });
} else {
  console.log("2. userAgentData: NOT AVAILABLE");
}

// 3. Window objects
console.log(
  "3. window.browser:",
  typeof window.browser !== "undefined" ? window.browser : "undefined",
);
console.log(
  "   window.coccoc:",
  typeof window.coccoc !== "undefined" ? window.coccoc : "undefined",
);
console.log(
  "   window.CocCocBrowser:",
  typeof window.CocCocBrowser !== "undefined",
);
console.log("   window.chrome:", typeof window.chrome !== "undefined");
console.log("   window.chrome.runtime.id:", window.chrome?.runtime?.id);

// 4. Plugins
console.log("4. Plugins:");
for (let i = 0; i < navigator.plugins.length; i++) {
  const plugin = navigator.plugins[i];
  console.log(`   - ${plugin.name}: ${plugin.description}`);
}

// 5. Check DOM for CocCoc elements
const coccocElements = document.querySelectorAll(
  '[class*="savior"], [id*="savior"], [class*="coccoc"], [id*="coccoc"]',
);
console.log("5. CocCoc DOM elements found:", coccocElements.length);
coccocElements.forEach((el) =>
  console.log("   -", el.tagName, el.className, el.id),
);

// 6. LocalStorage keys
console.log("6. LocalStorage keys with 'coccoc' or 'savior':");
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (/coccoc|savior/i.test(key)) {
    console.log(`   - ${key}`);
  }
}

// 7. Performance resources
const resources = performance.getEntriesByType("resource");
const coccocResources = resources.filter((r) => /coccoc|savior/i.test(r.name));
console.log("7. CocCoc resources loaded:", coccocResources.length);
coccocResources.forEach((r) => console.log("   -", r.name));

// 8. Document attributes
console.log(
  "8. HTML attributes:",
  document.documentElement.getAttributeNames(),
);

console.log("=== END DEBUG ===");
