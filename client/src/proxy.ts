import {
  getDefaultDashboardRoute,
  getRouteOwner,
  isAuthRoute,
  TAuthUser,
} from "./lib/authUtlils";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtUtils } from "./lib/jwtUtils";
import { getNewRefeshToken } from "./services/auth.service";
import { isTokenExpiringSoon } from "./lib/tokenUtils";

export const refreshTokenMiddleware = async (
  refreshToken: string,
): Promise<boolean> => {
  try {
    const refresh = await getNewRefeshToken(refreshToken);
    if (!refresh) {
      return false;
    }
    return true;
  } catch (error) {
    console.error("Refresh token middleware error", error);
    return false;
  }
};

export default async function proxy(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    const accessToken = request.cookies.get("accessToken")?.value;
    const refreshToken = request.cookies.get("refreshToken")?.value;

    const decodedAccessToken = accessToken
      ? jwtUtils.verifyToken(
          accessToken,
          process.env.JWT_ACCESS_SECRET as string,
        )
      : undefined;
    const isValidAccessToken =
      accessToken &&
      jwtUtils.verifyToken(accessToken, process.env.JWT_ACCESS_SECRET as string)
        .success;

    let userRole: TAuthUser | null = null;

    if (decodedAccessToken?.success && decodedAccessToken.data) {
      userRole = decodedAccessToken.data.role as TAuthUser;
    }

    const effectiveRole =
      userRole === "SUPER_ADMIN" ? "ADMIN" : userRole;

    const routeOwner = getRouteOwner(pathname);

    const isAuth = isAuthRoute(pathname);

    if (
      isValidAccessToken &&
      refreshToken &&
      (await isTokenExpiringSoon(accessToken))
    ) {
      const requestHeaders = new Headers(request.headers);

      const response = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });

      try {
        const refreshed = await refreshTokenMiddleware(refreshToken);
        if (refreshed) {
          requestHeaders.set("x-token-refreshed", "1");
        }
        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
          headers: response.headers,
        });
      } catch (error) {
        console.error("Refresh token middleware error", error);
      }

      return response;
    }

    if (isAuth && isValidAccessToken) {
      return NextResponse.redirect(
        new URL(getDefaultDashboardRoute(userRole as TAuthUser), request.url),
      );
    }

    // when user trying to access public route
    if (routeOwner === null) {
      return NextResponse.next();
    }

    if (!accessToken || !isValidAccessToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (routeOwner === "COMMON") {
      return NextResponse.next();
    }

    if (
      routeOwner === "ADMIN" ||
      routeOwner === "DOCTOR" ||
      routeOwner === "PATIENT"
    ) {
      if (routeOwner !== effectiveRole) {
        return NextResponse.redirect(
          new URL(getDefaultDashboardRoute(userRole as TAuthUser), request.url),
        );
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Proxy error", error);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.well-known).*)",
  ],
};
