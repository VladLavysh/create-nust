import { execa } from "execa";
import pc from "picocolors";

export async function runInstall(targetDir: string): Promise<void> {
  try {
    await execa("pnpm", ["install"], {
      cwd: targetDir,
      stdio: "pipe",
    });
  } catch {
    console.warn(
      pc.yellow("\n  pnpm not found, falling back to npm install...\n"),
    );

    await execa("npm", ["install"], {
      cwd: targetDir,
      stdio: "pipe",
    });
  }
}
