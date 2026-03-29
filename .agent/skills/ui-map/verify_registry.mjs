import fs from "fs";
import path from "path";

const registryPath = ".agent/skills/ui-map/ui-registry.json";
const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));

const collectFiles = (dir, matcher, result = []) => {
  for (const entry of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      collectFiles(fullPath, matcher, result);
      continue;
    }

    if (matcher(fullPath)) {
      result.push(fullPath);
    }
  }

  return result;
};

const cssFiles = collectFiles("src", (filePath) => filePath.endsWith(".css"));
const declaredSelectors = new Set();
for (const filePath of cssFiles) {
  const css = fs.readFileSync(filePath, "utf8");
  const matches = css.match(/\.[A-Za-z_][\w-]*/g) || [];
  matches.forEach((selector) => declaredSelectors.add(selector));
}

let hasError = false;

const checkFile = (filePath, reason) => {
  if (!filePath) return;
  if (!fs.existsSync(filePath)) {
    console.log(`[!] ${reason}: ${filePath}`);
    hasError = true;
  }
};

const extractSearchToken = (snippet) => {
  const match = snippet.match(/[A-Za-z_][\w-]*/);
  return match ? match[0] : snippet;
};

const checkSourceReference = (filePath, snippet, reason) => {
  if (!filePath || !snippet || !fs.existsSync(filePath)) return;

  const content = fs.readFileSync(filePath, "utf8");
  const token = extractSearchToken(snippet);

  if (!content.includes(token)) {
    console.log(`[!] ${reason}: ${snippet} -> ${token} (${filePath})`);
    hasError = true;
  }
};

console.log(`1. Reading registry: ${registryPath}`);
console.log(`- Areas: ${registry.registry.length}`);

for (const area of registry.registry) {
  checkFile(area.path, "缺少 area path");

  if (area.selector && !declaredSelectors.has(area.selector)) {
    console.log(`[!] area selector 未找到: ${area.selector} (${area.area})`);
    hasError = true;
  }

  if (area.state_trigger) {
    checkSourceReference("src/App.tsx", area.state_trigger, "缺少 state_trigger");
  }

  if (!area.entities) continue;

  for (const entity of area.entities) {
    checkFile(entity.path, "缺少 entity path");

    if (entity.selector && !declaredSelectors.has(entity.selector)) {
      console.log(`[!] entity selector 未找到: ${entity.selector} (${entity.id})`);
      hasError = true;
    }

    if (entity.logic) {
      const searchPath = entity.path || area.path || "src/App.tsx";
      checkSourceReference(searchPath, entity.logic, "缺少 logic");
    }

    if (entity.action) {
      const searchPath = entity.path || area.path || "src/App.tsx";
      checkSourceReference(searchPath, entity.action, "缺少 action");
    }
  }
}

console.log("2. Done!");

if (hasError) {
  console.log("❌ UI registry 存在缺失 path、selector 或逻辑引用。");
  process.exit(1);
}

console.log("✅ UI registry looks consistent.");
