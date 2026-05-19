#!/usr/bin/env node
import { Command } from "commander";
import { showBanner } from "./utils/banner.js";
import { runCli } from "./cli.js";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs-extra";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pkg = await fs.readJson(path.resolve(__dirname, "../package.json"));

const program = new Command();

program
  .name("create-nust")
  .description("Full-stack Nuxt + NestJS monorepo scaffold")
  .version(pkg.version, "-v, --version")
  .argument("[project-name]", "Name of the project to create")
  .action(async (projectName?: string) => {
    showBanner({ version: pkg.version });
    await runCli({ projectName });
  });

program.parse();
