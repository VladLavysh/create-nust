import path from "path";
import fs from "fs-extra";
import { fileURLToPath } from "url";
import { replaceTokens } from "./utils/replace-tokens.js";
import { runInstall } from "./utils/run-install.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface ScaffoldOptions {
  projectName: string;
  targetDir: string;
  withAuth: boolean; // False for now
  devMode: "hybrid" | "full";
  installDeps: boolean;
}

const AUTH_ONLY_PATHS = [
  path.join("apps", "api", "src", "auth"),
  path.join("apps", "api", "src", "common"),
  path.join("apps", "web", "app", "components", "auth"),
  path.join("apps", "web", "app", "composables", "useAuth.ts"),
  path.join("apps", "web", "app", "middleware", "auth.ts"),
  path.join("apps", "web", "app", "pages", "auth"),
];

const DOCKER_VARIANT_FILES = [
  "docker-compose.yml",
  "docker-compose.hybrid.yml",
  "docker-compose.full.yml",
  "docker-compose.dev.yml",
];

export async function scaffold(options: ScaffoldOptions): Promise<void> {
  const { projectName, targetDir, withAuth, devMode, installDeps } = options;
  const templateDir = path.resolve(__dirname, "../template");

  await fs.ensureDir(targetDir);

  await fs.copy(templateDir, targetDir, {
    overwrite: false,
    filter: (src) => {
      const relativePath = path.relative(templateDir, src);

      const alwaysExcluded = [
        "node_modules",
        ".nuxt",
        ".output",
        "dist",
        ".env",
      ];
      if (
        alwaysExcluded.some(
          (p) =>
            relativePath.startsWith(p) || relativePath.includes(path.sep + p),
        )
      )
        return false;

      if (DOCKER_VARIANT_FILES.some((f) => relativePath === f)) return false;

      if (!withAuth) {
        const isAuthOnly = AUTH_ONLY_PATHS.some(
          (authPath) =>
            relativePath.startsWith(authPath) || relativePath === authPath,
        );
        if (isAuthOnly) return false;
      }

      if (devMode === "hybrid") {
        if (
          relativePath === path.join("apps", "api", "Dockerfile.dev") ||
          relativePath === path.join("apps", "web", "Dockerfile.dev") ||
          relativePath === path.join("apps", "web", "Dockerfile")
        )
          return false;
      }

      return true;
    },
  });

  await setupDockerFiles(targetDir, devMode);

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

async function setupDockerFiles(
  targetDir: string,
  devMode: "hybrid" | "full",
): Promise<void> {
  if (devMode === "hybrid") {
    await fs.copy(
      path.join(targetDir, "docker-compose.hybrid.yml"),
      path.join(targetDir, "docker-compose.yml"),
    );
  } else {
    await fs.copy(
      path.join(targetDir, "docker-compose.full.yml"),
      path.join(targetDir, "docker-compose.yml"),
    );
  }

  await fs.remove(path.join(targetDir, "docker-compose.hybrid.yml"));
  await fs.remove(path.join(targetDir, "docker-compose.full.yml"));
}
