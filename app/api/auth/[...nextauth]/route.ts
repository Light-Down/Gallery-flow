/**
 * Gallery Flow
 * Copyright (C) 2025 Gallery Flow Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Vercel-fix: NEXTAUTH_URL aus VERCEL_URL ableiten wenn nicht explizit gesetzt
if (!process.env.NEXTAUTH_URL && process.env.VERCEL_URL) {
  process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`;
}

console.log("[NextAuth route] NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
console.log("[NextAuth route] VERCEL_URL:", process.env.VERCEL_URL);

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
