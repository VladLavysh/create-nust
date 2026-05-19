import pc from "picocolors";
import { badge, brand, paintPurpleDepth } from "./theme.js";

const LOGO = [
  "███╗   ██╗██╗   ██╗███████╗████████╗",
  "████╗  ██║██║   ██║██╔════╝╚══██╔══╝",
  "██╔██╗ ██║██║   ██║███████╗   ██║   ",
  "██║╚██╗██║██║   ██║╚════██║   ██║   ",
  "██║ ╚████║╚██████╔╝███████║   ██║   ",
  "╚═╝  ╚═══╝ ╚═════╝ ╚══════╝   ╚═╝   ",
];

export interface BannerOptions {
  version?: string;
}

export function showBanner(options: BannerOptions = {}) {
  const { version } = options;

  console.log();
  for (let i = 0; i < LOGO.length; i++) {
    console.log(`  ${paintPurpleDepth(LOGO[i]!, i, LOGO.length)}`);
  }

  console.log();
  console.log(
    `${badge(brand.nuxt, pc.black, "Nuxt")}` +
      `${pc.dim("·")}` +
      `${badge(brand.nest, pc.black, "Nest")}` +
      `${pc.dim("·")} ` +
      `${pc.dim("TypeScript")}` +
      ` ${pc.dim("·")} ` +
      `${pc.dim("pnpm monorepo")}`,
  );
  console.log(
    `${badge(brand.nuxt, pc.black, "Full-stack scaffold")}` +
      (version ? `${pc.dim(`· v${version}`)}` : ""),
  );
  console.log();
}
