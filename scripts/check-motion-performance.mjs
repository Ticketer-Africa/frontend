import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const scanTargets = ["app", "components", "tailwind.config.ts"];
const allowedExtensions = new Set([".css", ".ts", ".tsx"]);
const ignoredSegments = new Set([
  ".git",
  ".next",
  "docs",
  "node_modules",
  "package-lock.json",
]);

const prohibitedPatterns = [
  {
    name: "transition-all",
    regex: /transition-all/g,
  },
  {
    name: "layout-property transition utility",
    regex:
      /transition-\[[^\]]*(?:width|height|margin|padding|top|left|right|bottom)[^\]]*\]/g,
  },
  {
    name: "Framer Motion initial height animation",
    regex: /initial=\{\{[^}]*height\s*:/gs,
  },
  {
    name: "Framer Motion animate height animation",
    regex: /animate=\{\{[^}]*height\s*:/gs,
  },
  {
    name: "Framer Motion exit height animation",
    regex: /exit=\{\{[^}]*height\s*:/gs,
  },
  {
    name: "Tailwind/CSS height animation frame",
    regex: /height:\s*["'](?:0|auto|var\(--radix-accordion-content-height\))["']/g,
  },
  {
    name: "max-height animation",
    regex: /max-height/g,
  },
];

function shouldIgnore(filePath) {
  return filePath
    .split(path.sep)
    .some((segment) => ignoredSegments.has(segment));
}

function collectFiles(target) {
  const fullPath = path.join(root, target);
  const stats = statSync(fullPath);

  if (stats.isFile()) {
    return allowedExtensions.has(path.extname(fullPath)) ? [fullPath] : [];
  }

  const files = [];
  for (const entry of readdirSync(fullPath)) {
    const child = path.join(fullPath, entry);
    if (shouldIgnore(child)) continue;

    const childStats = statSync(child);
    if (childStats.isDirectory()) {
      files.push(...collectFiles(path.relative(root, child)));
      continue;
    }

    if (allowedExtensions.has(path.extname(child))) {
      files.push(child);
    }
  }

  return files;
}

function lineAndColumn(source, index) {
  const before = source.slice(0, index);
  const lines = before.split("\n");
  return {
    line: lines.length,
    column: lines[lines.length - 1].length + 1,
  };
}

const failures = [];

for (const target of scanTargets) {
  for (const file of collectFiles(target)) {
    const source = readFileSync(file, "utf8");
    const relativePath = path.relative(root, file);

    for (const pattern of prohibitedPatterns) {
      pattern.regex.lastIndex = 0;
      let match;

      while ((match = pattern.regex.exec(source)) !== null) {
        const location = lineAndColumn(source, match.index);
        failures.push({
          file: relativePath,
          line: location.line,
          column: location.column,
          rule: pattern.name,
          match: match[0].replace(/\s+/g, " ").trim(),
        });
      }
    }
  }
}

if (failures.length > 0) {
  console.error("Motion performance check failed:");
  for (const failure of failures) {
    console.error(
      `${failure.file}:${failure.line}:${failure.column} ${failure.rule} (${failure.match})`,
    );
  }
  process.exit(1);
}

console.log("Motion performance check passed.");
