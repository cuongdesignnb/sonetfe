import fs from "node:fs";
import vm from "node:vm";

const path = ".next/static/chunks/app/layout.js";
const content = fs.readFileSync(path, "utf8");
const lines = content.split(/\r?\n/);

function extractFirstStringLiteralFromTsEval(line) {
  const marker = "eval(__webpack_require__.ts(";
  const idx = line.indexOf(marker);
  if (idx === -1) return null;

  const start = idx + marker.length;
  const quoteStart = line.indexOf('"', start);
  if (quoteStart === -1) return null;

  let i = quoteStart + 1;
  let escaped = false;
  while (i < line.length) {
    const ch = line[i];
    if (escaped) {
      escaped = false;
    } else if (ch === "\\") {
      escaped = true;
    } else if (ch === '"') {
      break;
    }
    i++;
  }

  if (i >= line.length) return null;
  return line.slice(quoteStart, i + 1);
}

let checked = 0;
for (let ln = 0; ln < lines.length; ln++) {
  const line = lines[ln];
  if (!line.includes("eval(__webpack_require__.ts(")) continue;

  const literal = extractFirstStringLiteralFromTsEval(line);
  if (!literal) continue;

  let codeStr;
  try {
    codeStr = vm.runInNewContext(literal);
  } catch (e) {
    console.error("FAILED to eval payload literal at layout.js line", ln + 1);
    console.error(String(e));
    process.exit(1);
  }

  checked++;

  try {
    // compile-only: this matches what eval would need to parse
    new Function(codeStr);
  } catch (e) {
    console.error("FOUND invalid eval payload in layout.js line", ln + 1);
    console.error(String(e));
    console.error("--- payload head ---");
    console.error(codeStr.slice(0, 500));
    console.error("--- payload tail ---");
    console.error(codeStr.slice(-500));
    process.exit(2);
  }
}

console.log("Checked eval payloads:", checked);
console.log("All eval payloads parse OK");
