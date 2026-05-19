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
  withPostman: boolean;
  devMode: "hybrid" | "full";
  installDeps: boolean;
  onProgress?: (message: string) => void;
}

export type ScaffoldProgress = NonNullable<ScaffoldOptions["onProgress"]>;

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
  const {
    projectName,
    targetDir,
    withAuth,
    withPostman,
    devMode,
    installDeps,
    onProgress,
  } = options;
  const templateDir = path.resolve(__dirname, "../template");
  const step = (message: string) => onProgress?.(message);

  step("Copying template files…");
  await fs.ensureDir(targetDir);

  if (path.resolve(targetDir) === path.resolve(templateDir)) {
    throw new Error("Cannot scaffold into the template directory.");
  }

  await fs.copy(templateDir, targetDir, {
    overwrite: false,
    filter: (src) => {
      const relativePath = path.relative(templateDir, src);

      const alwaysExcluded = ["node_modules", ".nuxt", ".output", "dist"];
      if (
        alwaysExcluded.some(
          (p) =>
            relativePath.startsWith(p) || relativePath.includes(path.sep + p),
        )
      )
        return false;

      if (relativePath.split(path.sep).some((segment) => segment === ".env")) {
        return false;
      }

      if (DOCKER_VARIANT_FILES.some((f) => relativePath === f)) return false;

      if (!withAuth) {
        const isAuthOnly = AUTH_ONLY_PATHS.some(
          (authPath) =>
            relativePath.startsWith(authPath) || relativePath === authPath,
        );
        if (isAuthOnly) return false;
      }

      if (!withPostman && relativePath.startsWith("postman")) {
        return false;
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

  step(
    devMode === "hybrid"
      ? "Configuring Docker (Postgres only)…"
      : "Configuring Docker (full stack)…",
  );
  await setupDockerFiles(templateDir, targetDir, devMode);

  step("Finalizing project files…");
  await setupGitignore(templateDir, targetDir);

  step("Applying project name…");
  await replaceTokens(targetDir, projectName);

  step("Creating .env from defaults…");
  await setupEnvFile(targetDir);

  if (installDeps) {
    step("Installing dependencies (pnpm)");
    await runInstall(targetDir);
  }
}

async function setupDockerFiles(
  templateDir: string,
  targetDir: string,
  devMode: "hybrid" | "full",
): Promise<void> {
  const sourceFile =
    devMode === "hybrid"
      ? "docker-compose.hybrid.yml"
      : "docker-compose.full.yml";

  await fs.copy(
    path.join(templateDir, sourceFile),
    path.join(targetDir, "docker-compose.yml"),
  );
}

async function setupGitignore(
  templateDir: string,
  targetDir: string,
): Promise<void> {
  const dest = path.join(targetDir, ".gitignore");
  const copied = path.join(targetDir, "_gitignore");
  const templateSrc = path.join(templateDir, "_gitignore");

  if (await fs.pathExists(copied)) {
    await fs.rename(copied, dest);
    return;
  }

  if (await fs.pathExists(templateSrc)) {
    await fs.copy(templateSrc, dest);
  }
}

async function setupEnvFile(targetDir: string): Promise<void> {
  const envExamplePath = path.join(targetDir, ".env.example");
  const envPath = path.join(targetDir, ".env");

  if (!(await fs.pathExists(envExamplePath))) {
    throw new Error("Missing .env.example in template.");
  }

  if (!(await fs.pathExists(envPath))) {
    await fs.copy(envExamplePath, envPath);
  }
}
