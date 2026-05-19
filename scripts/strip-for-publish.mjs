import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const pathsToRemove = [
  "template/node_modules",
  "template/apps/web/node_modules",
  "template/apps/api/node_modules",
  "template/packages/shared/node_modules",
  "template/apps/web/.nuxt",
  "template/apps/web/.output",
  "template/apps/api/dist",
  "template/packages/shared/tsconfig.tsbuildinfo",
];

for (const rel of pathsToRemove) {
  const target = path.join(root, rel);
  if (await fs.pathExists(target)) {
    await fs.remove(target);
    console.log(`removed ${rel}`);
  }
}
