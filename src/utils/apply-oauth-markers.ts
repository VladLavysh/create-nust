import type { AuthType } from "./summary.js";

export type AuthProvider = "google" | "github";

const PROVIDERS: Record<
  AuthProvider,
  {
    strategy: string;
    guard: string;
    route: string;
    passportName: string;
  }
> = {
  google: {
    strategy: "GoogleStrategy",
    guard: "GoogleAuthGuard",
    route: "google",
    passportName: "google",
  },
  github: {
    strategy: "GithubStrategy",
    guard: "GithubAuthGuard",
    route: "github",
    passportName: "github",
  },
};

export function stripOAuthMarkers(content: string): string {
  let result = content;

  const tsMarkers = [
    "__OAUTH_IMPORTS__",
    "__OAUTH_MODULE_IMPORTS__",
    "__OAUTH_PROVIDERS__",
    "__OAUTH_CONTROLLER_IMPORTS__",
    "__OAUTH_CONTROLLER_ROUTES__",
    "__OAUTH_SERVICE_METHODS__",
  ];

  for (const marker of tsMarkers) {
    result = result.replace(
      new RegExp(`^[ \\t]*// ${marker}[ \\t]*\\r?\\n`, "gm"),
      "",
    );
  }

  result = result.replace(
    /[ \t]*<!-- __OAUTH_BUTTONS_START__ -->[\s\S]*?<!-- __OAUTH_BUTTONS_END__ -->[ \t]*\r?\n?/g,
    "",
  );

  return result;
}

export function applyOAuthMarkers(
  content: string,
  authType: "jwt" | "session",
  providers: AuthProvider[],
): string {
  if (providers.length === 0) {
    return stripOAuthMarkers(content);
  }

  const imports = buildImports(authType, providers);
  const moduleImports =
    authType === "session" ? "PassportModule.register({})," : "";
  const providerEntries = providers
    .map((p) => `${PROVIDERS[p].strategy},`)
    .join("\n");
  const controllerImports = buildControllerImports(providers);
  const controllerRoutes = buildControllerRoutes(authType, providers);
  const serviceMethods = buildServiceMethods(authType);

  return content
    .replace("// __OAUTH_IMPORTS__", imports)
    .replace("// __OAUTH_MODULE_IMPORTS__", moduleImports)
    .replace("// __OAUTH_PROVIDERS__", providerEntries)
    .replace("// __OAUTH_CONTROLLER_IMPORTS__", controllerImports)
    .replace("// __OAUTH_CONTROLLER_ROUTES__", controllerRoutes)
    .replace("// __OAUTH_SERVICE_METHODS__", serviceMethods);
}

function buildImports(
  authType: "jwt" | "session",
  providers: AuthProvider[],
): string {
  const lines: string[] = [];
  if (authType === "session") {
    lines.push("import { PassportModule } from '@nestjs/passport'");
  }
  lines.push(
    ...providers.map(
      (p) =>
        `import { ${PROVIDERS[p].strategy} } from './strategies/${PROVIDERS[p].route}.strategy'`,
    ),
  );
  return lines.join("\n");
}

function buildControllerImports(providers: AuthProvider[]): string {
  const lines = [
    "import { Get, Req, Res, UseGuards } from '@nestjs/common'",
    "import type { Request, Response } from 'express'",
    ...providers.map(
      (p) =>
        `import { ${PROVIDERS[p].guard} } from './guards/${PROVIDERS[p].route}-auth.guard'`,
    ),
  ];
  return lines.join("\n");
}

function buildControllerRoutes(
  authType: "jwt" | "session",
  providers: AuthProvider[],
): string {
  return providers
    .map((p) => {
      const { guard, route } = PROVIDERS[p];
      if (authType === "jwt") {
        return `  @Get('${route}')
  @UseGuards(${guard})
  ${route}Auth() {}

  @Get('${route}/callback')
  @UseGuards(${guard})
  async ${route}Callback(@Req() req: Request, @Res() res: Response) {
    const user = req.user as User
    const redirectUrl = this.authService.buildJwtOAuthRedirectUrl(user)
    return res.redirect(redirectUrl)
  }`;
      }
      return `  @Get('${route}')
  @UseGuards(${guard})
  ${route}Auth() {}

  @Get('${route}/callback')
  @UseGuards(${guard})
  async ${route}Callback(@Req() req: Request, @Res() res: Response) {
    const user = req.user as User
    this.authService.loginWithOAuth(user, req.session as AppSession)
    return res.redirect(this.authService.buildSessionOAuthRedirectUrl())
  }`;
    })
    .join("\n\n");
}

function buildServiceMethods(authType: "jwt" | "session"): string {
  if (authType === "jwt") {
    return `  buildJwtOAuthRedirectUrl(user: User): string {
    const tokens = this.generateTokens(user)
    const webUrl =
      this.configService.get<string>('WEB_URL') ?? 'http://localhost:3000'
    const url = new URL('/auth/oauth-callback', webUrl)
    url.searchParams.set('accessToken', tokens.accessToken)
    url.searchParams.set('refreshToken', tokens.refreshToken)
    return url.toString()
  }`;
  }
  return `  loginWithOAuth(user: User, session: AppSession): void {
    this.setSessionUser(session, user)
  }

  buildSessionOAuthRedirectUrl(): string {
    return this.configService.get<string>('WEB_URL') ?? 'http://localhost:3000'
  }`;
}

export function stripOAuthFromLoginForm(content: string): string {
  return stripOAuthMarkers(content);
}

export function applyOAuthToLoginForm(
  content: string,
  providers: AuthProvider[],
): string {
  if (providers.length === 0) {
    return stripOAuthFromLoginForm(content);
  }

  const buttonLines: string[] = ['    <AuthOAuthDivider v-if="hasOAuth" />'];
  if (providers.includes("google")) {
    buttonLines.push(
      '    <AuthOAuthGoogleButton v-if="googleEnabled" :href="oauthGoogleUrl" />',
    );
  }
  if (providers.includes("github")) {
    buttonLines.push(
      '    <AuthOAuthGithubButton v-if="githubEnabled" :href="oauthGithubUrl" />',
    );
  }

  const block = `${buttonLines.join("\n")}\n`;

  let result = content.replace(
    /[ \t]*<!-- __OAUTH_BUTTONS_START__ -->[\s\S]*?<!-- __OAUTH_BUTTONS_END__ -->/,
    `<!-- __OAUTH_BUTTONS_START__ -->\n${block}    <!-- __OAUTH_BUTTONS_END__ -->`,
  );

  const scriptInjection = `
const config = useRuntimeConfig()
const googleEnabled = config.public.oauthGoogle as boolean
const githubEnabled = config.public.oauthGithub as boolean
const hasOAuth = computed(() => googleEnabled || githubEnabled)
const apiRoot = computed(() =>
  config.public.apiBase ? \`\${config.public.apiBase}/api/v1\` : '/api/v1',
)
const oauthGoogleUrl = computed(() => \`\${apiRoot.value}/auth/google\`)
const oauthGithubUrl = computed(() => \`\${apiRoot.value}/auth/github\`)
`;

  result = result.replace(
    "<script setup lang=\"ts\">",
    `<script setup lang="ts">${scriptInjection}`,
  );

  return result;
}

export function patchNuxtRuntimeConfig(
  content: string,
  providers: AuthProvider[],
): string {
  const oauthGoogle = providers.includes("google");
  const oauthGithub = providers.includes("github");

  if (content.includes("oauthGoogle:")) {
    return content
      .replace(/oauthGoogle:\s*(true|false)/, `oauthGoogle: ${oauthGoogle}`)
      .replace(/oauthGithub:\s*(true|false)/, `oauthGithub: ${oauthGithub}`);
  }

  return content.replace(
    /(runtimeConfig:\s*\{\s*public:\s*\{)/,
    `$1
      oauthGoogle: ${oauthGoogle},
      oauthGithub: ${oauthGithub},`,
  );
}

export function stripNuxtOAuthRuntimeConfig(content: string): string {
  return content
    .replace(/\s*oauthGoogle:\s*(true|false),?\n?/g, "\n")
    .replace(/\s*oauthGithub:\s*(true|false),?\n?/g, "\n");
}
