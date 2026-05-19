import pc from "picocolors";
import { brand } from "./theme.js";

/** Secondary text — readable but softer than primary. */
const soft = (s: string) => pc.white(s);

export interface ProjectSummaryOptions {
  projectName: string;
  devMode: "hybrid" | "full";
  withPostman: boolean;
  withAuth: boolean;
  installDeps: boolean;
}

export function formatProjectSummary(options: ProjectSummaryOptions): string {
  const { projectName, devMode, withPostman, withAuth, installDeps } = options;

  const lines: string[] = [
    pc.green("✓") + " " + pc.bold(`Project ${pc.cyan(projectName)} is ready`),
    "",
    sectionTitle("Your stack"),
    row("Mode", devModeLabel(devMode)),
    row("Web", `${brand.nuxt("http://localhost:3000")} ${soft("(Nuxt)")}`),
    row("API", `${brand.nest("http://localhost:3001")} ${soft("(Nest)")}`),
    row("Auth", withAuth ? pc.green("JWT included") : soft("disabled")),
    row("Env", soft(".env created from .env.example")),
    row(
      "Postman",
      withPostman
        ? pc.cyan("postman/nust.postman_collection.json")
        : soft("not included"),
    ),
    "",
    sectionTitle("Get started"),
    ...getStartedSteps(projectName, devMode, installDeps),
  ];

  if (devMode === "hybrid") {
    lines.push("");
    lines.push(
      soft("  Tip: change JWT secrets in .env before deploying."),
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

function devModeLabel(devMode: "hybrid" | "full"): string {
  if (devMode === "hybrid") {
    return `${brand.purple("Hybrid")} ${soft("— Postgres in Docker, apps on host")}`;
  }
  return `${brand.purple("Full Docker")} ${soft("— experimental, all services in containers")}`;
}

function getStartedSteps(
  projectName: string,
  devMode: "hybrid" | "full",
  installDeps: boolean,
): string[] {
  const cmd = (script: string) =>
    `    ${soft("$")} ${soft("cd")} ${pc.cyan(projectName)} ${soft("&&")} ${soft("pnpm")} ${pc.cyan(script)}`;

  const steps: string[] = [];

  if (!installDeps) {
    steps.push(
      `    ${soft("$")} ${soft("cd")} ${pc.cyan(projectName)} ${soft("&&")} ${soft("pnpm")} ${pc.cyan("install")}`,
    );
  }

  if (devMode === "hybrid") {
    steps.push(cmd("docker:db"));
    steps.push(
      `    ${soft("$")} ${soft("cd")} ${pc.cyan(projectName)} ${soft("&&")} ${soft("pnpm")} ${pc.cyan("dev")} ${pc.dim("# web :3000 + api :3001")}`,
    );
  } else {
    steps.push(cmd("docker:dev"));
    steps.push(
      `    ${soft("then open")} ${brand.nuxt("http://localhost:3000")} ${soft("and")} ${brand.nest("http://localhost:3001")}`,
    );
  }

  return steps;
}
