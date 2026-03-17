import fs from "fs";
import path from "path";

console.log("1. Reading defined tokens...");
const coreCss = fs.readFileSync("src/styles/tokens/core.css", "utf-8");
const semanticCss = fs.readFileSync("src/styles/tokens/semantic.css", "utf-8");
const apiCss = fs.readFileSync("src/styles/tokens/components-api.css", "utf-8");

const definedVars = new Set();
[coreCss, semanticCss, apiCss].forEach((css) => {
  const matches = css.match(/--[\w-]+:/g) || [];
  matches.forEach((m) => definedVars.add(m.replace(":", "")));
});

console.log(`- Total global defined variables: ${definedVars.size}`);

const checkUsage = (filePath) => {
  const css = fs.readFileSync(filePath, "utf-8");

  // 组件内部定义的局部变量（比如 --bpm-action-gap, --wheel-offset 等）不应报错
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

console.log("\n2. Checking components and App...");
let foundMissing = false;

if (checkUsage("src/App.module.css")) foundMissing = true;
if (checkUsage("src/styles/tokens/components-api.css")) foundMissing = true;
if (checkUsage("src/styles/tokens/semantic.css")) foundMissing = true;

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

console.log("\n3. Done!");
if (!foundMissing) {
  console.log("✅ 完美！所有的 CSS 变量引用均已闭环！没有遗漏。");
} else {
  console.log("❌ 存在遗漏的变量，请检查。");
}
