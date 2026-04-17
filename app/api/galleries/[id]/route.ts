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

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.userType !== "photographer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const doc = await adminDb.collection("galleries").doc(id).get();
  if (!doc.exists || doc.data()?.photographerId !== session.uid) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const photosSnap = await adminDb
    .collection("photos")
    .where("galleryId", "==", id)
    .orderBy("sortOrder", "asc")
    .get();

  return NextResponse.json({
    id: doc.id,
    ...doc.data(),
    photos: photosSnap.docs.map((p) => ({ id: p.id, ...p.data() })),
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.userType !== "photographer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const doc = await adminDb.collection("galleries").doc(id).get();
  if (!doc.exists || doc.data()?.photographerId !== session.uid) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { title, slug, description, design, status, greetingText, clientId, expiresAt } =
    await req.json();

  await adminDb.collection("galleries").doc(id).update({
    title,
    slug,
    description: description ?? null,
    design,
    status,
    greetingText: greetingText ?? null,
    clientId: clientId ?? null,
    expiresAt: expiresAt ? new Date(expiresAt) : null,
    updatedAt: new Date(),
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.userType !== "photographer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const doc = await adminDb.collection("galleries").doc(id).get();
  if (!doc.exists || doc.data()?.photographerId !== session.uid) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const photosSnap = await adminDb.collection("photos").where("galleryId", "==", id).get();
  const batch = adminDb.batch();
  photosSnap.docs.forEach((p) => batch.delete(p.ref));
  batch.delete(adminDb.collection("galleries").doc(id));
  await batch.commit();

  return NextResponse.json({ ok: true });
}
