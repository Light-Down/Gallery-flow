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
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.userType !== "photographer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const doc = await adminDb.collection("clients").doc(id).get();
  if (!doc.exists || doc.data()?.photographerId !== session.uid) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const galleriesSnap = await adminDb
    .collection("galleries")
    .where("clientId", "==", id)
    .select("title", "slug", "status")
    .get();

  return NextResponse.json({
    id: doc.id,
    ...doc.data(),
    galleries: galleriesSnap.docs.map((g) => ({ id: g.id, ...g.data() })),
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.userType !== "photographer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const doc = await adminDb.collection("clients").doc(id).get();
  if (!doc.exists || doc.data()?.photographerId !== session.uid) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { name, email, password } = await req.json();

  const authUpdate: { displayName?: string; email?: string; password?: string } = {};
  if (name) authUpdate.displayName = name;
  if (email) authUpdate.email = email;
  if (password) authUpdate.password = password;
  if (Object.keys(authUpdate).length) await adminAuth.updateUser(id, authUpdate);

  await adminDb.collection("clients").doc(id).update({
    name,
    email,
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
  const doc = await adminDb.collection("clients").doc(id).get();
  if (!doc.exists || doc.data()?.photographerId !== session.uid) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await adminAuth.deleteUser(id);
  await adminDb.collection("clients").doc(id).delete();
  return NextResponse.json({ ok: true });
}
