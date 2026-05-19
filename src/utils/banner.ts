import pc from "picocolors";

export function showBanner() {
  console.log(
    pc.bold(
      pc.magenta(`
  ███╗   ██╗██╗   ██╗███████╗████████╗
  ████╗  ██║██║   ██║██╔════╝╚══██╔══╝
  ██╔██╗ ██║██║   ██║███████╗   ██║
  ██║╚██╗██║██║   ██║╚════██║   ██║
  ██║ ╚████║╚██████╔╝███████║   ██║
  ╚═╝  ╚═══╝ ╚═════╝ ╚══════╝   ╚═╝
    `),
    ),
  );
  console.log(pc.dim("  Full-stack Nuxt + NestJS monorepo scaffold\n"));
}
