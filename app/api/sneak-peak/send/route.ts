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
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/brevo";
import { renderSneakPeakEmail } from "@/emails/SneakPeakEmail";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.userType !== "photographer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { galleryId } = await req.json();

  const gallery = await prisma.gallery.findFirst({
    where: { id: galleryId, photographerId: session.user.userId },
    include: {
      client: true,
      photographer: true,
      photos: { where: { isSneakPeak: true }, take: 3, orderBy: { sortOrder: "asc" } },
    },
  });

  if (!gallery) return NextResponse.json({ error: "Gallery not found" }, { status: 404 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const galleryUrl = `${appUrl}/gallery/${gallery.slug}`;

  const html = renderSneakPeakEmail({
    clientName: gallery.client.name,
    photographerName: gallery.photographer.name,
    photographerLogoUrl: gallery.photographer.logoUrl ?? undefined,
    greetingText: gallery.greetingText ?? `Schau mal, was wir zusammen festgehalten haben!`,
    previewPhotos: gallery.photos.map((p) => p.previewUrl),
    galleryUrl,
  });

  await sendEmail({
    to: { email: gallery.client.email, name: gallery.client.name },
    subject: `✨ Deine ersten Bilder sind da, ${gallery.client.name}!`,
    htmlContent: html,
    senderName: gallery.photographer.name,
  });

  return NextResponse.json({ ok: true });
}
