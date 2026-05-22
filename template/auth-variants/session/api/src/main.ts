import "tsconfig-paths/register";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import session from "express-session";
import { RedisStore } from "connect-redis";
import { createClient } from "redis";
import type { Request, Response, NextFunction } from "express";
import { AppModule } from "./app.module";

type SessionCookieCtor = new (options: {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: boolean | "lax" | "strict" | "none";
  maxAge?: number;
}) => NonNullable<Request["session"]>["cookie"];

const SessionCookie = session.Cookie as SessionCookieCtor;

function parsePositiveInt(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function ensureSessionCookie(
  req: Request,
  maxAge: number,
  secure: boolean,
): void {
  if (!req.session) return;

  const cookie = req.session.cookie;
  if (
    cookie &&
    cookie.originalMaxAge != null &&
    cookie.maxAge != null
  ) {
    return;
  }

  req.session.cookie = new SessionCookie({
    httpOnly: true,
    secure,
    sameSite: "lax",
    maxAge,
  });
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const redisHost = configService.get<string>("REDIS_HOST", "localhost");
  const redisPort = parsePositiveInt(configService.get("REDIS_PORT"), 6379);
  const sessionSecret = configService.get<string>("SESSION_SECRET");
  const sessionMaxAge = parsePositiveInt(
    configService.get("SESSION_MAX_AGE_MS"),
    604800000,
  );
  const secureCookies = configService.get("NODE_ENV") === "production";

  const redisClient = createClient({
    url: `redis://${redisHost}:${redisPort}`,
  });
  await redisClient.connect();

  app.use(
    session({
      store: new RedisStore({
        client: redisClient,
        ttl: Math.ceil(sessionMaxAge / 1000),
      }),
      secret: sessionSecret!,
      resave: false,
      saveUninitialized: false,
      proxy: true,
      cookie: {
        httpOnly: true,
        secure: secureCookies,
        sameSite: "lax",
        maxAge: sessionMaxAge,
      },
    }),
  );

  app.use((req: Request, _res: Response, next: NextFunction) => {
    ensureSessionCookie(req, sessionMaxAge, secureCookies);
    next();
  });

  app.setGlobalPrefix("api/v1");

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: configService.get("WEB_URL") ?? "http://localhost:3000",
    credentials: true,
  });

  await app.listen(configService.get("API_PORT") ?? 3001, () => {
    console.log(`API is running on port ${configService.get("API_PORT") ?? 3001}`);
  });
}

bootstrap();
