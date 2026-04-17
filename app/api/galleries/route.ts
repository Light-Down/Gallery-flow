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

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.userType !== "photographer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const galleries = await prisma.gallery.findMany({
    where: { photographerId: session.user.userId },
    include: { client: { select: { name: true } }, _count: { select: { photos: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(galleries);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.userType !== "photographer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, slug, description, design, status, greetingText, clientId, expiresAt } = body;

  const gallery = await prisma.gallery.create({
    data: {
      title,
      slug,
      description,
      design,
      status,
      greetingText,
      clientId,
      photographerId: session.user.userId,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  });

  return NextResponse.json(gallery, { status: 201 });
}
