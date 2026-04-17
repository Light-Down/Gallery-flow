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
import { adminDb } from "@/lib/firebase-admin";
import { sendEmail } from "@/lib/brevo";
import { renderSneakPeakEmail } from "@/emails/SneakPeakEmail";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.userType !== "photographer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { galleryId } = await req.json();

  const galleryDoc = await adminDb.collection("galleries").doc(galleryId).get();
  if (!galleryDoc.exists || galleryDoc.data()?.photographerId !== session.uid) {
    return NextResponse.json({ error: "Gallery not found" }, { status: 404 });
  }
  const gallery = galleryDoc.data()!;

  const [clientDoc, photographerDoc, photosSnap] = await Promise.all([
    adminDb.collection("clients").doc(gallery.clientId).get(),
    adminDb.collection("photographers").doc(session.uid).get(),
    adminDb
      .collection("photos")
      .where("galleryId", "==", galleryId)
      .where("isSneakPeak", "==", true)
      .orderBy("sortOrder", "asc")
      .limit(3)
      .get(),
  ]);

  if (!clientDoc.exists) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  const client = clientDoc.data()!;
  const photographer = photographerDoc.data()!;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const html = renderSneakPeakEmail({
    clientName: client.name,
    photographerName: photographer.name,
    photographerLogoUrl: photographer.logoUrl ?? undefined,
    greetingText: gallery.greetingText ?? `Schau mal, was wir zusammen festgehalten haben!`,
    previewPhotos: photosSnap.docs.map((p) => p.data().previewUrl),
    galleryUrl: `${appUrl}/gallery/${gallery.slug}`,
  });

  await sendEmail({
    to: { email: client.email, name: client.name },
    subject: `✨ Deine ersten Bilder sind da, ${client.name}!`,
    htmlContent: html,
    senderName: photographer.name,
  });

  return NextResponse.json({ ok: true });
}
