import pc from "picocolors";

/** Nuxt green, Nest red, and dark purple for branding. */
export const brand = {
  nuxt: pc.green,
  nest: pc.red,
  purple: pc.magenta,
  purpleDark: (s: string) => pc.dim(pc.magenta(s)),
  purpleDeep: (s: string) => pc.dim(pc.dim(pc.magenta(s))),
  nuxtBright: pc.greenBright,
  nestBright: pc.redBright,
} as const;

export type BrandColor = (text: string) => string;

/** Dark purple logo with a simple top-to-bottom depth fade. */
export function paintPurpleDepth(
  line: string,
  lineIndex: number,
  totalLines: number,
): string {
  const depth = lineIndex < totalLines * 0.45 ? brand.purple : brand.purple;

  let out = "";
  for (const ch of line) {
    out += ch === " " ? ch : depth(ch);
  }
  return out;
}

export function badge(bg: BrandColor, fg: BrandColor, label: string): string {
  return bg(fg(` ${label} `));
}
