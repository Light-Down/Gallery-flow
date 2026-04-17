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
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.userType !== "photographer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const client = await prisma.client.findFirst({
    where: { id, photographerId: session.user.userId },
    include: { galleries: { select: { id: true, title: true, slug: true, status: true } } },
  });

  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { password: _, ...safeClient } = client;
  return NextResponse.json(safeClient);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.userType !== "photographer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { name, email, password } = await req.json();

  const data: { name: string; email: string; password?: string } = { name, email };
  if (password) data.password = await bcrypt.hash(password, 12);

  await prisma.client.updateMany({
    where: { id, photographerId: session.user.userId },
    data,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.userType !== "photographer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.client.deleteMany({ where: { id, photographerId: session.user.userId } });
  return NextResponse.json({ ok: true });
}
