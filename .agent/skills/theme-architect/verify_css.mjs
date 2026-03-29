import fs from "fs";
import path from "path";

console.log("1. Reading defined tokens...");
const coreCss = fs.readFileSync("src/styles/tokens/core.css", "utf-8");
const semanticCss = fs.readFileSync("src/styles/tokens/semantic.css", "utf-8");
const recipesCss = fs.readFileSync("src/styles/tokens/recipes.css", "utf-8");
const apiCss = fs.readFileSync("src/styles/tokens/components-api.css", "utf-8");
const apiDefinedTokens = new Set(
  Array.from(apiCss.matchAll(/--([\w-]+):/g)).map((match) => `--${match[1]}`)
);

const definedVars = new Set();
[coreCss, semanticCss, recipesCss, apiCss].forEach((css) => {
  const matches = css.match(/--[\w-]+:/g) || [];
  matches.forEach((m) => definedVars.add(m.replace(":", "")));
});

console.log(`- Total global defined variables: ${definedVars.size}`);

const checkUsage = (filePath) => {
  const css = fs.readFileSync(filePath, "utf-8");

  // 组件内部定义的局部变量（比如 --readout-action-gap, --wheel-offset 等）不应报错
  const localMatch = css.match(/--[\w-]+:/g) || [];
  const localVars = new Set(localMatch.map((m) => m.replace(":", "")));

  // 匹配所有的引用
  const matches = css.match(/var\(--[\w-]+/g) || [];
  const missing = new Set();

  matches.forEach((m) => {
    const varName = m.replace("var(", "");
    // 如果既不在全局 Core/Semantic/API 里，也不在本文件的局部定义里，才算是缺失
    if (!definedVars.has(varName) && !localVars.has(varName)) {
      missing.add(varName);
    }
  });

  if (missing.size > 0) {
    console.log(`[!] 缺少定义 (${filePath}):`, Array.from(missing).join(", "));
    return true;
  }
  return false;
};

const deprecatedThemeTokens = [
  "--app-panel-bg",
  "--app-panel-blur",
  "--app-panel-border",
  "--app-panel-shadow",
  "--app-panel-radius",
  "--app-modal-bg",
  "--app-modal-border",
  "--app-modal-radius",
  "--app-modal-shadow",
  "--app-modal-inner-shadow",
  "--app-input-bg",
  "--app-input-border",
  "--app-input-border-width",
  "--app-input-radius",
  "--app-input-color",
  "--app-input-shadow",
  "--app-input-focus-border",
  "--app-input-focus-bg",
  "--trainer-dock-bg",
  "--trainer-dock-blur",
  "--trainer-dock-radius",
  "--trainer-dock-border",
  "--trainer-dock-shadow",
  "--dock-blur",
  "--dock-bg",
  "--dock-border",
  "--dock-shadow",
  "--dock-shadow-outline",
  "--dock-radius",
  "--help-content-border",
  "--help-content-shadow",
  "--help-content-bg",
  "--help-content-radius",
  "--help-content-backdrop-blur",
  "--select-dropdown-radius",
  "--select-dropdown-border-width",
  "--select-dropdown-border-color",
  "--select-dropdown-shadow",
  "--select-dropdown-bg",
  "--select-dropdown-blur",
  "--select-dropdown-sheen",
  "--presets-input-bg",
];

const deprecatedThemeTokenPatterns = [
  /--(?:speed|interval|presets|help|history)-[\w-]+\s*:/g,
  /--(?:swing-label-color|swing-value-color|swing-value-bg|swing-value-border|swing-value-shadow|swing-value-radius|swing-desc-color|swing-divider-bg|swing-reset-border|swing-reset-shadow|swing-reset-active-opacity)\s*:/g,
  /--swing-slider-[\w-]+\s*:/g,
  /--(?:btn|bpm|visualizer|slider|checkbox)-[\w-]+\s*:/g,
];

const checkDeprecatedThemeTokens = (filePath) => {
  const css = fs.readFileSync(filePath, "utf-8");
  const found = new Set(deprecatedThemeTokens.filter((token) => css.includes(`${token}:`)));

  deprecatedThemeTokenPatterns.forEach((pattern) => {
    const matches = css.match(pattern) || [];
    matches.forEach((match) => found.add(match.replace(/\s*:\s*$/, "")));
  });

  if (found.size > 0) {
    console.log(`[!] 发现已废弃的主题 token (${filePath}):`, Array.from(found).join(", "));
    return true;
  }

  return false;
};

const dictionaryBackedComponentFamilies = [/^--app-/, /^--ui-/, /^--modal-shell-/, /^--select-/];

const checkUndeclaredThemeComponentSlots = (filePath) => {
  const css = fs.readFileSync(filePath, "utf-8");
  const declared = Array.from(css.matchAll(/--([\w-]+):/g)).map((match) => `--${match[1]}`);

  const offenders = declared.filter(
    (token) =>
      dictionaryBackedComponentFamilies.some((pattern) => pattern.test(token)) &&
      !apiDefinedTokens.has(token)
  );

  if (offenders.length > 0) {
    console.log(
      `[!] 发现未在 components-api.css 声明的主题组件 slot (${filePath}):`,
      Array.from(new Set(offenders)).join(", ")
    );
    return true;
  }

  return false;
};

const semanticOnlyTokenFamilies = [
  /^--bg-/,
  /^--fill-/,
  /^--border-/,
  /^--radius-/,
  /^--text-/,
  /^--accent-/,
  /^--shadow-/,
  /^--surface-/,
  /^--field-/,
  /^--control-/,
];

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const checkApiSemanticDrift = () => {
  const matches = apiCss.match(/--[\w-]+:/g) || [];
  const offenders = matches
    .map((m) => m.replace(":", ""))
    .filter((token) => semanticOnlyTokenFamilies.some((pattern) => pattern.test(token)));

  if (offenders.length > 0) {
    console.log(
      "[!] components-api.css 不应重复定义共享语义 token:",
      Array.from(new Set(offenders)).join(", ")
    );
    return true;
  }

  return false;
};

const checkApiCoverage = () => {
  const apiTokens = Array.from(apiCss.matchAll(/--([\w-]+):/g)).map((match) => `--${match[1]}`);
  const runtimeFiles = ["src/App.module.css", "src/App.tsx", "src/styles/tokens/recipes.css"];

  const collectRuntimeFiles = (dir) => {
    for (const file of fs.readdirSync(dir)) {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        collectRuntimeFiles(fullPath);
      } else if (fullPath.endsWith(".css") || fullPath.endsWith(".tsx")) {
        runtimeFiles.push(fullPath);
      }
    }
  };

  collectRuntimeFiles("src/components");

  const runtimeText = runtimeFiles.map((filePath) => fs.readFileSync(filePath, "utf-8")).join("\n");
  const unused = apiTokens.filter((token) => {
    const pattern = new RegExp(`var\\(\\s*${escapeRegex(token)}\\b`);
    return !pattern.test(runtimeText);
  });

  if (unused.length > 0) {
    console.log("[!] components-api.css 中存在未被运行时样式消费的 slot:", unused.join(", "));
    return true;
  }

  return false;
};

console.log("\n2. Checking components and App...");
let foundMissing = false;
let foundDeprecated = false;
let foundApiDrift = false;
let foundModuleDrift = false;
let foundApiCoverageIssue = false;
let foundUndeclaredThemeSlots = false;

if (checkUsage("src/App.module.css")) foundMissing = true;
if (checkUsage("src/styles/tokens/semantic.css")) foundMissing = true;
if (checkUsage("src/styles/tokens/recipes.css")) foundMissing = true;
if (checkUsage("src/styles/tokens/components-api.css")) foundMissing = true;
if (checkApiSemanticDrift()) foundApiDrift = true;
if (checkApiCoverage()) foundApiCoverageIssue = true;

const scanDir = (dir) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      scanDir(fullPath);
    } else if (fullPath.endsWith(".css")) {
      if (checkUsage(fullPath)) foundMissing = true;
    }
  }
};

scanDir("src/components");

const extractSelectors = (css) => {
  const matches = css.match(/\.[A-Za-z_][\w-]*/g) || [];
  return new Set(matches.map((match) => match.slice(1)));
};

const extractStyleRefs = (tsx) => {
  const exact = new Set();
  const patterns = [];

  (tsx.match(/(?<!["'`/])styles\.([A-Za-z_][\w-]*)/g) || []).forEach((match) => {
    exact.add(match.replace("styles.", ""));
  });

  Array.from(tsx.matchAll(/styles\["([^"]+)"\]/g)).forEach((match) => {
    exact.add(match[1]);
  });

  Array.from(tsx.matchAll(/styles\[`([^`]+)`\]/g)).forEach((match) => {
    const pattern = `^${escapeRegex(match[1]).replace(/\\\$\\\{[^}]+\\\}/g, ".*")}$`;
    patterns.push(new RegExp(pattern));
  });

  return { exact, patterns };
};

const checkCssModuleDrift = (tsxPath, cssPath) => {
  const tsx = fs.readFileSync(tsxPath, "utf-8");
  if (!tsx.includes("styles")) return false;

  let hasIssue = false;
  const selectors = extractSelectors(fs.readFileSync(cssPath, "utf-8"));
  const { exact, patterns } = extractStyleRefs(tsx);

  const unused = Array.from(selectors)
    .filter((selector) => !exact.has(selector))
    .filter((selector) => !patterns.some((pattern) => pattern.test(selector)));

  if (unused.length > 0) {
    console.log(`[!] 发现未使用的 CSS module selector (${cssPath}):`, unused.join(", "));
    hasIssue = true;
  }

  const missing = Array.from(exact).filter((selector) => !selectors.has(selector));

  if (missing.length > 0) {
    console.log(`[!] 发现引用了但未定义的 CSS module selector (${tsxPath}):`, missing.join(", "));
    hasIssue = true;
  }

  const bareClassMatches = Array.from(tsx.matchAll(/className="([^"]+)"/g))
    .map((match) => match[1])
    .filter((className) => className.trim().length > 0);

  if (bareClassMatches.length > 0) {
    console.log(
      `[!] 发现裸 className，可能绕过 CSS module (${tsxPath}):`,
      bareClassMatches.join(", ")
    );
    hasIssue = true;
  }

  return hasIssue;
};

console.log("\n3. Checking CSS module drift...");
const modulePairs = [];

for (const entry of fs.readdirSync("src/components")) {
  const dirPath = path.join("src/components", entry);
  if (!fs.statSync(dirPath).isDirectory()) continue;

  const tsxPath = path.join(dirPath, "index.tsx");
  const cssPath = path.join(dirPath, "styles.module.css");

  if (fs.existsSync(tsxPath) && fs.existsSync(cssPath)) {
    modulePairs.push([tsxPath, cssPath]);
  }
}

modulePairs.push(["src/App.tsx", "src/App.module.css"]);

for (const [tsxPath, cssPath] of modulePairs) {
  if (checkCssModuleDrift(tsxPath, cssPath)) {
    foundModuleDrift = true;
  }
}

console.log("\n4. Checking themes for deprecated component slot overrides...");
for (const file of fs.readdirSync("src/styles/themes")) {
  const fullPath = path.join("src/styles/themes", file);
  if (fullPath.endsWith(".css")) {
    if (checkDeprecatedThemeTokens(fullPath)) {
      foundDeprecated = true;
    }

    if (checkUndeclaredThemeComponentSlots(fullPath)) {
      foundUndeclaredThemeSlots = true;
    }
  }
}

console.log("\n5. Done!");
if (
  !foundMissing &&
  !foundDeprecated &&
  !foundApiDrift &&
  !foundModuleDrift &&
  !foundApiCoverageIssue &&
  !foundUndeclaredThemeSlots
) {
  console.log("✅ 完美！所有的 CSS 变量引用均已闭环，主题里也没有回退到旧组件 slot。");
} else {
  console.log("❌ 存在遗漏变量、架构漂移或已废弃 token，请检查。");
}
