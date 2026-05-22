import * as p from "@clack/prompts";
import pc from "picocolors";
import path from "path";
import fs from "fs-extra";
import { scaffold } from "./scaffold.js";
import { brand } from "./utils/theme.js";
import { formatProjectSummary } from "./utils/summary.js";
import type { AuthType } from "./utils/summary.js";
import type { AuthProvider } from "./utils/apply-oauth-markers.js";

export interface CliOptions {
  projectName?: string;
}

export async function runCli(options: CliOptions = {}) {
  p.intro(
    `${brand.nuxt("Nuxt")} ${brand.purple("+")} ${brand.nest("Nest")} ${pc.dim("— answer a few questions to scaffold your monorepo")}`,
  );

  let projectName = options.projectName;
  let withPostman = false;

  if (!projectName) {
    const nameInput = await p.text({
      message: "Project name",
      placeholder: "my-nust-app",
      validate(value) {
        if (!value) return "Project name is required";
        if (!/^[a-z0-9-_]+$/.test(value))
          return "Only lowercase letters, numbers, hyphens and underscores";
        if (value.length > 64) return "Project name is too long";
      },
    });

    if (p.isCancel(nameInput)) {
      p.cancel("Operation cancelled");
      process.exit(0);
    }

    projectName = nameInput;
  }

  const targetDir = path.resolve(process.cwd(), projectName);

  if (await fs.pathExists(targetDir)) {
    const overwrite = await p.confirm({
      message: `Directory ${pc.yellow(projectName)} already exists. Overwrite?`,
      initialValue: false,
    });

    if (p.isCancel(overwrite) || !overwrite) {
      p.cancel("Operation cancelled");
      process.exit(0);
    }

    await fs.remove(targetDir);
  }

  const devMode = await p.select({
    message: "Development mode",
    options: [
      {
        value: "hybrid",
        label: "Hybrid (recommended)",
        hint: "Docker for DB, run apps locally",
      },
      {
        value: "full",
        label: "Full Docker (experimental)",
        hint: "Everything in containers — may be unstable",
      },
    ],
  });

  if (p.isCancel(devMode)) {
    p.cancel("Operation cancelled");
    process.exit(0);
  }

  const authType = await p.select({
    message: "Authentication",
    options: [
      {
        value: "jwt",
        label: "JWT",
        hint: "Access + refresh tokens (Bearer header)",
      },
      {
        value: "session",
        label: "Sessions",
        hint: "httpOnly cookie + Redis store",
      },
      {
        value: "none",
        label: "No authentication",
        hint: "Skip auth modules and pages",
      },
    ],
  });

  if (p.isCancel(authType)) {
    p.cancel("Operation cancelled");
    process.exit(0);
  }

  let authProviders: AuthProvider[] = [];

  if (authType !== "none") {
    const oauthSelection = await p.multiselect({
      message: "OAuth providers (optional)",
      options: [
        {
          value: "google",
          label: "Google",
          hint: "Sign in with Google",
        },
        {
          value: "github",
          label: "GitHub",
          hint: "Sign in with GitHub",
        },
        {
          value: "none",
          label: "None — email/password only",
        },
      ],
      required: false,
    });

    if (p.isCancel(oauthSelection)) {
      p.cancel("Operation cancelled");
      process.exit(0);
    }

    const selected = (oauthSelection ?? []) as string[];
    if (selected.includes("none")) {
      authProviders = [];
    } else {
      authProviders = selected.filter(
        (p): p is AuthProvider => p === "google" || p === "github",
      );
    }
  }

  const postmanAnswer = await p.confirm({
    message: "Include Postman collection?",
    initialValue: true,
  });

  if (p.isCancel(postmanAnswer)) {
    p.cancel("Operation cancelled");
    process.exit(0);
  }

  withPostman = postmanAnswer as boolean;

  const installDeps = await p.confirm({
    message: "Install dependencies?",
    initialValue: true,
  });

  if (p.isCancel(installDeps)) {
    p.cancel("Operation cancelled");
    process.exit(0);
  }

  const s = p.spinner();
  const onProgress = (message: string) => {
    s.message(message);
  };

  try {
    s.start("Copying template files…");
    await scaffold({
      projectName,
      targetDir,
      devMode,
      authType: authType as AuthType,
      authProviders,
      withPostman,
      installDeps: installDeps as boolean,
      onProgress,
    });
    s.stop(pc.green("Project scaffolded"));
  } catch (error) {
    s.stop(pc.red("Something went wrong"));
    console.error(error);
    process.exit(1);
  }

  p.note(
    formatProjectSummary({
      projectName,
      devMode,
      withPostman,
      authType: authType as AuthType,
      authProviders,
      installDeps: installDeps as boolean,
    }),
    "Summary",
  );

  p.outro(pc.dim("Happy coding!"));
}
