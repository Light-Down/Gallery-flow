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
import { compressImage } from "@/lib/sharp";
import { saveFile } from "@/lib/storage";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.userType !== "photographer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const galleryId = formData.get("galleryId") as string | null;

  if (!file || !galleryId) {
    return NextResponse.json({ error: "Missing file or galleryId" }, { status: 400 });
  }

  const galleryDoc = await adminDb.collection("galleries").doc(galleryId).get();
  if (!galleryDoc.exists || galleryDoc.data()?.photographerId !== session.uid) {
    return NextResponse.json({ error: "Gallery not found" }, { status: 404 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const compressed = await compressImage(buffer);

  const filename = `${Date.now()}-${file.name.replace(/\.[^.]+$/, "")}.webp`;
  const previewUrl = await saveFile(compressed.buffer, galleryId, filename);

  const lastPhotoSnap = await adminDb
    .collection("photos")
    .where("galleryId", "==", galleryId)
    .orderBy("sortOrder", "desc")
    .limit(1)
    .get();

  const lastSortOrder = lastPhotoSnap.empty ? -1 : (lastPhotoSnap.docs[0].data().sortOrder ?? -1);

  const now = new Date();
  const photoRef = await adminDb.collection("photos").add({
    galleryId,
    filename: file.name,
    previewUrl,
    driveLink: null,
    isSneakPeak: false,
    width: compressed.width,
    height: compressed.height,
    sizeBytes: compressed.sizeBytes,
    sortOrder: lastSortOrder + 1,
    createdAt: now,
  });

  return NextResponse.json({ id: photoRef.id, galleryId, previewUrl });
}
