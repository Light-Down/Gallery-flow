/**
 * Gallery Flow
 * Copyright (C) 2025 Gallery Flow Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Demo-Modus: Auth temporär deaktiviert
export function middleware(req: NextRequest) {
  // Startseite direkt zum Dashboard weiterleiten
  if (req.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};
