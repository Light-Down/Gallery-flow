/**
 * Gallery Flow – Firebase session cookie helpers (server-side)
 */

import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";

const SESSION_COOKIE = "__session";
const SESSION_EXPIRY_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

export type SessionUser = {
  uid: string;
  email: string;
  name: string;
  userType: "photographer" | "client";
  photographerId?: string;
  gallerySlug?: string;
};

export async function createSessionCookie(idToken: string): Promise<string> {
  return adminAuth.createSessionCookie(idToken, { expiresIn: SESSION_EXPIRY_MS });
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionCookie) return null;

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    return {
      uid: decoded.uid,
      email: decoded.email ?? "",
      name: (decoded.name as string) ?? "",
      userType: decoded.userType as "photographer" | "client",
      photographerId: decoded.photographerId as string | undefined,
      gallerySlug: decoded.gallerySlug as string | undefined,
    };
  } catch {
    return null;
  }
}

export { SESSION_COOKIE, SESSION_EXPIRY_MS };
