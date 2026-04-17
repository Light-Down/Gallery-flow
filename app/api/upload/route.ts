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
import { compressImage } from "@/lib/sharp";
import { saveFile } from "@/lib/storage";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.userType !== "photographer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const galleryId = formData.get("galleryId") as string | null;

  if (!file || !galleryId) {
    return NextResponse.json({ error: "Missing file or galleryId" }, { status: 400 });
  }

  const gallery = await prisma.gallery.findFirst({
    where: { id: galleryId, photographerId: session.user.userId },
  });
  if (!gallery) return NextResponse.json({ error: "Gallery not found" }, { status: 404 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const compressed = await compressImage(buffer);

  const filename = `${Date.now()}-${file.name.replace(/\.[^.]+$/, "")}.webp`;
  const previewUrl = await saveFile(compressed.buffer, galleryId, filename);

  const lastPhoto = await prisma.photo.findFirst({
    where: { galleryId },
    orderBy: { sortOrder: "desc" },
  });

  const photo = await prisma.photo.create({
    data: {
      galleryId,
      filename: file.name,
      previewUrl,
      width: compressed.width,
      height: compressed.height,
      sizeBytes: compressed.sizeBytes,
      sortOrder: (lastPhoto?.sortOrder ?? -1) + 1,
    },
  });

  return NextResponse.json(photo);
}
