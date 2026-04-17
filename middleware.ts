/**
 * Gallery Flow
 * Copyright (C) 2025 Gallery Flow Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */

import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "__session";

export async function middleware(req: NextRequest) {
  const sessionCookie = req.cookies.get(SESSION_COOKIE)?.value;
  const pathname = req.nextUrl.pathname;

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Verify via internal API to use Firebase Admin (Edge Runtime can't use Node.js SDK directly)
  const verifyUrl = new URL("/api/auth/verify", req.url);
  const verifyRes = await fetch(verifyUrl, {
    headers: { Cookie: `${SESSION_COOKIE}=${sessionCookie}` },
  });

  if (!verifyRes.ok) {
    const response = NextResponse.redirect(new URL("/login", req.url));
    response.cookies.delete(SESSION_COOKIE);
    return response;
  }

  const { userType } = await verifyRes.json();

  if (pathname.startsWith("/dashboard") && userType !== "photographer") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname.startsWith("/gallery") && userType !== "client") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/gallery/:path*"],
};
