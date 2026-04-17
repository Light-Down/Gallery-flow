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

export async function GET() {
  const session = await getSession();
  if (!session || session.userType !== "photographer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const snapshot = await adminDb
    .collection("galleries")
    .where("photographerId", "==", session.uid)
    .orderBy("updatedAt", "desc")
    .get();

  const galleries = await Promise.all(
    snapshot.docs.map(async (doc) => {
      const data = doc.data();
      const photosSnap = await adminDb
        .collection("photos")
        .where("galleryId", "==", doc.id)
        .count()
        .get();
      let clientName: string | null = null;
      if (data.clientId) {
        const clientDoc = await adminDb.collection("clients").doc(data.clientId).get();
        clientName = clientDoc.data()?.name ?? null;
      }
      return {
        id: doc.id,
        ...data,
        client: clientName ? { name: clientName } : null,
        _count: { photos: photosSnap.data().count },
      };
    })
  );

  return NextResponse.json(galleries);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.userType !== "photographer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, slug, description, design, status, greetingText, clientId, expiresAt } =
    await req.json();

  const now = new Date();
  const docRef = await adminDb.collection("galleries").add({
    title,
    slug,
    description: description ?? null,
    design: design ?? "MASONRY",
    status: status ?? "DRAFT",
    greetingText: greetingText ?? null,
    clientId: clientId ?? null,
    photographerId: session.uid,
    expiresAt: expiresAt ? new Date(expiresAt) : null,
    createdAt: now,
    updatedAt: now,
  });

  return NextResponse.json({ id: docRef.id, title, slug }, { status: 201 });
}
