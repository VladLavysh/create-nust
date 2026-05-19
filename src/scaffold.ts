import path from "path";
import fs from "fs-extra";
import { fileURLToPath } from "url";
import { replaceTokens } from "./utils/replace-tokens.js";
import { runInstall } from "./utils/run-install.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface ScaffoldOptions {
  projectName: string;
  targetDir: string;
  installDeps: boolean;
}

export async function scaffold(options: ScaffoldOptions): Promise<void> {
  const { projectName, targetDir, installDeps } = options;

  const templateDir = path.resolve(__dirname, "../template");

  await fs.ensureDir(targetDir);

  await fs.copy(templateDir, targetDir, {
    overwrite: false,
    filter: (src) => {
      const relativePath = path.relative(templateDir, src);

      const excluded = ["node_modules", ".nuxt", ".output", "dist", ".env"];

      return !excluded.some(
        (pattern) =>
          relativePath.startsWith(pattern) ||
          relativePath.includes(path.sep + pattern),
      );
    },
  });

  const gitignoreSrc = path.join(targetDir, "_gitignore");
  const gitignoreDest = path.join(targetDir, ".gitignore");
  if (await fs.pathExists(gitignoreSrc)) {
    await fs.rename(gitignoreSrc, gitignoreDest);
  }

  await replaceTokens(targetDir, projectName);

  if (installDeps) {
    await runInstall(targetDir);
  }
}
