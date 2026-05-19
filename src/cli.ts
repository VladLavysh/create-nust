import * as p from "@clack/prompts";
import pc from "picocolors";
import path from "path";
import fs from "fs-extra";
import { scaffold } from "./scaffold.js";

export interface CliOptions {
  projectName?: string;
}

export async function runCli(options: CliOptions = {}) {
  p.intro(pc.bgMagenta(pc.white(" create-nust ")));

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

  try {
    s.start("Scaffolding project");
    await scaffold({
      projectName,
      targetDir,
      devMode,
      withAuth: true,
      withPostman,
      installDeps: installDeps as boolean,
    });
    s.stop("Project scaffolded");

    if (installDeps) {
      s.start("Installing dependencies");
      s.stop("Dependencies installed");
    }
  } catch (error) {
    s.stop(pc.red("Something went wrong"));
    console.error(error);
    process.exit(1);
  }

  const nextSteps =
    devMode === "hybrid"
      ? [
          `  ${pc.dim("cd")} ${pc.cyan(projectName)}`,
          `  ${pc.dim("pnpm")} ${pc.cyan("docker:db")}`,
          `  ${pc.dim("pnpm")} ${pc.cyan("dev")}`,
        ]
      : [
          `  ${pc.dim("cd")} ${pc.cyan(projectName)}`,
          `  ${pc.dim("pnpm")} ${pc.cyan("docker:dev")}`,
        ];

  const postmanNote = withPostman
    ? `\n  ${pc.dim("Postman:")} import ${pc.cyan(`${projectName}/postman/nust.postman_collection.json`)}\n`
    : "";

  p.outro(
    pc.green(`✓ Project created!\n`) +
      `\n  Next steps:\n` +
      nextSteps.join("\n") +
      postmanNote +
      "\n",
  );
}
