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
import { getSession } from "@/lib/auth";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function GET() {
  const session = await getSession();
  if (!session || session.userType !== "photographer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const doc = await adminDb.collection("photographers").doc(session.uid).get();
  if (!doc.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data = doc.data()!;
  return NextResponse.json({
    id: doc.id,
    name: data.name ?? "",
    email: data.email ?? "",
    logoUrl: data.logoUrl ?? "",
    accentColor: data.accentColor ?? "#1a1a1a",
    footerText: data.footerText ?? "",
    googleReviewUrl: data.googleReviewUrl ?? "",
    secondReviewUrl: data.secondReviewUrl ?? "",
    secondReviewLabel: data.secondReviewLabel ?? "",
  });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session || session.userType !== "photographer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, email, logoUrl, accentColor, footerText, googleReviewUrl, secondReviewUrl, secondReviewLabel } =
    await req.json();

  await adminDb.collection("photographers").doc(session.uid).update({
    name,
    email,
    logoUrl: logoUrl || null,
    accentColor,
    footerText: footerText || null,
    googleReviewUrl: googleReviewUrl || null,
    secondReviewUrl: secondReviewUrl || null,
    secondReviewLabel: secondReviewLabel || null,
    updatedAt: new Date(),
  });

  if (email) await adminAuth.updateUser(session.uid, { email, displayName: name });

  return NextResponse.json({ ok: true });
}
