/**
 * Internal endpoint used by middleware to verify Firebase session cookies.
 * Cannot use Firebase Admin SDK directly in Edge Runtime.
 */

import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

const SESSION_COOKIE = "__session";

export async function GET(req: NextRequest) {
  const sessionCookie = req.cookies.get(SESSION_COOKIE)?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: "No session" }, { status: 401 });
  }

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    return NextResponse.json({ userType: decoded.userType, uid: decoded.uid });
  } catch {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }
}
