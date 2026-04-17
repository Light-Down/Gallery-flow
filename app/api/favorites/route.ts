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

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.userType !== "client") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { photoId } = await req.json();
  const clientId = session.user.userId;

  const existing = await prisma.favorite.findUnique({
    where: { clientId_photoId: { clientId, photoId } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { clientId_photoId: { clientId, photoId } } });
    return NextResponse.json({ favorited: false });
  }

  await prisma.favorite.create({ data: { clientId, photoId } });
  return NextResponse.json({ favorited: true });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.userType !== "photographer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clientId = req.nextUrl.searchParams.get("clientId");
  if (!clientId) return NextResponse.json({ error: "Missing clientId" }, { status: 400 });

  const client = await prisma.client.findFirst({
    where: { id: clientId, photographerId: session.user.userId },
  });
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const favorites = await prisma.favorite.findMany({
    where: { clientId },
    include: { photo: { select: { filename: true, previewUrl: true, driveLink: true, galleryId: true } } },
  });

  return NextResponse.json(favorites);
}
