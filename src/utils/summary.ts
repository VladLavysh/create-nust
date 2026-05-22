import pc from "picocolors";
import { brand } from "./theme.js";

const soft = (s: string) => pc.white(s);

export type AuthType = "jwt" | "session" | "none";

export interface ProjectSummaryOptions {
  projectName: string;
  devMode: "hybrid" | "full";
  withPostman: boolean;
  authType: AuthType;
  installDeps: boolean;
}

export function formatProjectSummary(options: ProjectSummaryOptions): string {
  const { projectName, devMode, withPostman, authType, installDeps } = options;

  const lines: string[] = [
    pc.green("✓") + " " + pc.bold(`Project ${pc.cyan(projectName)} is ready`),
    "",
    sectionTitle("Your stack"),
    row("Mode", devModeLabel(devMode)),
    row("Docker", dockerLabel(authType, devMode)),
    row("Web", `${brand.nuxt("http://localhost:3000")} ${soft("(Nuxt)")}`),
    row("API", `${brand.nest("http://localhost:3001")} ${soft("(Nest)")}`),
    row("Auth", authTypeLabel(authType)),
    row("Env", soft(".env created from .env.example")),
    row(
      "Postman",
      withPostman
        ? pc.cyan("postman/nust.postman_collection.json")
        : soft("not included"),
    ),
    "",
    sectionTitle("Get started"),
    ...getStartedSteps(projectName, devMode, authType, installDeps),
  ];

  if (authType === "jwt" && devMode === "hybrid") {
    lines.push("");
    lines.push(soft("  Tip: change JWT secrets in .env before deploying."));
  }

  if (authType === "session" && devMode === "hybrid") {
    lines.push("");
    lines.push(
      soft(
        "  Tip: API calls are proxied through Nuxt so session cookies work on localhost.",
      ),
    );
  }

  return lines.join("\n");
}

function sectionTitle(title: string): string {
  return `  ${brand.purple("▸")} ${pc.bold(title)}`;
}

function row(label: string, value: string): string {
  const pad = label.padEnd(8);
  return `    ${soft(pad)} ${value}`;
}

function authTypeLabel(authType: AuthType): string {
  if (authType === "jwt") return pc.green("JWT (access + refresh tokens)");
  if (authType === "session")
    return pc.green("Sessions (Redis + httpOnly cookie)");
  return soft("not included");
}

function dockerLabel(authType: AuthType, devMode: "hybrid" | "full"): string {
  if (devMode === "full") {
    if (authType === "session") {
      return soft("Postgres + Redis + apps in containers");
    }
    if (authType === "jwt") {
      return soft("Postgres + apps in containers");
    }
    return soft("All services in containers");
  }

  if (authType === "jwt" || authType === "none") {
    return soft("Postgres in Docker");
  }
  if (authType === "session") {
    return soft("Postgres + Redis in Docker");
  }
  return soft("not required");
}

function devModeLabel(devMode: "hybrid" | "full"): string {
  if (devMode === "hybrid") {
    return `${brand.purple("Hybrid")} ${soft("(apps on localhost)")}`;
  }
  return `${brand.purple("Full Docker")} ${soft("(apps in containers)")}`;
}

function getStartedSteps(
  projectName: string,
  devMode: "hybrid" | "full",
  authType: AuthType,
  installDeps: boolean,
): string[] {
  const cmd = (script: string, comment?: string) => {
    const suffix = comment ? ` ${pc.dim(`# ${comment}`)}` : "";
    return `    ${soft("$")} ${soft("cd")} ${pc.cyan(projectName)} ${soft("&&")} ${soft("pnpm")} ${pc.cyan(script)}${suffix}`;
  };

  const steps: string[] = [];

  if (!installDeps) {
    steps.push(
      `    ${soft("$")} ${soft("cd")} ${pc.cyan(projectName)} ${soft("&&")} ${soft("pnpm")} ${pc.cyan("install")}`,
    );
  }

  if (devMode === "hybrid") {
    if (authType === "jwt" || authType === "none") {
      steps.push(cmd("docker:db", "Postgres in Docker"));
    } else if (authType === "session") {
      steps.push(cmd("docker:db", "Postgres + Redis in Docker"));
    }
    steps.push(cmd("dev", "web :3000 + api :3001"));
  } else {
    steps.push(cmd("docker:dev"));
    steps.push(
      `    ${soft("then open")} ${brand.nuxt("http://localhost:3000")} ${soft("and")} ${brand.nest("http://localhost:3001")}`,
    );
  }

  return steps;
}
