import path from "path";
import fs from "fs-extra";
import { fileURLToPath } from "url";
import { replaceTokens } from "./utils/replace-tokens.js";
import { runInstall } from "./utils/run-install.js";
import type { AuthType } from "./utils/summary.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface ScaffoldOptions {
  projectName: string;
  targetDir: string;
  authType: AuthType;
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
  path.join("apps", "web", "app", "composables", "useAuthTokens.ts"),
  path.join("apps", "web", "app", "middleware", "auth.global.ts"),
  path.join("apps", "web", "app", "plugins", "api.ts"),
  path.join("apps", "web", "app", "plugins", "auth-init.client.ts"),
  path.join("apps", "web", "app", "pages", "auth"),
];

const SCAFFOLD_INTERNAL_PATHS = [
  "auth-variants",
  path.join("env"),
  path.join("postman", "nust.postman_collection.jwt.json"),
  path.join("postman", "nust.postman_collection.session.json"),
];

const DOCKER_VARIANT_FILES = [
  "docker-compose.yml",
  "docker-compose.hybrid.yml",
  "docker-compose.full.yml",
  "docker-compose.dev.yml",
  "docker-compose.hybrid.session.yml",
  "docker-compose.full.session.yml",
];

const AUTH_VARIANT_FILES: Record<
  AuthType,
  Array<{ from: string; to: string }>
> = {
  jwt: [
    { from: "api/src/auth", to: "apps/api/src/auth" },
    { from: "api/src/main.ts", to: "apps/api/src/main.ts" },
    { from: "api/src/common", to: "apps/api/src/common" },
    { from: "web/composables/useAuth.ts", to: "apps/web/app/composables/useAuth.ts" },
    {
      from: "web/composables/useAuthTokens.ts",
      to: "apps/web/app/composables/useAuthTokens.ts",
    },
    {
      from: "web/middleware/auth.global.ts",
      to: "apps/web/app/middleware/auth.global.ts",
    },
    { from: "web/plugins/api.ts", to: "apps/web/app/plugins/api.ts" },
    {
      from: "web/plugins/auth-init.client.ts",
      to: "apps/web/app/plugins/auth-init.client.ts",
    },
    { from: "web/nuxt.config.ts", to: "apps/web/nuxt.config.ts" },
    {
      from: "shared/src/dto/auth.dto.ts",
      to: "packages/shared/src/dto/auth.dto.ts",
    },
    {
      from: "api/package.deps.json",
      to: "apps/api/package.deps.json",
    },
  ],
  session: [
    { from: "api/src/auth", to: "apps/api/src/auth" },
    { from: "api/src/main.ts", to: "apps/api/src/main.ts" },
    { from: "api/src/common", to: "apps/api/src/common" },
    { from: "api/src/types", to: "apps/api/src/types" },
    { from: "web/composables/useAuth.ts", to: "apps/web/app/composables/useAuth.ts" },
    {
      from: "web/middleware/auth.global.ts",
      to: "apps/web/app/middleware/auth.global.ts",
    },
    { from: "web/plugins/api.ts", to: "apps/web/app/plugins/api.ts" },
    { from: "web/nuxt.config.ts", to: "apps/web/nuxt.config.ts" },
    {
      from: "shared/src/dto/auth.dto.ts",
      to: "packages/shared/src/dto/auth.dto.ts",
    },
    {
      from: "api/package.deps.json",
      to: "apps/api/package.deps.json",
    },
  ],
  none: [
    { from: "api/src/app.module.ts", to: "apps/api/src/app.module.ts" },
    { from: "api/src/main.ts", to: "apps/api/src/main.ts" },
    { from: "web/layouts/default.vue", to: "apps/web/app/layouts/default.vue" },
    { from: "web/pages/index.vue", to: "apps/web/app/pages/index.vue" },
    { from: "web/pages/welcome.vue", to: "apps/web/app/pages/welcome.vue" },
    { from: "web/composables/useAuth.ts", to: "apps/web/app/composables/useAuth.ts" },
    { from: "web/plugins/api.ts", to: "apps/web/app/plugins/api.ts" },
    { from: "web/nuxt.config.ts", to: "apps/web/nuxt.config.ts" },
  ],
};

export async function scaffold(options: ScaffoldOptions): Promise<void> {
  const {
    projectName,
    targetDir,
    authType,
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

      if (
        SCAFFOLD_INTERNAL_PATHS.some(
          (p) => relativePath === p || relativePath.startsWith(p + path.sep),
        )
      ) {
        return false;
      }

      if (authType === "none") {
        const isAuthOnly = AUTH_ONLY_PATHS.some(
          (authPath) =>
            relativePath.startsWith(authPath) || relativePath === authPath,
        );
        if (isAuthOnly) return false;
      }

      if (authType !== "none") {
        const authPathsToSkip = [
          path.join("apps", "api", "src", "auth"),
          path.join("apps", "api", "src", "common"),
          path.join("apps", "api", "src", "main.ts"),
          path.join("apps", "web", "app", "composables", "useAuth.ts"),
          path.join("apps", "web", "app", "composables", "useAuthTokens.ts"),
          path.join("apps", "web", "app", "middleware", "auth.global.ts"),
          path.join("apps", "web", "app", "plugins", "api.ts"),
          path.join("apps", "web", "app", "plugins", "auth-init.client.ts"),
          path.join("apps", "web", "nuxt.config.ts"),
          path.join("packages", "shared", "src", "dto", "auth.dto.ts"),
        ];
        if (
          authPathsToSkip.some(
            (p) => relativePath.startsWith(p) || relativePath === p,
          )
        ) {
          return false;
        }
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
    authType === "session"
      ? "Configuring authentication (sessions)…"
      : authType === "jwt"
        ? "Configuring authentication (JWT)…"
        : "Configuring project (no auth)…",
  );
  await setupAuthFiles(templateDir, targetDir, authType);

  step(
    devMode === "hybrid"
      ? "Configuring Docker (Postgres" +
          (authType === "session" ? " + Redis" : "") +
          ")…"
      : "Configuring Docker (full stack)…",
  );
  await setupDockerFiles(templateDir, targetDir, devMode, authType);

  if (withPostman && authType !== "none") {
    step("Configuring Postman collection…");
    await setupPostmanCollection(templateDir, targetDir, authType);
  }

  step("Finalizing project files…");
  const gitignoreSrc = path.join(targetDir, "_gitignore");
  const gitignoreDest = path.join(targetDir, ".gitignore");
  if (await fs.pathExists(gitignoreSrc)) {
    await fs.rename(gitignoreSrc, gitignoreDest);
  }

  step("Applying project name…");
  await replaceTokens(targetDir, projectName);

  step("Creating .env from defaults…");
  await setupEnvFile(templateDir, targetDir, authType);

  if (installDeps) {
    step("Installing dependencies (pnpm)");
    await runInstall(targetDir);
  }
}

async function setupAuthFiles(
  templateDir: string,
  targetDir: string,
  authType: AuthType,
): Promise<void> {
  const variantDir = path.join(templateDir, "auth-variants", authType);
  const mappings = AUTH_VARIANT_FILES[authType];

  for (const { from, to } of mappings) {
    const src = path.join(variantDir, from);
    const dest = path.join(targetDir, to);

    if (!(await fs.pathExists(src))) {
      throw new Error(`Missing auth variant file: ${from} (${authType})`);
    }

    const stat = await fs.stat(src);
    if (stat.isDirectory()) {
      await fs.copy(src, dest, { overwrite: true });
    } else {
      await fs.ensureDir(path.dirname(dest));
      await fs.copy(src, dest, { overwrite: true });
    }
  }

  if (authType === "jwt" || authType === "session") {
    await mergeApiPackageDeps(targetDir, authType);
    const depsFile = path.join(targetDir, "apps/api/package.deps.json");
    if (await fs.pathExists(depsFile)) {
      await fs.remove(depsFile);
    }
  }

  await patchRootPackageJson(targetDir, authType);
}

async function mergeApiPackageDeps(
  targetDir: string,
  authType: "jwt" | "session",
): Promise<void> {
  const pkgPath = path.join(targetDir, "apps/api/package.json");
  const depsPath = path.join(
    targetDir,
    "apps/api/package.deps.json",
  );

  if (!(await fs.pathExists(depsPath))) return;

  const pkg = await fs.readJson(pkgPath);
  const extra = await fs.readJson(depsPath);

  pkg.dependencies = { ...pkg.dependencies, ...extra.dependencies };
  if (extra.devDependencies) {
    pkg.devDependencies = {
      ...pkg.devDependencies,
      ...extra.devDependencies,
    };
  }

  await fs.writeJson(pkgPath, pkg, { spaces: 2 });
}

async function patchRootPackageJson(
  targetDir: string,
  authType: AuthType,
): Promise<void> {
  const pkgPath = path.join(targetDir, "package.json");
  const pkg = await fs.readJson(pkgPath);

  if (!pkg.scripts) {
    pkg.scripts = {};
  }

  if (authType === "session") {
    pkg.scripts["docker:db"] = "docker compose up postgres redis -d";
  } else {
    pkg.scripts["docker:db"] = "docker compose up postgres -d";
  }

  await fs.writeJson(pkgPath, pkg, { spaces: 2 });
}

async function setupDockerFiles(
  templateDir: string,
  targetDir: string,
  devMode: "hybrid" | "full",
  authType: AuthType,
): Promise<void> {
  let sourceFile: string;

  if (devMode === "hybrid") {
    sourceFile =
      authType === "session"
        ? "docker-compose.hybrid.session.yml"
        : "docker-compose.hybrid.yml";
  } else {
    sourceFile =
      authType === "session"
        ? "docker-compose.full.session.yml"
        : "docker-compose.full.yml";
  }

  await fs.copy(
    path.join(templateDir, sourceFile),
    path.join(targetDir, "docker-compose.yml"),
  );
}

async function setupPostmanCollection(
  templateDir: string,
  targetDir: string,
  authType: AuthType,
): Promise<void> {
  const sourceName =
    authType === "session"
      ? "nust.postman_collection.session.json"
      : "nust.postman_collection.jwt.json";

  await fs.copy(
    path.join(templateDir, "postman", sourceName),
    path.join(targetDir, "postman", "nust.postman_collection.json"),
  );
}

async function setupEnvFile(
  templateDir: string,
  targetDir: string,
  authType: AuthType,
): Promise<void> {
  const envExamplePath = path.join(targetDir, ".env.example");
  const envPath = path.join(targetDir, ".env");

  if (!(await fs.pathExists(envExamplePath))) {
    throw new Error("Missing .env.example in template.");
  }

  let content = await fs.readFile(envExamplePath, "utf-8");

  if (authType === "jwt" || authType === "session") {
    const fragmentPath = path.join(
      templateDir,
      "env",
      authType === "jwt" ? ".env.jwt" : ".env.session",
    );
    if (await fs.pathExists(fragmentPath)) {
      const fragment = await fs.readFile(fragmentPath, "utf-8");
      content = `${content.trimEnd()}\n\n${fragment.trimStart()}`;
    }
  }

  await fs.writeFile(envExamplePath, content, "utf-8");

  if (!(await fs.pathExists(envPath))) {
    await fs.writeFile(envPath, content, "utf-8");
  }
}
