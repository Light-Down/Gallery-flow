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

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.userType !== "client") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { photoId } = await req.json();
  const favoriteId = `${session.uid}_${photoId}`;
  const ref = adminDb.collection("favorites").doc(favoriteId);
  const existing = await ref.get();

  if (existing.exists) {
    await ref.delete();
    return NextResponse.json({ favorited: false });
  }

  await ref.set({ clientId: session.uid, photoId, createdAt: new Date() });
  return NextResponse.json({ favorited: true });
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.userType !== "photographer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clientId = req.nextUrl.searchParams.get("clientId");
  if (!clientId) return NextResponse.json({ error: "Missing clientId" }, { status: 400 });

  const clientDoc = await adminDb.collection("clients").doc(clientId).get();
  if (!clientDoc.exists || clientDoc.data()?.photographerId !== session.uid) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const favSnap = await adminDb
    .collection("favorites")
    .where("clientId", "==", clientId)
    .get();

  const favorites = await Promise.all(
    favSnap.docs.map(async (fav) => {
      const photoDoc = await adminDb.collection("photos").doc(fav.data().photoId).get();
      return {
        id: fav.id,
        ...fav.data(),
        photo: photoDoc.exists
          ? {
              filename: photoDoc.data()?.filename,
              previewUrl: photoDoc.data()?.previewUrl,
              driveLink: photoDoc.data()?.driveLink ?? null,
              galleryId: photoDoc.data()?.galleryId,
            }
          : null,
      };
    })
  );

  return NextResponse.json(favorites);
}
