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

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.userType !== "photographer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const gallery = await prisma.gallery.findFirst({
    where: { id, photographerId: session.user.userId },
    include: { photos: { orderBy: { sortOrder: "asc" } } },
  });

  if (!gallery) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(gallery);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.userType !== "photographer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { title, slug, description, design, status, greetingText, clientId, expiresAt } = body;

  const gallery = await prisma.gallery.updateMany({
    where: { id, photographerId: session.user.userId },
    data: {
      title,
      slug,
      description,
      design,
      status,
      greetingText,
      clientId,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  });

  if (gallery.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.userType !== "photographer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.gallery.deleteMany({
    where: { id, photographerId: session.user.userId },
  });

  return NextResponse.json({ ok: true });
}
