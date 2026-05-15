import type { IAuthResponse } from "@nust/shared";

export const useAuthTokens = () => {
  const config = useRuntimeConfig();
  const accessMaxAge =
    Number(config.public.jwtAccessExpirationTimeInSec) || 900;
  const refreshMaxAge =
    Number(config.public.jwtRefreshExpirationTimeInSec) || 604800;

  const accessToken = useCookie<string | null>("access_token", {
    maxAge: accessMaxAge,
    sameSite: "lax",
    path: "/",
    secure: import.meta.env.PROD,
  });

  const refreshToken = useCookie<string | null>("refresh_token", {
    maxAge: refreshMaxAge,
    sameSite: "lax",
    path: "/",
    secure: import.meta.env.PROD,
  });

  function setAuthCookies(data: IAuthResponse) {
    accessToken.value = data.accessToken;
    refreshToken.value = data.refreshToken;
  }

  function clearAuthCookies() {
    accessToken.value = null;
    refreshToken.value = null;
  }

  return {
    accessToken,
    refreshToken,
    setAuthCookies,
    clearAuthCookies,
  };
};
