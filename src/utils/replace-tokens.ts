import fs from "fs-extra";
import path from "path";

const TOKENS: Record<string, string> = {
  __PROJECT_NAME__: "",
  __PROJECT_VERSION__: "0.1.0",
};

const TEXT_EXTENSIONS = new Set([
  ".ts",
  ".js",
  ".json",
  ".vue",
  ".md",
  ".env",
  ".yaml",
  ".yml",
  ".dockerfile",
  ".html",
  ".css",
  ".gitignore",
  ".example",
]);

export async function replaceTokens(
  dir: string,
  projectName: string,
): Promise<void> {
  TOKENS["__PROJECT_NAME__"] = projectName;

  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await replaceTokens(fullPath, projectName);
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    const isTextFile = TEXT_EXTENSIONS.has(ext) || !ext;

    if (!isTextFile) continue;

    let content = await fs.readFile(fullPath, "utf-8");
    let modified = false;

    for (const [token, value] of Object.entries(TOKENS)) {
      if (content.includes(token)) {
        content = content.replaceAll(token, value);
        modified = true;
      }
    }

    if (modified) {
      await fs.writeFile(fullPath, content, "utf-8");
    }
  }
}
