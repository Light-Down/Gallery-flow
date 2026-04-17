/**
 * Gallery Flow – Firebase session cookie management
 * POST: create session cookie from Firebase ID token
 * DELETE: sign out (clear session cookie)
 */

import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { SESSION_COOKIE, SESSION_EXPIRY_MS } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { idToken } = await req.json();
  if (!idToken) return NextResponse.json({ error: "Missing idToken" }, { status: 400 });

  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    const uid = decoded.uid;

    // Fetch extra claims needed for the session
    const userRecord = await adminAuth.getUser(uid);
    const claims = userRecord.customClaims ?? {};

    // If photographer and no Firestore doc yet, create it
    if (claims.userType === "photographer") {
      const docRef = adminDb.collection("photographers").doc(uid);
      const doc = await docRef.get();
      if (!doc.exists) {
        await docRef.set({
          email: decoded.email ?? "",
          name: decoded.name ?? "",
          logoUrl: null,
          accentColor: "#1a1a1a",
          footerText: null,
          googleReviewUrl: null,
          secondReviewUrl: null,
          secondReviewLabel: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_EXPIRY_MS,
    });

    const res = NextResponse.json({ ok: true, userType: claims.userType });
    res.cookies.set(SESSION_COOKIE, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_EXPIRY_MS / 1000,
      path: "/",
    });
    return res;
  } catch (err) {
    console.error("Session creation failed:", err);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
